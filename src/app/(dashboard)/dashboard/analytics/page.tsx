"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const REVENUE_DATA = [
  { day: "Mon", revenue: 420 },
  { day: "Tue", revenue: 380 },
  { day: "Wed", revenue: 510 },
  { day: "Thu", revenue: 460 },
  { day: "Fri", revenue: 620 },
  { day: "Sat", revenue: 580 },
  { day: "Sun", revenue: 0 },
];

const SERVICE_DATA = [
  { name: "Haircuts", value: 45 },
  { name: "Beard", value: 20 },
  { name: "Shaves", value: 15 },
  { name: "Combos", value: 20 },
];

const PIE_COLORS = ["#c9a84c", "#5ba5a5", "#d4b96a", "#1a1a1a"];
const PIE_COLOR_CLASSES = ["bg-[#c9a84c]", "bg-[#5ba5a5]", "bg-[#d4b96a]", "bg-[#1a1a1a]"];

export default function AnalyticsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-figaro-cream">Analytics</h2>
      <p className="mt-1 text-sm text-figaro-cream/50">
        Sample data shown. Live data will populate as appointments are booked.
      </p>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Weekly Revenue", value: "$2,970", change: "+12%" },
          { label: "Appointments", value: "47", change: "+8%" },
          { label: "New Clients", value: "12", change: "+25%" },
          { label: "Avg. Ticket", value: "$63", change: "+3%" },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-5"
          >
            <p className="text-sm text-figaro-cream/50">{card.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-2xl font-bold text-figaro-gold">{card.value}</p>
              <span className="text-sm font-medium text-green-400">{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
          <h3 className="text-lg font-semibold text-figaro-cream">Weekly Revenue</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#999" fontSize={12} />
                <YAxis stroke="#999" fontSize={12} tickFormatter={(v: number) => `$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #c9a84c33",
                    borderRadius: "2px",
                  }}
                  labelStyle={{ color: "#f5f0e8" }}
                  formatter={(value) => [`$${value}`, "Revenue"]}
                />
                <Bar dataKey="revenue" fill="#c9a84c" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="rounded-sm border border-figaro-gold/10 bg-figaro-dark p-6">
          <h3 className="text-lg font-semibold text-figaro-cream">Service Breakdown</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SERVICE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {SERVICE_DATA.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #c9a84c33",
                    borderRadius: "2px",
                  }}
                  formatter={(value) => [`${value}%`, "Share"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {SERVICE_DATA.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${PIE_COLOR_CLASSES[index % PIE_COLOR_CLASSES.length]}`}
                />
                <span className="text-xs text-figaro-cream/60">
                  {entry.name} ({entry.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
