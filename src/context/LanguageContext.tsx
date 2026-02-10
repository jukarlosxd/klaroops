'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// --- Dictionary ---
export const dictionary = {
  en: {
    sidebar: {
      brand: 'KlaroOps',
      adminPanel: 'Admin Panel',
      clientPortal: 'Client Portal',
      ambassadorPanel: 'Ambassador Panel',
      homeAdmin: 'Home Admin',
      applications: 'Applications',
      management: 'Management',
      ambassadors: 'Ambassadors',
      clients: 'Clients',
      auditLog: 'Audit Log',
      settings: 'Settings',
      myDashboard: 'My Dashboard',
      home: 'Home',
      clientDashboards: 'Client Dashboards',
      myClients: 'My Clients',
      appointments: 'Appointments',
      logout: 'Sign Out',
      salesAssistant: 'Prospects',
      salesAssistantMenu: 'Prospects',
      mySales: 'My Sales',
      dashboards: 'Dashboards'
    },
    dashboard: {
      title: 'Dashboard',
      activeClients: 'Active Clients',
      commissions: 'Commissions',
      totalLeads: 'Total Leads',
      conversionRate: 'Conversion Rate',
      recentActivity: 'Recent Activity',
      noActivity: 'No recent activity',
      errorProfile: 'Error: Ambassador profile not found.'
    },
    clients: {
      title: 'My Clients',
      addClient: 'Add Client',
      searchPlaceholder: 'Search clients...',
      status: 'Status',
      contractValue: 'Contract Value',
      noClients: 'No clients found.',
      table: {
        name: 'Name',
        status: 'Status',
        value: 'Value',
        lastActivity: 'Last Activity'
      }
    },
    appointments: {
      title: 'Appointments',
      newAppointment: 'New Appointment',
      upcoming: 'Upcoming',
      past: 'Past',
      noAppointments: 'No appointments found.'
    },
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View'
    },
    salesAssistant: {
        title: 'Sales Assistant',
        leads: 'My Leads',
        addLead: 'Add Lead',
        chatTitle: 'AI Sales Coach',
        chatPlaceholder: 'Ask for advice, messaging help, or strategy...',
        emptyChat: 'Start a conversation with your AI Sales Coach.',
        leadContext: 'Talking about:',
        noContext: 'General Strategy',
        status: {
            new: 'New',
            contacted: 'Contacted',
            interested: 'Interested',
            negotiation: 'Negotiation',
            closed: 'Closed',
            lost: 'Lost'
        },
        form: {
            name: 'Name',
            company: 'Company',
            industry: 'Industry',
            notes: 'Notes / Context',
            save: 'Save Lead'
        }
    }
  },
  es: {
    sidebar: {
      brand: 'KlaroOps',
      adminPanel: 'Panel de Admin',
      clientPortal: 'Portal de Cliente',
      ambassadorPanel: 'Panel de Embajador',
      homeAdmin: 'Inicio Admin',
      applications: 'Solicitudes',
      management: 'Gestión',
      ambassadors: 'Embajadores',
      clients: 'Clientes',
      auditLog: 'Auditoría',
      settings: 'Configuración',
      myDashboard: 'Mi Tablero',
      home: 'Inicio',
      clientDashboards: 'Tableros de Clientes',
      myClients: 'Mis Clientes',
      appointments: 'Citas',
      logout: 'Cerrar Sesión',
      salesAssistant: 'Prospectos',
      salesAssistantMenu: 'Prospectos',
      mySales: 'Mis Ventas',
      dashboards: 'Dashboards'
    },
    dashboard: {
      title: 'Tablero Principal',
      activeClients: 'Clientes Activos',
      commissions: 'Comisiones',
      totalLeads: 'Prospectos Totales',
      conversionRate: 'Tasa de Conversión',
      recentActivity: 'Actividad Reciente',
      noActivity: 'No hay actividad reciente',
      errorProfile: 'Error: Perfil de embajador no encontrado.'
    },
    clients: {
      title: 'Mis Clientes',
      addClient: 'Agregar Cliente',
      searchPlaceholder: 'Buscar clientes...',
      status: 'Estado',
      contractValue: 'Valor del Contrato',
      noClients: 'No se encontraron clientes.',
      table: {
        name: 'Nombre',
        status: 'Estado',
        value: 'Valor',
        lastActivity: 'Última Actividad'
      }
    },
    appointments: {
      title: 'Citas',
      newAppointment: 'Nueva Cita',
      upcoming: 'Próximas',
      past: 'Pasadas',
      noAppointments: 'No se encontraron citas.'
    },
    common: {
      loading: 'Cargando...',
      error: 'Ocurrió un error',
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      view: 'Ver'
    },
    salesAssistant: {
        title: 'Asistente de Ventas',
        leads: 'Mis Prospectos',
        addLead: 'Nuevo Prospecto',
        chatTitle: 'Coach de Ventas IA',
        chatPlaceholder: 'Pide consejos, ayuda con mensajes o estrategia...',
        emptyChat: 'Inicia una conversación con tu Coach de Ventas.',
        leadContext: 'Hablando sobre:',
        noContext: 'Estrategia General',
        status: {
            new: 'Nuevo',
            contacted: 'Contactado',
            interested: 'Interesado',
            negotiation: 'Negociación',
            closed: 'Cerrado',
            lost: 'Perdido'
        },
        form: {
            name: 'Nombre',
            company: 'Empresa',
            industry: 'Industria',
            notes: 'Notas / Contexto',
            save: 'Guardar Prospecto'
        }
    }
  }
};

type Language = 'en' | 'es';
type Content = typeof dictionary.en;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Content;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('klaroops_lang');
    if (saved === 'en' || saved === 'es') {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('klaroops_lang', newLang);
  };

  const value = {
    lang,
    setLang,
    t: dictionary[lang]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
