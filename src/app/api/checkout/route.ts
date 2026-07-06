import { NextRequest, NextResponse } from "next/server";
import { getPaymentConfig } from "@/config/payment";
import { attachPaymentProviderData, createPayment, updatePaymentStatus } from "@/lib/db";
import { createTbankPayment } from "@/lib/tbank";

export const runtime = "nodejs";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createOrderId() {
  const random = crypto.randomUUID().slice(0, 8);
  return `site50-${Date.now()}-${random}`;
}

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; customerName?: string; agreed?: boolean };
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const customerName = typeof body.customerName === "string" ? body.customerName.trim().slice(0, 120) : "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: "Нужен корректный email" }, { status: 400 });
    }
    if (!body.agreed) {
      return NextResponse.json({ success: false, error: "Нужно принять оферту и политику ПД" }, { status: 400 });
    }

    const config = getPaymentConfig();
    const orderId = createOrderId();
    createPayment({
      orderId,
      email,
      customerName,
      productName: config.productName,
      amountKopeks: config.amountKopeks,
      status: config.provider === "mock" ? "mock_created" : "pending",
      checkoutIp: clientIp(req),
      checkoutUserAgent: req.headers.get("user-agent") || "",
    });

    if (config.provider === "mock") {
      const paymentUrl = `${config.appUrl}/success?orderId=${encodeURIComponent(orderId)}&mock=1`;
      attachPaymentProviderData(orderId, { paymentId: `mock-${orderId}`, paymentUrl });
      return NextResponse.json({ success: true, orderId, paymentUrl, provider: "mock" });
    }

    const result = await createTbankPayment({
      orderId,
      amountKopeks: config.amountKopeks,
      description: config.productName,
      email,
      notificationUrl: config.tbankNotificationUrl,
      successUrl: `${config.appUrl}/success?orderId=${encodeURIComponent(orderId)}`,
      failUrl: `${config.appUrl}/fail?orderId=${encodeURIComponent(orderId)}`,
      receiptTaxation: config.receiptTaxation,
      receiptTax: config.receiptTax,
    });

    if (!result.success) {
      updatePaymentStatus(orderId, "failed", { errorMessage: result.error });
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    attachPaymentProviderData(orderId, { paymentId: result.paymentId, paymentUrl: result.paymentUrl });
    return NextResponse.json({ success: true, orderId, paymentUrl: result.paymentUrl, paymentId: result.paymentId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
