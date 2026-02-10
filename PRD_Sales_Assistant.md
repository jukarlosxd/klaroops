# Product Requirements Document: AI Sales Assistant for Ambassadors

## 1. Visión General
Una herramienta integrada en el Panel de Embajador que actúa como un **Senior Software Sales Representative** virtual. Su objetivo es aumentar la productividad de los embajadores ayudándoles a organizar sus propios leads (no oficiales) y proporcionando coaching de ventas en tiempo real (mensajes, estrategias, manejo de objeciones) en **Español** e **Inglés**.

## 2. Usuarios Objetivo
*   **Embajadores de Klaroops:** Desde juniors hasta seniors. Necesitan estructura y guion de ventas.
*   **No para Clientes Finales.**

## 3. Componentes Principales

### A. Panel "Sales Assistant" (Nueva Sección)
Ubicada en el sidebar del embajador. Contiene 3 bloques:
1.  **Lead Tracker (Personal):** Lista simple de prospectos que el embajador está trabajando.
2.  **AI Chat (Coach):** Interfaz de chat persistente para consultas generales o específicas sobre leads.
3.  **Lead Context Selector:** Capacidad de seleccionar un lead del tracker para que la IA tenga contexto automático.

### B. Funcionalidades Detalladas

#### 1. Lead Tracker (Prospectos Personales)
*   **Concepto:** CRM ultra-ligero. Privado para cada embajador. El admin NO ve estos datos (privacidad).
*   **Campos:**
    *   Nombre (Persona)
    *   Empresa
    *   Industria
    *   Estado (New, Contacted, Interested, Negotiation, Closed, Lost)
    *   Notas (Texto libre para contexto)
*   **Acciones:** Crear, Editar, Eliminar, Cambiar Estado.

#### 2. AI Sales Coach (Chat)
*   **Rol:** Senior B2B SaaS Sales Expert.
*   **Tono:** Práctico, honesto, estratégico.
*   **Idiomas:** Español e Inglés (según preferencia del usuario).
*   **Capacidades:**
    *   Generar "Cold Outreach Messages" (LinkedIn/Email).
    *   Roleplay de manejo de objeciones ("Es muy caro", "Ya usamos Excel").
    *   Sugerir siguientes pasos basados en el estado del lead.
*   **Límites:** No inventa precios, no garantiza resultados técnicos, no cierra ventas automáticamente.

#### 3. Contextual Intelligence
*   Al chatear, el usuario puede seleccionar un lead activo.
*   El System Prompt se inyecta con: `Contexto del Lead: {Name}, {Company}, {Industry}, {Notes}, {Status}`.
*   La IA responde específicamente para ESE lead.

## 4. Arquitectura de Datos (Supabase)

### Tabla: `ambassador_leads`
| Columna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `ambassador_id` | uuid | FK -> `ambassadors.id`. RLS: `auth.uid() = user_id` (via join) |
| `name` | text | Nombre del prospecto |
| `company` | text | Nombre de la empresa |
| `industry` | text | Industria (opcional) |
| `status` | text | Enum: `new`, `contacted`, `interested`, `negotiation`, `closed`, `lost` |
| `notes` | text | Notas libres |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### Tabla: `ambassador_ai_messages`
| Columna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `ambassador_id` | uuid | FK -> `ambassadors.id` |
| `role` | text | `user` o `assistant` |
| `content` | text | El mensaje |
| `lead_id` | uuid | FK (Opcional) -> `ambassador_leads.id` para historial por lead |
| `created_at` | timestamptz | |

*Nota: Se puede reutilizar la lógica de chat existente, pero separando las tablas para no mezclar con soporte al cliente.*

## 5. System Prompt Base

```text
You are a senior B2B SaaS sales expert helping ambassadors sell Klaroops (a dashboard & automation platform for manufacturing/logistics).

ROLE:
- Your goal is to help the ambassador book demos and close deals.
- You provide specific, actionable advice on messaging, strategy, and objection handling.
- You are professional, concise, and encouraging.

RULES:
1. LANGUAGE: Respond in the same language as the user (English or Spanish).
2. TRUTH: Do not invent features, pricing, or guarantees. If unsure, advise the ambassador to check official docs.
3. CONTEXT: If a lead context is provided, tailor your advice to that specific company/industry.
4. FORMAT: Use bullet points for strategies. Use "quote blocks" for suggested message templates.

DO NOT:
- Act as a customer support agent.
- Write code.
- Be overly formal or robotic.
```

## 6. Flujo de Usuario (UX)

1.  **Ingreso:** Embajador va a `/sales-assistant`.
2.  **Vista:** Layout de 2 columnas (Escritorio) o Tabs (Móvil).
    *   Izquierda: Lista de Leads (Lead Tracker).
    *   Derecha: Chat con IA.
3.  **Gestión Lead:** Embajador crea lead "Fabrica Zapatos SA". Agrega nota: "Usan Excel gigante, dueño escéptico".
4.  **Consulta IA:**
    *   Embajador selecciona "Fabrica Zapatos SA".
    *   Escribe en el chat: "¿Qué le escribo por WhatsApp para retomar contacto?"
5.  **Respuesta IA:**
    *   Analiza notas ("Dueño escéptico", "Excel").
    *   Genera propuesta: "Hola [Nombre], estuve pensando en el problema de los Excel gigantes..."
6.  **Acción:** Embajador copia, pega y envía. Actualiza estado a "Contacted".

## 7. Reutilización Técnica
*   **Chat UI:** Reutilizar `ChatWidget.tsx` o crear una variante `SalesChatWidget.tsx`.
*   **LLM Integration:** Reutilizar `src/lib/groq.ts` o `src/app/api/chat/route.ts` (crear nuevo endpoint `/api/ambassador/chat`).
*   **Auth:** Misma sesión de NextAuth.
*   **Idiomas:** Usar `LanguageContext` ya implementado.

## 8. Riesgos y Límites
*   **Alucinaciones:** La IA podría inventar precios si se le presiona. El prompt debe ser estricto.
*   **Privacidad:** Los leads son del embajador, no de la empresa. RLS debe ser estricto.
*   **Costo:** Uso de tokens de LLM. Limitar historial de chat (últimos 10-20 mensajes).
