#!/usr/bin/env node

/**
 * Performance Testing Script for Airtable Task Manager
 * Analyzes bundle size, build performance, and basic metrics
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('⚡ Running Performance Tests...\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
  metrics: {}
};

function logTest(name, status, message = '', metric = null) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status}`);
  if (message) console.log(`   ${message}`);
  
  results.tests.push({ name, status, message, metric });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.warnings++;
  
  if (metric) results.metrics[name] = metric;
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// 1. Build Performance
function testBuildPerformance() {
  console.log('\n🏗️ Build Performance');
  
  try {
    const buildStart = Date.now();
    console.log('   Building application...');
    
    // Clean build
    if (fs.existsSync('dist')) {
      execSync('rm -rf dist');
    }
    
    execSync('npm run build', { stdio: 'pipe' });
    const buildTime = Date.now() - buildStart;
    
    if (buildTime < 30000) { // 30 seconds
      logTest('Build Time', 'PASS', `${(buildTime / 1000).toFixed(2)}s`, buildTime);
    } else if (buildTime < 60000) { // 60 seconds
      logTest('Build Time', 'WARN', `${(buildTime / 1000).toFixed(2)}s (consider optimizing)`, buildTime);
    } else {
      logTest('Build Time', 'FAIL', `${(buildTime / 1000).toFixed(2)}s (too slow)`, buildTime);
    }
    
  } catch (error) {
    logTest('Build Process', 'FAIL', 'Build failed');
    return false;
  }
  
  return true;
}

// 2. Bundle Size Analysis
function testBundleSize() {
  console.log('\n📦 Bundle Size Analysis');
  
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    logTest('Bundle Analysis', 'FAIL', 'dist directory not found');
    return;
  }
  
  // Get all JS files in assets directory
  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    logTest('Assets Directory', 'FAIL', 'assets directory not found');
    return;
  }
  
  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  
  let totalSize = 0;
  let mainBundleSize = 0;
  let largestBundle = { name: '', size: 0 };
  
  jsFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalSize += size;
    
    if (size > largestBundle.size) {
      largestBundle = { name: file, size };
    }
    
    // Identify main bundle (usually the largest or named index-*)
    if (file.includes('index-') || size > mainBundleSize) {
      mainBundleSize = size;
    }
  });
  
  // Test total bundle size (target: < 1MB)
  if (totalSize < 1024 * 1024) { // 1MB
    logTest('Total Bundle Size', 'PASS', `${formatBytes(totalSize)}`, totalSize);
  } else if (totalSize < 2 * 1024 * 1024) { // 2MB
    logTest('Total Bundle Size', 'WARN', `${formatBytes(totalSize)} (consider optimization)`, totalSize);
  } else {
    logTest('Total Bundle Size', 'FAIL', `${formatBytes(totalSize)} (too large)`, totalSize);
  }
  
  // Test main bundle size (target: < 500KB)
  if (mainBundleSize < 500 * 1024) { // 500KB
    logTest('Main Bundle Size', 'PASS', `${formatBytes(mainBundleSize)}`, mainBundleSize);
  } else if (mainBundleSize < 1024 * 1024) { // 1MB
    logTest('Main Bundle Size', 'WARN', `${formatBytes(mainBundleSize)} (consider code splitting)`, mainBundleSize);
  } else {
    logTest('Main Bundle Size', 'FAIL', `${formatBytes(mainBundleSize)} (too large)`, mainBundleSize);
  }
  
  console.log(`   📊 Bundle breakdown: ${jsFiles.length} JS files, largest: ${formatBytes(largestBundle.size)}`);
}

// 3. Asset Analysis
function testAssetOptimization() {
  console.log('\n🖼️ Asset Optimization');
  
  const distPath = path.join(process.cwd(), 'dist');
  const assetsPath = path.join(distPath, 'assets');
  
  if (!fs.existsSync(assetsPath)) {
    logTest('Asset Directory', 'FAIL', 'assets directory not found');
    return;
  }
  
  const files = fs.readdirSync(assetsPath);
  const imageFiles = files.filter(f => /\.(png|jpg|jpeg|gif|svg|ico)$/.test(f));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  // Check for images
  if (imageFiles.length > 0) {
    let totalImageSize = 0;
    let largeImages = [];
    
    imageFiles.forEach(file => {
      const filePath = path.join(assetsPath, file);
      const size = fs.statSync(filePath).size;
      totalImageSize += size;
      
      if (size > 100 * 1024) { // 100KB
        largeImages.push({ file, size: formatBytes(size) });
      }
    });
    
    if (largeImages.length === 0) {
      logTest('Image Optimization', 'PASS', `${imageFiles.length} images, total: ${formatBytes(totalImageSize)}`);
    } else {
      logTest('Image Optimization', 'WARN', 
        `Large images found: ${largeImages.map(img => `${img.file} (${img.size})`).join(', ')}`);
    }
  }
  
  // Check for CSS files
  if (cssFiles.length > 0) {
    logTest('CSS Files Present', 'PASS', `${cssFiles.length} CSS files found`);
  } else {
    logTest('CSS Files', 'WARN', 'No separate CSS files (may be inlined)');
  }
}

// 4. Module Analysis
function testModuleStructure() {
  console.log('\n📋 Module Structure');
  
  try {
    // Count source files
    const srcPath = path.join(process.cwd(), 'src');
    if (fs.existsSync(srcPath)) {
      let componentCount = 0;
      let totalLines = 0;
      let largeComponents = [];
      
      function scanDirectory(dir) {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            scanDirectory(filePath);
          } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            componentCount++;
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n').length;
            totalLines += lines;
            
            if (lines > 500) {
              largeComponents.push({ 
                file: path.relative(process.cwd(), filePath), 
                lines 
              });
            }
          }
        });
      }
      
      scanDirectory(srcPath);
      
      logTest('Component Count', 'PASS', 
        `${componentCount} components, ${totalLines} total lines`, componentCount);
      
      if (largeComponents.length === 0) {
        logTest('Component Size', 'PASS', 'No components exceed 500 lines');
      } else {
        logTest('Component Size', 'WARN', 
          `Large components: ${largeComponents.map(c => `${c.file} (${c.lines} lines)`).join(', ')}`);
      }
      
      // Average component size
      const avgLines = Math.round(totalLines / componentCount);
      if (avgLines < 200) {
        logTest('Average Component Size', 'PASS', `${avgLines} lines per component`);
      } else {
        logTest('Average Component Size', 'WARN', 
          `${avgLines} lines per component (consider splitting)`);
      }
    }
  } catch (error) {
    logTest('Module Analysis', 'FAIL', 'Failed to analyze modules');
  }
}

// 5. Performance Budget Check
function checkPerformanceBudget() {
  console.log('\n📊 Performance Budget');
  
  const budgets = {
    'Total Bundle Size': { limit: 1024 * 1024, actual: results.metrics['Total Bundle Size'] }, // 1MB
    'Main Bundle Size': { limit: 500 * 1024, actual: results.metrics['Main Bundle Size'] }, // 500KB
    'Build Time': { limit: 30000, actual: results.metrics['Build Time'] }, // 30s
  };
  
  let budgetPassed = 0;
  let budgetTotal = 0;
  
  Object.entries(budgets).forEach(([name, budget]) => {
    budgetTotal++;
    if (budget.actual && budget.actual <= budget.limit) {
      budgetPassed++;
    }
  });
  
  if (budgetPassed === budgetTotal) {
    logTest('Performance Budget', 'PASS', `${budgetPassed}/${budgetTotal} budgets met`);
  } else {
    logTest('Performance Budget', 'WARN', `${budgetPassed}/${budgetTotal} budgets met`);
  }
}

// Run all tests
async function runAllTests() {
  try {
    const buildSuccess = testBuildPerformance();
    if (buildSuccess) {
      testBundleSize();
      testAssetOptimization();
    }
    testModuleStructure();
    checkPerformanceBudget();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('⚡ Performance Test Summary');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log(`📊 Total: ${results.tests.length}`);
    
    // Key Metrics Summary
    if (Object.keys(results.metrics).length > 0) {
      console.log('\n📈 Key Metrics:');
      Object.entries(results.metrics).forEach(([name, value]) => {
        if (name.includes('Size')) {
          console.log(`   ${name}: ${formatBytes(value)}`);
        } else if (name.includes('Time')) {
          console.log(`   ${name}: ${(value / 1000).toFixed(2)}s`);
        } else {
          console.log(`   ${name}: ${value}`);
        }
      });
    }
    
    if (results.failed === 0) {
      console.log('\n🎉 Performance tests completed successfully!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Performance issues found. Review before deployment.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Performance test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests();