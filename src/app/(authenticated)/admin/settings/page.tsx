import SettingsClient from './client';

export const dynamic = 'force-dynamic';

export default async function SettingsPage(props: { searchParams: Promise<any> }) {
  await props.searchParams; // Consume searchParams even if not used to satisfy Next.js 15
  
  return <SettingsClient />;
}
