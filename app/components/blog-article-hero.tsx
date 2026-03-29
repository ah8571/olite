type BlogArticleHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  noteTitle: string;
  note: string;
};

export function BlogArticleHero({ eyebrow, title, description, noteTitle, note }: BlogArticleHeroProps) {
  return (
    <section className="tool-page-hero">
      <div className="container split-grid tool-hero-grid">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="tool-title">{title}</h1>
          <p className="tool-copy">{description}</p>
        </div>
        <aside className="section-panel">
          <p className="kicker">Article Focus</p>
          <h2>{noteTitle}</h2>
          <p className="section-copy">{note}</p>
        </aside>
      </div>
    </section>
  );
}