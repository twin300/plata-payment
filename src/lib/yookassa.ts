const YOOKASSA_BASE_URL = "https://api.yookassa.ru/v3";

export type YooKassaPaymentResult =
  | { success: true; paymentId: string; paymentUrl: string }
  | { success: false; error: string };

function credentials() {
  const shopId = process.env.YOOKASSA_SHOP_ID || "";
  const secretKey = process.env.YOOKASSA_SECRET_KEY || "";
  return { shopId, secretKey };
}

function authHeader(shopId: string, secretKey: string) {
  return `Basic ${Buffer.from(`${shopId}:${secretKey}`, "utf8").toString("base64")}`;
}

function formatAmount(amountKopeks: number) {
  return (amountKopeks / 100).toFixed(2);
}

export function buildYooKassaReceipt(input: {
  amountKopeks: number;
  email: string;
  itemName: string;
}) {
  return {
    customer: {
      email: input.email,
    },
    items: [
      {
        description: input.itemName.slice(0, 128) || "Услуга",
        quantity: "1.00",
        amount: {
          value: formatAmount(input.amountKopeks),
          currency: "RUB",
        },
        vat_code: 1,
        payment_subject: "service",
        payment_mode: "full_prepayment",
      },
    ],
  };
}

export async function createYooKassaPayment(input: {
  orderId: string;
  amountKopeks: number;
  description: string;
  email: string;
  returnUrl: string;
}): Promise<YooKassaPaymentResult> {
  const { shopId, secretKey } = credentials();

  if (!shopId || !secretKey || shopId.includes("replace_") || secretKey.includes("replace_")) {
    return { success: false, error: "YOOKASSA_SHOP_ID/YOOKASSA_SECRET_KEY не настроены" };
  }

  const response = await fetch(`${YOOKASSA_BASE_URL}/payments`, {
    method: "POST",
    headers: {
      Authorization: authHeader(shopId, secretKey),
      "Content-Type": "application/json",
      "Idempotence-Key": input.orderId,
    },
    body: JSON.stringify({
      amount: {
        value: formatAmount(input.amountKopeks),
        currency: "RUB",
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: input.returnUrl,
      },
      description: input.description,
      metadata: {
        order_id: input.orderId,
        email: input.email,
      },
      receipt: buildYooKassaReceipt({
        amountKopeks: input.amountKopeks,
        email: input.email,
        itemName: input.description,
      }),
    }),
  });

  const data = (await response.json()) as {
    id?: string;
    confirmation?: { confirmation_url?: string };
    description?: string;
    code?: string;
    type?: string;
  };

  if (response.ok && data.id && data.confirmation?.confirmation_url) {
    return {
      success: true,
      paymentId: data.id,
      paymentUrl: data.confirmation.confirmation_url,
    };
  }

  return {
    success: false,
    error: data.description || data.code || data.type || `YooKassa error ${response.status}`,
  };
}
