type ComparisonRow = {
  topic: string;
  olite: string;
  alternative: string;
};

export function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="comparison-list">
      {rows.map((row) => (
        <div className="comparison-row" key={row.topic}>
          <div className="comparison-topic">{row.topic}</div>
          <div className="comparison-cell">
            <strong>Olite</strong>
            <p>{row.olite}</p>
          </div>
          <div className="comparison-cell">
            <strong>Alternative</strong>
            <p>{row.alternative}</p>
          </div>
        </div>
      ))}
    </div>
  );
}