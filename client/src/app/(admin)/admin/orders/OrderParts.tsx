"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Copy, MessageCircle, Pencil, Phone, ShoppingBag, X } from "lucide-react";
import {
  STATUSES,
  STATUS_BADGE,
  areaLabel,
  getArea,
  itemSize,
  money,
  printText,
  shortId,
} from "./lib";
import type { EditPayload, Order, OrderItem, OrderStatus } from "./lib";

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL", "3XL"];
const EDITABLE: OrderStatus[] = ["Pending", "Confirmed"];
const CANCELLABLE: OrderStatus[] = ["Pending", "Confirmed", "Shipped"];

type Draft = { size: string; quantity: string; price: string };

export function Chip({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
        accent ? "bg-primary/10 text-primary" : "bg-secondary text-foreground"
      }`}
    >
      {children}
    </span>
  );
}

export function ItemLine({ order, item }: { order: Order; item: OrderItem }) {
  const size = itemSize(order, item);
  const print = printText(item);
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      <span className="font-medium">{item.name}</span>
      {size && <Chip>Size {size}</Chip>}
      <Chip>× {item.quantity}</Chip>
      {item.uclPatch && <Chip accent>UCL patch</Chip>}
      {print && <Chip accent>Print: {print}</Chip>}
    </div>
  );
}

export function productionNote(order: Order): string {
  return order.items
    .map((item) =>
      [
        item.name,
        itemSize(order, item) && `Size ${itemSize(order, item)}`,
        `x${item.quantity}`,
        item.uclPatch && "UCL patch",
        printText(item) && `Print: ${printText(item)}`,
      ]
        .filter(Boolean)
        .join(" | ")
    )
    .join("\n");
}

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-primary";

export function OrderModal({
  selected,
  updatingId,
  onClose,
  onChangeStatus,
  onCopyNote,
  onSaveEdit,
}: {
  selected: Order;
  updatingId: string | null;
  onClose: () => void;
  onChangeStatus: (order: Order, status: OrderStatus) => void;
  onCopyNote: (order: Order) => void;
  onSaveEdit: (order: Order, payload: EditPayload) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [draft, setDraft] = useState<{ items: Draft[]; delivery: string }>({
    items: [],
    delivery: "",
  });

  const canEdit = EDITABLE.includes(selected.status);
  const canCancel = CANCELLABLE.includes(selected.status);

  const startEdit = () => {
    setDraft({
      items: selected.items.map((i) => ({
        size: itemSize(selected, i) ?? "",
        quantity: String(i.quantity),
        price: String(i.price),
      })),
      delivery: String(selected.deliveryCharge),
    });
    setEditError("");
    setEditing(true);
  };

  const setItem = (idx: number, patch: Partial<Draft>) =>
    setDraft((d) => ({
      ...d,
      items: d.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));

  const draftItemsTotal = draft.items.reduce(
    (s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 0),
    0
  );
  const draftTotal = draftItemsTotal + (Number(draft.delivery) || 0);

  const save = async () => {
    const items = draft.items.map((it) => ({
      size: it.size || null,
      quantity: Math.floor(Number(it.quantity)),
      price: Number(it.price),
    }));
    if (items.some((i) => !(i.quantity >= 1) || !Number.isFinite(i.price) || i.price < 0)) {
      setEditError("Check quantity and price");
      return;
    }
    const deliveryCharge = Number(draft.delivery);
    if (!Number.isFinite(deliveryCharge) || deliveryCharge < 0) {
      setEditError("Check delivery charge");
      return;
    }

    setSaving(true);
    setEditError("");
    try {
      await onSaveEdit(selected, { items, deliveryCharge });
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  const discount =
    selected.edited && selected.originalTotal != null && selected.originalTotal > selected.totalPrice
      ? selected.originalTotal - selected.totalPrice
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order details"
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-card p-5 shadow-xl md:p-6"
      >
        <button
          type="button"
          onClick={() => onClose()}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full hover:bg-secondary"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold">Order #{shortId(selected)}</h2>
        <p className="mb-4 text-sm text-muted-foreground">{new Date(selected.createdAt).toLocaleString()}</p>

        {/* Customer */}
        <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">Name</p>
            <p className="font-semibold">{selected.customerName}</p>
          </div>

          <div className="rounded-xl bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="font-semibold">{selected.phone}</p>
            <div className="mt-1.5 flex gap-3 text-xs font-semibold">
              <a href={`tel:${selected.phone}`} className="inline-flex items-center gap-1 text-primary">
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <a
                href={`https://wa.me/88${selected.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-green-600"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
          </div>

          <div className="col-span-2 rounded-xl bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">Address</p>
            <p className="font-semibold">{selected.address}</p>
          </div>

          <div className="rounded-xl bg-secondary/60 p-3">
            <p className="text-xs text-muted-foreground">Area</p>
            <p className={`font-semibold ${getArea(selected) === "dhaka" ? "text-green-600" : "text-red-500"}`}>
              {areaLabel(getArea(selected))}
            </p>
          </div>

          <div className="rounded-xl bg-secondary/60 p-3">
            <p className="mb-1 text-xs text-muted-foreground">Status</p>
            <select
              value={selected.status}
              disabled={updatingId === selected._id || editing}
              onChange={(e) => onChangeStatus(selected, e.target.value as OrderStatus)}
              className={`h-8 w-full rounded-lg border border-border px-2 text-sm font-medium disabled:opacity-50 ${
                STATUS_BADGE[selected.status] ?? ""
              }`}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items header */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="font-semibold">{editing ? "Edit order" : "Order Items"}</h3>
          {!editing && (
            <div className="flex gap-2">
              {canEdit && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-secondary"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit order
                </button>
              )}
              <button
                type="button"
                onClick={() => onCopyNote(selected)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-secondary"
              >
                <Copy className="h-3.5 w-3.5" /> Copy note
              </button>
            </div>
          )}
        </div>

        {/* Items: view or edit */}
        <div className="space-y-3 border-t border-border/60 pt-3">
          {editing
            ? selected.items.map((item, i) => {
                const d = draft.items[i];
                if (!d) return null;
                const sizes = d.size && !SIZE_OPTIONS.includes(d.size) ? [d.size, ...SIZE_OPTIONS] : SIZE_OPTIONS;
                return (
                  <div key={i} className="space-y-2 rounded-xl border border-border/60 p-3">
                    <p className="text-sm font-medium">{item.name}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <label className="text-xs text-muted-foreground">
                        Size
                        <select
                          value={d.size}
                          onChange={(e) => setItem(i, { size: e.target.value })}
                          className={`${inputCls} mt-1`}
                        >
                          <option value="">None</option>
                          {sizes.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-xs text-muted-foreground">
                        Qty
                        <input
                          type="number"
                          min={1}
                          max={20}
                          inputMode="numeric"
                          value={d.quantity}
                          onChange={(e) => setItem(i, { quantity: e.target.value })}
                          className={`${inputCls} mt-1`}
                        />
                      </label>
                      <label className="text-xs text-muted-foreground">
                        Unit price (৳)
                        <input
                          type="number"
                          min={0}
                          inputMode="numeric"
                          value={d.price}
                          onChange={(e) => setItem(i, { price: e.target.value })}
                          className={`${inputCls} mt-1`}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Current: {money(item.price)} each · Line total:{" "}
                      {money((Number(d.price) || 0) * (Number(d.quantity) || 0))}
                    </p>
                  </div>
                );
              })
            : selected.items.map((item, i) => {
                const addOns = item.addOnsPrice ?? 0;
                return (
                  <div key={i} className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-secondary">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-5 w-5 opacity-40" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <ItemLine order={selected} item={item} />
                      <p className="text-xs text-muted-foreground">
                        {item.basePrice !== undefined
                          ? `${money(item.basePrice)}${addOns > 0 ? ` + ${money(addOns)} add-ons` : ""} each`
                          : `${money(item.price)} each`}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-semibold">{money(item.price * item.quantity)}</p>
                  </div>
                );
              })}

          {editing && (
            <label className="block text-xs text-muted-foreground">
              Delivery charge (৳)
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.delivery}
                onChange={(e) => setDraft((d) => ({ ...d, delivery: e.target.value }))}
                className={`${inputCls} mt-1 max-w-40`}
              />
            </label>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 space-y-1 border-t border-border/60 pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(editing ? draftItemsTotal : selected.totalPrice - selected.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{money(editing ? Number(draft.delivery) || 0 : selected.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total (Cash on Delivery)</span>
            <span className="text-primary">{money(editing ? draftTotal : selected.totalPrice)}</span>
          </div>
          {!editing && selected.edited && (
            <p className="pt-1 text-xs text-muted-foreground">
              Edited by admin
              {selected.originalTotal != null && ` · original ${money(selected.originalTotal)}`}
              {discount > 0 && ` · discount ${money(discount)}`}
            </p>
          )}
        </div>

        {/* Actions */}
        {editing ? (
          <div className="mt-5">
            {editError && (
              <p role="alert" className="mb-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-600">
                {editError}
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                className="h-11 flex-1 rounded-xl border border-border text-sm font-semibold hover:bg-secondary disabled:opacity-50"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="h-11 flex-1 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        ) : (
          canCancel && (
            <button
              type="button"
              onClick={() => onChangeStatus(selected, "Cancelled")}
              disabled={updatingId === selected._id}
              className="mt-5 h-11 w-full rounded-xl border border-red-500/40 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              Cancel this order
            </button>
          )
        )}

        {!editing && !canEdit && selected.status !== "Cancelled" && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {selected.status} orders cannot be edited.
          </p>
        )}
      </div>
    </div>
  );
}