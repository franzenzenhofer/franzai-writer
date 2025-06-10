# Implement SEO and Metadata Optimization

**Created**: 2025-06-10
**Priority**: Medium
**Component**: SEO/Performance

## Description
Implement comprehensive SEO optimization using Next.js 15 metadata API, including dynamic OG images, structured data, and performance optimizations.

## Tasks
- [ ] Implement dynamic metadata for all pages
- [ ] Create dynamic OG images
- [ ] Add structured data (JSON-LD)
- [ ] Implement sitemap generation
- [ ] Add robots.txt configuration
- [ ] Optimize Core Web Vitals
- [ ] Implement proper canonical URLs

## Metadata Implementation

### Dynamic Metadata
```typescript
// app/wizard/[pageId]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const workflow = await getWorkflow(params.pageId);
  
  return {
    title: `${workflow.name} - Franz AI Writer`,
    description: workflow.description,
    openGraph: {
      title: workflow.name,
      description: workflow.description,
      images: [`/api/og?workflow=${workflow.id}`],
    },
  };
}
```

### Dynamic OG Images
```typescript
// app/api/og/route.tsx
import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workflow = searchParams.get('workflow');
  
  return new ImageResponse(
    <div style={{
      background: 'linear-gradient(to bottom right, #1e40af, #3b82f6)',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <h1>{workflow} Wizard</h1>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### Structured Data
```typescript
// components/structured-data.tsx
export function ArticleStructuredData({ article }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.createdAt,
    author: {
      '@type': 'Person',
      name: article.author,
    },
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

## Performance Optimizations
- Implement next/font for font optimization
- Use next/image for all images
- Lazy load heavy components
- Implement route prefetching
- Optimize bundle size

## Acceptance Criteria
- [ ] All pages have proper meta tags
- [ ] OG images generate dynamically
- [ ] Structured data validates
- [ ] Sitemap accessible
- [ ] Core Web Vitals pass
- [ ] SEO audit score > 95