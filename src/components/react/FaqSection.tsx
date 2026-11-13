import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ConvexAppProvider from "./ConvexAppProvider";

type Faq = {
  title: string;
  items: { question: string; answer: string }[];
};

function FaqInner() {
  const data = useQuery(api.siteContent.getSection, { key: "faq" });
  if (data === undefined) return <p className="loading-line">Loading…</p>;
  const faq = (data?.data as Faq | undefined) ?? {
    title: "FAQ",
    items: [],
  };

  return (
    <div className="faq">
      <h1>{faq.title}</h1>
      <ul className="faq-list">
        {faq.items.map((item) => (
          <li key={item.question}>
            <h2>{item.question}</h2>
            <p>{item.answer}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FaqSection() {
  return (
    <ConvexAppProvider>
      <FaqInner />
    </ConvexAppProvider>
  );
}
