import { AdminNav } from '@/components/admin/admin-nav';
import { AdminBreadcrumbs } from '@/components/admin/admin-breadcrumbs';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="container mx-auto px-4 py-6">
        <AdminBreadcrumbs />
        <main className="mt-6">
          {children}
        </main>
      </div>
    </div>
  );
}