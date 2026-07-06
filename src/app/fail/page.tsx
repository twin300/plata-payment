import Link from "next/link";
import { XCircle } from "lucide-react";

export default async function FailPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const params = await searchParams;
  return (
    <main className="payment-wash relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 text-slate-50">
      <div className="payment-grid pointer-events-none absolute inset-0" />
      <div className="payment-glow payment-glow-violet" />
      <div className="payment-glow payment-glow-cyan" />

      <div className="checkout-card relative max-w-lg p-8 text-center">
        <XCircle className="mx-auto h-12 w-12 text-rose-300" />
        <h1 className="mt-5 text-3xl font-bold tracking-[-0.03em] text-white">Оплата не завершена</h1>
        <p className="mt-3 leading-7 text-slate-400">Можно вернуться на страницу и попробовать ещё раз.</p>
        {params.orderId ? <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-3 font-mono text-xs text-slate-400">{params.orderId}</p> : null}
        <Link href="/" className="checkout-button mt-6 inline-flex rounded-xl px-5 py-3 font-bold">К оплате</Link>
      </div>
    </main>
  );
}
