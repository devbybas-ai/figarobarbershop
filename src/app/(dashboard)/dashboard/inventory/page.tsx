"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/utils";

interface InventoryItem {
  quantity: number;
  reorderLevel: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: string;
  costPrice: string | null;
  isForSale: boolean;
  inventoryItems: InventoryItem[];
}

interface ProductForm {
  name: string;
  description: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  reorderLevel: number;
  isForSale: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  sku: "",
  price: 0,
  costPrice: 0,
  quantity: 0,
  reorderLevel: 5,
  isForSale: false,
};

export default function InventoryPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [restockId, setRestockId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState(0);

  const isOwner = session?.user?.role === "OWNER";
  const isStaffOrAbove = !!session?.user?.role;

  function loadProducts() {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function showMessage(msg: string) {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  }

  function openEdit(product: Product) {
    const inv = product.inventoryItems[0];
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description ?? "",
      sku: product.sku ?? "",
      price: Number(product.price),
      costPrice: product.costPrice ? Number(product.costPrice) : 0,
      quantity: inv?.quantity ?? 0,
      reorderLevel: inv?.reorderLevel ?? 5,
      isForSale: product.isForSale,
    });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name,
      description: form.description || undefined,
      sku: form.sku || undefined,
      price: form.price,
      costPrice: form.costPrice || undefined,
      isForSale: form.isForSale,
      quantity: form.quantity,
      reorderLevel: form.reorderLevel,
    };

    try {
      const url = editingId ? `/api/inventory/${editingId}` : "/api/inventory";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        closeForm();
        loadProducts();
        showMessage(editingId ? "Product updated" : "Product created");
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
      if (res.ok) {
        const data = await res.json();
        setConfirmDeleteId(null);
        loadProducts();
        showMessage(
          data.softDeleted
            ? "Product has order history — marked as not for sale"
            : "Product deleted",
        );
      }
    } catch {
      // silently fail
    }
  }

  async function handleRestock(id: string) {
    if (restockQty < 0) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: restockQty }),
      });

      if (res.ok) {
        setRestockId(null);
        setRestockQty(0);
        loadProducts();
        showMessage("Stock updated");
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  function openRestock(product: Product) {
    const inv = product.inventoryItems[0];
    setRestockId(product.id);
    setRestockQty(inv?.quantity ?? 0);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-figaro-cream">Inventory</h2>
        {isOwner && (
          <button
            onClick={openAdd}
            className="rounded-sm bg-figaro-gold px-4 py-2 text-sm font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light"
          >
            + Add Product
          </button>
        )}
      </div>

      {success && (
        <div className="mt-4 rounded-sm border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {showForm && (
        <div className="mt-6 rounded-sm border border-figaro-gold/20 bg-figaro-dark p-6">
          <h3 className="text-lg font-semibold text-figaro-cream">
            {editingId ? "Edit Product" : "New Product"}
          </h3>

          {error && (
            <div className="mt-3 rounded-sm border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-figaro-cream/70">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
                className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">
                  Price ($) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">Cost ($)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.costPrice}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      costPrice: Number(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">Quantity</label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      quantity: Number(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-figaro-cream/70">
                  Reorder Level
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={form.reorderLevel}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      reorderLevel: Number(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-sm border border-figaro-gold/20 bg-figaro-black px-3 py-2.5 text-figaro-cream focus:border-figaro-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-figaro-cream/70">
                <input
                  type="checkbox"
                  checked={form.isForSale}
                  onChange={(e) => setForm((f) => ({ ...f, isForSale: e.target.checked }))}
                  className="h-4 w-4 rounded border-figaro-gold/20 bg-figaro-black text-figaro-gold accent-figaro-gold focus:ring-figaro-gold"
                />
                For Sale
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-sm bg-figaro-gold px-6 py-2.5 font-semibold text-figaro-dark transition-colors hover:bg-figaro-gold-light disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-sm border border-figaro-gold/20 px-6 py-2.5 text-figaro-cream/60 transition-colors hover:text-figaro-cream"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-sm border border-figaro-gold/10">
        <table className="w-full">
          <thead>
            <tr className="border-b border-figaro-gold/10 bg-figaro-dark">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                SKU
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Stock
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                Cost
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                For Sale
              </th>
              {(isOwner || isStaffOrAbove) && (
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-figaro-gold/5">
            {products.map((product) => {
              const inv = product.inventoryItems[0];
              const isLow = inv ? inv.quantity <= inv.reorderLevel : false;
              return (
                <tr key={product.id} className="hover:bg-figaro-gold/5">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-figaro-cream">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-figaro-cream/40">{product.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-figaro-cream/50">
                    {product.sku ?? "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {restockId === product.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min={0}
                          value={restockQty}
                          onChange={(e) => setRestockQty(Number(e.target.value))}
                          className="w-20 rounded-sm border border-figaro-gold/20 bg-figaro-black px-2 py-1 text-center text-sm text-figaro-cream focus:border-figaro-gold focus:outline-none"
                        />
                        <button
                          onClick={() => handleRestock(product.id)}
                          disabled={submitting}
                          className="rounded-sm bg-figaro-gold px-2 py-1 text-xs font-medium text-figaro-dark hover:bg-figaro-gold-light disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setRestockId(null);
                            setRestockQty(0);
                          }}
                          className="rounded-sm border border-figaro-gold/20 px-2 py-1 text-xs text-figaro-cream/40 hover:text-figaro-cream"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`text-sm font-medium ${isLow ? "text-red-400" : "text-figaro-cream"}`}
                        >
                          {inv?.quantity ?? 0}
                        </span>
                        {isLow && <p className="text-xs text-red-400">Low stock</p>}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-figaro-gold">
                    {formatCurrency(Number(product.price))}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-figaro-cream/50">
                    {product.costPrice ? formatCurrency(Number(product.costPrice)) : "\u2014"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${product.isForSale ? "bg-green-400" : "bg-figaro-cream/20"}`}
                    />
                  </td>
                  {(isOwner || isStaffOrAbove) && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isStaffOrAbove && restockId !== product.id && (
                          <button
                            onClick={() => openRestock(product)}
                            className="rounded-sm border border-figaro-gold/20 px-3 py-1.5 text-xs text-figaro-cream/60 transition-colors hover:border-figaro-gold/40 hover:text-figaro-cream"
                          >
                            Restock
                          </button>
                        )}
                        {isOwner && (
                          <>
                            <button
                              onClick={() => openEdit(product)}
                              className="rounded-sm border border-figaro-gold/20 px-3 py-1.5 text-xs text-figaro-cream/60 transition-colors hover:border-figaro-gold/40 hover:text-figaro-cream"
                            >
                              Edit
                            </button>
                            {confirmDeleteId === product.id ? (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="rounded-sm bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="rounded-sm border border-figaro-gold/20 px-3 py-1.5 text-xs text-figaro-cream/40 transition-colors hover:text-figaro-cream"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(product.id)}
                                className="rounded-sm border border-red-500/20 px-3 py-1.5 text-xs text-red-400/60 transition-colors hover:border-red-500/40 hover:text-red-400"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-figaro-cream/40">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
