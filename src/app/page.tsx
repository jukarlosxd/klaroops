'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { 
  Globe, 
  ArrowLeft, 
  Check, 
  X, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  Menu,
  ChevronDown
} from 'lucide-react';

// --- Content & Config ---
const PRICING_BY_COUNTRY: any = {
    US: {
        lang: "en",
        name: "United States",
        setup: "USD 1,500 – 3,000",
        monthly: "USD 250 – 450"
    },
    MX: {
        lang: "es",
        name: "México",
        setup: "MXN 18,000 – 45,000",
        monthly: "MXN 3,500 – 9,000"
    },
    CO: {
        lang: "es",
        name: "Colombia",
        setup: "COP 1,200,000 – 3,000,000",
        monthly: "COP 250,000 – 600,000"
    },
    GT: {
        lang: "es",
        name: "Guatemala",
        setup: "GTQ 6,000 – 15,000",
        monthly: "GTQ 900 – 2,500"
    }
};

const content: any = {
    en: {
        nav: { brand: 'KlaroOps', login: 'Login' },
        home: {
            headline: 'Turn Your Manufacturing Spreadsheets Into An Intelligent Data Hub',
            subheadline: 'We convert your existing Google Sheets into a clear, professional dashboard with AI-powered answers. No new software to learn. No technical setup required.',
            cta_implement: 'Implement in my business',
            cta_ambassador: 'I want to be an ambassador',
            how_it_works: {
                title: 'How It Works',
                steps: [
                    { title: 'Connect', desc: 'You share access to your current operational Google Sheets.' },
                    { title: 'Build', desc: 'We configure your custom dashboard and train the AI on your data structure.' },
                    { title: 'Decide', desc: 'You receive a secure private link to monitor production and ask questions in real-time.' }
                ]
            },
            benefits: {
                title: 'Benefits',
                list: [
                    { title: 'One Source of Truth', desc: 'Unify operations, inventory, and finance data in a single view.' },
                    { title: 'Instant AI Answers', desc: 'Ask "What was last week\'s waste percentage?" and get an immediate, data-backed answer.' },
                    { title: 'Mobile Ready', desc: 'Access your factory floor metrics from any device, anywhere.' },
                    { title: 'Zero Migration', desc: 'Keep working in Google Sheets; we visualize the data you already have.' },
                    { title: 'Secure Access', desc: 'Granular permission controls ensure only the right people see sensitive financial data.' }
                ]
            },
            faq: {
                title: 'Frequently Asked Questions',
                items: [
                    { q: 'Do I need to migrate my data to a new database?', a: 'No. KlaroOps works directly on top of your existing Google Sheets. You don\'t change your workflow.' },
                    { q: 'Is my data secure?', a: 'Yes. We use enterprise-grade encryption and issue restricted access links. Your raw data never leaves your control.' },
                    { q: 'How long does implementation take?', a: 'Most dashboards are live within 3 to 5 business days after we receive access.' },
                    { q: 'Do I need technical skills to maintain it?', a: 'None. We handle the technical construction and maintenance. You just view the insights.' },
                    { q: 'Can the AI answer complex questions?', a: 'Yes. It can calculate averages, compare periods, and summarize trends based on the data in your sheets.' },
                    { q: 'What happens if I change a column in my Sheet?', a: 'We provide a support line for structural changes. Minor data updates reflect automatically.' }
                ]
            },
            trust: 'Professional installation, dedicated support, and strict data privacy guaranteed.'
        },
        client: {
            headline: 'Turn Your Google Sheets Into An Intelligent Executive Dashboard',
            subheadline: 'Gain total clarity, spot issues, and make fast decisions. All synchronized with your existing spreadsheets.',
            sales_points: [
                'Eliminate file chaos and manual reporting.',
                'Centralize operations in a single source of truth.',
                'Get instant production answers via AI.',
                'No new software: Your team keeps working in Sheets.'
            ],
            included: {
                title: 'What Is Included',
                list: [
                    'Custom-built Metrics Dashboard',
                    'AI Chatbox Integration (trained on your data)',
                    'Secure private access link',
                    'Monthly Maintenance & Priority Support'
                ]
            },
            who_for: {
                title: 'Who This Is For',
                list: [
                    'Manufacturing business owners running operations on Google Sheets.',
                    'Managers who spend hours manually unifying data.'
                ]
            },
            who_not_for: {
                title: 'Who This Is NOT For',
                list: [
                    'Companies looking for a complex traditional ERP (SAP, Oracle).',
                    'Businesses with zero digital records (paper-only).'
                ]
            },
            pricing: {
                title: 'Pricing',
                setup: 'Setup:',
                monthly: 'Monthly:',
                note: 'Price depends on number of Sheets and complexity.',
                alt: 'Book a demo'
            },
            form: {
                title: 'Get Started',
                fields: {
                    name: 'Name',
                    email: 'Email',
                    business_name: 'Business Name',
                    city: 'City',
                    whatsapp: 'WhatsApp',
                    type: 'Business Type (Manufacturing)',
                    select: 'Select...'
                },
                submit: 'Implement in my business',
                after_submit: 'What happens next: We review your current setup and contact you within 24 hours to discuss the plan.',
            },
            trust: 'Professional installation and strict data privacy guaranteed.'
        },
        ambassador: {
            headline: 'Help Manufacturers Make Better Decisions',
            subheadline: 'Join as a strategic partner. Connect real solutions to real problems, without the technical complexity.',
            role_title: 'What An Ambassador Does',
            role_list: [
                'Identify manufacturing companies using Google Sheets.',
                'Introduce KlaroOps to decision-makers.',
                'Make the initial connection.'
            ],
            role_note: 'Note: You do NOT handle technical support, implementation, or configuration.',
            earnings: {
                title: 'How You Earn',
                models: [
                    'Model A (Cash): One-time commission per successful setup.',
                    'Model B (Recurring): Monthly commission while the client remains active.'
                ],
                note: 'Commissions are based on actual payments received.'
            },
            who_for: {
                title: 'Who This Is For',
                list: [
                    'Consultants & Sales Representatives.',
                    'Professionals with an existing manufacturing network.'
                ]
            },
            who_not_for: {
                title: 'Who This Is NOT For',
                list: [
                    'People looking for passive income without effort.',
                    'Individuals with zero B2B contacts.'
                ]
            },
            provide: {
                title: 'We Provide',
                list: [
                    'Full demo access & sales pitch deck.',
                    'Clear pricing structure by country.',
                    'Direct support during your sales process.'
                ]
            },
            form: {
                title: 'Ambassador Application',
                fields: {
                    name: 'Name',
                    email: 'Email',
                    city: 'City',
                    experience: 'Sales Experience (Yes/No)',
                    contacts: 'Approx. contacts/month',
                    whatsapp: 'WhatsApp',
                    why: 'Why do you want to be an ambassador?'
                },
                submit: 'Apply',
                after_submit: 'What happens next: We review your profile. If approved, we schedule a brief call to unlock your materials.'
            }
        },
        login: {
            title: 'Ambassador Access',
            subtitle: 'Enter your credentials to access the panel.',
            email: 'Email',
            password: 'Password',
            submit: 'Secure Login',
            error: 'Invalid credentials',
            back: 'Back to Home'
        }
    },
    es: {
        nav: { brand: 'KlaroOps', login: 'Iniciar Sesión' },
        home: {
            headline: 'Convierta sus Hojas de Cálculo de Manufactura en un Tablero Inteligente',
            subheadline: 'Transformamos sus Google Sheets actuales en un tablero profesional y claro con respuestas por IA. Sin software nuevo que aprender. Sin configuración técnica.',
            cta_implement: 'Implementarlo en mi negocio',
            cta_ambassador: 'Quiero ser embajador',
            how_it_works: {
                title: 'Cómo Funciona',
                steps: [
                    { title: 'Conectar', desc: 'Usted comparte el acceso a sus Google Sheets operativos actuales.' },
                    { title: 'Construir', desc: 'Nosotros configuramos su tablero personalizado y entrenamos a la IA con su estructura de datos.' },
                    { title: 'Decidir', desc: 'Usted recibe un enlace privado y seguro para monitorear la producción y hacer preguntas en tiempo real.' }
                ]
            },
            benefits: {
                title: 'Beneficios',
                list: [
                    { title: 'Fuente Única de Verdad', desc: 'Unifique operaciones, inventario y finanzas en una sola vista.' },
                    { title: 'Respuestas Inmediatas con IA', desc: 'Pregunte "¿Cuál fue el porcentaje de merma la semana pasada?" y obtenga una respuesta instantánea basada en datos.' },
                    { title: 'Listo para Móvil', desc: 'Acceda a las métricas de su planta desde cualquier dispositivo, en cualquier lugar.' },
                    { title: 'Cero Migración', desc: 'Siga trabajando en Google Sheets; nosotros visualizamos los datos que ya tiene.' },
                    { title: 'Acceso Seguro', desc: 'Controles de permiso granulares aseguran que solo las personas correctas vean datos financieros sensibles.' }
                ]
            },
            faq: {
                title: 'Preguntas Frecuentes',
                items: [
                    { q: '¿Necesito migrar mis datos a una base de datos nueva?', a: 'No. KlaroOps funciona directamente sobre sus Google Sheets existentes. No cambia su flujo de trabajo.' },
                    { q: '¿Son seguros mis datos?', a: 'Sí. Usamos encriptación de grado empresarial y emitimos enlaces de acceso restringido. Sus datos crudos nunca salen de su control.' },
                    { q: '¿Cuánto tiempo toma la implementación?', a: 'La mayoría de los tableros están activos entre 3 a 5 días hábiles después de recibir el acceso.' },
                    { q: '¿Necesito conocimientos técnicos para mantenerlo?', a: 'Ninguno. Nosotros manejamos la construcción técnica y el mantenimiento. Usted solo ve los insights.' },
                    { q: '¿Puede la IA responder preguntas complejas?', a: 'Sí. Puede calcular promedios, comparar periodos y resumir tendencias basándose en los datos de sus hojas.' },
                    { q: '¿Qué pasa si cambio una columna en mi Hoja?', a: 'Ofrecemos una línea de soporte para cambios estructurales. Las actualizaciones menores de datos se reflejan automáticamente.' }
                ]
            },
            trust: 'Instalación profesional, soporte dedicado y privacidad de datos garantizada.'
        },
        client: {
            headline: 'Convierta sus Google Sheets en un Tablero de Control Ejecutivo',
            subheadline: 'Obtenga claridad total y tome decisiones rápidas. Todo sincronizado con sus hojas de cálculo actuales.',
            sales_points: [
                'Elimine el caos de múltiples archivos y el reporte manual.',
                'Centralice su operación en una sola fuente de verdad.',
                'Obtenga respuestas inmediatas de su producción vía IA.',
                'No use software nuevo: Su equipo sigue trabajando en Sheets.'
            ],
            included: {
                title: 'Qué Incluye',
                list: [
                    'Tablero de métricas diseñado para su flujo',
                    'Chat de IA entrenado con su histórico',
                    'Enlace de acceso privado y seguro',
                    'Mantenimiento técnico y soporte continuo'
                ]
            },
            who_for: {
                title: 'Para Quién Es',
                list: [
                    'Dueños de manufactura que operan en Google Sheets.',
                    'Gerentes que pierden horas unificando datos.'
                ]
            },
            who_not_for: {
                title: 'Para Quién NO Es',
                list: [
                    'Quienes buscan un ERP complejo tradicional (SAP, Oracle).',
                    'Negocios sin registros digitales (solo papel).'
                ]
            },
            pricing: {
                title: 'Precios',
                setup: 'Implementación:',
                monthly: 'Mantenimiento mensual:',
                note: 'El precio depende del número de Sheets y complejidad.',
                alt: 'Agendar una demo'
            },
            form: {
                title: 'Comenzar',
                fields: {
                    name: 'Nombre',
                    email: 'Email',
                    business_name: 'Nombre del Negocio',
                    city: 'Ciudad',
                    whatsapp: 'WhatsApp',
                    type: 'Tipo de Negocio (Manufactura)',
                    select: 'Seleccionar...'
                },
                submit: 'Implementarlo en mi negocio',
                after_submit: 'Qué pasa después: Analizamos su estructura actual y le contactamos en 24h para una propuesta.'
            },
            trust: 'Instalación profesional garantizada y privacidad absoluta de sus datos.'
        },
        ambassador: {
            headline: 'Ayude a Empresas de Manufactura a Tomar Mejores Decisiones',
            subheadline: 'Únase como socio comercial estratégico. Conecte soluciones reales con problemas reales, sin la complejidad técnica.',
            role_title: 'Qué hace un Embajador',
            role_list: [
                'Identifica empresas que usan Google Sheets.',
                'Presenta KlaroOps a los tomadores de decisiones.',
                'Realiza la conexión inicial.'
            ],
            role_note: 'Nota: Usted NO realiza soporte técnico, implementación ni configuración.',
            earnings: {
                title: 'Cómo Gana',
                models: [
                    'Modelo A (Pago Único): Comisión por cada configuración exitosa.',
                    'Modelo B (Recurrente): Comisión mensual mientras el cliente siga activo.'
                ],
                note: 'Comisiones basadas en pagos reales recibidos del cliente.'
            },
            who_for: {
                title: 'Para Quién Es',
                list: [
                    'Consultores y Representantes de Ventas.',
                    'Profesionales con red en manufactura.'
                ]
            },
            who_not_for: {
                title: 'Para Quién NO Es',
                list: [
                    'Personas buscando ingresos pasivos sin esfuerzo.',
                    'Individuos sin contactos B2B.'
                ]
            },
            provide: {
                title: 'Nosotros Proveemos',
                list: [
                    'Acceso a demo completo y pitch deck.',
                    'Estructura de precios clara por país.',
                    'Soporte directo durante su proceso de venta.'
                ]
            },
            form: {
                title: 'Solicitud de Embajador',
                fields: {
                    name: 'Nombre',
                    email: 'Email',
                    city: 'Ciudad',
                    experience: 'Experiencia en Ventas (Sí/No)',
                    contacts: 'Aprox. contactos/mes',
                    whatsapp: 'WhatsApp',
                    why: '¿Por qué quiere ser embajador?'
                },
                submit: 'Aplicar',
                after_submit: 'Qué pasa después: Revisamos su perfil. Si es aprobado, agendamos una breve llamada para desbloquear sus materiales.'
            }
        },
        login: {
            title: 'Acceso Embajadores',
            subtitle: 'Ingrese sus credenciales para acceder al panel.',
            email: 'Email',
            password: 'Contraseña',
            submit: 'Ingresar Seguro',
            error: 'Credenciales inválidas',
            back: 'Volver al inicio'
        }
    }
};

function getNested(obj: any, path: string) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

export default function Home() {
    const [view, setView] = useState('home');
    const [lang, setLang] = useState('es');
    const [country, setCountry] = useState('US');
    const router = useRouter();

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    const t = content[lang];
    const pricing = PRICING_BY_COUNTRY[country];

    const switchView = (v: string) => {
        setView(v);
        window.scrollTo(0, 0);
    };

    const handleSetCountry = (code: string) => {
        if (!PRICING_BY_COUNTRY[code]) return;
        setCountry(code);
        setLang(PRICING_BY_COUNTRY[code].lang);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLoginError('');

        try {
            const res = await signIn('credentials', {
                email: email.trim().toLowerCase(),
                password,
                redirect: false
            });

            if (res?.error) {
                setLoginError('Credenciales incorrectas');
                setLoading(false);
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setLoginError('Error de conexión');
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 text-gray-900 font-sans min-h-screen flex flex-col">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="text-2xl font-bold text-blue-900 cursor-pointer" onClick={() => switchView('home')}>
                            KlaroOps
                        </div>
                        <div className="flex items-center space-x-6">
                            <button 
                                onClick={() => setLang(lang === 'es' ? 'en' : 'es')} 
                                className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <Globe className="w-4 h-4" />
                                <span>{lang.toUpperCase()}</span>
                            </button>
                            <button 
                                onClick={() => switchView('login')} 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                {t.nav.login}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-grow">
                {/* VIEW: HOME */}
                {view === 'home' && (
                    <div className="fade-in">
                        {/* Hero */}
                        <section className="bg-white py-20 border-b border-gray-100">
                            <div className="max-w-4xl mx-auto px-4 text-center">
                                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
                                    {t.home.headline}
                                </h1>
                                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                                    {t.home.subheadline}
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <button onClick={() => switchView('client')} className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition shadow-lg">
                                        {t.home.cta_implement}
                                    </button>
                                    <button onClick={() => switchView('ambassador')} className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition">
                                        {t.home.cta_ambassador}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* How It Works */}
                        <section className="py-16 bg-gray-50">
                            <div className="max-w-7xl mx-auto px-4">
                                <h2 className="text-3xl font-bold text-center mb-12">{t.home.how_it_works.title}</h2>
                                <div className="grid md:grid-cols-3 gap-8">
                                    {t.home.how_it_works.steps.map((step: any, idx: number) => (
                                        <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">
                                                {idx + 1}
                                            </div>
                                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                            <p className="text-gray-600">{step.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Benefits */}
                        <section className="py-16 bg-white">
                            <div className="max-w-7xl mx-auto px-4">
                                <h2 className="text-3xl font-bold text-center mb-12">{t.home.benefits.title}</h2>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {t.home.benefits.list.map((benefit: any, idx: number) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <Check className="w-6 h-6 text-green-500" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold mb-1">{benefit.title}</h3>
                                                <p className="text-gray-600">{benefit.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* FAQ */}
                        <section className="py-16 bg-gray-50">
                            <div className="max-w-3xl mx-auto px-4">
                                <h2 className="text-3xl font-bold text-center mb-12">{t.home.faq.title}</h2>
                                <div className="space-y-6">
                                    {t.home.faq.items.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-bold mb-2">{item.q}</h3>
                                            <p className="text-gray-600">{item.a}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Trust */}
                        <section className="py-8 bg-blue-900 text-white text-center px-4">
                            <div className="flex items-center justify-center gap-2 text-sm sm:text-base opacity-90">
                                <ShieldCheck className="w-5 h-5" />
                                <p>{t.home.trust}</p>
                            </div>
                        </section>
                    </div>
                )}

                {/* VIEW: CLIENT */}
                {view === 'client' && (
                    <div className="fade-in">
                        <div className="max-w-7xl mx-auto px-4 py-12">
                            <button onClick={() => switchView('home')} className="mb-8 text-gray-500 hover:text-gray-900 flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                            
                            <div className="grid lg:grid-cols-2 gap-12 items-start">
                                {/* Left Column: Info */}
                                <div>
                                    <h1 className="text-4xl font-bold mb-4 text-gray-900">{t.client.headline}</h1>
                                    <p className="text-lg text-gray-600 mb-8 font-medium">{t.client.subheadline}</p>
                                    
                                    <ul className="space-y-3 mb-8">
                                        {t.client.sales_points.map((item: string, idx: number) => (
                                            <li key={idx} className="flex items-start">
                                                <div className="flex-shrink-0 mt-1 mr-2">
                                                    <ArrowLeft className="w-4 h-4 text-blue-500 rotate-180" />
                                                </div>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    
                                    <div className="bg-blue-50 p-6 rounded-xl mb-8">
                                        <h3 className="font-bold text-lg mb-4 text-blue-900">{t.client.included.title}</h3>
                                        <ul className="space-y-2">
                                            {t.client.included.list.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-start">
                                                    <div className="flex-shrink-0 mt-1 mr-2">
                                                        <Check className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-3">{t.client.who_for.title}</h3>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                {t.client.who_for.list.map((item: string, idx: number) => (
                                                    <li key={idx} className="flex items-start">
                                                        <div className="flex-shrink-0 mt-1 mr-2">
                                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                                        </div>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-3">{t.client.who_not_for.title}</h3>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                {t.client.who_not_for.list.map((item: string, idx: number) => (
                                                    <li key={idx} className="flex items-start">
                                                        <div className="flex-shrink-0 mt-1 mr-2">
                                                            <X className="w-3.5 h-3.5 text-red-400" />
                                                        </div>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="font-bold text-xl mb-4">{t.client.pricing.title}</h3>
                                        
                                        <div className="flex flex-wrap items-center gap-3 mb-6">
                                            <span className="text-sm font-medium text-gray-500">
                                                {lang === 'en' ? 'Country:' : 'País:'}
                                            </span>
                                            <div className="flex gap-2">
                                                {['US', 'MX', 'CO', 'GT'].map(c => (
                                                    <button 
                                                        key={c}
                                                        onClick={() => handleSetCountry(c)}
                                                        className={`w-12 h-10 flex items-center justify-center rounded-lg border text-2xl shadow-sm transition-all ${country === c ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
                                                    >
                                                        {c === 'US' ? '🇺🇸' : c === 'MX' ? '🇲🇽' : c === 'CO' ? '🇨🇴' : '🇬🇹'}
                                                    </button>
                                                ))}
                                            </div>
                                            <span className="text-sm font-semibold text-blue-900">{pricing.name}</span>
                                        </div>

                                        <div className="space-y-2 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <p className="text-gray-700 font-medium">
                                                <span>{t.client.pricing.setup}</span> 
                                                <span className="text-blue-600 font-bold ml-1">
                                                    {lang === 'en' ? 'From ' : 'Desde '}{pricing.setup}
                                                </span>
                                            </p>
                                            <p className="text-gray-700 font-medium">
                                                <span>{t.client.pricing.monthly}</span> 
                                                <span className="text-blue-600 font-bold ml-1">
                                                    {lang === 'en' ? 'From ' : 'Desde '}{pricing.monthly}
                                                    {lang === 'en' ? ' / month' : ' / mes'}
                                                </span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">{t.client.pricing.note}</p>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2">
                                            <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline">
                                                {t.client.pricing.alt}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Form */}
                                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                                    <h2 className="text-2xl font-bold mb-6">{t.client.form.title}</h2>
                                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Form submitted!'); }}>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.client.form.fields.name}</label>
                                            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.client.form.fields.email}</label>
                                            <input type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.client.form.fields.business_name}</label>
                                            <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.client.form.fields.city}</label>
                                                <input type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.client.form.fields.whatsapp}</label>
                                                <input type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.client.form.fields.type}</label>
                                            <select className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                <option value="">{t.client.form.fields.select}</option>
                                                <option value="manufacturing">Manufacturing / Manufactura</option>
                                                <option value="other">Other / Otro</option>
                                            </select>
                                        </div>
                                        
                                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
                                            {t.client.form.submit}
                                        </button>
                                        
                                        <p className="text-xs text-gray-500 mt-4 text-center">
                                            {t.client.form.after_submit}
                                        </p>
                                    </form>
                                    
                                    <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                        <p className="text-xs text-gray-500">{t.client.trust}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: AMBASSADOR */}
                {view === 'ambassador' && (
                    <div className="fade-in">
                        <div className="max-w-7xl mx-auto px-4 py-12">
                            <button onClick={() => switchView('home')} className="mb-8 text-gray-500 hover:text-gray-900 flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>

                            <div className="grid lg:grid-cols-2 gap-12 items-start">
                                {/* Left Column: Info */}
                                <div>
                                    <h1 className="text-4xl font-bold mb-6 text-gray-900">{t.ambassador.headline}</h1>
                                    <p className="text-lg text-gray-600 mb-8 font-medium">{t.ambassador.subheadline}</p>

                                    <div className="mb-8">
                                        <h3 className="font-bold text-gray-900 mb-3">{t.ambassador.role_title}</h3>
                                        <ul className="space-y-2 text-gray-600 mb-4">
                                            {t.ambassador.role_list.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-start">
                                                    <div className="flex-shrink-0 mt-1 mr-2">
                                                        <ArrowLeft className="w-4 h-4 text-blue-500 rotate-180" />
                                                    </div>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-sm text-gray-500 italic">{t.ambassador.role_note}</p>
                                    </div>

                                    <div className="bg-green-50 p-6 rounded-xl mb-8">
                                        <h3 className="font-bold text-lg mb-4 text-green-900">{t.ambassador.earnings.title}</h3>
                                        <ul className="space-y-3">
                                            {t.ambassador.earnings.models.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-start">
                                                    <div className="bg-green-200 p-1 rounded-full mt-1 mr-3">
                                                        <Check className="w-3.5 h-3.5 text-green-800" />
                                                    </div>
                                                    <span className="font-medium text-green-900">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-green-700 mt-3">{t.ambassador.earnings.note}</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-3">{t.ambassador.who_for.title}</h3>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                {t.ambassador.who_for.list.map((item: string, idx: number) => (
                                                    <li key={idx} className="flex items-start">
                                                        <div className="flex-shrink-0 mt-1 mr-2">
                                                            <Check className="w-3.5 h-3.5 text-green-500" />
                                                        </div>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-3">{t.ambassador.who_not_for.title}</h3>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                {t.ambassador.who_not_for.list.map((item: string, idx: number) => (
                                                    <li key={idx} className="flex items-start">
                                                        <div className="flex-shrink-0 mt-1 mr-2">
                                                            <X className="w-3.5 h-3.5 text-red-400" />
                                                        </div>
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-3">{t.ambassador.provide.title}</h3>
                                        <ul className="space-y-2 text-gray-600">
                                            {t.ambassador.provide.list.map((item: string, idx: number) => (
                                                <li key={idx} className="flex items-start">
                                                    <div className="flex-shrink-0 mt-2 mr-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    </div>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Right Column: Form */}
                                <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                                    <h2 className="text-2xl font-bold mb-6">{t.ambassador.form.title}</h2>
                                    <form className="space-y-4" onSubmit={async (e) => { 
                                        e.preventDefault(); 
                                        const form = e.target as HTMLFormElement;
                                        const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                                        const originalText = btn.innerText;
                                        
                                        // Simple form data extraction
                                        const formData = {
                                            full_name: (form.querySelector('input[name="name"]') as HTMLInputElement).value,
                                            email: (form.querySelector('input[name="email"]') as HTMLInputElement).value,
                                            city_state: (form.querySelector('input[name="city"]') as HTMLInputElement).value,
                                            phone: (form.querySelector('input[name="phone"]') as HTMLInputElement).value,
                                            // Combine extra fields into message
                                            message: `
                                                Experience: ${(form.querySelector('select[name="experience"]') as HTMLSelectElement).value}
                                                Contacts: ${(form.querySelector('input[name="contacts"]') as HTMLInputElement).value}
                                                Why: ${(form.querySelector('textarea[name="why"]') as HTMLTextAreaElement).value}
                                            `,
                                            company: (form.querySelector('input[name="company_honeypot"]') as HTMLInputElement).value // Honeypot
                                        };

                                        btn.disabled = true;
                                        btn.innerText = 'Sending...';

                                        try {
                                            const res = await fetch('/api/ambassador-apply', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(formData)
                                            });
                                            
                                            if (res.ok) {
                                                alert('Application submitted successfully! We will contact you soon.');
                                                form.reset();
                                                switchView('home');
                                            } else {
                                                const err = await res.json();
                                                alert('Error: ' + (err.error || 'Failed to submit'));
                                            }
                                        } catch (error) {
                                            alert('Network error. Please try again.');
                                        }
                                        
                                        btn.disabled = false;
                                        btn.innerText = originalText;
                                    }}>
                                        {/* Honeypot Field (Hidden) */}
                                        <input type="text" name="company_honeypot" style={{display: 'none'}} tabIndex={-1} autoComplete="off" />

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.ambassador.form.fields.name}</label>
                                            <input name="name" type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.ambassador.form.fields.email}</label>
                                            <input name="email" type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.ambassador.form.fields.city}</label>
                                                <input name="city" type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.ambassador.form.fields.whatsapp}</label>
                                                <input name="phone" type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.ambassador.form.fields.experience}</label>
                                                <select name="experience" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                    <option value="">Select...</option>
                                                    <option value="yes">Yes / Sí</option>
                                                    <option value="no">No</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.ambassador.form.fields.contacts}</label>
                                                <input name="contacts" type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t.ambassador.form.fields.why}</label>
                                            <textarea name="why" rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required></textarea>
                                        </div>
                                        
                                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                                            {t.ambassador.form.submit}
                                        </button>
                                        
                                        <p className="text-xs text-gray-500 mt-4 text-center">
                                            {t.ambassador.form.after_submit}
                                        </p>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* VIEW: LOGIN */}
                {view === 'login' && (
                    <div className="fade-in">
                        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center px-4 py-12">
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900">{t.login.title}</h2>
                                    <p className="text-sm text-gray-500 mt-2">{t.login.subtitle}</p>
                                </div>
                                
                                <form onSubmit={handleLogin} className="space-y-6">
                                    {loginError && (
                                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center border border-red-100">
                                            {loginError}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.login.email}</label>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="email" 
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                            required 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t.login.password}</label>
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="current-password" 
                                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                            required 
                                        />
                                    </div>

                                    <button type="submit" disabled={loading} className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-lg flex justify-center items-center gap-2">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                                        <span>{loading ? 'Verificando...' : t.login.submit}</span>
                                    </button>
                                </form>

                                <div className="mt-6 text-center">
                                    <button onClick={() => switchView('home')} className="text-sm text-gray-500 hover:text-gray-900 underline">
                                        {t.login.back}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-white py-8 border-t border-gray-100 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} KlaroOps. All rights reserved.
                </div>
            </footer>
        </div>
    );
}