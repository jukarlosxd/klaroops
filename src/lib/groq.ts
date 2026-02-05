import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  // In production, this should log an error to monitoring (Sentry, etc)
  console.error('CRITICAL: GROQ_API_KEY is not set. AI features will fail.');
}

export const groq = new Groq({
  apiKey: apiKey || 'dummy_key_to_prevent_crash_at_build_time',
});

export const GROQ_MODELS = {
  FAST: 'llama-3.1-8b-instant',
  POWERFUL: 'llama-3.1-70b-versatile',
  MIXTRAL: 'mixtral-8x7b-32768'
};

