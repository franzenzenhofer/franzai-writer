# Bundle Analysis & Optimization Guide

This document explains the comprehensive bundle analysis and optimization setup for the Franz AI Writer project.

## Overview

The project now includes automated bundle analysis that:
- Tracks bundle size over time
- Identifies and flags unused dependencies
- Provides detailed bundle composition reports
- Integrates with CI/CD for automated monitoring
- Generates bundle size comparison between builds

## Quick Start

### Local Development

```bash
# Build with bundle analysis
npm run build:analyze

# Run comprehensive bundle analysis
npm run bundle:report

# Check bundle size limits
npm run bundle:size

# Analyze dependencies
npm run deps:analyze

# Find unused dependencies
npm run deps:unused
```

### Bundle Analysis Commands

| Command | Description |
|---------|-------------|
| `npm run build:analyze` | Build with webpack-bundle-analyzer enabled |
| `npm run bundle:report` | Generate comprehensive bundle analysis report |
| `npm run bundle:size` | Check bundle size against configured limits |
| `npm run bundle:analyze` | Build and open bundle analyzer in browser |
| `npm run deps:analyze` | Check for circular dependencies |
| `npm run deps:unused` | Find unused dependencies with detailed report |

## Configuration

### Bundle Size Limits

Bundle size limits are configured in `package.json`:

```json
{
  "bundlesize": [
    {
      "path": ".next/static/js/**/*.js",
      "maxSize": "500kb"
    },
    {
      "path": ".next/static/css/**/*.css",
      "maxSize": "50kb"
    }
  ]
}
```

### Next.js Configuration

Bundle analysis is enabled via environment variable in `next.config.ts`:

```typescript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
```

## CI/CD Integration

### GitHub Actions Workflow

The bundle analysis runs automatically on:
- Push to main/master branches
- Pull requests

The workflow (`/.github/workflows/performance.yml`) includes:
- Comprehensive bundle analysis
- Bundle size checking
- Unused dependency detection
- Automatic PR comments with analysis results

### Artifacts

The following artifacts are generated and stored:
- Bundle analysis reports (30 days retention)
- Knip unused dependency reports
- Bundle size comparison data

## Reports & Analysis

### Bundle Analysis Report

The comprehensive report (`bundle-analysis/reports/bundle-report-*.json`) contains:

```json
{
  "timestamp": "2025-01-10T10:00:00Z",
  "buildHash": "abc123",
  "bundleSize": {
    "total": 1048576,
    "formatted": "1.0 MB"
  },
  "chunks": [...],
  "assets": [...],
  "dependencies": {
    "react": {
      "size": 42567,
      "modules": 15
    }
  },
  "warnings": [],
  "errors": []
}
```

### Dependency Analysis

#### Unused Dependencies

Uses [knip](https://github.com/webpro/knip) to detect:
- Unused dependencies
- Unused files
- Unused exports
- Unused types

Configuration in `knip.json`:

```json
{
  "entry": ["src/app/**/*.tsx", "src/app/**/*.ts"],
  "project": ["src/**/*.ts", "src/**/*.tsx"],
  "ignore": ["**/*.d.ts", "node_modules/**", ".next/**"],
  "ignoreDependencies": ["postcss", "tailwindcss", "eslint-config-next"]
}
```

#### Circular Dependencies

Uses [madge](https://github.com/pahen/madge) to detect circular dependencies in the TypeScript/JavaScript codebase.

## Optimization Strategies

### 1. Code Splitting

Next.js automatically splits code, but you can optimize with:

```javascript
// Dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});

// Route-based code splitting (automatic with Next.js App Router)
```

### 2. Tree Shaking

Ensure optimal tree shaking by:
- Using ES6 imports/exports
- Importing only needed functions from libraries
- Avoiding importing entire libraries

```javascript
// Good
import { debounce } from 'lodash-es';

// Bad
import _ from 'lodash';
```

### 3. Bundle Analysis

Use the webpack bundle analyzer to:
- Identify large dependencies
- Find duplicate code
- Optimize import patterns

```bash
# Open bundle analyzer in browser
npm run bundle:analyze
```

### 4. Dependency Optimization

Regular dependency maintenance:
- Remove unused dependencies
- Update to lighter alternatives
- Use CDN for large libraries when appropriate

## Monitoring & Alerts

### Bundle Size Monitoring

The CI/CD pipeline will:
- ✅ Pass if bundle size is within limits
- ⚠️ Warn if bundle size increases significantly
- ❌ Fail if bundle size exceeds configured limits

### PR Comments

Pull requests automatically receive bundle analysis comments including:
- Total bundle size
- Size comparison with base branch
- Top dependencies by size
- Warnings and errors

## Best Practices

### Development

1. **Regular Analysis**: Run `npm run bundle:report` weekly
2. **Dependency Review**: Check `npm run deps:unused` before releases
3. **Size Awareness**: Monitor bundle size during development

### Dependencies

1. **Audit Regularly**: Review dependencies monthly
2. **Import Optimization**: Use specific imports, not entire libraries
3. **Alternative Evaluation**: Consider lighter alternatives for heavy libraries

### Performance

1. **Lazy Loading**: Use dynamic imports for non-critical components
2. **Code Splitting**: Implement route-based splitting
3. **Asset Optimization**: Compress and optimize static assets

## Troubleshooting

### Common Issues

#### Bundle Analysis Fails

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm ci

# Run analysis again
npm run bundle:report
```

#### Bundle Size Limits Too Strict

Update limits in `package.json`:

```json
{
  "bundlesize": [
    {
      "path": ".next/static/js/**/*.js",
      "maxSize": "750kb"  // Increased from 500kb
    }
  ]
}
```

#### False Positive Unused Dependencies

Add to `knip.json` ignore list:

```json
{
  "ignoreDependencies": [
    "postcss",
    "tailwindcss",
    "your-package-name"
  ]
}
```

## Integration with Development Workflow

### Pre-commit Hooks

Consider adding bundle analysis to pre-commit hooks:

```json
{
  "scripts": {
    "pre-commit": "npm run bundle:size && npm run deps:unused"
  }
}
```

### IDE Integration

Many IDEs can show bundle analysis results:
- VS Code: Webpack Bundle Analyzer extension
- WebStorm: Built-in bundle analysis

## Advanced Configuration

### Custom Bundle Analysis

The `scripts/bundle-analysis.js` script can be customized for specific needs:
- Add custom metrics
- Integrate with external services
- Generate custom reports

### Webpack Configuration

For advanced webpack customization, modify `next.config.ts`:

```typescript
const nextConfig = {
  webpack: (config) => {
    // Custom webpack configuration
    return config;
  },
};
```

## Future Enhancements

### Planned Features

1. **Historical Tracking**: Database storage for long-term trend analysis
2. **Slack Integration**: Automated notifications for significant changes
3. **Custom Dashboards**: Visual bundle analysis dashboards
4. **Performance Budgets**: More granular performance budget controls

### Contributing

When adding new features:
1. Update bundle size limits if necessary
2. Add dependencies to ignore lists if appropriate
3. Run comprehensive bundle analysis before submitting PR
4. Document any new optimization techniques

## Resources

- [Next.js Bundle Analysis](https://nextjs.org/docs/advanced-features/analyzing-bundles)
- [Webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Knip Documentation](https://github.com/webpro/knip)
- [Bundle Size Optimization Guide](https://web.dev/reduce-javascript-payloads-with-code-splitting/)