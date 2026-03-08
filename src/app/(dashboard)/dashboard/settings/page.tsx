import { db } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const settings = await db.shopSettings.findUnique({
    where: { id: "default" },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-figaro-cream">Shop Settings</h2>

      <div className="mt-6 rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[
            { label: "Shop Name", value: settings?.shopName },
            { label: "Phone", value: settings?.phone },
            { label: "Email", value: settings?.email },
            { label: "Address", value: settings?.address },
            { label: "City", value: settings?.city },
            { label: "State", value: settings?.state },
            { label: "ZIP", value: settings?.zip },
            { label: "Timezone", value: settings?.timezone },
          ].map((field) => (
            <div key={field.label}>
              <p className="text-xs font-medium uppercase tracking-wider text-figaro-cream/50">
                {field.label}
              </p>
              <p className="mt-1 text-figaro-cream">{field.value ?? "—"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
