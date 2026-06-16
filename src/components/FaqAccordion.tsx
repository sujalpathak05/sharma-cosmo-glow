import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

type FaqAccordionItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqAccordionItem[];
  className?: string;
};

const FaqAccordion = ({ items, className }: FaqAccordionProps) => {
  return (
    <Accordion type="single" collapsible className={cn("w-full", className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.question}
          value={item.question}
          className="rounded-[1.5rem] border border-border bg-card/90 px-5 sm:px-6"
        >
          <AccordionTrigger className="py-5 text-left font-display text-lg text-foreground hover:no-underline sm:text-xl">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 font-body text-sm leading-7 text-muted-foreground sm:text-base">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FaqAccordion;
