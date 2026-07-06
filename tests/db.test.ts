import test, { after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createPayment, getDb, updatePaymentStatus } from "../src/lib/db";

const dir = mkdtempSync(path.join(tmpdir(), "paymentshowcase-db-"));
process.env.DATABASE_PATH = path.join(dir, "test.db");

test("creates payment and updates status", () => {
  const row = createPayment({
    orderId: "order-test",
    email: "client@example.com",
    productName: "Оплата разработки лендинга",
    amountKopeks: 450000,
    status: "pending",
  });
  assert.equal(row?.email, "client@example.com");

  const updated = updatePaymentStatus("order-test", "confirmed", {
    tbankPaymentId: "tb-1",
    webhookPayload: { Status: "CONFIRMED" },
  });
  assert.equal(updated?.status, "confirmed");
  assert.equal(updated?.tbank_payment_id, "tb-1");
  assert.ok(updated?.confirmed_at);
});

after(() => {
  getDb().close();
  rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
});
