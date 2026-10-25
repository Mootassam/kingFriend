import { BookOpen } from "lucide-react";
import { tradingGuideItems } from "src/modules/support/tradingGuide";
import { HelpList, HelpSection } from "src/view/pages/Support/HelpPages";

export const guideSection: HelpSection = {
  title: "Trading Guide",
  subtitle: "Learn your way around the trading workspace",
  icon: BookOpen,
  path: "/app/service/guide",
  items: tradingGuideItems,
};

export default function GuidePage() {
  return <HelpList section={guideSection} />;
}
