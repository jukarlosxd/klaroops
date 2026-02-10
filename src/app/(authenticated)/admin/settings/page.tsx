import SettingsClient from './client';
import { getSystemConfig } from '@/lib/admin-db';
import { getGoogleIntegrationStatus } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

export default async function SettingsPage(props: { searchParams: Promise<any> }) {
  await props.searchParams; 
  const config = await getSystemConfig();
  const googleStatus = await getGoogleIntegrationStatus();
  
  return <SettingsClient googleConfig={config} googleStatus={googleStatus} />;
}
