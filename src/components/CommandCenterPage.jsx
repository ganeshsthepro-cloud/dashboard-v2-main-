import {
  ComposedChart,
  Bar,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./CommandCenterPage.css";

const REVENUE_JOURNEY_DATA = [
  { year: "FY16", revenue: 183, comfy: 18, beverage: 10, ecomm: 0 },
  { year: "FY17", revenue: 207, comfy: 22, beverage: 11, ecomm: 0 },
  { year: "FY18", revenue: 245, comfy: 28, beverage: 12, ecomm: 0 },
  { year: "FY19", revenue: 268, comfy: 33, beverage: 13, ecomm: 1 },
  { year: "FY20", revenue: 280, comfy: 35, beverage: 12, ecomm: 2 },
  { year: "FY21", revenue: 330, comfy: 42, beverage: 14, ecomm: 3 },
  { year: "FY22", revenue: 381, comfy: 53, beverage: 15, ecomm: 5 },
  { year: "FY23", revenue: 355, comfy: 54, beverage: 18, ecomm: 6 },
  { year: "FY24", revenue: 421, comfy: 108, beverage: 30, ecomm: 8 },
  { year: "FY25", revenue: 452, comfy: 128, beverage: 36, ecomm: 9 },
];

const REVENUE_MIX_DATA = [
  { name: "OTC Gross Sales", value: 462.48 },
  { name: "Comfy Revenue", value: 127.79 },
  { name: "Beverage Revenue", value: 36.43 },
  { name: "E-Comm + QCOM", value: 9.39 },
];

const VISION_GAP_DATA = [
  { year: "FY16", actual: 183, vision: null },
  { year: "FY17", actual: 207, vision: null },
  { year: "FY18", actual: 245, vision: null },
  { year: "FY19", actual: 268, vision: null },
  { year: "FY20", actual: 280, vision: null },
  { year: "FY21", actual: 330, vision: 330 },
  { year: "FY22", actual: 381, vision: 439 },
  { year: "FY23", actual: 355, vision: 584 },
  { year: "FY24", actual: 421, vision: 776 },
  { year: "FY25", actual: 452, vision: 1032 },
];

const MIX_COLORS = ["#2563eb", "#16a34a", "#dc2626", "#312e81"];

const KPI_CARDS = [
  { label: "Net revenue Operations", value: "₹451.82 Cr", delta: "+7.3% YoY", positive: true },
  { label: "Return on Capital Employed", value: "21.44%", delta: "−33 bps", positive: false },
  { label: "Earnings Per Share", value: "₹17.58", delta: "+13.4% YoY", positive: true },
  { label: "Net worth", value: "₹326.61 Cr", delta: "+13.2% YoY", positive: true },
  { label: "Comfy revenue", value: "₹127.79 Cr", delta: "+18.0% YoY", positive: true },
  { label: "Over-The-Counter gross margin", value: "55.24%", delta: "−870bp vs FY16", positive: false },
];

const CcTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="cc-tooltip">
      {label && <p className="cc-tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#374151" }}>
          {p.name}: <strong>₹{p.value} Cr</strong>
        </p>
      ))}
    </div>
  );
};

export default function CommandCenterPage() {
  return (
    <div className="cc-page">
      <div className="cc-titlebar">
        <span className="cc-titlebar-name">Command center</span>
      </div>

      <div className="cc-body">
        {/* Hero metrics */}
        <div className="cc-hero-row">
          <div className="cc-hero-card">
            <p className="cc-hero-label">NORTH STAR METRIC</p>
            <p className="cc-hero-value cc-green">₹509.68 Cr</p>
          </div>
          <div className="cc-hero-card">
            <p className="cc-hero-label">EBITDA margin</p>
            <p className="cc-hero-value cc-red">12.88%</p>
          </div>
        </div>

        {/* 6 KPI cards */}
        <div className="cc-kpi-grid">
          {KPI_CARDS.map((kpi) => (
            <div className="cc-kpi-card" key={kpi.label}>
              <p className="cc-kpi-label">{kpi.label}</p>
              <p className="cc-kpi-value">{kpi.value}</p>
              <p className={`cc-kpi-delta ${kpi.positive ? "cc-pos" : "cc-neg"}`}>
                {kpi.delta}
              </p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="cc-charts-row">
          {/* 10-year revenue journey */}
          <div className="cc-chart-card cc-chart-lg">
            <p className="cc-chart-title">
              10-year revenue journey (₹ Cr net revenue from ops)
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart
                data={REVENUE_JOURNEY_DATA}
                margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CcTooltip />} />
                <Bar
                  dataKey="revenue"
                  fill="#93c5fd"
                  radius={[2, 2, 0, 0]}
                  name="Net Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="comfy"
                  stroke="#16a34a"
                  strokeWidth={1.5}
                  dot={false}
                  name="Comfy"
                />
                <Line
                  type="monotone"
                  dataKey="beverage"
                  stroke="#dc2626"
                  strokeWidth={1.5}
                  dot={false}
                  name="Beverage"
                />
                <Line
                  type="monotone"
                  dataKey="ecomm"
                  stroke="#7c3aed"
                  strokeWidth={1.5}
                  dot={false}
                  name="E-Comm"
                />
              </ComposedChart>
            </ResponsiveContainer>
            <div className="cc-chart-footer">
              <span className="cc-view-link">⊞ View Details</span>
              <span className="cc-updated">Updated On 08-05-2026</span>
            </div>
          </div>

          {/* Revenue mix donut */}
          <div className="cc-chart-card cc-chart-sm">
            <p className="cc-chart-title">Business Revenue Mix — FY2025</p>
            <div className="cc-pie-row">
              <ResponsiveContainer width="45%" height={160}>
                <PieChart>
                  <Pie
                    data={REVENUE_MIX_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {REVENUE_MIX_DATA.map((_, i) => (
                      <Cell key={i} fill={MIX_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `₹${v} Cr`}
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="cc-pie-legend">
                {REVENUE_MIX_DATA.map((d, i) => (
                  <div key={i} className="cc-pie-item">
                    <span
                      className="cc-pie-dot"
                      style={{ background: MIX_COLORS[i] }}
                    />
                    <span className="cc-pie-name">{d.name}</span>
                    <span className="cc-pie-val">{d.value} Cr</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="cc-chart-footer">
              <span className="cc-view-link">⊞ View Details</span>
              <span className="cc-updated">Updated On 08-05-2026</span>
            </div>
          </div>
        </div>

        {/* Vision gap chart */}
        <div className="cc-chart-card cc-chart-full">
          <p className="cc-chart-title">
            Vision gap — actual vs 33% CAGR trajectory
          </p>
          <div className="cc-vision-legend">
            <span>
              <span className="cc-legend-dash" />
              33% CAGR vision (from FY21)
            </span>
            <span>
              <span className="cc-legend-line" />
              Actual net revenue
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={VISION_GAP_DATA}
              margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={[0, 1200]}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="vision"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="6 3"
                dot={false}
                name="33% CAGR Vision"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                name="Actual net revenue"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="cc-chart-footer">
            <span className="cc-view-link">⊞ View Details</span>
            <span className="cc-updated">Updated On 08-05-2026</span>
          </div>
        </div>

        {/* Gap analysis banner */}
        <div className="cc-gap-banner">
          <p className="cc-gap-label">GAP ANALYSIS FY25</p>
          <p className="cc-gap-text">
            Actual ₹451 Cr vs vision ₹1,037 Cr — a{" "}
            <strong>₹586 Cr shortfall</strong>. Post-COVID normalization
            accounts for FY23 dip. Recovery is real but pace is 7% vs required
            33%. Three levers needed simultaneously: body pain 3×, Comfy
            captive plant, and US market entry via cGMP.
          </p>
        </div>
      </div>
    </div>
  );
}
