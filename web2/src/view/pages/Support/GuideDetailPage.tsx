import { useParams } from "react-router-dom";
import { HelpArticle } from "src/view/pages/Support/HelpPages";
import { guideSection } from "src/view/pages/Support/GuidePage";

export default function GuideDetailPage() {
  const { id } = useParams<{ id: string }>();
  return <HelpArticle section={guideSection} id={id} />;
}
