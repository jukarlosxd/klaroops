'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Loader2, 
  MessageSquare,
  BarChart3,
  Zap,
  Layout,
  Globe,
  ArrowRight,
  PlayCircle,
  Menu,
  Link as LinkIcon,
  Cpu,
  Smartphone,
  X,
  AlertTriangle,
  HardHat,
  TrendingUp,
  Clock,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

import Link from 'next/link';
import { PricingSection } from '@/components/PricingSection';
import SupportChatWidget from '@/components/SupportChatWidget';

// --- Configuration & Content ---
const PRICING_BY_COUNTRY: any = {
    US: {
        lang: "en",
        name: "United States",
        setup: "USD 500 – 2,500",
        monthly: "USD 199 – 599"
    },
    MX: {
        lang: "es",
        name: "México",
        setup: "MXN 8,500 – 45,000",
        monthly: "MXN 3,500 – 10,500"
    },
    CO: {
        lang: "es",
        name: "Colombia",
        setup: "COP 2,000,000 – 9,000,000",
        monthly: "COP 800,000 – 2,500,000"
    },
    GT: {
        lang: "es",
        name: "Guatemala",
        setup: "GTQ 3,500 – 18,000",
        monthly: "GTQ 1,500 – 4,500"
    }
};

const content: any = {
    en: {
        nav: { brand: 'KlaroOps', login: 'Login', bookDemo: 'Start Free Trial' },
        hero: {
            headline: 'Stop Managing Spreadsheets. Start Managing Operations.',
            subheadline: 'KlaroOps turns messy construction logs into decision-ready insights. Spot variances, assign actions, and prevent margin fade in seconds.',
            cta_primary: 'See the Decision Engine',
            cta_secondary: 'Need something custom?',
            demo_caption: 'See how it works'
        },
        how_it_works: {
            title: 'From Chaos to Command in 3 Steps',
            steps: [
                { title: 'Connect Logs', desc: 'Sync your existing daily reports & cost sheets.', icon: 'link' },
                { title: 'Detect Issues', desc: 'AI spots budget variances & schedule slips instantly.', icon: 'alert' },
                { title: 'Act Instantly', desc: 'Assign fixes to site managers before margins bleed.', icon: 'zap' }
            ]
        },
        comparison: {
            title: 'The Cost of "Waiting for the Report"',
            before_label: 'Before: Static Spreadsheets',
            after_label: 'After: Active Command Center',
            before_desc: 'Buried problems, delayed reactions, margin bleed.',
            after_desc: 'Instant variance alerts, root cause clarity, rapid decisions.'
        },
        live_demo: {
            title: 'Your AI Operations Analyst',
            chat_placeholder: 'Why are we over budget on Site B?',
            ai_response: 'Site B is $45k over budget due to emergency steel orders (Vendor: SteelCorp). Action: Review PO approvals immediately.',
            cta: 'Try the Decision Engine'
        },
        who_for: {
            title: 'Built for Decision-Makers, Not Just Data Entry',
            cards: [
                { title: 'Project Managers', desc: 'Catch schedule slips before they impact the critical path.', icon: 'clock' },
                { title: 'Site Superintendents', desc: 'Track daily labor & material usage against the plan.', icon: 'hardhat' },
                { title: 'Financial Controllers', desc: 'Stop margin fade with real-time cost variance alerts.', icon: 'trending' },
                { title: 'Operations Directors', desc: 'Standardize reporting across all sites instantly.', icon: 'layout' }
            ]
        },
        features: {
            title: 'A Platform That Thinks Like a Manager',
            list: [
                { title: 'Change Detection', desc: 'Alerts you the moment costs deviate from budget.', icon: 'alert' },
                { title: 'Root Cause AI', desc: 'Identifies WHY costs are up (Price? Volume? Waste?).', icon: 'cpu' },
                { title: 'Field Access', desc: 'Mobile-first view for decisions on the job site.', icon: 'phone' },
                { title: 'Bank-Grade Security', desc: 'Enterprise encryption for your sensitive project data.', icon: 'lock' }
            ]
        },
        trust: {
            text: 'Used by construction leaders to protect margins on over $500M in projects.'
        },
        cta_footer: {
            title: 'Stop the Bleeding. Start Leading.',
            btn_demo: 'Start Free Trial',
            btn_ambassador: 'Partner Program'
        },
        contact: {
            title: 'Custom Solutions',
            subtitle: 'For teams with large datasets or custom needs. Most users start with the free trial.',
            form: {
                name: 'Name',
                email: 'Work Email',
                message: 'Tell us about your needs',
                submit: 'Contact Sales'
            }
        },
        ambassador: { 
            headline: 'Help Builders Build Better',
            subheadline: 'Join our partner program and help construction firms modernize.',
            earnings: {
                title: 'Partner Benefits',
                models: ['20% Recurring Revenue', 'Sales & Tech Support', 'Co-Marketing Resources']
            },
            form: {
                title: 'Apply Now',
                fields: { 
                    name: 'Full Name', 
                    email: 'Email Address', 
                    phone: 'WhatsApp',
                    city: 'City & Country',
                    experience: 'Do you have Construction/SaaS sales experience? (Yes/No)',
                    outreach_volume: 'Estimated monthly outreach',
                    why: 'Why do you want to join?' 
                },
                submit: 'Submit Application'
            }
        },
        login: { 
            title: 'Command Center Login',
            email: 'Email',
            password: 'Password',
            submit: 'Enter'
        }
    },
    es: {
        nav: { brand: 'KlaroOps', login: 'Entrar', bookDemo: 'Empezar Prueba Gratis' },
        hero: {
            headline: 'Deje de "Administrar Hojas". Empiece a Gestionar Obras.',
            subheadline: 'KlaroOps convierte reportes de obra desordenados en decisiones claras. Detecte desviaciones, asigne acciones y proteja su margen en segundos.',
            cta_primary: 'Ver el Motor de Decisión',
            cta_secondary: '¿Necesita algo personalizado?',
            demo_caption: 'Ver cómo funciona'
        },
        how_it_works: {
            title: 'Del Caos al Control en 3 Pasos',
            steps: [
                { title: 'Conectar', desc: 'Sincronice sus reportes diarios y costos actuales.', icon: 'link' },
                { title: 'Detectar', desc: 'La IA encuentra fugas de presupuesto y retrasos al instante.', icon: 'alert' },
                { title: 'Actuar', desc: 'Asigne correcciones a residentes antes de perder dinero.', icon: 'zap' }
            ]
        },
        comparison: {
            title: 'El Costo de "Esperar el Reporte"',
            before_label: 'Antes: Excel Estático',
            after_label: 'Después: Centro de Mando',
            before_desc: 'Problemas ocultos, reacciones tardías, pérdida de margen.',
            after_desc: 'Alertas inmediatas, causa raíz clara, decisiones rápidas.'
        },
        live_demo: {
            title: 'Su Analista de Operaciones IA',
            chat_placeholder: '¿Por qué nos pasamos del presupuesto en la Torre B?',
            ai_response: 'Torre B está $45k arriba por pedidos de acero de emergencia (Prov: SteelCorp). Acción: Revisar aprobaciones de OC.',
            cta: 'Pruébelo Usted Mismo'
        },
        who_for: {
            title: 'Hecho para Tomadores de Decisiones',
            cards: [
                { title: 'Gerentes de Proyecto', desc: 'Detecte retrasos antes de que afecten la ruta crítica.', icon: 'clock' },
                { title: 'Superintendentes', desc: 'Monitoree uso diario de materiales y mano de obra vs plan.', icon: 'hardhat' },
                { title: 'Controladores', desc: 'Detenga la erosión de márgenes con alertas de costos en vivo.', icon: 'trending' },
                { title: 'Directores de Ops', desc: 'Estandarice reportes en todas las obras al instante.', icon: 'layout' }
            ]
        },
        features: {
            title: 'Una Plataforma que Piensa como Gerente',
            list: [
                { title: 'Detección de Cambios', desc: 'Le alerta en el momento que los costos se desvían.', icon: 'alert' },
                { title: 'IA Causa Raíz', desc: 'Identifica POR QUÉ subieron los costos (¿Precio? ¿Volumen?).', icon: 'cpu' },
                { title: 'Acceso en Campo', desc: 'Vista móvil para decisiones en el sitio de trabajo.', icon: 'phone' },
                { title: 'Seguridad Bancaria', desc: 'Encriptación empresarial para sus datos sensibles.', icon: 'lock' }
            ]
        },
        trust: {
            text: 'Usado por líderes de construcción para proteger márgenes en más de $500M en proyectos.'
        },
        cta_footer: {
            title: 'Deje de Perder Dinero. Empiece a Liderar.',
            btn_demo: 'Empezar Prueba Gratis',
            btn_ambassador: 'Programa de Partners'
        },
        contact: {
            title: 'Soluciones Personalizadas',
            subtitle: 'Para equipos con grandes volúmenes de datos o necesidades a medida. La mayoría empieza con la prueba gratis.',
            form: {
                name: 'Nombre',
                email: 'Email de Trabajo',
                message: 'Cuéntenos sus necesidades',
                submit: 'Contactar Ventas'
            }
        },
        ambassador: { 
            headline: 'Ayude a Construir Mejor',
            subheadline: 'Únase a nuestro programa y ayude a constructoras a modernizarse.',
            earnings: {
                title: 'Beneficios',
                models: ['20% Ingreso Recurrente', 'Soporte Técnico y Ventas', 'Recursos de Co-Marketing']
            },
            form: {
                title: 'Aplicar Ahora',
                fields: { 
                    name: 'Nombre Completo', 
                    email: 'Email', 
                    phone: 'Número',
                    city: 'Ciudad y País',
                    experience: '¿Experiencia en ventas Construcción/B2B? (Sí/No)',
                    outreach_volume: 'Estimado de contacto mensual',
                    why: '¿Por qué quiere unirse?' 
                },
                submit: 'Enviar Aplicación'
            }
        },
        login: { 
            title: 'Entrar al Centro de Mando',
            email: 'Email',
            password: 'Contraseña',
            submit: 'Entrar'
        }
    }
};

// --- Components ---

const Navbar = ({ t, switchView, lang, setLang, view }: any) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="text-2xl font-bold text-blue-900 cursor-pointer flex items-center gap-2" onClick={() => switchView('home')}>
                        <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-sm">
                            <HardHat size={20} />
                        </div>
                        KlaroOps
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Lang Toggle */}
                        <div className="flex items-center bg-gray-100 rounded-full p-1">
                            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'en' ? 'bg-white shadow-sm text-blue-800' : 'text-gray-500'}`}>EN</button>
                            <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === 'es' ? 'bg-white shadow-sm text-blue-800' : 'text-gray-500'}`}>ES</button>
                        </div>
                        
                        {view === 'home' && (
                            <>
                                <button onClick={() => switchView('login')} className="text-sm font-medium text-gray-600 hover:text-blue-700 transition">
                                    {t.nav.login}
                                </button>
                                <Link href="/signup" className="bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                    {t.nav.bookDemo}
                                </Link>
                            </>
                        )}
                    </div>
                     {/* Mobile Menu Icon */}
                     <div className="md:hidden">
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                     </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 shadow-xl"
                >
                    <div className="flex flex-col space-y-4">
                         <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                            <span className="text-sm font-bold text-gray-500">Language</span>
                            <div className="flex gap-2">
                                <button onClick={() => setLang('en')} className={`px-3 py-1 rounded text-xs font-bold ${lang === 'en' ? 'bg-white shadow text-blue-800' : 'text-gray-500'}`}>EN</button>
                                <button onClick={() => setLang('es')} className={`px-3 py-1 rounded text-xs font-bold ${lang === 'es' ? 'bg-white shadow text-blue-800' : 'text-gray-500'}`}>ES</button>
                            </div>
                        </div>
                        
                        {view === 'home' && (
                            <>
                                <button onClick={() => { switchView('login'); setMobileMenuOpen(false); }} className="text-left py-2 font-medium text-gray-600">
                                    {t.nav.login}
                                </button>
                                <Link href="/demo" className="bg-blue-700 text-white px-5 py-3 rounded-lg text-center font-bold">
                                    {t.nav.bookDemo}
                                </Link>
                            </>
                        )}
                         {view !== 'home' && (
                            <button onClick={() => { switchView('home'); setMobileMenuOpen(false); }} className="text-left py-2 font-medium text-gray-600">
                                Back to Home
                            </button>
                        )}
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

const Hero = ({ t, switchView }: any) => {
    return (
        <section className="relative pt-32 pb-24 overflow-hidden bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-bold text-sm mb-8 border border-blue-200">
                        <AlertTriangle size={16} /> Construction Cost Control
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">
                        {t.hero.headline}
                    </h1>
                    <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
                        {t.hero.subheadline}
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                        <Link href="/demo" className="px-8 py-4 bg-blue-700 text-white rounded-lg font-bold text-lg hover:bg-blue-800 transition shadow-xl hover:shadow-2xl hover:-translate-y-1 transform flex items-center justify-center gap-2">
                            {t.hero.cta_primary} <ArrowRight size={20} />
                        </Link>
                        <Link href="/signup" className="px-8 py-4 bg-white text-gray-700 border border-gray-300 rounded-lg font-bold text-lg hover:bg-gray-50 transition shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                            {t.hero.cta_secondary}
                        </Link>
                    </div>
                </motion.div>

                {/* Dashboard Mockup */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="relative max-w-5xl mx-auto"
                >
                    <div className="bg-gray-900 rounded-2xl p-2 shadow-2xl ring-1 ring-gray-900/10">
                         <div className="bg-white rounded-xl overflow-hidden border border-gray-200 aspect-[16/9] relative group cursor-pointer">
                            {/* Fake Dashboard UI */}
                            <div className="absolute inset-0 bg-gray-50 flex flex-col">
                                <div className="h-14 border-b bg-white flex items-center px-6 justify-between shadow-sm z-10">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white"><HardHat size={18} /></div>
                                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-24 h-8 bg-red-50 text-red-700 rounded-full flex items-center justify-center text-xs font-bold border border-red-100">
                                            <AlertTriangle size={12} className="mr-1" /> Risk: High
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-3 gap-6 flex-1 overflow-hidden">
                                    <div className="bg-white rounded-lg border shadow-sm p-5 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600"><TrendingUp size={20} /></div>
                                            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">+12% vs Bid</span>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Project Cost</div>
                                            <div className="text-2xl font-bold text-gray-900">$1,245,000</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border shadow-sm p-5 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600"><Clock size={20} /></div>
                                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">+5 Days</span>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Schedule Variance</div>
                                            <div className="text-2xl font-bold text-gray-900">Delayed</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border shadow-sm p-5 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600"><Check size={20} /></div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">-2%</span>
                                        </div>
                                        <div>
                                            <div className="text-gray-500 text-xs font-bold uppercase mb-1">Labor Efficiency</div>
                                            <div className="text-2xl font-bold text-gray-900">On Track</div>
                                        </div>
                                    </div>
                                    
                                    {/* Chart Area */}
                                    <div className="col-span-2 bg-white rounded-lg border shadow-sm p-5">
                                        <div className="flex justify-between mb-4">
                                            <div className="w-32 h-4 bg-gray-200 rounded"></div>
                                            <div className="flex gap-2">
                                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                                            </div>
                                        </div>
                                        <div className="flex items-end gap-3 h-32">
                                            {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
                                                <div key={i} className="flex-1 flex flex-col gap-1 justify-end h-full">
                                                    <div className="w-full bg-gray-200 rounded-t" style={{ height: `${h * 0.8}%` }}></div>
                                                    <div className="w-full bg-blue-600 rounded-t opacity-90" style={{ height: `${h}%` }}></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Insight Panel */}
                                    <div className="bg-blue-900 rounded-lg shadow-sm p-5 text-white flex flex-col">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Zap size={16} className="text-yellow-400" />
                                            <span className="font-bold text-sm">AI Insight</span>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="bg-blue-800/50 p-3 rounded text-xs leading-relaxed border border-blue-700">
                                                <span className="font-bold text-yellow-300">Alert:</span> Steel prices from "SteelCorp" are 12% higher than bid.
                                            </div>
                                            <div className="bg-blue-800/50 p-3 rounded text-xs leading-relaxed border border-blue-700">
                                                <span className="font-bold text-green-300">Action:</span> Review Site B procurement logs.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-blue-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm">
                                <Link href="/demo" className="bg-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3 text-blue-900 hover:scale-105 transition transform">
                                    <PlayCircle size={24} /> {t.hero.cta_primary}
                                </Link>
                            </div>
                         </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

const HowItWorks = ({ t }: any) => {
    return (
        <section className="py-24 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 text-center">
                 <h2 className="text-3xl font-bold mb-16 text-gray-900">{t.how_it_works.title}</h2>
                 <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 -z-10"></div>

                    {t.how_it_works.steps.map((step: any, i: number) => (
                        <div key={i} className="flex flex-col items-center bg-white">
                            <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6 text-3xl font-bold shadow-lg border-4 border-white ${
                                i === 0 ? 'bg-blue-100 text-blue-700' : 
                                i === 1 ? 'bg-red-100 text-red-700' : 
                                'bg-green-100 text-green-700'
                            }`}>
                                {step.icon === 'link' && <LinkIcon size={40} />}
                                {step.icon === 'alert' && <AlertTriangle size={40} />}
                                {step.icon === 'zap' && <Zap size={40} />}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-gray-600 max-w-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                 </div>
            </div>
        </section>
    )
};

const BeforeAfter = ({ t }: any) => {
    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">{t.comparison.title}</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">See the difference clarity makes.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Before */}
                    <div className="relative group">
                        <div className="absolute -top-4 left-6 bg-gray-800 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide z-10 shadow-lg">
                            {t.comparison.before_label}
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-2 overflow-hidden h-[420px] shadow-sm grayscale opacity-80 group-hover:opacity-100 transition duration-500">
                            <div className="bg-white h-full w-full rounded border shadow-inner p-4 font-mono text-xs text-gray-400 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 pointer-events-none"></div>
                                <div className="grid grid-cols-6 gap-2 mb-2 border-b pb-2 font-bold text-gray-300">
                                    <div>DATE</div><div>ITEM</div><div>CAT</div><div>COST</div><div>VEND</div><div>SITE</div>
                                </div>
                                {[...Array(25)].map((_, r) => (
                                    <div key={r} className="grid grid-cols-6 gap-2 mb-2 opacity-60">
                                        {[...Array(6)].map((_, c) => <div key={c} className="bg-gray-100 h-3 rounded"></div>)}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 flex gap-3 items-start justify-center">
                             <div className="p-2 bg-red-100 text-red-600 rounded-lg"><X size={20} /></div>
                             <p className="text-sm text-gray-600 font-medium max-w-xs pt-1">{t.comparison.before_desc}</p>
                        </div>
                    </div>

                    {/* After */}
                    <div className="relative transform md:-translate-x-4 z-10">
                        <div className="absolute -top-4 right-6 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide z-20 shadow-lg shadow-blue-600/30">
                            {t.comparison.after_label}
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-200 p-1 shadow-2xl h-[420px] overflow-hidden">
                            {/* Mini Dashboard */}
                            <div className="h-full bg-slate-50 rounded-xl flex flex-col overflow-hidden">
                                <div className="p-4 bg-white border-b flex justify-between items-center">
                                    <div className="font-bold text-gray-900">Site B: Overview</div>
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <div className="text-xs font-bold text-red-600">1 Alert</div>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                                    <div className="col-span-2 bg-white border border-red-100 rounded-lg p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase">Variance Alert</p>
                                            <p className="text-lg font-bold text-red-700">Steel Budget Exceeded</p>
                                            <p className="text-xs text-red-500 mt-1">+$45,000 vs Bid</p>
                                        </div>
                                        <AlertTriangle className="text-red-500" size={24} />
                                    </div>
                                    <div className="bg-white border rounded-lg p-4">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Labor Hours</p>
                                        <p className="text-xl font-bold text-gray-800">1,240</p>
                                        <p className="text-xs text-green-600 font-bold mt-1">-5% under</p>
                                    </div>
                                    <div className="bg-white border rounded-lg p-4">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Materials</p>
                                        <p className="text-xl font-bold text-gray-800">$850k</p>
                                        <p className="text-xs text-red-600 font-bold mt-1">+12% over</p>
                                    </div>
                                    <div className="col-span-2 bg-white rounded-lg border p-4 flex-1">
                                        <div className="flex items-end gap-2 h-24 pb-2">
                                            {[30, 50, 40, 70, 60, 90, 80, 100].map((h, i) => (
                                                <div key={i} className={`flex-1 rounded-t ${h > 80 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div className="mt-6 flex gap-3 items-start justify-center">
                             <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Check size={20} /></div>
                             <p className="text-sm text-gray-900 font-bold max-w-xs pt-1">{t.comparison.after_desc}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

const LiveDemo = ({ t }: any) => {
    const [typing, setTyping] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setTyping(true);
            setTimeout(() => {
                setMessages([{ role: 'user', text: t.live_demo.chat_placeholder }]);
                setTyping(false);
                setTimeout(() => {
                    setMessages(prev => [...prev, { role: 'ai', text: t.live_demo.ai_response }]);
                }, 1000);
            }, 1500);
        }, 1000);
        return () => clearTimeout(timer);
    }, [t]);

    return (
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
                <div>
                    <div className="inline-flex items-center gap-2 bg-blue-900/50 text-blue-300 px-4 py-2 rounded-full text-xs font-bold uppercase mb-8 border border-blue-700/50">
                        <Zap size={14} /> {t.live_demo.title}
                    </div>
                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Don't just see the data. <br/>
                        <span className="text-blue-400">Ask the data.</span>
                    </h2>
                    <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                        Managers don't have time to filter columns. KlaroOps lets you ask plain questions and get variance analysis, root causes, and recommended actions instantly.
                    </p>
                    <Link href="/demo" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-blue-50 transition shadow-lg hover:shadow-xl">
                        {t.live_demo.cta} <ArrowRight size={18} />
                    </Link>
                </div>
                
                {/* Chat UI */}
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 shadow-2xl max-w-md w-full mx-auto relative overflow-hidden">
                    <div className="flex items-center gap-4 border-b border-slate-700 pb-4 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Zap size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white">Decision Engine</p>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                            </p>
                        </div>
                    </div>
                    
                    <div className="space-y-4 h-64 overflow-y-auto mb-4 custom-scrollbar">
                        {messages.map((m, i) => (
                            <motion.div 
                                key={i} 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none border border-slate-600'}`}>
                                    {m.text}
                                </div>
                            </motion.div>
                        ))}
                        {typing && (
                            <div className="flex justify-end">
                                <div className="bg-blue-600/20 p-3 rounded-2xl rounded-br-none">
                                    <Loader2 size={16} className="animate-spin text-blue-400" />
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div className="relative">
                        <input disabled className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-4 text-sm text-slate-500 cursor-not-allowed" placeholder="Type a question..." />
                        <div className="absolute right-4 top-4 text-slate-600"><ArrowRight size={16} /></div>
                    </div>
                    
                    {/* TRY IT YOURSELF LINK OVERLAY */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/40 hover:bg-slate-900/30 transition backdrop-blur-[2px]">
                         <Link href="/demo" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2">
                            <PlayCircle size={18} /> Interactive Demo
                         </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

const WhoFor = ({ t }: any) => (
    <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">{t.who_for.title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {t.who_for.cards.map((card: any, i: number) => (
                    <div key={i} className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition duration-300 hover:-translate-y-1 group">
                        <div className="w-14 h-14 bg-white text-blue-700 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                            {card.icon === 'clock' && <Clock size={24} />}
                            {card.icon === 'hardhat' && <HardHat size={24} />}
                            {card.icon === 'trending' && <TrendingUp size={24} />}
                            {card.icon === 'layout' && <Layout size={24} />}
                        </div>
                        <h3 className="font-bold text-lg mb-3 text-gray-900">{card.title}</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{card.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const Features = ({ t }: any) => (
    <section className="py-24 bg-slate-50 border-t border-gray-200">
         <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">{t.features.title}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {t.features.list.map((feature: any, i: number) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-400 transition shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-full flex items-center justify-center mb-4">
                            {feature.icon === 'alert' && <AlertTriangle size={20} />}
                            {feature.icon === 'cpu' && <Cpu size={20} />}
                            {feature.icon === 'lock' && <ShieldCheck size={20} />}
                            {feature.icon === 'phone' && <Smartphone size={20} />}
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.desc}</p>
                    </div>
                ))}
            </div>
         </div>
    </section>
);

const Trust = ({ t }: any) => (
    <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">TRUSTED BY CONSTRUCTION LEADERS</p>
            <p className="text-2xl text-gray-800 font-medium max-w-3xl mx-auto leading-relaxed">
                "{t.trust.text}"
            </p>
        </div>
    </section>
);

const FooterCTA = ({ t, switchView }: any) => (
    <section className="py-24 bg-blue-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
             <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">{t.cta_footer.title}</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup" className="px-10 py-5 bg-white text-blue-900 rounded-lg font-bold text-lg hover:bg-blue-50 transition shadow-xl hover:shadow-2xl">
                    {t.cta_footer.btn_demo}
                </Link>
                <button onClick={() => switchView('ambassador')} className="px-10 py-5 bg-blue-800 text-white border border-blue-700 rounded-lg font-bold text-lg hover:bg-blue-700 transition">
                    {t.cta_footer.btn_ambassador}
                </button>
            </div>
            <p className="mt-10 text-sm text-blue-200 opacity-80">
                No complex migration. Start with your existing spreadsheets.
            </p>
        </div>
    </section>
);

// --- Main Page Component ---

export default function Home() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent />
        </Suspense>
    );
}

function HomeContent() {
    const [view, setView] = useState('home');
    const [lang, setLang] = useState('en');
    const [country, setCountry] = useState('US');
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check for login query param
    useEffect(() => {
        if (searchParams.get('view') === 'login') {
            setView('login');
        }
    }, [searchParams]);

    // Load language preference
    useEffect(() => {
        const savedLang = localStorage.getItem('klaroops_lang');
        if (savedLang && (savedLang === 'en' || savedLang === 'es')) {
            setLang(savedLang);
        }
    }, []);

    const handleSetLang = (newLang: string) => {
        setLang(newLang);
        localStorage.setItem('klaroops_lang', newLang);
    };

    const handleSetCountry = (code: string) => {
        if (!PRICING_BY_COUNTRY[code]) return;
        setCountry(code);
        const newLang = PRICING_BY_COUNTRY[code].lang;
        setLang(newLang);
        localStorage.setItem('klaroops_lang', newLang);
    };

    const switchView = (v: string) => {
        setView(v);
        window.scrollTo(0, 0);
    };

    const t = content[lang];
    const pricing = PRICING_BY_COUNTRY[country];

    // Login Logic
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLoginError('');
        try {
            const res = await signIn('credentials', { email: email.trim().toLowerCase(), password, redirect: false });
            if (res?.error) setLoginError('Credenciales incorrectas');
            else router.push('/dashboard');
        } catch (err) { setLoginError('Error de conexión'); }
        setLoading(false);
    };

    // Ambassador Form Logic
    const [ambassadorForm, setAmbassadorForm] = useState({
        name: '', email: '', phone: '', city: '', experience: '', outreach_volume: '', why: '', company: '' // company is honeypot
    });
    const [ambassadorStatus, setAmbassadorStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleAmbassadorSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAmbassadorStatus('loading');

        try {
            // Combine extra fields into message for backend compatibility
            const combinedMessage = `
${ambassadorForm.why}

---
Additional Info:
City/Country: ${ambassadorForm.city}
Experience: ${ambassadorForm.experience}
Outreach Volume: ${ambassadorForm.outreach_volume}
            `.trim();

            const res = await fetch('/api/ambassador-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: ambassadorForm.name,
                    email: ambassadorForm.email,
                    phone: ambassadorForm.phone,
                    city_state: ambassadorForm.city,
                    message: combinedMessage,
                    company: ambassadorForm.company // Honeypot
                })
            });

            if (res.ok) {
                setAmbassadorStatus('success');
                setAmbassadorForm({ name: '', email: '', phone: '', city: '', experience: '', outreach_volume: '', why: '', company: '' });
            } else {
                setAmbassadorStatus('error');
            }
        } catch (error) {
            setAmbassadorStatus('error');
        }
    };

    return (
        <div className="bg-white text-gray-900 font-sans min-h-screen flex flex-col selection:bg-blue-100 selection:text-blue-900">
            <Navbar t={t} switchView={switchView} lang={lang} setLang={handleSetLang} view={view} />

            <main className="flex-grow">
                {view === 'home' && (
                    <div className="fade-in">
                        <Hero t={t} switchView={switchView} />
                        <HowItWorks t={t} />
                        <BeforeAfter t={t} />
                        <LiveDemo t={t} />
                        <WhoFor t={t} />
                        <Features t={t} />
                        <PricingSection />
                        <Trust t={t} />
                        <FooterCTA t={t} switchView={switchView} />
                        <SupportChatWidget />
                    </div>
                )}

                {/* Reuse existing views (Contact, Ambassador, Login) but wrapped in new layout */}
                {(view === 'contact' || view === 'ambassador' || view === 'login') && (
                     <div className="pt-24 pb-12 fade-in bg-gray-50 min-h-screen">
                         
                         {/* --- VIEW: CONTACT FORM (Simplified) --- */}
                         {view === 'contact' && (
                             <div className="max-w-4xl mx-auto px-4">
                                <button onClick={() => switchView('home')} className="mb-8 text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium">
                                    <ArrowLeft size={16} /> Back to Home
                                </button>
                                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                    <div className="text-center mb-8">
                                        <h1 className="text-3xl font-bold mb-2">{t.contact.title}</h1>
                                        <p className="text-gray-600">{t.contact.subtitle}</p>
                                    </div>
                                    <form className="max-w-lg mx-auto space-y-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent! Our team will contact you shortly.'); switchView('home'); }}>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.contact.form.name}</label>
                                            <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.contact.form.email}</label>
                                            <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="email" required />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-1">{t.contact.form.message}</label>
                                            <textarea className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" rows={4} required></textarea>
                                        </div>
                                        <button className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-lg flex justify-center gap-2 items-center">
                                            <Mail size={18} /> {t.contact.form.submit}
                                        </button>
                                    </form>
                                </div>
                             </div>
                         )}

                         {/* --- VIEW: AMBASSADOR FORM --- */}
                         {view === 'ambassador' && (
                             <div className="max-w-7xl mx-auto px-4">
                                 <button onClick={() => switchView('home')} className="mb-8 text-gray-500 hover:text-gray-900 flex items-center gap-2 font-medium"><ArrowLeft size={16} /> Back</button>
                                 <div className="grid lg:grid-cols-2 gap-12">
                                     <div>
                                         <h1 className="text-4xl font-bold mb-4">{t.ambassador.headline}</h1>
                                         <p className="text-lg text-gray-600 mb-8">{t.ambassador.subheadline}</p>
                                         <div className="bg-green-50 p-6 rounded-xl border border-green-100 mb-8">
                                             <h3 className="font-bold text-green-900 mb-4">{t.ambassador.earnings.title}</h3>
                                             <ul className="space-y-3">
                                                 {t.ambassador.earnings.models.map((m: string, i: number) => (
                                                     <li key={i} className="flex gap-3 text-green-800"><Check size={20} /> {m}</li>
                                                 ))}
                                             </ul>
                                         </div>
                                     </div>
                                     <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
                                         {ambassadorStatus === 'success' ? (
                                             <div className="absolute inset-0 bg-white flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-300">
                                                 <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                                                     <Check size={40} />
                                                 </div>
                                                 <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Received!</h2>
                                                 <p className="text-gray-600">We'll be in touch shortly via email or WhatsApp.</p>
                                                 <button onClick={() => switchView('home')} className="mt-8 text-blue-700 font-bold hover:underline">Back to Home</button>
                                             </div>
                                         ) : (
                                            <>
                                                <h2 className="text-2xl font-bold mb-6">{t.ambassador.form.title}</h2>
                                                <form className="space-y-4" onSubmit={handleAmbassadorSubmit}>
                                                    {/* Honeypot */}
                                                    <input type="text" className="hidden" value={ambassadorForm.company} onChange={e => setAmbassadorForm({...ambassadorForm, company: e.target.value})} />
                                                    
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <input 
                                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                                            placeholder={t.ambassador.form.fields.name} 
                                                            value={ambassadorForm.name}
                                                            onChange={e => setAmbassadorForm({...ambassadorForm, name: e.target.value})}
                                                            required 
                                                        />
                                                        <input 
                                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                                            placeholder={t.ambassador.form.fields.email} 
                                                            type="email" 
                                                            value={ambassadorForm.email}
                                                            onChange={e => setAmbassadorForm({...ambassadorForm, email: e.target.value})}
                                                            required 
                                                        />
                                                    </div>
                                                    
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <input 
                                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                                            placeholder={t.ambassador.form.fields.phone} 
                                                            value={ambassadorForm.phone}
                                                            onChange={e => setAmbassadorForm({...ambassadorForm, phone: e.target.value})}
                                                            required 
                                                        />
                                                        <input 
                                                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                                            placeholder={t.ambassador.form.fields.city} 
                                                            value={ambassadorForm.city}
                                                            onChange={e => setAmbassadorForm({...ambassadorForm, city: e.target.value})}
                                                            required 
                                                        />
                                                    </div>

                                                    <input 
                                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                                        placeholder={t.ambassador.form.fields.experience} 
                                                        value={ambassadorForm.experience}
                                                        onChange={e => setAmbassadorForm({...ambassadorForm, experience: e.target.value})}
                                                        required
                                                    />

                                                    <input 
                                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                                        placeholder={t.ambassador.form.fields.outreach_volume} 
                                                        value={ambassadorForm.outreach_volume}
                                                        onChange={e => setAmbassadorForm({...ambassadorForm, outreach_volume: e.target.value})}
                                                        required
                                                    />

                                                    <textarea 
                                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                                        placeholder={t.ambassador.form.fields.why} 
                                                        rows={3} 
                                                        value={ambassadorForm.why}
                                                        onChange={e => setAmbassadorForm({...ambassadorForm, why: e.target.value})}
                                                        required
                                                    ></textarea>

                                                    <button 
                                                        disabled={ambassadorStatus === 'loading'}
                                                        className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition flex justify-center gap-2"
                                                    >
                                                        {ambassadorStatus === 'loading' ? <Loader2 className="animate-spin" /> : t.ambassador.form.submit}
                                                    </button>
                                                    
                                                    {ambassadorStatus === 'error' && (
                                                        <p className="text-red-500 text-sm text-center">Error submitting application. Please try again.</p>
                                                    )}
                                                </form>
                                            </>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         )}

                         {/* --- VIEW: LOGIN --- */}
                         {view === 'login' && (
                             <div className="max-w-md mx-auto px-4 pt-12">
                                 <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                                     <h2 className="text-2xl font-bold text-center mb-6">{t.login.title}</h2>
                                     <form onSubmit={handleLogin} className="space-y-4">
                                         {loginError && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{loginError}</div>}
                                         <input className="w-full p-3 border rounded-lg" placeholder={t.login.email} value={email} onChange={e => setEmail(e.target.value)} type="email" required />
                                         <input className="w-full p-3 border rounded-lg" placeholder={t.login.password} value={password} onChange={e => setPassword(e.target.value)} type="password" required />
                                         <button disabled={loading} className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 flex justify-center gap-2">
                                             {loading && <Loader2 className="animate-spin" size={20} />} {t.login.submit}
                                         </button>
                                     </form>
                                     <button onClick={() => switchView('home')} className="w-full text-center mt-4 text-sm text-gray-500 hover:text-gray-900">Back to Home</button>
                                 </div>
                             </div>
                         )}
                     </div>
                )}
            </main>

            <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="mb-8 flex justify-center items-center gap-2 text-white text-xl font-bold">
                        <HardHat size={24} /> KlaroOps
                    </div>
                    <p className="text-sm opacity-50">&copy; {new Date().getFullYear()} KlaroOps. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
