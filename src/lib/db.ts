import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

export type PaymentStatus = "pending" | "mock_created" | "confirmed" | "failed" | "rejected" | "cancelled";

export type PaymentRow = {
  id: number;
  order_id: string;
  email: string;
  customer_name: string | null;
  product_name: string;
  amount_kopeks: number;
  status: PaymentStatus;
  tbank_payment_id: string | null;
  payment_url: string | null;
  offer_accepted_at: string | null;
  checkout_ip: string | null;
  checkout_user_agent: string | null;
  webhook_payload: string | null;
  error_message: string | null;
  created_at: string;
  confirmed_at: string | null;
  updated_at: string;
};

type Db = Database.Database;

let db: Db | null = null;

function databasePath() {
  const raw = process.env.DATABASE_PATH || "payments.db";
  if (path.isAbsolute(raw)) return raw;

  // Keep relative DB files inside ./data so Next/Turbopack does not trace the whole project.
  const filename = path.basename(raw) || "payments.db";
  return path.join(process.cwd(), "data", filename);
}

function migrate(instance: Db) {
  instance.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL,
      customer_name TEXT,
      product_name TEXT NOT NULL,
      amount_kopeks INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      tbank_payment_id TEXT,
      payment_url TEXT,
      offer_accepted_at TEXT,
      checkout_ip TEXT,
      checkout_user_agent TEXT,
      webhook_payload TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      confirmed_at TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_payments_email ON payments(email);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
  `);
}

export function getDb() {
  if (!db) {
    const file = databasePath();
    mkdirSync(path.dirname(file), { recursive: true });
    db = new Database(file);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    migrate(db);
  }
  return db;
}

export function createPayment(input: {
  orderId: string;
  email: string;
  customerName?: string;
  productName: string;
  amountKopeks: number;
  status?: PaymentStatus;
  checkoutIp?: string;
  checkoutUserAgent?: string;
}) {
  const result = getDb()
    .prepare(
      `INSERT INTO payments (
        order_id, email, customer_name, product_name, amount_kopeks, status,
        offer_accepted_at, checkout_ip, checkout_user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), ?, ?)`
    )
    .run(
      input.orderId,
      input.email,
      input.customerName || null,
      input.productName,
      input.amountKopeks,
      input.status || "pending",
      input.checkoutIp || null,
      input.checkoutUserAgent || null
    );

  return getPaymentById(Number(result.lastInsertRowid));
}

export function attachPaymentProviderData(orderId: string, input: { paymentId: string; paymentUrl: string }) {
  getDb()
    .prepare(
      `UPDATE payments
       SET tbank_payment_id = ?, payment_url = ?, updated_at = datetime('now')
       WHERE order_id = ?`
    )
    .run(input.paymentId, input.paymentUrl, orderId);
  return getPaymentByOrderId(orderId);
}

export function getPaymentById(id: number) {
  return getDb().prepare("SELECT * FROM payments WHERE id = ?").get(id) as PaymentRow | undefined;
}

export function getPaymentByOrderId(orderId: string) {
  return getDb().prepare("SELECT * FROM payments WHERE order_id = ?").get(orderId) as PaymentRow | undefined;
}

export function updatePaymentStatus(
  orderId: string,
  status: PaymentStatus,
  input: { tbankPaymentId?: string; webhookPayload?: unknown; errorMessage?: string } = {}
) {
  const confirmedAtSql = status === "confirmed" ? ", confirmed_at = COALESCE(confirmed_at, datetime('now'))" : "";
  getDb()
    .prepare(
      `UPDATE payments
       SET status = ?,
           tbank_payment_id = COALESCE(?, tbank_payment_id),
           webhook_payload = COALESCE(?, webhook_payload),
           error_message = ?,
           updated_at = datetime('now')
           ${confirmedAtSql}
       WHERE order_id = ?`
    )
    .run(
      status,
      input.tbankPaymentId || null,
      input.webhookPayload ? JSON.stringify(input.webhookPayload) : null,
      input.errorMessage || null,
      orderId
    );
  return getPaymentByOrderId(orderId);
}

export function listRecentPayments(limit = 30) {
  return getDb()
    .prepare("SELECT * FROM payments ORDER BY id DESC LIMIT ?")
    .all(Math.min(Math.max(limit, 1), 100)) as PaymentRow[];
}
