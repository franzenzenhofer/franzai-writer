#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ANALYSIS_DIR = path.join(process.cwd(), 'bundle-analysis');
const REPORTS_DIR = path.join(ANALYSIS_DIR, 'reports');

// Ensure analysis directories exist
if (!fs.existsSync(ANALYSIS_DIR)) {
  fs.mkdirSync(ANALYSIS_DIR, { recursive: true });
}
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

async function generateBundleAnalysis() {
  console.log('🔍 Starting comprehensive bundle analysis...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(REPORTS_DIR, `bundle-report-${timestamp}.json`);
  
  try {
    // 1. Build with bundle analysis
    console.log('\n📦 Building with bundle analysis...');
    execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
    
    // 2. Generate webpack stats
    console.log('\n📊 Generating webpack stats...');
    const nextDir = path.join(process.cwd(), '.next');
    const statsPath = path.join(nextDir, 'webpack-stats.json');
    
    if (fs.existsSync(statsPath)) {
      const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      const analysis = {
        timestamp: new Date().toISOString(),
        buildHash: stats.hash,
        bundleSize: getBundleSize(nextDir),
        chunks: getChunkAnalysis(stats),
        assets: getAssetAnalysis(stats),
        dependencies: getDependencyAnalysis(stats),
        warnings: stats.warnings || [],
        errors: stats.errors || []
      };
      
      fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
      console.log(`✅ Bundle analysis saved to: ${reportPath}`);
    }
    
    // 3. Run unused dependency check
    console.log('\n🔍 Checking for unused dependencies...');
    try {
      execSync('npm run deps:unused', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Some unused dependencies detected (non-blocking)');
    }
    
    // 4. Run circular dependency check
    console.log('\n🔄 Checking for circular dependencies...');
    try {
      execSync('npm run deps:analyze', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Circular dependencies detected (see output above)');
    }
    
    // 5. Generate size comparison if previous report exists
    const previousReport = getMostRecentReport(REPORTS_DIR, timestamp);
    if (previousReport) {
      console.log('\n📈 Generating size comparison...');
      generateSizeComparison(reportPath, previousReport);
    }
    
    console.log('\n🎉 Bundle analysis complete!');
    
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

function getBundleSize(nextDir) {
  const staticDir = path.join(nextDir, 'static');
  let totalSize = 0;
  
  if (fs.existsSync(staticDir)) {
    const files = getAllFiles(staticDir);
    files.forEach(file => {
      const stats = fs.statSync(file);
      totalSize += stats.size;
    });
  }
  
  return {
    total: totalSize,
    formatted: formatBytes(totalSize)
  };
}

function getChunkAnalysis(stats) {
  if (!stats.chunks) return [];
  
  return stats.chunks.map(chunk => ({
    id: chunk.id,
    names: chunk.names,
    size: chunk.size,
    files: chunk.files,
    rendered: chunk.rendered
  }));
}

function getAssetAnalysis(stats) {
  if (!stats.assets) return [];
  
  return stats.assets.map(asset => ({
    name: asset.name,
    size: asset.size,
    chunks: asset.chunks,
    emitted: asset.emitted
  }));
}

function getDependencyAnalysis(stats) {
  if (!stats.modules) return {};
  
  const dependencies = {};
  stats.modules.forEach(module => {
    if (module.name && module.name.includes('node_modules')) {
      const match = module.name.match(/node_modules\/([^\/]+)/);
      if (match) {
        const packageName = match[1];
        if (!dependencies[packageName]) {
          dependencies[packageName] = {
            size: 0,
            modules: 0
          };
        }
        dependencies[packageName].size += module.size || 0;
        dependencies[packageName].modules += 1;
      }
    }
  });
  
  return dependencies;
}

function getAllFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  });
  
  return files;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getMostRecentReport(reportsDir, currentTimestamp) {
  const files = fs.readdirSync(reportsDir)
    .filter(file => file.startsWith('bundle-report-') && file.endsWith('.json'))
    .filter(file => !file.includes(currentTimestamp))
    .sort()
    .reverse();
  
  return files.length > 0 ? path.join(reportsDir, files[0]) : null;
}

function generateSizeComparison(currentReportPath, previousReportPath) {
  const currentReport = JSON.parse(fs.readFileSync(currentReportPath, 'utf8'));
  const previousReport = JSON.parse(fs.readFileSync(previousReportPath, 'utf8'));
  
  const currentSize = currentReport.bundleSize.total;
  const previousSize = previousReport.bundleSize.total;
  const difference = currentSize - previousSize;
  const percentChange = ((difference / previousSize) * 100).toFixed(2);
  
  console.log('\n📊 Bundle Size Comparison:');
  console.log(`Previous: ${formatBytes(previousSize)}`);
  console.log(`Current:  ${formatBytes(currentSize)}`);
  console.log(`Change:   ${difference > 0 ? '+' : ''}${formatBytes(difference)} (${percentChange}%)`);
  
  if (Math.abs(difference) > 50000) { // 50KB threshold
    console.log(`${difference > 0 ? '⚠️' : '✅'} Significant bundle size change detected!`);
  }
}

// Run the analysis
generateBundleAnalysis();