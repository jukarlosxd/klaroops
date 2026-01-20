export function KPICard({ title, value, trend }: { title: string, value: string | number, trend: 'good' | 'bad' | 'neutral' }) {
  const color = trend === 'good' ? 'text-green-600' : trend === 'bad' ? 'text-red-600' : 'text-gray-900';
  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
