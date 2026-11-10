"use client";

import { memo } from "react";
import { Faq6, type FaqItem } from "@/components/ui/faq-06";
import { useLanguage } from "@/lib/i18n";

export const FaqAccordion = memo(function FaqAccordion() {
  const { t } = useLanguage();

  const faqs: FaqItem[] = [
    {
      id: "faq-1",
      question: t.faq1Q,
      answer: t.faq1A,
    },
    {
      id: "faq-2",
      question: t.faq2Q,
      answer: t.faq2A,
    },
    {
      id: "faq-3",
      question: t.faq3Q,
      answer: t.faq3A,
    },
    {
      id: "faq-4",
      question: t.faq4Q,
      answer: t.faq4A,
    },
  ];

  return (
    <Faq6
      title={t.faqTitle}
      faqs={faqs}
      className="my-4 shadow-xl"
    />
  );
});

export default FaqAccordion;
