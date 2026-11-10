"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FaPlus, FaMinus } from "react-icons/fa";
import { cn } from "@/lib/utils";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface Faq6Props {
  badge?: string;
  title: React.ReactNode;
  faqs: FaqItem[];
  className?: string;
}

export function Faq6({ badge, title, faqs, className }: Faq6Props) {
  return (
    <section
      className={cn(
        "mx-auto w-full max-w-6xl border-y border-dashed border-border md:border-x rounded-2xl overflow-hidden bg-card/30 backdrop-blur-sm",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 relative">
        <div className="md:col-span-4 lg:col-span-5 p-8 md:p-12 border-b border-dashed border-border md:border-b-0 md:border-r flex flex-col justify-start">
          {badge && (
            <span className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-widest">
              {badge}
            </span>
          )}
          <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-5xl lg:text-5xl leading-[1.15]">
            {title}
          </h2>
        </div>

        <div className="md:col-span-8 lg:col-span-7 relative">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border-b border-dashed border-border px-6 md:px-8 last:border-b-0"
              >
                <AccordionTrigger className="group flex items-center py-6 md:py-8 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:!hidden cursor-pointer">
                  <div className="flex flex-1 items-center gap-6">
                    <span className="text-muted-foreground text-xs font-semibold tracking-widest font-mono">
                      Q{index + 1}
                    </span>
                    <span className="text-foreground text-left text-base font-semibold md:text-lg">
                      {faq.question}
                    </span>
                  </div>
                  <div className="bg-muted text-muted-foreground ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors group-hover:bg-muted/80">
                    <FaPlus className="block h-3 w-3 group-data-[state=open]:hidden" />
                    <FaMinus className="hidden h-3 w-3 group-data-[state=open]:block" />
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-8 pl-[3.25rem] pr-12">
                  <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

export default Faq6;

