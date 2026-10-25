import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { Link, Redirect } from "react-router-dom";
import type { FaqItem } from "src/modules/support/faq";

// Shared layout for the Help Center sections (FAQ, Trading Guide): a list of topics and
// one page per topic, styled with the workspace theme.

export interface HelpSection {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  // Base path of the list page, e.g. /app/service/faq.
  path: string;
  items: FaqItem[];
}

function Heading({ section, back, backLabel }: { section: HelpSection; back: string; backLabel: string }) {
  return (
    <div className="page-title">
      <Link to={back} className="faq-back" aria-label={backLabel}>
        <ChevronLeft />
      </Link>
      <span className="title-icon">
        <section.icon />
      </span>
      <div>
        <h1>{section.title}</h1>
        <small>{section.subtitle}</small>
      </div>
    </div>
  );
}

export function HelpList({ section }: { section: HelpSection }) {
  return (
    <div>
      <Heading section={section} back="/app/service" backLabel="Back to Online Service" />
      <div className="service-page">
        <nav className="panel faq-list" aria-label={section.title}>
          {section.items.map((item) => (
            <Link key={item.id} to={`${section.path}/${item.id}`} className="faq-row">
              <span>{item.question}</span>
              <ChevronRight size={18} />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function HelpArticle({ section, id }: { section: HelpSection; id: string }) {
  const index = section.items.findIndex((item) => item.id === id);
  // Unknown ids go back to the list.
  if (index < 0) return <Redirect to={section.path} />;
  const item = section.items[index];
  const next = section.items[index + 1];

  return (
    <div>
      <Heading section={section} back={section.path} backLabel={`Back to ${section.title}`} />
      <div className="service-page">
        <article className="panel faq-answer">
          <h2>{item.question}</h2>
          <p>{item.answer}</p>
        </article>
        {next && (
          <Link to={`${section.path}/${next.id}`} className="panel faq-row faq-next">
            <span>
              <small>Next</small>
              {next.question}
            </span>
            <ChevronRight size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}
