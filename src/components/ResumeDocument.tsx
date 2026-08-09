import type { Bullet, Resume } from "@/lib/types";

/*
 * data-block marks the smallest unit that must never be split across a page,
 * and data-keep-with-next marks a heading that must stay with what follows.
 * PaginatedPreview reads both to reproduce the print layout on screen, so they
 * have to stay in sync with the break rules in RESUME_CSS.
 */

function Bullets({ items }: { items: Bullet[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="resume-bullets">
      {items.map((bullet) => (
        <li key={bullet.id} data-block>
          {bullet.text}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="resume-section">
      <h2 className="resume-section-title" data-block data-keep-with-next>
        {title}
      </h2>
      {children}
    </section>
  );
}

export type Density = "comfortable" | "compact";

export function ResumeDocument({
  resume,
  density = "comfortable",
}: {
  resume: Resume;
  density?: Density;
}) {
  const { basics } = resume;
  const links = basics.links.filter((link) => link.url.trim().length > 0);
  const skills = resume.skills.filter((group) => group.items.length > 0);

  return (
    <div className="resume-root" data-density={density}>
      <article className="resume-page">
        <header data-block>
          <h1 className="resume-name">{basics.name}</h1>
          <p className="resume-headline">{basics.headline}</p>
          <p className="resume-contact">
            {basics.location ? <span>{basics.location}</span> : null}
            {basics.phone ? <span>{basics.phone}</span> : null}
            {basics.email ? (
              <span>
                <a href={`mailto:${basics.email}`}>{basics.email}</a>
              </span>
            ) : null}
            {links.map((link) => (
              <span key={link.url}>
                <a href={link.url.startsWith("http") ? link.url : `https://${link.url}`}>
                  {link.url.replace(/^https?:\/\//, "")}
                </a>
              </span>
            ))}
          </p>
        </header>

        {resume.summary ? (
          <Section title="Professional Summary">
            <p className="resume-summary" data-block>
              {resume.summary}
            </p>
          </Section>
        ) : null}

        {skills.length > 0 ? (
          <Section title={resume.skillsTitle?.trim() || "Technical Skills"}>
            {skills.map((group) => (
              <div className="resume-skill-row" key={group.id} data-block>
                <span className="resume-skill-label">{group.label}</span>
                <span>{group.items.join(", ")}</span>
              </div>
            ))}
          </Section>
        ) : null}

        {resume.experience.length > 0 ? (
          <Section title="Professional Experience">
            {resume.experience.map((job) => (
              <div className="resume-entry" key={job.id}>
                <div className="resume-entry-head" data-block data-keep-with-next>
                  <span>
                    <span className="resume-entry-company">{job.company}</span>
                    <span className="resume-entry-role"> — {job.role}</span>
                  </span>
                  <span className="resume-entry-meta">
                    {job.start} – {job.end}
                    {job.location ? ` | ${job.location}` : ""}
                  </span>
                </div>
                {job.companyNote ? (
                  <p className="resume-entry-note" data-block>
                    {job.companyNote}
                  </p>
                ) : null}
                <Bullets items={job.bullets} />

                {job.projects.map((project) => (
                  <div className="resume-project" key={project.id}>
                    <div className="resume-project-head" data-block data-keep-with-next>
                      <span className="resume-project-name">{project.name}</span>
                      {project.summary ? (
                        <span className="resume-project-summary"> — {project.summary}</span>
                      ) : null}
                    </div>
                    <Bullets items={project.bullets} />
                  </div>
                ))}
              </div>
            ))}
          </Section>
        ) : null}

        {resume.leadership.length > 0 ? (
          <Section title="Leadership & Community">
            {resume.leadership.map((entry) => (
              <div className="resume-entry" key={entry.id}>
                <div className="resume-entry-head" data-block data-keep-with-next>
                  <span className="resume-entry-company">{entry.organization}</span>
                  {entry.institution ? (
                    <span className="resume-entry-meta">{entry.institution}</span>
                  ) : null}
                </div>
                {entry.roles.map((role) => (
                  <div className="resume-role-block" key={role.id}>
                    <div className="resume-entry-head" data-block data-keep-with-next>
                      <span className="resume-entry-role">{role.title}</span>
                      <span className="resume-entry-meta">{role.period}</span>
                    </div>
                    <Bullets items={role.bullets} />
                  </div>
                ))}
              </div>
            ))}
          </Section>
        ) : null}

        {resume.education.length > 0 ? (
          <Section title="Education">
            {resume.education.map((item) => (
              <div className="resume-entry" key={item.id}>
                <div className="resume-entry-head" data-block data-keep-with-next>
                  <span>
                    <span className="resume-entry-company">{item.degree}</span>
                    <span className="resume-entry-role"> — {item.institution}</span>
                  </span>
                  <span className="resume-entry-meta">{item.period}</span>
                </div>
                {item.note ? (
                  <p className="resume-entry-note" data-block>
                    {item.note}
                  </p>
                ) : null}
              </div>
            ))}
          </Section>
        ) : null}

        {resume.languages.length > 0 ? (
          <Section title="Languages">
            <div className="resume-inline-list" data-block>
              {resume.languages.map((language) => (
                <span key={language.name}>
                  <strong>{language.name}</strong> — {language.level}
                </span>
              ))}
            </div>
          </Section>
        ) : null}
      </article>
    </div>
  );
}
