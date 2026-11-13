import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ConvexAppProvider from "./ConvexAppProvider";

type Intro = { headline: string; paragraphs: string[] };
type Education = {
  label: string;
  items: { name: string; url: string; description: string }[];
};
type Projects = {
  label: string;
  items: { name: string; description: string; source: string }[];
};
type About = { title: string; paragraphs: string[]; email: string };

function HomeSectionsInner() {
  const data = useQuery(api.siteContent.getMany, {
    keys: ["introduction", "education", "projects", "about"],
  });
  const posts = useQuery(api.posts.listPublished, { limit: 3 });

  if (data === undefined || posts === undefined) {
    return <p className="loading-line">Loading…</p>;
  }

  const introduction = data.introduction as Intro | null;
  const education = data.education as Education | null;
  const projects = data.projects as Projects | null;
  const about = data.about as About | null;

  return (
    <>
      <div className="introduction">
        <h1>{introduction?.headline ?? "Hey there! Santosh here 👋🏻"}</h1>
        {(introduction?.paragraphs ?? []).map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
        <hr />
      </div>

      <div className="education section-grid">
        <ul>
          <li>
            <b>{education?.label ?? "Studying at"}</b>
          </li>
          <li>
            {(education?.items ?? []).map((item) => (
              <p key={item.name}>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  {item.name}
                </a>
                {", "}
                {item.description}
              </p>
            ))}
          </li>
        </ul>
      </div>
      <hr />

      <div className="project section-grid">
        <ul>
          <li>
            <b>{projects?.label ?? "Recent Project"}</b>
          </li>
          <li className="proj">
            {(projects?.items ?? []).map((item) => (
              <p key={item.name}>
                <a
                  href={`https://${item.source.replace(/^https?:\/\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.name}
                </a>
                {item.description}
              </p>
            ))}
          </li>
        </ul>
      </div>
      <hr />

      <div className="blogs section-grid">
        <ul>
          <li>
            <b>Recent Blogs</b>
          </li>
          <li className="blog">
            {posts.length === 0 && <p>No posts yet.</p>}
            {posts.map((item) => (
              <p key={item._id}>
                <a href={`/blog/${item.slug}/`}>{item.title}</a>
                {item.description.slice(0, 100)}
                {item.description.length > 100 ? "..." : ""}
              </p>
            ))}
          </li>
        </ul>
      </div>
      <hr />

      <div className="more-about">
        <b>{about?.title ?? "More about me"}</b>
        {(about?.paragraphs ?? []).map((p, i) => (
          <p key={i}>
            {about?.email && p.includes(about.email) ? (
              <>
                {p.split(about.email)[0]}
                <b>
                  <a href={`mailto:${about.email}`}>{about.email}</a>
                </b>
                {p.split(about.email)[1] ?? ""}
              </>
            ) : (
              p
            )}
          </p>
        ))}
      </div>
    </>
  );
}

export default function HomeSections() {
  return (
    <ConvexAppProvider>
      <HomeSectionsInner />
    </ConvexAppProvider>
  );
}
