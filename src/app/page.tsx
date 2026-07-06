import Link from "next/link";
import PaymentForm from "@/components/payment-form";
import { formatRub, getPaymentConfig } from "@/config/payment";

export default function HomePage() {
  const config = getPaymentConfig();

  return (
    <main className="payment-wash relative min-h-screen overflow-hidden text-slate-50">
      <div className="payment-grid pointer-events-none absolute inset-0" />
      <div className="payment-glow payment-glow-cyan" />
      <div className="payment-glow payment-glow-violet" />
      <div className="payment-glow payment-glow-emerald" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="payment-header flex items-center justify-between gap-4">
          <Link href="/" className="brand-mark text-xl font-extrabold tracking-[-0.03em]">
            <span className="brand-accent">Matvey</span>.Geek
          </Link>
          <nav className="flex items-center gap-1 text-sm font-semibold text-slate-400 sm:gap-2">
            <Link className="payment-nav-link" href="/oferta-razrabotka">Оферта</Link>
            <Link className="payment-nav-link" href="/politika-pd">Политика ПД</Link>
            <Link className="payment-nav-link" href="/requisites">Реквизиты</Link>
          </nav>
        </header>

        <section className="grid flex-1 items-center gap-10 py-14 sm:py-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:py-20">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="payment-badge mx-auto lg:mx-0">
              <span className="payment-badge-dot" />
              Заказ на разработку сайта
            </div>
            <h1 className="mt-8 text-5xl font-extrabold leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl">
              Оплата разработки <span className="gradient-text">лендинга</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-400 lg:mx-0">
              Завершите заказ по публичной оферте. После оплаты я свяжусь с вами, подтвержу детали и запущу работу над проектом.
            </p>

            <div className="payment-metrics mx-auto mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/10 pt-7 text-left lg:mx-0">
              <div>
                <div className="metric-value">{formatRub(config.amountRub)}</div>
                <div className="metric-label">стоимость</div>
              </div>
              <div>
                <div className="metric-value">100%</div>
                <div className="metric-label">предоплата</div>
              </div>
              <div>
                <div className="metric-value">24/7</div>
                <div className="metric-label">прием заявок</div>
              </div>
            </div>
          </div>

          <div className="w-full lg:justify-self-end">
            <PaymentForm
              productName={config.productName}
              productDescription={config.productDescription}
              amountText={formatRub(config.amountRub)}
              buttonText={config.buttonText}
              offerUrl={config.offerUrl}
              privacyUrl={config.privacyUrl}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
