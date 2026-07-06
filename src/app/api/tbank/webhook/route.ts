import { NextRequest, NextResponse } from "next/server";
import { getPaymentByOrderId, updatePaymentStatus, type PaymentStatus } from "@/lib/db";
import { verifyWebhookToken } from "@/lib/tbank";

export const runtime = "nodejs";

type TbankWebhookBody = {
  OrderId?: string;
  PaymentId?: string | number;
  Status?: string;
  Success?: boolean;
  Token?: string;
  Message?: string;
  Details?: string;
  [key: string]: unknown;
};

function mapStatus(body: TbankWebhookBody): PaymentStatus {
  const status = String(body.Status || "").toUpperCase();
  if (status === "CONFIRMED" || status === "AUTHORIZED") return "confirmed";
  if (["REJECTED", "DEADLINE_EXPIRED"].includes(status)) return "rejected";
  if (status === "CANCELED" || status === "REFUNDED") return "cancelled";
  return body.Success === false ? "failed" : "pending";
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TbankWebhookBody;
  const password = process.env.TBANK_PASSWORD || "";

  if (!password || !verifyWebhookToken(body, password)) {
    return new NextResponse("Invalid token", { status: 403 });
  }

  const orderId = typeof body.OrderId === "string" ? body.OrderId : "";
  if (!orderId) return new NextResponse("Missing OrderId", { status: 400 });

  const payment = getPaymentByOrderId(orderId);
  if (!payment) return new NextResponse("Payment not found", { status: 404 });

  const status = mapStatus(body);
  updatePaymentStatus(orderId, status, {
    tbankPaymentId: body.PaymentId ? String(body.PaymentId) : undefined,
    webhookPayload: body,
    errorMessage: body.Message || body.Details ? String(body.Message || body.Details) : undefined,
  });

  return new NextResponse("OK", { status: 200 });
}
