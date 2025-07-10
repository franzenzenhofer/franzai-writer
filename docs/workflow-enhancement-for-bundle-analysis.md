# GitHub Actions Workflow Enhancement for Bundle Analysis

Due to GitHub App permissions, the workflow file cannot be automatically updated. Please manually apply these changes to `.github/workflows/performance.yml`.

## Enhanced Bundle Analysis Job

Replace the existing `bundle-analysis` job in `.github/workflows/performance.yml` with this enhanced version:

```yaml
  bundle-analysis:
    name: Bundle Size Analysis
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run comprehensive bundle analysis
      run: npm run bundle:report
    
    - name: Check bundle size limits
      run: npm run bundle:size
      continue-on-error: true
    
    - name: Upload bundle analysis reports
      uses: actions/upload-artifact@v4
      with:
        name: bundle-analysis-reports
        path: |
          bundle-analysis/
          .knip-report.json
        retention-days: 30
    
    - name: Comment PR with bundle analysis
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          const path = require('path');
          
          // Find the most recent bundle report
          const reportsDir = 'bundle-analysis/reports';
          if (fs.existsSync(reportsDir)) {
            const files = fs.readdirSync(reportsDir)
              .filter(file => file.startsWith('bundle-report-') && file.endsWith('.json'))
              .sort()
              .reverse();
            
            if (files.length > 0) {
              const reportPath = path.join(reportsDir, files[0]);
              const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
              
              const comment = `## 📦 Bundle Analysis Report
              
              **Build Hash:** \`${report.buildHash}\`
              **Total Bundle Size:** ${report.bundleSize.formatted}
              **Chunks:** ${report.chunks.length}
              **Assets:** ${report.assets.length}
              
              ### Top Dependencies by Size
              ${Object.entries(report.dependencies)
                .sort(([,a], [,b]) => b.size - a.size)
                .slice(0, 10)
                .map(([name, data]) => `- **${name}**: ${Math.round(data.size / 1024)}KB`)
                .join('\n')}
              
              ${report.warnings.length > 0 ? `### ⚠️ Warnings\n${report.warnings.map(w => `- ${w}`).join('\n')}` : ''}
              ${report.errors.length > 0 ? `### ❌ Errors\n${report.errors.map(e => `- ${e}`).join('\n')}` : ''}
              
              <details>
              <summary>📊 Full Bundle Analysis</summary>
              
              View the complete analysis in the workflow artifacts.
              </details>`;
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: comment
              });
            }
          }
```

## What This Enhancement Adds

1. **Comprehensive Bundle Analysis**: Uses the new `bundle:report` script
2. **Bundle Size Checking**: Runs `bundle:size` to enforce limits
3. **Artifact Upload**: Stores bundle analysis reports for 30 days
4. **PR Comments**: Automatically comments on PRs with bundle analysis results
5. **Fetch Depth**: Ensures git history is available for comparisons

## Benefits

- **Automated Reporting**: Every PR gets a detailed bundle analysis comment
- **Size Monitoring**: Automatic detection of bundle size increases
- **Dependency Tracking**: Identifies largest dependencies
- **Historical Data**: Artifacts stored for trend analysis
- **Non-blocking**: Bundle size warnings don't fail the build

## After Manual Update

Once you manually update the workflow file, the CI/CD pipeline will:
1. Run comprehensive bundle analysis on every PR
2. Comment on PRs with detailed bundle information
3. Store analysis reports as artifacts
4. Monitor bundle size against configured limits
5. Provide warnings for unused dependencies

The enhanced workflow integrates seamlessly with all the application-level changes that have been implemented.