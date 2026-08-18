import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && key.trim() !== "" && !key.includes("MY_STRIPE")) {
      stripeClient = new Stripe(key, {
        apiVersion: '2025-02-24' as any,
      });
    }
  }
  return stripeClient;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== "" && !process.env.STRIPE_SECRET_KEY.includes("MY_STRIPE"));
}

export async function createStripePaymentLink(
  serviceName: string,
  amountInINR: number,
  customerId: string,
  leadId: string
): Promise<{ url: string | null; error?: string }> {
  const stripe = getStripe();
  if (!stripe) {
    return { 
      url: null, 
      error: "Payment integration not configured. Please set STRIPE_SECRET_KEY in environment settings." 
    };
  }

  try {
    // Create product and price dynamically in Stripe
    const product = await stripe.products.create({
      name: `${serviceName} - SkillBridge Academy`,
      description: `Course enrollment for ${serviceName}`,
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amountInINR * 100, // in paise
      currency: 'inr',
    });

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      metadata: {
        customer_id: customerId,
        lead_id: leadId,
        service_name: serviceName,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.APP_URL || 'http://localhost:3000'}?payment_success=true&lead_id=${leadId}`,
        },
      },
    });

    return { url: paymentLink.url };
  } catch (err: any) {
    console.error("Stripe createPaymentLink error:", err);
    return { 
      url: null, 
      error: err.message || "Failed to create Stripe payment link." 
    };
  }
}
