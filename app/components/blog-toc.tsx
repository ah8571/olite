type BlogTocItem = {
  id: string;
  label: string;
};

export function BlogToc({ items }: { items: BlogTocItem[] }) {
  return (
    <aside className="section-panel toc-panel">
      <p className="kicker">Table Of Contents</p>
      <nav aria-label="Table of contents">
        <ul className="toc-list">
          {items.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}