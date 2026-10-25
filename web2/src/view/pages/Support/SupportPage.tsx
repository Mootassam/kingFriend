import { BookOpen, ChevronRight, CircleHelp, Headphones, MessageCircle } from "lucide-react";
import { useHistory } from "react-router-dom";
import chatWidgetBus from "src/view/shared/chat/chatWidgetBus";

// Each help topic opens its own Help Center section.
const topics = [
  {
    title: "FAQ",
    icon: CircleHelp,
    description: "Answers to common account questions.",
    href: "/app/service/faq",
  },
  {
    title: "Trading Guide",
    icon: BookOpen,
    description: "Get familiar with your trading workspace.",
    href: "/app/service/guide",
  },
];

export default function SupportPage() {
  const history = useHistory();

  return (
    <div>
      <div className="page-title">
        <span className="title-icon">
          <Headphones />
        </span>
        <div>
          <h1>Online Service</h1>
          <small>Help center and live support</small>
        </div>
      </div>
      <div className="service-page">
        <h2>Need help?</h2>
        <p>Find your way around KingFriend, or chat with our support team.</p>
        <div className="service-grid">
          <button className="panel help-card" onClick={() => chatWidgetBus.open()}>
            <MessageCircle className="blue" size={29} />
            <h3>Live Chat</h3>
            <p>Talk to our support team in real time.</p>
            <ChevronRight size={19} />
          </button>
          {topics.map((topic) => (
            <button
              key={topic.title}
              className="panel help-card"
              onClick={() => history.push(topic.href)}
            >
              <topic.icon className="blue" size={29} />
              <h3>{topic.title}</h3>
              <p>{topic.description}</p>
              <ChevronRight size={19} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
