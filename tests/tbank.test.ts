import test from "node:test";
import assert from "node:assert/strict";
import { buildReceipt, generateToken, verifyWebhookToken } from "../src/lib/tbank";

test("generateToken ignores DATA/Receipt and verifies webhook token", () => {
  const password = "secret";
  const body = {
    TerminalKey: "terminal",
    Amount: 450000,
    OrderId: "order-1",
    Success: true,
    DATA: { Email: "client@example.com" },
    Receipt: { ignored: true },
  };
  const token = generateToken(body, password);
  assert.equal(token.length, 64);
  assert.equal(verifyWebhookToken({ ...body, Token: token }, password), true);
  assert.equal(verifyWebhookToken({ ...body, Token: "0".repeat(64) }, password), false);
});

test("buildReceipt creates one service item equal to total amount", () => {
  const receipt = buildReceipt({
    amountKopeks: 450000,
    email: "client@example.com",
    itemName: "Оплата разработки лендинга",
    taxation: "usn_income",
    tax: "none",
  });
  assert.equal(receipt.Email, "client@example.com");
  assert.equal(receipt.Items[0].Amount, 450000);
  assert.equal(receipt.Items[0].PaymentObject, "service");
});
