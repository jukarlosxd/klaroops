import { NextResponse } from 'next/server';
import { supportConfig } from '@/config/support';

// --- MOCK KNOWLEDGE BASE (RAG Stub) ---
// In a real app, this would be a vector database query.
const KNOWLEDGE_BASE = [
  {
    keywords: ['pricing', 'cost', 'price', 'plan', 'precio', 'costo', 'planes'],
    en: "KlaroOps pricing depends on the country. In the US, setup is $500–$2,500 and monthly is $199–$599. In Mexico, setup is MXN 8,500–45,000 and monthly MXN 3,500–10,500.",
    es: "El precio de KlaroOps depende del país. En EE.UU., la configuración es de $500–$2,500 USD y la mensualidad de $199–$599 USD. En México, la configuración es de $8,500–$45,000 MXN y la mensualidad de $3,500–$10,500 MXN."
  },
  {
    keywords: ['trial', 'free', 'demo', 'prueba', 'gratis'],
    en: "You can start a free trial immediately by clicking the 'Start Free Trial' button. No credit card required for the initial demo.",
    es: "Puede iniciar una prueba gratuita inmediatamente haciendo clic en el botón 'Empezar Prueba Gratis'. No se requiere tarjeta de crédito para la demostración inicial."
  },
  {
    keywords: ['ambassador', 'partner', 'referral', 'embajador', 'socio'],
    en: "Our Ambassador Program offers 20% recurring revenue. You can apply via the 'Partner Program' link in the footer.",
    es: "Nuestro Programa de Embajadores ofrece un 20% de ingresos recurrentes. Puede aplicar a través del enlace 'Programa de Partners' en el pie de página."
  },
  {
    keywords: ['integration', 'connect', 'api', 'integración', 'conectar'],
    en: "KlaroOps connects with your existing spreadsheets and daily reports. We support CSV, Excel, and PDF imports.",
    es: "KlaroOps se conecta con sus hojas de cálculo y reportes diarios existentes. Soportamos importación de CSV, Excel y PDF."
  },
  {
    keywords: ['cancel', 'subscription', 'billing', 'cancelar', 'facturación', 'suscripción'],
    en: "To manage your subscription or billing, please contact support directly. We do not process cancellations via chat for security reasons.",
    es: "Para administrar su suscripción o facturación, por favor contacte a soporte directamente. No procesamos cancelaciones por chat por razones de seguridad."
  },
  {
    keywords: ['password', 'login', 'access', 'contraseña', 'entrar', 'acceso'],
    en: "If you forgot your password, please use the 'Forgot Password' link on the login screen or contact your account administrator.",
    es: "Si olvidó su contraseña, use el enlace 'Olvidé mi contraseña' en la pantalla de inicio de sesión o contacte al administrador de su cuenta."
  }
];

// Helper to detect language
function detectLanguage(text: string): 'en' | 'es' {
  const esWords = new Set(['hola', 'gracias', 'precio', 'ayuda', 'como', 'donde', 'puedo', 'quiero', 'es', 'el', 'la', 'en', 'los', 'las', 'un', 'una', 'por', 'para', 'con', 'que']);
  const enWords = new Set(['hello', 'thanks', 'price', 'help', 'how', 'where', 'can', 'want', 'is', 'the', 'a', 'an', 'by', 'for', 'with', 'what', 'who', 'why']);
  
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  
  let esScore = 0;
  let enScore = 0;
  
  for (const w of words) {
    if (esWords.has(w)) esScore++;
    if (enWords.has(w)) enScore++;
  }
  
  return esScore > enScore ? 'es' : 'en';
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    // 1. Detect Language
    const lang = detectLanguage(message);
    
    // 2. Retrieval (Mock RAG)
    const lowerMsg = message.toLowerCase();
    
    // Simple keyword matching logic
    // We look for the entry with the most matching keywords
    let bestMatch = null;
    let maxMatches = 0;

    for (const entry of KNOWLEDGE_BASE) {
      const matches = entry.keywords.filter(k => lowerMsg.includes(k)).length;
      if (matches > 0 && matches > maxMatches) {
        maxMatches = matches;
        bestMatch = entry;
      }
    }

    // 3. Generation / Response Construction
    let responseText = "";

    if (bestMatch && maxMatches >= 1) { // Threshold for "confidence"
      responseText = bestMatch[lang];
    } else {
      // LOW CONFIDENCE FALLBACK
      responseText = supportConfig.fallback[lang];
    }

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 600));

    return NextResponse.json({ 
      response: responseText,
      detectedLanguage: lang,
      confidence: maxMatches > 0 ? 'high' : 'low'
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error' 
    }, { status: 500 });
  }
}
