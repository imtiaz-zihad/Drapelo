import { Star } from "lucide-react";

type Review = {
  name: string;
  location?: string;
  rating: number; // 1 to 5, 4.5 / 3.5 ei rokom o hobe
  text: string;
  product?: string;
};

// Each star: grey base + red fill clipped to 0 / 50 / 100%
function Stars({ rating }: { rating: number }) {
  return (
    <div className="mb-2 flex gap-0.5" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, s) => {
        const fill = Math.max(0, Math.min(1, rating - s)); // 0 to 1
        return (
          <span key={s} className="relative inline-block h-4 w-4">
            <Star className="absolute inset-0 h-4 w-4 text-muted-foreground/30" />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className="h-4 w-4 fill-primary text-primary" />
            </span>
          </span>
        );
      })}
    </div>
  );
}

// Shudhu REAL customer-er review boshao (customer-er permission niye).
// Faka thakle ei section home page-e dekhabe na.
const REVIEWS: Review[] = [
  {
    name: "Jahid",
    location: "Mirpur, Dhaka",
    rating: 5,
    text: "Jacket Quality joss chilo, akbare same as picture",
    product: "Ferrari Jacket",
  },
  {
    name: "Zihad",
    location: "Dhanmondi, Dhaka",
    rating: 5,
    text: "Jacket ar Embroidery Quality sera , sewing o khub valo",
    product: "Red Bull Jacket",
  },
];

export default function Reviews() {
  if (REVIEWS.length === 0) return null;

  return (
    <section className="py-6 md:py-10" aria-labelledby="reviews">
      <div className="container">
        <h2
          id="reviews"
          className="mb-6 flex items-center gap-3 font-display text-2xl font-bold md:text-3xl"
        >
          <span className="h-7 w-1.5 -skew-x-12 bg-primary" aria-hidden />
          What customers say
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
          {REVIEWS.map((r, i) => (
            <figure
              key={i}
              className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm"
            >
              <Stars rating={r.rating} />
              <blockquote className="text-sm leading-relaxed">{r.text}</blockquote>
              <figcaption className="mt-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{r.name}</span>
                {r.location && ` · ${r.location}`}
                {r.product && ` · ${r.product}`}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}