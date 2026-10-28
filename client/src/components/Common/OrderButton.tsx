"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, ShoppingBag } from "lucide-react";
import QuantitySelector from "./QuantitySelector";

import type { ProductAddOns } from "@/types/product";
import { track } from "@/lib/fbpixel";
import { SIZE_CHART } from "../Home/SizeChart";
import SizeChartModal from "./SizeChartModal";

// ⚠️ Drapelo number (international format, no "+"), same as Navbar/Footer
const CONTACT_NUMBER = "8801XXXXXXXXX";

interface Props {
  productId: string;
  productName: string; // used in the WhatsApp message
  basePrice: number; // discounted jacket price
  sizes?: string[]; // empty → no size selection needed
  addOns?: ProductAddOns; // unused (jacket has no add-ons), kept so the product page needs no change
  outOfStock?: boolean;
}

type Errors = { size?: string; storage?: string };

const money = (n: number) => `৳${n.toLocaleString()}`;

const WhatsAppIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{money(value)}</span>
    </div>
  );
}

export default function OrderButton({
  productId,
  productName,
  basePrice,
  sizes = [],
  outOfStock = false,
}: Props) {
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const needsSize = sizes.length > 0;
  const total = basePrice * quantity;

  const chartRow = SIZE_CHART.find((r) => r.size === size);

  // WhatsApp message reflects the current selection
  const waMessage = [
    `Hi! I want to order: ${productName}`,
    size && `Size: ${size}`,
    `Quantity: ${quantity}`,
    `Total: ${money(total)} (+ delivery)`,
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappHref = `https://wa.me/${CONTACT_NUMBER}?text=${encodeURIComponent(waMessage)}`;
  const callHref = `tel:+${CONTACT_NUMBER}`;

  const handleOrder = () => {
    if (needsSize && !size) {
      setErrors({ size: "Please select a size" });
      return;
    }

    try {
      // same shape the checkout page already reads (add-ons are always off)
      localStorage.setItem(
        "order",
        JSON.stringify({
          productId,
          quantity,
          size,
          uclPatch: false,
          customName: null,
          customNumber: null,
        }),
      );
    } catch {
      setErrors({
        storage:
          "Could not start checkout. Please enable browser storage and try again.",
      });
      return;
    }

    track("AddToCart", {
      content_ids: [productId],
      content_name: productName,
      content_type: "product",
      value: total,
      currency: "BDT",
      num_items: quantity,
    });

    router.push("/checkout");
  };

  return (
    <div className="space-y-5">
      {/* Size */}
      {needsSize && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold">Size</span>
            <SizeChartModal selectedSize={size} />
          </div>

          <div
            role="radiogroup"
            aria-label="Select size"
            className="flex flex-wrap gap-2"
          >
            {sizes.map((s) => {
              const active = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    setSize(s);
                    setErrors((e) => ({ ...e, size: undefined }));
                  }}
                  className={`h-11 min-w-14 rounded-xl border px-4 text-sm font-semibold transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {chartRow && (
            <p className="mt-2 text-sm text-muted-foreground">
              Size {chartRow.size}: Chest {chartRow.chest} in · Length{" "}
              {chartRow.length} in · Sleeve {chartRow.sleeve} in{" "}
              <span className="text-xs">(1–2 in variation)</span>
            </p>
          )}

          {errors.size && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {errors.size}
            </p>
          )}
        </div>
      )}

      {/* Quantity + WhatsApp + Call */}
      <div>
        <span className="mb-2 block text-sm font-semibold">Quantity</span>
        <div className="flex items-center gap-2">
          <QuantitySelector quantity={quantity} setQuantity={setQuantity} />

          <div className="ml-auto flex items-center gap-2">
            <a
              href={whatsappHref}
              onClick={() => track("Contact", { content_name: productName })}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Order on WhatsApp"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-green-600/40 px-3 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50 sm:px-4"
            >
              <WhatsAppIcon />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <a
              href={callHref}
              onClick={() => track("Contact", { content_name: productName })}
              aria-label="Call us"
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary sm:px-4"
            >
              <Phone className="h-5 w-5" />
              <span className="hidden sm:inline">Call</span>
            </a>
          </div>
        </div>
      </div>

      {/* Price summary */}
      <div className="space-y-1.5 rounded-xl bg-secondary/60 p-4 text-sm">
        <Row label={`Jacket × ${quantity}`} value={basePrice * quantity} />
        <div className="flex justify-between border-t border-border/60 pt-2 text-base font-bold">
          <span>Total</span>
          <span className="text-primary">{money(total)}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Delivery charge is added at checkout.
        </p>
      </div>

      {/* Order */}
      <div>
        <button
          type="button"
          onClick={handleOrder}
          disabled={outOfStock}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag size={18} />
          {outOfStock ? "Out of Stock" : "Order Now"}
        </button>

        {errors.storage && (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {errors.storage}
          </p>
        )}
      </div>
    </div>
  );
}
