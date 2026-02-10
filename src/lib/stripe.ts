import Stripe from 'stripe';

// This would normally come from process.env.STRIPE_SECRET_KEY
// For now, we initialize it conditionally to avoid runtime crashes if key is missing
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' as any,
      typescript: true,
    })
  : null;

export const PLANS = {
  starter: {
    name: 'Starter',
    priceId: process.env.STRIPE_PRICE_STARTER || 'price_starter_dummy',
    amount: 1500
  },
  growth: {
    name: 'Growth',
    priceId: process.env.STRIPE_PRICE_GROWTH || 'price_growth_dummy',
    amount: 2900
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_PRO || 'price_pro_dummy',
    amount: 4900
  }
};

export async function createCheckoutSession({
  customerId,
  priceId,
  returnUrl
}: {
  customerId: string;
  priceId: string;
  returnUrl: string;
}) {
  if (!stripe) throw new Error('Stripe not configured');

  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
  });
}

export async function createCustomer(email: string, name: string) {
  if (!stripe) return `cus_dummy_${Date.now()}`;
  
  const customer = await stripe.customers.create({
    email,
    name,
  });
  return customer.id;
}
