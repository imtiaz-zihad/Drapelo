import { BadgeCheck, CreditCard, RefreshCw, Truck } from "lucide-react";

const ITEMS = [
  { icon: BadgeCheck, label: "Premium Quality", desc: "Clean stitching, quality fabric" },
  { icon: CreditCard, label: "Cash on Delivery", desc: "Pay when you receive" },
  { icon: RefreshCw, label: "Easy Exchange", desc: "Size problem? We'll exchange" },
  { icon: Truck, label: "Fast Delivery", desc: "All over Bangladesh" },
];

export default function WhyDrapelo() {
  return (
    <section className="py-6 md:py-10" aria-labelledby="why-drapelo">
      <div className="container">
        <h2
          id="why-drapelo"
          className="mb-6 flex items-center gap-3 font-display text-2xl font-bold md:text-3xl"
        >
           <span className="h-7 w-1.5 -skew-x-12 bg-primary" aria-hidden />
          Why Drapelo
        </h2>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {ITEMS.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex flex-col items-start gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm md:p-5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold md:text-base">{label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground md:text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}