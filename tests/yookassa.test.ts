import test from "node:test";
import assert from "node:assert/strict";
import { buildYooKassaReceipt } from "../src/lib/yookassa";

test("buildYooKassaReceipt creates service receipt without VAT", () => {
  const receipt = buildYooKassaReceipt({
    amountKopeks: 490000,
    email: "client@example.com",
    itemName: "Оплата разработки лендинга",
  });

  assert.equal(receipt.customer.email, "client@example.com");
  assert.equal(receipt.items[0].amount.value, "4900.00");
  assert.equal(receipt.items[0].amount.currency, "RUB");
  assert.equal(receipt.items[0].payment_subject, "service");
  assert.equal(receipt.items[0].payment_mode, "full_prepayment");
  assert.equal(receipt.items[0].vat_code, 1);
});
