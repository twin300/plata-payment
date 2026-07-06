import Link from "next/link";
import { listRecentPayments } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function rub(kopeks: number) {
  return new Intl.NumberFormat("ru-RU").format(kopeks / 100) + " ₽";
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = process.env.ADMIN_TOKEN || "";
  const allowed = token && params.token === token;

  if (!allowed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-slate-950">
        <div className="max-w-lg rounded-[32px] border border-slate-200 bg-slate-50 p-8">
          <h1 className="text-3xl font-semibold tracking-[-0.04em]">Админка закрыта</h1>
          <p className="mt-3 leading-7 text-slate-600">Добавь токен из `.env.local`: <code className="rounded bg-white px-2 py-1">/admin?token=...</code></p>
          <Link className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white" href="/">К оплате</Link>
        </div>
      </main>
    );
  }

  const payments = listRecentPayments(50);

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-[-0.05em]">Платежи</h1>
            <p className="mt-2 text-slate-500">Последние записи из SQLite.</p>
          </div>
          <Link className="rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white" href="/">К форме</Link>
        </div>
        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Сумма</th>
                <th className="px-4 py-3">OrderId</th>
                <th className="px-4 py-3">Создан</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-3 font-medium">{payment.id}</td>
                  <td className="px-4 py-3">{payment.status}</td>
                  <td className="px-4 py-3">{payment.email}</td>
                  <td className="px-4 py-3">{rub(payment.amount_kopeks)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{payment.order_id}</td>
                  <td className="px-4 py-3 text-slate-500">{payment.created_at}</td>
                </tr>
              ))}
              {payments.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-slate-500" colSpan={6}>Платежей пока нет</td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
