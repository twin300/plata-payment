import { NextRequest, NextResponse } from "next/server";
import { getPaymentByOrderId, updatePaymentStatus, type PaymentStatus } from "@/lib/db";

export const runtime = "nodejs";

type YooKassaWebhookBody = {
  object?: {
    id?: string;
    status?: string;
    metadata?: {
      order_id?: string;
      [key: string]: unknown;
    };
    cancellation_details?: {
      reason?: string;
      party?: string;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function mapStatus(status?: string): PaymentStatus {
  if (status === "succeeded") return "confirmed";
  if (status === "canceled") return "cancelled";
  return "pending";
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as YooKassaWebhookBody;
  const orderId = typeof body.object?.metadata?.order_id === "string" ? body.object.metadata.order_id : "";

  if (!orderId) return new NextResponse("Missing order_id", { status: 400 });

  const payment = getPaymentByOrderId(orderId);
  if (!payment) return new NextResponse("Payment not found", { status: 404 });

  const reason = body.object?.cancellation_details?.reason;
  const party = body.object?.cancellation_details?.party;
  const errorMessage = reason ? `${reason}${party ? ` (${party})` : ""}` : undefined;

  updatePaymentStatus(orderId, mapStatus(body.object?.status), {
    tbankPaymentId: body.object?.id,
    webhookPayload: body,
    errorMessage,
  });

  return new NextResponse("OK", { status: 200 });
}
