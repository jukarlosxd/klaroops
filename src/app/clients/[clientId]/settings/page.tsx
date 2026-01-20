import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p>Not implemented in MVP.</p>
      <Link href=".." className="text-blue-600 underline">Back to Dashboard</Link>
    </div>
  );
}
