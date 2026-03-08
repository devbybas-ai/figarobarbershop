"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  price: string;
  costPrice: string | null;
  isForSale: boolean;
  inventoryItems: Array<{
    quantity: number;
    reorderLevel: number;
  }>;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/inventory")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-figaro-cream">Inventory</h2>

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
                  <td className="px-4 py-3 text-sm text-figaro-cream/50">{product.sku ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-sm font-medium ${isLow ? "text-red-400" : "text-figaro-cream"}`}
                    >
                      {inv?.quantity ?? 0}
                    </span>
                    {isLow && <p className="text-xs text-red-400">Low stock</p>}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-figaro-gold">
                    {formatCurrency(Number(product.price))}
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-figaro-cream/50">
                    {product.costPrice ? formatCurrency(Number(product.costPrice)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${product.isForSale ? "bg-green-400" : "bg-figaro-cream/20"}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
