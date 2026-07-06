import type { Metadata } from "next";
import LegalDocumentPage from "@/components/legal-document-page";
import { personalDataText } from "@/content/legal-documents";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description: "Комплект документов по персональным данным для сайта.",
};

export default function PersonalDataPolicyPage() {
  return (
    <LegalDocumentPage
      title="Политика обработки персональных данных"
      description="Политика обработки персональных данных для формы оплаты разработки лендинга."
      text={personalDataText}
    />
  );
}
