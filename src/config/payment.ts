export type PaymentConfig = {
  provider: "mock" | "tbank" | "yookassa";
  appUrl: string;
  productName: string;
  productDescription: string;
  amountRub: number;
  amountKopeks: number;
  buttonText: string;
  offerUrl: string;
  privacyUrl: string;
  tbankNotificationUrl: string;
  receiptTaxation: string;
  receiptTax: string;
};

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function readAmountRub() {
  const raw = process.env.PRODUCT_AMOUNT_RUB || process.env.NEXT_PUBLIC_PRODUCT_AMOUNT_RUB || "4900";
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 4900;
  return Math.round(value);
}

export function getPaymentConfig(): PaymentConfig {
  const appUrl = stripTrailingSlash(process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
  const amountRub = readAmountRub();

  return {
    provider:
      process.env.PAYMENT_PROVIDER === "tbank"
        ? "tbank"
        : process.env.PAYMENT_PROVIDER === "yookassa"
          ? "yookassa"
          : "mock",
    appUrl,
    productName: process.env.PRODUCT_NAME || "Оплата разработки лендинга",
    productDescription:
      process.env.PRODUCT_DESCRIPTION ||
      "Оплата разработки лендинга по публичной оферте.",
    amountRub,
    amountKopeks: amountRub * 100,
    buttonText: process.env.PAYMENT_BUTTON_TEXT || "Перейти к оплате",
    offerUrl: process.env.NEXT_PUBLIC_OFFER_URL || "/oferta-razrabotka",
    privacyUrl: process.env.NEXT_PUBLIC_PRIVACY_URL || "/politika-pd",
    tbankNotificationUrl: process.env.TBANK_NOTIFICATION_URL || `${appUrl}/api/tbank/webhook`,
    receiptTaxation: process.env.TBANK_RECEIPT_TAXATION || "usn_income",
    receiptTax: process.env.TBANK_RECEIPT_TAX || "none",
  };
}

export function formatRub(amountRub: number) {
  return new Intl.NumberFormat("ru-RU").format(amountRub) + " ₽";
}
