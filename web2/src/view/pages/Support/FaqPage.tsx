import { CircleHelp } from "lucide-react";
import { faqItems } from "src/modules/support/faq";
import { HelpList, HelpSection } from "src/view/pages/Support/HelpPages";

// Help Center question list, like PC's /support page.
export const faqSection: HelpSection = {
  title: "Help Center",
  subtitle: "Frequently asked questions",
  icon: CircleHelp,
  path: "/app/service/faq",
  items: faqItems,
};

export default function FaqPage() {
  return <HelpList section={faqSection} />;
}
