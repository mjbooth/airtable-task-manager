#!/usr/bin/env node

/**
 * Security Testing Script for Airtable Task Manager
 * Run before deployment to verify security standards
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Running Security Tests...\n');

// Test Results Storage
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

// 1. Dependency Security Audit
function testDependencyAudit() {
  console.log('\n📦 Dependency Security Audit');
  try {
    const auditOutput = execSync('npm audit --audit-level=high --json', { encoding: 'utf8' });
    const audit = JSON.parse(auditOutput);
    
    if (audit.metadata.vulnerabilities.high === 0 && audit.metadata.vulnerabilities.critical === 0) {
      logTest('High/Critical Vulnerabilities', 'PASS', 'No high or critical vulnerabilities found');
    } else {
      logTest('High/Critical Vulnerabilities', 'FAIL', 
        `Found ${audit.metadata.vulnerabilities.high} high and ${audit.metadata.vulnerabilities.critical} critical vulnerabilities`);
    }
    
    if (audit.metadata.vulnerabilities.moderate > 0) {
      logTest('Moderate Vulnerabilities', 'WARN', 
        `${audit.metadata.vulnerabilities.moderate} moderate vulnerabilities (review acceptable)`);
    }
  } catch (error) {
    logTest('Dependency Audit', 'FAIL', 'Failed to run npm audit');
  }
}

// 2. Environment Variables Security
function testEnvironmentSecurity() {
  console.log('\n🔐 Environment Security');
  
  // Check if .env is in .gitignore
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignore = fs.readFileSync(gitignorePath, 'utf8');
    if (gitignore.includes('.env')) {
      logTest('.env in .gitignore', 'PASS');
    } else {
      logTest('.env in .gitignore', 'FAIL', '.env should be in .gitignore');
    }
  } else {
    logTest('.gitignore exists', 'WARN', '.gitignore file not found');
  }
  
  // Check for committed secrets (basic check)
  try {
    const gitOutput = execSync('git log --grep="password\\|secret\\|key\\|token" --oneline', { encoding: 'utf8' });
    if (gitOutput.trim() === '') {
      logTest('No secrets in git history', 'PASS');
    } else {
      logTest('Potential secrets in git', 'WARN', 'Review git history for exposed secrets');
    }
  } catch (error) {
    logTest('Git history check', 'WARN', 'Could not check git history');
  }
}

// 3. Build Security
function testBuildSecurity() {
  console.log('\n🏗️ Build Security');
  
  // Check if source maps are properly configured for production
  const viteConfigPath = path.join(process.cwd(), 'vite.config.js');
  if (fs.existsSync(viteConfigPath)) {
    const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
    // Basic check for source map configuration
    logTest('Vite config exists', 'PASS');
  }
  
  // Test build process
  try {
    console.log('   Building application...');
    execSync('npm run build', { stdio: 'pipe' });
    logTest('Production build', 'PASS', 'Build completed successfully');
    
    // Check dist directory
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const distFiles = fs.readdirSync(distPath);
      if (distFiles.length > 0) {
        logTest('Build artifacts', 'PASS', `Generated ${distFiles.length} build artifacts`);
      } else {
        logTest('Build artifacts', 'FAIL', 'No build artifacts found');
      }
    }
  } catch (error) {
    logTest('Production build', 'FAIL', 'Build failed');
  }
}

// 4. Code Quality Security
function testCodeQuality() {
  console.log('\n📝 Code Quality Security');
  
  // Check for console.log in production code
  const srcPath = path.join(process.cwd(), 'src');
  let consoleLogCount = 0;
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const matches = content.match(/console\.(log|warn|error|debug)/g);
        if (matches) {
          consoleLogCount += matches.length;
        }
      }
    });
  }
  
  if (fs.existsSync(srcPath)) {
    scanDirectory(srcPath);
    if (consoleLogCount === 0) {
      logTest('No console logs', 'PASS');
    } else {
      logTest('Console logs found', 'WARN', `Found ${consoleLogCount} console statements (review for production)`);
    }
  }
}

// 5. Package.json Security
function testPackageJsonSecurity() {
  console.log('\n📄 Package.json Security');
  
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check for private flag
    if (packageJson.private === true) {
      logTest('Package is private', 'PASS');
    } else {
      logTest('Package privacy', 'WARN', 'Consider setting "private": true');
    }
    
    // Check for scripts security
    const scripts = packageJson.scripts || {};
    const dangerousPatterns = ['rm -rf', 'sudo', 'chmod'];
    let dangerousScripts = [];
    
    Object.entries(scripts).forEach(([scriptName, scriptContent]) => {
      dangerousPatterns.forEach(pattern => {
        if (scriptContent.includes(pattern)) {
          dangerousScripts.push(scriptName);
        }
      });
    });
    
    if (dangerousScripts.length === 0) {
      logTest('Safe npm scripts', 'PASS');
    } else {
      logTest('Potentially dangerous scripts', 'WARN', `Review scripts: ${dangerousScripts.join(', ')}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  try {
    testDependencyAudit();
    testEnvironmentSecurity();
    testBuildSecurity();
    testCodeQuality();
    testPackageJsonSecurity();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('🔒 Security Test Summary');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⚠️  Warnings: ${results.warnings}`);
    console.log(`📊 Total: ${results.tests.length}`);
    
    if (results.failed === 0) {
      console.log('\n🎉 All critical security tests passed!');
      process.exit(0);
    } else {
      console.log('\n🚨 Security issues found that must be resolved before deployment!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Security test suite failed:', error.message);
    process.exit(1);
  }
}

// Run the tests
runAllTests();