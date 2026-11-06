import React from 'react';
import { getAllSubmissions } from '@/lib/submissionsStore';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AdminDashboardPage() {
  const initialSubmissions = getAllSubmissions();

  return <AdminDashboardClient initialSubmissions={initialSubmissions} />;
}
