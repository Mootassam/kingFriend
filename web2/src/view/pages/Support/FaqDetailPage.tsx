import { useParams } from "react-router-dom";
import { HelpArticle } from "src/view/pages/Support/HelpPages";
import { faqSection } from "src/view/pages/Support/FaqPage";

// One Help Center answer, like PC's /support/details/:id page.
export default function FaqDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <HelpArticle section={faqSection} id={id} />;
}
