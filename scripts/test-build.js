#!/usr/bin/env node

/**
 * Build Testing Script for Airtable Task Manager
 * Comprehensive build verification and validation
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🏗️ Running Build Tests...\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(name, status, message = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}: ${status}`);
  if (message) console.log(`   ${message}`);
  
  results.tests.push({ name, status, message });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.warnings++;
}

// 1. Clean Build Test
function testCleanBuild() {
  console.log('\n🧹 Clean Build Test');
  
  try {
    // Clean previous build
    if (fs.existsSync('dist')) {
      execSync('rm -rf dist');
      logTest('Clean Previous Build', 'PASS', 'Removed existing dist directory');
    } else {
      logTest('Clean Previous Build', 'PASS', 'No previous build to clean');
    }
    
    // Run build
    console.log('   Running production build...');
    const buildOutput = execSync('npm run build', { encoding: 'utf8' });
    
    if (buildOutput.includes('built in')) {
      logTest('Production Build', 'PASS', 'Build completed successfully');
    } else {
      logTest('Production Build', 'WARN', 'Build completed but no timing info');
    }
    
    return true;
  } catch (error) {
    logTest('Production Build', 'FAIL', `Build failed: ${error.message.split('\n')[0]}`);
    return false;
  }
}

// 2. Build Artifacts Verification
function testBuildArtifacts() {
  console.log('\n📁 Build Artifacts Verification');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  // Check dist directory exists
  if (!fs.existsSync(distPath)) {
    logTest('Dist Directory', 'FAIL', 'dist directory not created');
    return false;
  }
  
  logTest('Dist Directory', 'PASS', 'dist directory created');
  
  // Check for index.html
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    if (indexContent.includes('<div id=\"root\"')) {
      logTest('Index HTML', 'PASS', 'index.html contains root element');
    } else {
      logTest('Index HTML', 'FAIL', 'index.html missing root element');
    }
  } else {
    logTest('Index HTML', 'FAIL', 'index.html not found');
  }
  
  // Check for assets directory
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assets = fs.readdirSync(assetsPath);
    const jsFiles = assets.filter(f => f.endsWith('.js'));
    const cssFiles = assets.filter(f => f.endsWith('.css'));
    
    if (jsFiles.length > 0) {
      logTest('JavaScript Assets', 'PASS', `${jsFiles.length} JS files generated`);
    } else {
      logTest('JavaScript Assets', 'FAIL', 'No JavaScript files found');
    }
    
    // CSS files might be inlined, so this is just informational
    if (cssFiles.length > 0) {
      logTest('CSS Assets', 'PASS', `${cssFiles.length} CSS files generated`);
    } else {
      logTest('CSS Assets', 'WARN', 'No separate CSS files (may be inlined)');
    }
  } else {
    logTest('Assets Directory', 'FAIL', 'assets directory not found');
  }
  
  // Check for favicon
  const faviconFiles = ['fav.ico', 'favicon.ico'];
  let faviconFound = false;
  for (const favicon of faviconFiles) {
    if (fs.existsSync(path.join(distPath, favicon))) {
      faviconFound = true;
      break;
    }
  }
  
  if (faviconFound) {
    logTest('Favicon', 'PASS', 'Favicon found');
  } else {
    logTest('Favicon', 'WARN', 'No favicon found');
  }
  
  return true;
}

// 3. Build Configuration Validation
function testBuildConfiguration() {
  console.log('\n⚙️ Build Configuration');
  
  // Check vite.config.js
  const viteConfigPath = path.join(process.cwd(), 'vite.config.js');
  if (fs.existsSync(viteConfigPath)) {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    
    if (viteConfig.includes('outDir')) {
      logTest('Output Directory Config', 'PASS', 'outDir configured in vite.config.js');
    } else {
      logTest('Output Directory Config', 'WARN', 'outDir not explicitly configured');
    }
    
    if (viteConfig.includes('base')) {
      logTest('Base Path Config', 'PASS', 'base path configured');
    } else {
      logTest('Base Path Config', 'WARN', 'base path not configured');
    }
    
    if (viteConfig.includes('@vitejs/plugin-react')) {
      logTest('React Plugin', 'PASS', 'React plugin configured');
    } else {
      logTest('React Plugin', 'FAIL', 'React plugin not found');
    }
  } else {
    logTest('Vite Configuration', 'FAIL', 'vite.config.js not found');
  }
  
  // Check package.json build script
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.build) {
      logTest('Build Script', 'PASS', `Build script: ${packageJson.scripts.build}`);
    } else {
      logTest('Build Script', 'FAIL', 'Build script not defined');
    }
    
    if (packageJson.scripts && packageJson.scripts.preview) {
      logTest('Preview Script', 'PASS', 'Preview script available');
    } else {
      logTest('Preview Script', 'WARN', 'Preview script not defined');
    }
  }
}

// 4. Build Output Validation
function testBuildOutput() {
  console.log('\n📊 Build Output Validation');
  
  const distPath = path.join(process.cwd(), 'dist');
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    logTest('HTML Validation', 'FAIL', 'index.html not found');
    return;
  }
  
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check for proper HTML structure
  if (indexContent.includes('<!DOCTYPE html>')) {
    logTest('HTML Doctype', 'PASS');
  } else {
    logTest('HTML Doctype', 'FAIL', 'Missing DOCTYPE declaration');
  }
  
  // Check for meta tags
  if (indexContent.includes('<meta charset')) {
    logTest('Character Encoding', 'PASS');
  } else {
    logTest('Character Encoding', 'WARN', 'Character encoding not specified');
  }
  
  if (indexContent.includes('viewport')) {
    logTest('Viewport Meta Tag', 'PASS');
  } else {
    logTest('Viewport Meta Tag', 'WARN', 'Viewport meta tag missing');
  }
  
  // Check for asset references
  const assetReferences = indexContent.match(/\/assets\/[^"']*/g) || [];
  if (assetReferences.length > 0) {
    logTest('Asset References', 'PASS', `${assetReferences.length} asset references found`);
    
    // Verify referenced assets exist
    let missingAssets = 0;
    assetReferences.forEach(ref => {
      const assetPath = path.join(distPath, ref.substring(1)); // Remove leading /
      if (!fs.existsSync(assetPath)) {
        missingAssets++;
      }
    });
    
    if (missingAssets === 0) {
      logTest('Asset Integrity', 'PASS', 'All referenced assets exist');
    } else {
      logTest('Asset Integrity', 'FAIL', `${missingAssets} referenced assets missing`);
    }
  } else {
    logTest('Asset References', 'WARN', 'No asset references found in HTML');
  }
}

// 5. Preview Server Test
function testPreviewServer() {
  return new Promise((resolve) => {
    console.log('\n🌐 Preview Server Test');
    
    try {
      console.log('   Starting preview server...');
      const preview = spawn('npm', ['run', 'preview'], { 
        stdio: ['pipe', 'pipe', 'pipe'],
        detached: false
      });
      
      let output = '';
      let serverUrl = null;
      
      preview.stdout.on('data', (data) => {
        output += data.toString();
        const urlMatch = output.match(/Local:\s+(http:\/\/[^\s]+)/);
        if (urlMatch && !serverUrl) {
          serverUrl = urlMatch[1];
          
          // Test server response
          setTimeout(() => {
            const url = new URL(serverUrl);
            const options = {
              hostname: url.hostname,
              port: url.port,
              path: url.pathname,
              method: 'GET',
              timeout: 5000
            };
            
            const req = http.request(options, (res) => {
              if (res.statusCode === 200) {
                logTest('Preview Server', 'PASS', `Server responding at ${serverUrl}`);
              } else {
                logTest('Preview Server', 'WARN', `Server returned status ${res.statusCode}`);
              }
              
              preview.kill();
              resolve();
            });
            
            req.on('error', (error) => {
              logTest('Preview Server', 'FAIL', `Server request failed: ${error.message}`);
              preview.kill();
              resolve();
            });
            
            req.on('timeout', () => {
              logTest('Preview Server', 'FAIL', 'Server request timed out');
              preview.kill();
              resolve();
            });
            
            req.end();
          }, 2000); // Wait 2 seconds for server to start
        }
      });
      
      preview.stderr.on('data', (data) => {
        const error = data.toString();
        if (error.includes('EADDRINUSE')) {
          logTest('Preview Server', 'WARN', 'Port already in use');
          preview.kill();
          resolve();
        }
      });
      
      preview.on('error', (error) => {
        logTest('Preview Server', 'FAIL', `Failed to start preview server: ${error.message}`);
        resolve();
      });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (!preview.killed) {
          logTest('Preview Server', 'FAIL', 'Preview server start timeout');
          preview.kill();
          resolve();
        }
      }, 10000);
      
    } catch (error) {
      logTest('Preview Server', 'FAIL', `Preview test failed: ${error.message}`);
      resolve();
    }
  });
}

// Run all tests
async function runAllTests() {
  try {
    const buildSuccess = testCleanBuild();
    
    if (buildSuccess) {
      testBuildArtifacts();
      testBuildConfiguration();
      testBuildOutput();
      await testPreviewServer();
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🏗️ Build Test Summary');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log(`📊 Total: ${results.tests.length}`);
    
    if (results.failed === 0) {
      console.log('\n🎉 All build tests passed!');
      process.exit(0);
    } else {
      console.log('\n🚨 Build issues found that must be resolved!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Build test suite failed:', error.message);
    process.exit(1);
  }
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 Tests interrupted by user');
  process.exit(1);
});

// Run the tests
runAllTests();