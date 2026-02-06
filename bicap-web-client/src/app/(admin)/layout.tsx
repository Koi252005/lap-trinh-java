import type { Metadata } from 'next';
import AdminNav from './admin/AdminNav';
import LogoutButton from '@/components/LogoutButton';

export const metadata: Metadata = {
  title: 'Admin | BICAP',
  description: 'Quản trị hệ thống BICAP',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNav />
      <main className="container mx-auto p-4 md:p-6">{children}</main>
    </div>
  );
}
