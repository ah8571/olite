type ArticleSource = {
  href: string;
  label: string;
};

export function ArticleSources({ items }: { items: ArticleSource[] }) {
  return (
    <span className="inline-sources">
      (
      {items.map((item, index) => (
        <span key={item.href}>
          {index > 0 ? ", " : ""}
          <a href={item.href} target="_blank" rel="noreferrer">
            {item.label}
          </a>
        </span>
      ))}
      )
    </span>
  );
}