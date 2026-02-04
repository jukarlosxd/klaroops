import SettingsClient from './client';
import { getSystemConfig } from '@/lib/admin-db';

export const dynamic = 'force-dynamic';

export default async function SettingsPage(props: { searchParams: Promise<any> }) {
  await props.searchParams; // Consume searchParams even if not used to satisfy Next.js 15
  const config = await getSystemConfig();
  
  return <SettingsClient googleConfig={config} />;
}
