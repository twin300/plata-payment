import crypto from "node:crypto";

const TBANK_BASE_URL = "https://securepay.tinkoff.ru/v2";

type Scalar = string | number | boolean;
type TbankParams = Record<string, unknown>;

function isScalar(value: unknown): value is Scalar {
  return ["string", "number", "boolean"].includes(typeof value);
}

export function generateToken(params: TbankParams, password: string) {
  const excluded = new Set(["Token", "DATA", "Receipt"]);
  const pairs: Record<string, string> = { Password: password };

  for (const [key, value] of Object.entries(params)) {
    if (excluded.has(key) || value == null || !isScalar(value)) continue;
    pairs[key] = String(value);
  }

  const source = Object.keys(pairs)
    .sort()
    .map((key) => pairs[key])
    .join("");

  return crypto.createHash("sha256").update(source, "utf8").digest("hex");
}

export function verifyWebhookToken(body: TbankParams, password: string) {
  const incoming = typeof body.Token === "string" ? body.Token : "";
  if (!incoming) return false;
  const expected = generateToken(body, password);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(incoming));
}

export function buildReceipt(input: {
  amountKopeks: number;
  email: string;
  itemName: string;
  taxation: string;
  tax: string;
}) {
  const safeName = input.itemName.slice(0, 128) || "Услуга";
  return {
    Email: input.email,
    Taxation: input.taxation,
    Items: [
      {
        Name: safeName,
        Price: input.amountKopeks,
        Quantity: 1,
        Amount: input.amountKopeks,
        Tax: input.tax,
        PaymentMethod: "full_prepayment",
        PaymentObject: "service",
      },
    ],
  };
}

export async function createTbankPayment(input: {
  orderId: string;
  amountKopeks: number;
  description: string;
  email: string;
  notificationUrl: string;
  successUrl: string;
  failUrl: string;
  receiptTaxation: string;
  receiptTax: string;
}) {
  const terminalKey = process.env.TBANK_TERMINAL_KEY;
  const password = process.env.TBANK_PASSWORD;

  if (!terminalKey || !password || terminalKey.includes("replace_") || password.includes("replace_")) {
    return { success: false as const, error: "TBANK_TERMINAL_KEY/TBANK_PASSWORD не настроены" };
  }

  const params: TbankParams = {
    TerminalKey: terminalKey,
    Amount: input.amountKopeks,
    OrderId: input.orderId,
    Description: input.description,
    Language: "ru",
    NotificationURL: input.notificationUrl,
    SuccessURL: input.successUrl,
    FailURL: input.failUrl,
    DATA: { Email: input.email },
    Receipt: buildReceipt({
      amountKopeks: input.amountKopeks,
      email: input.email,
      itemName: input.description,
      taxation: input.receiptTaxation,
      tax: input.receiptTax,
    }),
  };

  params.Token = generateToken(params, password);

  const res = await fetch(`${TBANK_BASE_URL}/Init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  const data = (await res.json()) as {
    Success?: boolean;
    ErrorCode?: string;
    PaymentId?: string | number;
    PaymentURL?: string;
    Message?: string;
    Details?: string;
  };

  if (data.Success && data.ErrorCode === "0" && data.PaymentURL) {
    return {
      success: true as const,
      paymentId: String(data.PaymentId || ""),
      paymentUrl: data.PaymentURL,
    };
  }

  return {
    success: false as const,
    error: data.Message || data.Details || `T-Касса Init error ${data.ErrorCode || res.status}`,
  };
}
