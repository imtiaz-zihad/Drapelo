"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, X } from "lucide-react";
import { api } from "./lib";
import type { Order } from "./lib";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;
const BD_PHONE = /^01[3-9]\d{8}$/;
const CHARGE = { dhaka: 70, outside: 130 } as const;

type AdminProduct = {
  _id: string;
  name: string;
  discountedPrice: number;
  sizes?: string[];
  stock?: number;
};

const CHANNELS = [
  { value: "messenger", label: "Messenger" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "phone", label: "Phone call" },
] as const;

const fmt = (n: number) => `৳${n.toLocaleString()}`;

const field =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default function NewOrderModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (order: Order) => void;
}) {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [channel, setChannel] = useState<string>("messenger");
  const [productId, setProductId] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryArea, setDeliveryArea] = useState<"dhaka" | "outside">("dhaka");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/products?limit=50`);
        const json = await res.json();
        const list: AdminProduct[] = Array.isArray(json) ? json : (json.data ?? []);
        setProducts(list);
        if (list[0]) setProductId(list[0]._id);
      } catch {
        setError("Could not load products");
      }
    })();
  }, []);

  const product = useMemo(
    () => products.find((p) => p._id === productId),
    [products, productId],
  );
  const sizes = product?.sizes ?? [];
  const total = (product?.discountedPrice ?? 0) * quantity + CHARGE[deliveryArea];

  const submit = async () => {
    setError("");
    if (!product) return setError("Select a product");
    if (sizes.length > 0 && !size) return setError("Select a size");
    if (!customerName.trim()) return setError("Enter the customer's name");
    if (!BD_PHONE.test(phone))
      return setError("Enter a valid 11-digit phone (01XXXXXXXXX)");
    if (!address.trim()) return setError("Enter the address");

    setSaving(true);
    try {
      const order = await api<Order>("/orders/admin-create", {
        method: "POST",
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone,
          address: address.trim(),
          deliveryArea,
          source: channel,
          items: [
            {
              productId: product._id,
              quantity,
              size: size || null,
              uclPatch: false,
              customName: null,
              customNumber: null,
            },
          ],
        }),
      });
      onCreated(order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create order");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">New order</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className={field}
            >
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Product</label>
            <select
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                setSize("");
              }}
              className={field}
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({fmt(p.discountedPrice)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className={field}
            >
              <option value="">Select size</option>
              {sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Quantity</label>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.min(10, Math.max(1, Number(e.target.value) || 1)))
              }
              className={field}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Customer name</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Phone</label>
            <input
              value={phone}
              inputMode="numeric"
              placeholder="01XXXXXXXXX"
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              className={field}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium">Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={field}
            />
          </div>

          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium">Delivery area</span>
            <div className="grid grid-cols-2 gap-3">
              {(["dhaka", "outside"] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setDeliveryArea(k)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    deliveryArea === k
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="block font-semibold">
                    {k === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                  </span>
                  <span className="text-primary">{fmt(CHARGE[k])}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-secondary/60 p-4">
          <span className="text-sm text-muted-foreground">
            {product ? `${product.name} × ${quantity} + delivery` : "Total"}
          </span>
          <span className="text-lg font-bold text-primary">{fmt(total)}</span>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl border border-border px-5 text-sm font-semibold hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Create order
          </button>
        </div>
      </div>
    </div>
  );
}