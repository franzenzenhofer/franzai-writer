"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  
  // Generate breadcrumb segments from pathname
  const segments = pathname.split('/').filter(Boolean);
  
  // Create breadcrumb items
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    
    // Convert segment to readable name
    const name = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return {
      name,
      href,
      isLast
    };
  });

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-slate-400 mx-2" />
            )}
            {crumb.isLast ? (
              <span className="text-sm font-medium text-slate-900">
                {crumb.name}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                {crumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}