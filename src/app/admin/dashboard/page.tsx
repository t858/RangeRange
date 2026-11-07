import React from 'react';
import { getAllSubmissionsAsync } from '@/lib/submissionsStore';
import AdminDashboardClient from './AdminDashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const initialSubmissions = await getAllSubmissionsAsync();

  return <AdminDashboardClient initialSubmissions={initialSubmissions} />;
}
