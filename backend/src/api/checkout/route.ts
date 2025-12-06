import { NextRequest, NextResponse } from "next/server";

// Lazy import to avoid bundling if not used
let stripeSingleton: any;
const getStripe = () => {
  if (stripeSingleton) return stripeSingleton;
  const key = process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
  if (!key) return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require("stripe");
  stripeSingleton = new Stripe(key, { apiVersion: "2024-06-20" });
  return stripeSingleton;
};

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const body = await req.json();
    const { items, billing } = body || {};

    if (!stripe) {
      return NextResponse.json(
        { message: "Stripe anahtarı bulunamadı" },
        { status: 503 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: "Öğe bulunamadı" },
        { status: 400 }
      );
    }

    const months = billing === "annual" ? 12 : billing === "semiannual" ? 6 : 1;

    const line_items = items.map((it: any) => ({
      price_data: {
        currency: "try",
        product_data: { name: it.name },
        unit_amount: Math.max(0, Math.round(it.unit_amount)) * 100 * months,
      },
      quantity: 1,
    }));

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${baseUrl}/admin/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/admin/payment/cancel`,
      locale: "tr",
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("checkout error", error);
    return NextResponse.json(
      { message: error?.message || "Bilinmeyen hata" },
      { status: 500 }
    );
  }
}


