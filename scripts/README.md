# Testing Scripts

This directory contains automated testing scripts for the Airtable Task Manager application.

## Available Scripts

### 🔒 Security Testing
```bash
npm run test:security
```
- Checks for high/critical dependency vulnerabilities
- Validates environment variable security
- Tests build process security
- Scans for console.log statements in production code
- Verifies package.json security settings

### ⚡ Performance Testing  
```bash
npm run test:performance
```
- Measures build performance and timing
- Analyzes bundle sizes and optimization
- Checks asset compression and structure
- Validates module organization
- Enforces performance budgets

### 🏗️ Build Testing
```bash
npm run test:build
```
- Performs clean production builds
- Validates build artifacts and structure
- Tests build configuration
- Verifies HTML output integrity
- Tests preview server functionality

### 🚀 Complete Pre-Deployment Test
```bash
npm run test:pre-deploy
```
Runs all three test suites in sequence. Must pass before deployment.

### 📊 Bundle Analysis
```bash
npm run analyze
```
Generates detailed bundle analysis (requires manual installation of analyzer).

## Test Results

- **✅ PASS**: Test passed successfully
- **⚠️ WARN**: Warning that should be reviewed but doesn't block deployment  
- **❌ FAIL**: Critical failure that blocks deployment

## CI/CD Integration

These scripts are designed for easy integration with CI/CD pipelines:

```yaml
# GitHub Actions example
- name: Run Security Tests
  run: npm run test:security

- name: Run Performance Tests  
  run: npm run test:performance

- name: Run Build Tests
  run: npm run test:build
```

## Customization

Each script can be customized by editing the corresponding `.js` file:

- `test-security.js`: Security testing configuration
- `test-performance.js`: Performance budgets and thresholds
- `test-build.js`: Build validation rules

## Exit Codes

- `0`: All tests passed
- `1`: Critical failures found (blocks deployment)

Scripts will provide detailed output showing which tests passed, failed, or generated warnings.