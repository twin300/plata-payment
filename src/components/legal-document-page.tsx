import Link from "next/link";

export default function LegalDocumentPage({
  title,
  description,
  text,
}: {
  title: string;
  description: string;
  text: string;
}) {
  return (
    <main className="min-h-screen bg-white px-5 py-12 text-slate-950">
      <article className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-950">← к оплате</Link>
            <h1 className="mt-8 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
          </div>
        </div>

        <section className="mt-10 rounded-[32px] border border-slate-200 bg-slate-50 p-5 shadow-[0_18px_70px_rgba(15,23,42,0.05)] sm:p-8">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-7 text-slate-700 sm:text-base sm:leading-8">{text}</pre>
        </section>
      </article>
    </main>
  );
}
