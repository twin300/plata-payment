import Link from "next/link";
import { BadgeCheck, ExternalLink } from "lucide-react";

const contractor = {
  fullName: process.env.CONTRACTOR_FULL_NAME || "Марков Матвей Михайлович",
  status: process.env.CONTRACTOR_STATUS || "самозанятый",
  inn: process.env.CONTRACTOR_INN || "761020292512",
  phone: process.env.CONTRACTOR_PHONE || "89106669230",
  telegram: process.env.CONTRACTOR_TELEGRAM || "@matveygeek",
  email: process.env.CONTRACTOR_EMAIL || "будет указан после создания рабочей почты",
  site: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3107",
};

const rows = [
  ["Исполнитель", contractor.fullName],
  ["Статус", contractor.status],
  ["ИНН", contractor.inn],
  ["Телефон", contractor.phone],
  ["Telegram", contractor.telegram],
  ["Email", contractor.email],
  ["Сайт", contractor.site],
  ["Услуга", "Разработка лендинга"],
  ["Стоимость", "4 900 ₽"],
  ["НДС", "не облагается, исполнитель применяет налог на профессиональный доход"],
];

export default function RequisitesPage() {
  return (
    <main className="payment-wash relative min-h-screen overflow-hidden px-5 py-10 text-slate-50 sm:px-8">
      <div className="payment-grid pointer-events-none absolute inset-0" />
      <div className="payment-glow payment-glow-cyan" />
      <div className="payment-glow payment-glow-emerald" />

      <article className="relative mx-auto max-w-4xl">
        <Link href="/" className="payment-nav-link inline-flex text-sm font-semibold text-slate-400">
          ← к оплате
        </Link>

        <div className="mt-8">
          <div className="payment-badge">
            <span className="payment-badge-dot" />
            Контакты и реквизиты
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl">
            Реквизиты <span className="gradient-text">исполнителя</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Данные самозанятого исполнителя для оплаты разработки лендинга, связи, оформления договора и проверки
            платежным сервисом.
          </p>
        </div>

        <section className="checkout-card mt-10 p-5 sm:p-8">
          <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
              <BadgeCheck className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-white">Марков Матвей Михайлович</h2>
              <p className="mt-1 text-sm text-slate-400">Самозанятый, налог на профессиональный доход</p>
            </div>
          </div>

          <dl className="grid gap-3">
            {rows.map(([label, value]) => (
              <div
                key={label}
                className="grid gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-4 sm:grid-cols-[13rem_1fr]"
              >
                <dt className="text-sm font-semibold text-slate-400">{label}</dt>
                <dd className="break-words text-base font-semibold text-slate-100">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/oferta-razrabotka" className="checkout-button inline-flex items-center justify-center gap-2 px-5 py-3 font-bold">
              Оферта <ExternalLink className="h-4 w-4" />
            </Link>
            <Link href="/politika-pd" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-bold text-slate-100 transition hover:border-cyan-400/40 hover:bg-cyan-400/5">
              Политика ПД <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
