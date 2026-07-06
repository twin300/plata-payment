import type { Metadata } from "next";
import LegalDocumentPage from "@/components/legal-document-page";
import { offerDevelopmentText } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Оферта на разработку лендинга",
  description: "Публичная оферта на оказание услуг по разработке лендинга.",
};

export default function OfferDevelopmentPage() {
  return (
    <LegalDocumentPage
      title="Оферта на разработку лендинга"
      description="Публичная оферта на оказание услуг по разработке лендинга."
      text={offerDevelopmentText}
    />
  );
}
