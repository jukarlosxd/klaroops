'use client';

import type { Client } from '@/types/client';

interface SetupAssistantProps {
  client: Client;
  tenantId: string;
}

export default function SetupAssistant({ client, tenantId }: SetupAssistantProps) {
  return (
    <div className="p-8 bg-gray-50 rounded-lg text-center">
      <h2 className="text-2xl font-bold mb-4">Asistente de Configuración "From Scratch"</h2>
      <p className="text-gray-600 mb-2">
        Bienvenido, {client.name}.
      </p>
      <p className="text-gray-600">
        Aquí es donde construirás tu dashboard personalizado.
      </p>
      <div className="mt-6 p-4 bg-blue-100 border border-blue-200 rounded-md">
        <p className="text-blue-800 font-medium">
          (Funcionalidad en construcción: Próximamente podrás definir tus propios KPIs, gráficos y vistas aquí.)
        </p>
      </div>
    </div>
  );
}
