import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  Sankey,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "../ThemeContext.jsx";
import ChartModal from "./ChartModal.jsx";
import "./ChartsPanel.css";

const SANKEY_BLUE = "#7B9BD4";
const SANKEY_PINK = "#F09898";

const SANKEY_NODE_COLORS_PANEL = {
  "OTC Products": SANKEY_BLUE,
  "Women's Hygiene": SANKEY_BLUE,
  "Beverages": SANKEY_BLUE,
  "Others & Other Income": SANKEY_BLUE,
  "Revenue": SANKEY_BLUE,
  "Cost of Materials": SANKEY_PINK,
  "Gross Profit": SANKEY_PINK,
  "Employee Cost": SANKEY_PINK,
  "Advertising & Selling Exp.": SANKEY_PINK,
  "Other Expenses": SANKEY_PINK,
  "EBITDA": SANKEY_BLUE,
  "Depreciation & Amortization": SANKEY_PINK,
  "Other Income": SANKEY_BLUE,
  "Profit Before Tax (PBT)": SANKEY_BLUE,
  "Tax": SANKEY_PINK,
  "Profit After Tax (PAT)": SANKEY_BLUE,
  "EPS (₹17.58 per share)": SANKEY_BLUE,
};

const SankeyPanelLink = (props) => {
  const { payload, sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, ...rest } = props;
  const targetName = payload?.target?.name || "";
  const color = SANKEY_NODE_COLORS_PANEL[targetName] || SANKEY_BLUE;
  const halfWidth = (linkWidth || 1) / 2;
  const path = `
    M${sourceX},${sourceY + halfWidth}
    C${sourceControlX},${sourceY + halfWidth} ${targetControlX},${targetY + halfWidth} ${targetX},${targetY + halfWidth}
    L${targetX},${targetY - halfWidth}
    C${targetControlX},${targetY - halfWidth} ${sourceControlX},${sourceY - halfWidth} ${sourceX},${sourceY - halfWidth}
    Z
  `;
  return <path d={path} fill={color} fillOpacity={0.4} stroke="none" />;
};

const revenueData = [
  { quarter: "Q1 FY25", revenue: 102, target: 113 },
  { quarter: "Q2 FY25", revenue: 118, target: 113 },
  { quarter: "Q3 FY25", revenue: 132, target: 113 },
  { quarter: "Q4 FY25", revenue: 100, target: 113 },
];

const categoryData = [
  { name: "OTC Gross Sales", value: 73.5 },
  { name: "Comfy Revenue", value: 20.3 },
  { name: "Beverage Revenue", value: 5.8 },
  { name: "E-Comm + QCOM", value: 1.5 },
  { name: "International", value: 0 },
].filter((d) => d.value > 0);

const trendsData = [
  { year: "FY20", otc: 175, comfy: 35 },
  { year: "FY21", otc: 210, comfy: 42 },
  { year: "FY22", otc: 245, comfy: 53 },
  { year: "FY23", otc: 230, comfy: 54 },
  { year: "FY24", otc: 264, comfy: 108 },
  { year: "FY25", otc: 278, comfy: 128 },
];

const PIE_COLORS = ["#00c4ba", "#0091a7", "#005a56", "#80dbd8"];

const KPI_CARDS = [
  { title: "OTC gross margin", value: "55.24%", subtitle: "−870bp vs FY16" },
  { title: "EBITDA margin", value: "12.88%", subtitle: "FY25" },
  { title: "Net Revenue FY25", value: "₹451.82 Cr", subtitle: "+7.3% YoY" },
  { title: "ROCE", value: "21.44%", subtitle: "−33 bps YoY" },
  { title: "Earnings Per Share", value: "₹17.58", subtitle: "+13.4% YoY" },
];



const CASH_FLOW_SANKEY_DATA = {
  nodes: [
    { name: "OTC Products" },
    { name: "Women's Hygiene" },
    { name: "Beverages" },
    { name: "Others & Other Income" },
    { name: "Revenue" },
    { name: "Cost of Materials" },
    { name: "Gross Profit" },
    { name: "Employee Cost" },
    { name: "Advertising & Selling Exp." },
    { name: "Other Expenses" },
    { name: "EBITDA" },
    { name: "Depreciation & Amortization" },
    { name: "Other Income" },
    { name: "Profit Before Tax (PBT)" },
    { name: "Tax" },
    { name: "Profit After Tax (PAT)" },
    { name: "EPS (₹17.58 per share)", displayValue: "₹17.58/share" },
  ],
  links: [
    { source: 0, target: 4, level: 1, value: 290 },
    { source: 1, target: 4, level: 1, value: 124 },
    { source: 2, target: 4, level: 1, value: 36 },
    { source: 3, target: 4, level: 1, value: 2 },
    { source: 4, target: 5, level: 2, value: 223 },
    { source: 4, target: 6, level: 2, value: 229 },
    { source: 6, target: 7, level: 3, value: 59 },
    { source: 6, target: 8, level: 3, value: 56 },
    { source: 6, target: 9, level: 3, value: 55 },
    { source: 6, target: 10, level: 3, value: 58 },
    { source: 10, target: 11, level: 4, value: 7 },
    { source: 10, target: 13, level: 4, value: 51 },
    { source: 12, target: 13, level: 4, value: 18 },
    { source: 13, target: 14, level: 5, value: 18 },
    { source: 13, target: 15, level: 5, value: 51 },
    { source: 15, target: 16, level: 6, value: 51 },
  ],
};

const CHARTS = [
  { id: "bar", title: "Quarterly Revenue FY25 (₹ Cr)", data: revenueData },
  { id: "pie", title: "Business Revenue Mix FY25", data: categoryData },
  { id: "line", title: "Segment Revenue Trend FY20–25 (₹ Cr)", data: trendsData },
  {
    id: "cashflow",
    title: "AHCL FY 2024-25 Cash Flow Sankey",
    data: CASH_FLOW_SANKEY_DATA,
  },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      {label && <p className="tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}:{" "}
          <strong>
            {typeof p.value === "number" && p.value > 999
              ? `$${(p.value / 1000).toFixed(1)}K`
              : p.value}
          </strong>
        </p>
      ))}
    </div>
  );
};

const ExpandIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ChartsPanel() {
  const [activeChart, setActiveChart] = useState(null);
  const { colors, mode } = useTheme();
  const gridColor = mode === "light" ? "rgba(0,0,0,0.08)" : "#005a56";
  const tickColor = mode === "light" ? "#757575" : "#b0dbd9";
  const tooltipBg = mode === "light" ? "#FFFFFF" : "#007a75";
  const tooltipBorder = mode === "light" ? "#E0E0D8" : "#005a56";

  const openChart = (chartId) =>
    setActiveChart(CHARTS.find((c) => c.id === chartId));

  return (
    <>
      <aside className="charts-panel">
        <div className="panel-header">
          <h2 className="panel-title">Insights</h2>
          <span className="badge">Static</span>
        </div>

        <div className="charts-scroll">
          {/* KPI Row */}
          <div
            className="insights-kpi-grid"
            aria-label="Amrutanjan Health Care KPI summary cards"
          >
            {KPI_CARDS.map((kpi) => (
              <article className="insights-kpi-card" key={kpi.title}>
                <p className="insights-kpi-title">{kpi.title}</p>
                <p className="insights-kpi-value">{kpi.value}</p>
                {kpi.subtitle ? (
                  <p className="insights-kpi-subtitle">{kpi.subtitle}</p>
                ) : (
                  <p className="insights-kpi-subtitle spacer">&nbsp;</p>
                )}
              </article>
            ))}
          </div>

          {/* Bar Chart */}
          <div
            className="chart-card clickable"
            onClick={() => openChart("bar")}
          >
            <div className="chart-title-row">
              <span className="chart-title">Quarterly Revenue FY25 (₹ Cr)</span>
              <span className="expand-hint">
                <ExpandIcon />
              </span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={revenueData}
                barGap={2}
                margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="quarter"
                  tick={{ fill: tickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: tickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(0,0,0,0.04)" }}
                />
                <Bar
                  dataKey="revenue"
                  fill={colors[0]}
                  radius={[3, 3, 0, 0]}
                  name="revenue"
                />
                <Bar
                  dataKey="target"
                  fill={colors[1]}
                  radius={[3, 3, 0, 0]}
                  name="target"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <span>
                <span className="dot" style={{ background: colors[0] }} />
                Revenue
              </span>
              <span>
                <span className="dot" style={{ background: colors[1] }} />
                Target
              </span>
            </div>
          </div>

          {/* Pie Chart */}
          <div
            className="chart-card clickable"
            onClick={() => openChart("pie")}
          >
            <div className="chart-title-row">
              <span className="chart-title">Business Revenue Mix FY25</span>
              <span className="expand-hint">
                <ExpandIcon />
              </span>
            </div>
            <div className="pie-wrapper">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => `${v}%`}
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend">
                {categoryData.map((d, i) => (
                  <div key={i} className="pie-legend-item">
                    <span
                      className="dot"
                      style={{ background: colors[i % colors.length] }}
                    />
                    <span className="pie-name">{d.name}</span>
                    <span className="pie-pct">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <section className="ai-insights-section" aria-label="AI insights">
            <div className="ai-insights-title-row">
              <h3 className="ai-insights-title">AI Insights</h3>
              <span className="ai-insights-count">2 cards</span>
            </div>

            <div className="finance-ai-card">
              <div className="finance-ai-header">
                <h3 className="finance-ai-title">
                  MarginWatch Agent — OTC gross margin compression
                </h3>
                <span className="finance-ai-badge">F1 Alert</span>
              </div>
              <p className="finance-highlight">
                55.24% today vs 64%+ in FY16 — 870bp erosion since FY16
              </p>
              <p className="finance-insight-copy">
                Raw material cost inflation (menthol, camphor, eucalyptus oil)
                and rising packaging costs have compressed OTC gross margin by
                870bp since FY16. Comfy captive plant launch in FY26 (Hyderabad)
                is the primary hedge — self-manufacturing pain relief patches
                eliminates ₹40–55 Cr in outsourcing premium. Margin recovery
                target: 58% by FY27.
              </p>
              <button
                className="runway-btn"
                onClick={() => openChart("cashflow")}
              >
                View P&amp;L flow
              </button>
            </div>

            <div className="finance-ai-card conversion-ai-card">
              <div className="finance-ai-header">
                <h3 className="finance-ai-title">
                  GrowthGapWatch Agent — 33% CAGR vision gap
                </h3>
                <span className="finance-ai-badge">AI Insight</span>
              </div>
              <p className="finance-highlight">
                ₹586 Cr shortfall vs vision — actual growth 7% vs required 33%
              </p>
              <p className="finance-insight-copy">
                FY21 33% CAGR vision implies ₹1,037 Cr by FY25. Actual FY25
                revenue ₹451.82 Cr — ₹586 Cr behind. Three simultaneous levers
                required: (1) Body Pain 3× via Amrutanjan Red &amp; Maha
                expansion, (2) Comfy captive plant reducing cost and enabling
                margin expansion, (3) US cGMP facility for regulated-market OTC
                exports.
              </p>
              <p className="finance-insight-copy">
                None of the three levers can succeed independently — all three
                must execute in parallel through FY26–FY28 to bridge the gap.
              </p>
              <button
                className="runway-btn"
                onClick={() => openChart("line")}
              >
                View segment trends
              </button>
            </div>
          </section>

          {/* Line Chart */}
          <div
            className="chart-card clickable"
            onClick={() => openChart("line")}
          >
            <div className="chart-title-row">
              <span className="chart-title">Segment Revenue Trend FY20–25 (₹ Cr)</span>
              <span className="expand-hint">
                <ExpandIcon />
              </span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart
                data={trendsData}
                margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="year"
                  tick={{ fill: tickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: tickColor, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: tooltipBg,
                    border: `1px solid ${tooltipBorder}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="otc"
                  stroke={colors[0]}
                  strokeWidth={2}
                  dot={{ fill: colors[0], r: 3 }}
                  name="OTC Net"
                />
                <Line
                  type="monotone"
                  dataKey="comfy"
                  stroke={colors[1]}
                  strokeWidth={2}
                  dot={{ fill: colors[1], r: 3 }}
                  name="Comfy"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              <span>
                <span className="dot" style={{ background: colors[0] }} />
                OTC Net
              </span>
              <span>
                <span className="dot" style={{ background: colors[1] }} />
                Comfy
              </span>
            </div>
          </div>

          <div
            className="chart-card clickable"
            onClick={() => openChart("cashflow")}
            style={{ background: "#ffffff" }}
          >
            <div className="chart-title-row">
              <span className="chart-title" style={{ color: "#1A1A1A" }}>AHCL FY 2024-25 Cash Flow Sankey</span>
              <span className="expand-hint">
                <ExpandIcon />
              </span>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <Sankey
                className="cashflow-sankey"
                data={CASH_FLOW_SANKEY_DATA}
                nodePadding={12}
                nodeWidth={10}
                link={<SankeyPanelLink />}
                node={{
                  stroke: "none",
                  strokeWidth: 0,
                  fill: SANKEY_BLUE,
                  fillOpacity: 0.85,
                }}
              >
                <Tooltip
                  formatter={(value) => [`₹${value} Cr`, "Flow"]}
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E0E0D8",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#1A1A1A",
                  }}
                  itemStyle={{ color: "#1A1A1A" }}
                  labelStyle={{ color: "#1A1A1A" }}
                />
              </Sankey>
            </ResponsiveContainer>
          </div>
        </div>
      </aside>

      {activeChart && (
        <ChartModal chart={activeChart} onClose={() => setActiveChart(null)} />
      )}
    </>
  );
}
