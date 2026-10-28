export type SizeRow = {
  size: string;
  chest: number; // inch
  length: number; // inch
  sleeve: number; // inch
};

export const SIZE_CHART: SizeRow[] = [
  { size: "S", chest: 40, length: 27, sleeve: 23 },
  { size: "M", chest: 42, length: 28, sleeve: 24 },
  { size: "L", chest: 44, length: 29, sleeve: 25 },
  { size: "XL", chest: 46, length: 30, sleeve: 26 },
  { size: "XXL", chest: 48, length: 31, sleeve: 27 },
  { size: "3XL", chest: 50, length: 32, sleeve: 28 },
];

const norm = (s?: string | null) => (s ?? "").toUpperCase().replace(/\s/g, "");


// Table + diagram + tips (used inline on the product page AND inside the modal)
export function SizeChartBody({ selectedSize }: { selectedSize?: string | null }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-center">
        <thead>
          <tr className="bg-primary text-primary-foreground">
            {["Size", "Chest", "Length", "Sleeve"].map((h) => (
              <th
                key={h}
className="px-2 py-2 text-xs font-bold uppercase tracking-wider"              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SIZE_CHART.map((row, i) => {
            const active = norm(row.size) === norm(selectedSize);
            return (
              <tr
                key={row.size}
className={`border-t border-border text-sm font-semibold ${
  active ? "bg-primary/15 text-primary" : i % 2 ? "bg-secondary/40" : ""
}`}
              >
<td className="px-2 py-2 font-extrabold">{row.size}</td>
<td className="px-2 py-2">{row.chest}</td>
<td className="px-2 py-2">{row.length}</td>
<td className="px-2 py-2">{row.sleeve}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Inline section for the product page
export default function SizeChartSection() {
  return (
    <section
      className="mt-10 border-t border-border/60 pt-8"
      aria-labelledby="size-chart-heading"
    >
      <h2
        id="size-chart-heading"
        className="mb-1 flex items-center gap-3 font-display text-xl font-bold md:text-2xl"
      >
        <span className="h-6 w-1.5 -skew-x-12 bg-primary" aria-hidden />
        Size Chart
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">All measurements in inches</p>

      <div className="max-w-8xl">
        <SizeChartBody />
      </div>
    </section>
  );
}