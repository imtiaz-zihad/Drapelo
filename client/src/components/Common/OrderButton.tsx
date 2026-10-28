"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  Banknote,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  ShoppingBag,
} from "lucide-react";
import QuantitySelector from "./QuantitySelector";
import SizeChartModal from "./SizeChartModal";
import { SIZE_CHART } from "../Home/SizeChart";
import { createOrder, type DeliveryArea, type Order } from "@/services/api";
import type { ProductAddOns } from "@/types/product";
import { track, getMetaIds } from "@/lib/fbpixel";
import { useAbandonedCheckout } from "@/lib/useAbandonedCheckout";

const CONTACT_NUMBER =process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "8801894302115";

const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

const DELIVERY: Record<
  DeliveryArea,
  { label: string; hint: string; charge: number }
> = {
  dhaka: { label: "Inside Dhaka", hint: "Dhaka city", charge: 70 },
  outside: { label: "Outside Dhaka", hint: "All over Bangladesh", charge: 130 },
};

// "+8801712345678" / "8801712345678" / "01712345678" -> "01712345678"
const normalizePhone = (v: string) => {
  let d = v.replace(/\D/g, "");
  if (d.startsWith("880")) d = d.slice(2);
  return d.slice(0, 11);
};

const money = (n: number) => `৳${n.toLocaleString()}`;

interface Props {
  productId: string;
  productName: string;
  basePrice: number; // discounted jacket price
  sizes?: string[];
  addOns?: ProductAddOns; // unused, kept so the product page needs no change
  outOfStock?: boolean;
}

type FormErrors = {
  size?: string;
  customerName?: string;
  phone?: string;
  address?: string;
};

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

function Line({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex justify-between ${
        strong ? "text-lg font-bold" : "text-sm text-muted-foreground"
      }`}
    >
      <span>{label}</span>
      <span className={strong ? "text-primary" : ""}>{money(value)}</span>
    </div>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border bg-background px-3.5 py-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
    hasError ? "border-red-500" : "border-border"
  }`;

export default function OrderButton({
  productId,
  productName,
  basePrice,
  sizes = [],
  outOfStock = false,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | null>(null);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    deliveryArea: "dhaka" as DeliveryArea,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  const sizeRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const addToCartSent = useRef(false);
  const checkoutStarted = useRef(false);

  const needsSize = sizes.length > 0;
  const subtotal = basePrice * quantity;
  const deliveryCharge = DELIVERY[form.deliveryArea].charge;
  const total = subtotal + deliveryCharge;
  const chartRow = SIZE_CHART.find((r) => r.size === size);

  // Save typed details (once a valid phone is entered) for follow-up
  useAbandonedCheckout({
    enabled: !placed,
    form,
    productId,
    productName,
    size,
    quantity,
  });

  // Hide the mobile sticky button while the form is on screen
  useEffect(() => {
    const el = formRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [placed]);

  // ── Pixel events ─────────────────────────────────────────────────────────
  const fireAddToCart = () => {
    if (addToCartSent.current) return;
    addToCartSent.current = true;
    track("AddToCart", {
      content_ids: [productId],
      content_name: productName,
      content_type: "product",
      value: subtotal,
      currency: "BDT",
      num_items: quantity,
    });
  };

  // InitiateCheckout fires once, when the customer first touches the form
  const startCheckout = () => {
    if (checkoutStarted.current) return;
    checkoutStarted.current = true;
    fireAddToCart();
    track("InitiateCheckout", {
      content_ids: [productId],
      content_name: productName,
      content_type: "product",
      value: subtotal,
      currency: "BDT",
      num_items: quantity,
    });
  };

  // ── WhatsApp / call ──────────────────────────────────────────────────────
  const waMessage = [
    `Hi! I want to order: ${productName}`,
    size && `Size: ${size}`,
    `Quantity: ${quantity}`,
    `Total: ${money(subtotal)} (+ delivery)`,
  ]
    .filter(Boolean)
    .join("\n");
  const whatsappHref = `https://wa.me/${CONTACT_NUMBER}?text=${encodeURIComponent(waMessage)}`;
  const callHref = `tel:+${CONTACT_NUMBER}`;

  // ── Validation + submit ──────────────────────────────────────────────────
  const validate = (): boolean => {
    const e: FormErrors = {};
    if (needsSize && !size) e.size = "Please select a size";
    if (!form.customerName.trim()) e.customerName = "Please enter your name";
    if (!BD_PHONE_REGEX.test(form.phone)) {
      e.phone = "Enter a valid 11-digit mobile number (01XXXXXXXXX)";
    }
    if (!form.address.trim()) e.address = "Please enter your full address";
    setErrors(e);

    if (e.size) {
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (submitting || outOfStock || !validate()) return;

    startCheckout(); // safety: make sure InitiateCheckout was sent
    setSubmitting(true);
    setSubmitError("");

    try {
      // Only selections are sent. The server calculates every price.
      const order = await createOrder({
        customerName: form.customerName.trim(),
        phone: form.phone,
        address: form.address.trim(),
        deliveryArea: form.deliveryArea,
        items: [
          {
            productId,
            quantity,
            size,
            uclPatch: false,
            customName: null,
            customNumber: null,
          },
        ],
        meta: getMetaIds(),
      });

      setPlaced(order);

      track(
        "Purchase",
        {
          value: order.totalPrice,
          currency: "BDT",
          content_ids: order.items.map((i) => i.productId),
          content_type: "product",
          num_items: order.items.reduce((sum, i) => sum + i.quantity, 0),
        },
        order._id, // same id the server sends → Meta de-duplicates
      );

      setTimeout(
        () =>
          formRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          }),
        50,
      );
    } catch (err) {
      console.error("Create Order Error:", err);
      setSubmitError(
        err instanceof Error && err.message
          ? err.message
          : "Could not place your order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Sticky mobile button: go to size first (if missing), else to the form
  const jumpToOrder = () => {
    if (needsSize && !size) {
      setErrors((e) => ({ ...e, size: "Please select a size" }));
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // ── Success (replaces the form, no page change) ──────────────────────────
  if (placed) {
    return (
      <div
        ref={formRef}
        className="space-y-5 rounded-3xl border border-border/60 bg-card p-6 text-center shadow-sm md:p-8"
      >
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Order placed!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Order #{placed._id.slice(-6).toUpperCase()}
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Thank you! We will call you shortly to confirm your order.
        </p>

        <div className="space-y-1 rounded-xl bg-secondary/60 p-4 text-left">
          <Line label="Delivery" value={placed.deliveryCharge} />
          <Line
            label="Total to pay (Cash on Delivery)"
            value={placed.totalPrice}
            strong
          />
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <Link
            href="/track-order"
            className="flex h-12 items-center justify-center rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Track Your Order
          </Link>
          <Link
            href="/"
            className="flex h-12 items-center justify-center rounded-xl border border-border font-semibold hover:bg-secondary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Size */}
        {needsSize && (
          <div ref={sizeRef}>
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
                      fireAddToCart();
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

        {/* ORDER FORM */}
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="scroll-mt-24 space-y-4 rounded-2xl border border-primary/30 bg-card p-5 shadow-sm md:p-6"
        >
          <h2 className="flex items-center gap-2 font-display text-lg font-bold uppercase">
            <MapPin className="h-5 w-5 text-primary" />
            Order now, pay on delivery
          </h2>

          <div className="space-y-4" onFocusCapture={startCheckout}>
            <Field id="name" label="Full name" error={errors.customerName}>
              <input
                id="name"
                autoComplete="name"
                placeholder="Your name"
                value={form.customerName}
                onChange={(e) =>
                  setForm({ ...form, customerName: e.target.value })
                }
                aria-invalid={Boolean(errors.customerName)}
                className={inputClass(Boolean(errors.customerName))}
              />
            </Field>

            <Field id="phone" label="Mobile number" error={errors.phone}>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: normalizePhone(e.target.value) })
                }
                aria-invalid={Boolean(errors.phone)}
                className={inputClass(Boolean(errors.phone))}
              />
            </Field>

            <Field id="address" label="Full address" error={errors.address}>
              <textarea
                id="address"
                rows={3}
                autoComplete="street-address"
                placeholder="House, road, area, thana, district"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                aria-invalid={Boolean(errors.address)}
                className={inputClass(Boolean(errors.address))}
              />
            </Field>

            {/* Delivery area */}
            <div>
              <span className="mb-1.5 block text-sm font-medium">
                Delivery area
              </span>
              <div
                role="radiogroup"
                aria-label="Delivery area"
                className="grid grid-cols-2 gap-3"
              >
                {(Object.keys(DELIVERY) as DeliveryArea[]).map((key) => {
                  const active = form.deliveryArea === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setForm({ ...form, deliveryArea: key })}
                      className={`rounded-xl border p-3 text-left transition-colors ${
                        active
                          ? "border-primary bg-primary/5"
                          : "border-border bg-card hover:border-primary/50"
                      }`}
                    >
                      <span className="block text-sm font-semibold">
                        {DELIVERY[key].label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {DELIVERY[key].hint}
                      </span>
                      <span className="mt-1 block text-sm font-bold text-primary">
                        {money(DELIVERY[key].charge)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Price summary */}
          <div className="space-y-2 rounded-xl bg-secondary/60 p-4">
            <Line label={`Jacket × ${quantity}`} value={subtotal} />
            <Line label="Delivery" value={deliveryCharge} />
            <div className="border-t border-border/60 pt-2">
              <Line label="Total" value={total} strong />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Banknote className="h-5 w-5 shrink-0 text-primary" />
            Cash on Delivery. Pay after receiving your order.
          </div>

          {outOfStock && (
            <p
              role="alert"
              className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600"
            >
              This product is currently out of stock.
            </p>
          )}

          {submitError && (
            <p
              role="alert"
              className="rounded-xl bg-red-500/10 p-3 text-sm text-red-600"
            >
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || outOfStock}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Placing order…
              </>
            ) : outOfStock ? (
              "Out of Stock"
            ) : (
              <>Place Order · {money(total)}</>
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            Final price is confirmed by our system when you place the order.
          </p>
        </form>
      </div>

      {/* Mobile sticky button (hidden while the form is on screen) */}
      {!formVisible && !outOfStock && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={jumpToOrder}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground"
          >
            <ShoppingBag size={18} />
            Order Now · {money(total)}
          </button>
        </div>
      )}
    </>
  );
}