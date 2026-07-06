"use client";

import { useState } from "react";
import { ArrowRight, Loader2, ShieldCheck, Sparkles } from "lucide-react";

type Props = {
  productName: string;
  productDescription: string;
  amountText: string;
  buttonText: string;
  offerUrl: string;
  privacyUrl: string;
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function PaymentForm({
  productName,
  productDescription,
  amountText,
  buttonText,
  offerUrl,
  privacyUrl,
}: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = email.trim();
  const emailIsValid = isValidEmail(normalizedEmail);
  const emailError = touched && !emailIsValid ? "Введите корректный email" : null;
  const canSubmit = emailIsValid && agreed && !submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    setError(null);
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, customerName: name, agreed }),
      });
      const data = (await res.json()) as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) throw new Error(data.error || "Платёж не создан");
      window.location.assign(data.paymentUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-card w-full max-w-[31rem] p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold leading-tight tracking-[-0.02em] text-white">{productName}</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{productDescription}</p>
        </div>
        <div className="amount-chip w-fit min-w-28 px-4 py-3 text-left sm:text-right">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-950/65">к оплате</div>
          <div className="mt-1 text-xl font-semibold">{amountText}</div>
        </div>
      </div>

      <div className="mt-7 space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-semibold text-slate-200">Email для чека и связи</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="client@example.com"
            autoComplete="email"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "email-error" : undefined}
            className="checkout-input mt-2 w-full px-4 py-4 text-base outline-none"
            required
          />
          {emailError ? <p id="email-error" className="mt-2 text-sm text-rose-600">{emailError}</p> : null}
        </div>

        <div>
          <label htmlFor="name" className="text-sm font-semibold text-slate-200">Имя клиента <span className="text-slate-500">(необязательно)</span></label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Иван"
            autoComplete="name"
            className="checkout-input mt-2 w-full px-4 py-4 text-base outline-none"
          />
        </div>

        <label className="agreement-box flex cursor-pointer gap-3 p-4 text-sm leading-6 text-slate-400">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-white/20 accent-cyan-400"
            required
          />
          <span>
            Я принимаю <a className="font-semibold text-cyan-300 underline underline-offset-4" href={offerUrl} target="_blank" rel="noreferrer">оферту</a> и соглашаюсь с <a className="font-semibold text-cyan-300 underline underline-offset-4" href={privacyUrl} target="_blank" rel="noreferrer">политикой обработки ПД</a>.
          </span>
        </label>

        {error ? <div className="rounded-lg bg-rose-50 p-4 text-sm font-medium text-rose-700" role="alert">{error}</div> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="checkout-button group flex min-h-14 w-full items-center justify-center gap-3 px-6 py-4 text-base font-bold transition disabled:translate-y-0 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
          {submitting ? "Создаю платёж..." : buttonText}
          {!submitting ? <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" /> : null}
        </button>
      </div>
    </form>
  );
}
