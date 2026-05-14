import { useState, useRef } from "react";
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
  Legend,
} from "recharts";
import { useTheme } from "../ThemeContext.jsx";
import { askAI } from "../services/aiService.js";
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

const REPORT_PROMPT = `You are a financial report generator for Amrutanjan Health Care Ltd (AHCL).
Generate a detailed, professional accounting/financial report based on the user's query.
FY25 data: Revenue ₹451.82 Cr, Gross Profit ₹229 Cr, EBITDA ₹58 Cr (12.88%), PBT ₹69 Cr, PAT ₹51 Cr, EPS ₹17.58/share. OTC ₹290 Cr, Comfy ₹124 Cr, Beverages ₹36 Cr. ROCE 21.44%. OTC gross margin 55.24%.

AHCL P&L Statement (FY25):
Revenue from Operations: ₹451.82 Cr
  OTC (Over-the-Counter): ₹290 Cr (64.18%)
  Comfy (Women's Hygiene): ₹124 Cr (27.44%)
  Beverages: ₹36 Cr (7.97%)
COGS: ₹222.82 Cr
Gross Profit: ₹229 Cr (Gross Margin 50.69%)
Operating Expenses: Employee Cost ₹59.1L, Rent ₹18L, Depreciation ₹24L, Utilities ₹6.5L, Marketing ₹32L
EBITDA: ₹58 Cr (12.88%)
PBT: ₹69 Cr (15.27%)
PAT: ₹51 Cr (Net Margin 11.29%)
EPS: ₹17.58/share | ROCE: 21.44%

P&L Formulas: Revenue - COGS = Gross Profit - OpEx = EBIT + Depreciation = EBITDA. PBT = EBIT + Other Income - Interest. PAT = PBT - Tax.
Margins: Gross Margin = GP/Revenue, Operating Margin = EBIT/Revenue, Net Margin = PAT/Revenue.
Common Size P&L: Express each line as % of revenue.

For trial balance queries, use this data:
Cash & Bank: Dr ₹45L, Accounts Receivable: Dr ₹72L, Inventory: Dr ₹85L, Plant & Machinery: Dr ₹1.2Cr, Office Equipment: Dr ₹35L, Prepaid Expenses: Dr ₹8L, Sales Revenue: Cr ₹4.52Cr, Service Income: Cr ₹12L, COGS: Dr ₹1.98Cr, Employee Cost: Dr ₹59.1L, Rent: Dr ₹18L, Depreciation: Dr ₹24L, Utilities: Dr ₹6.5L, Marketing: Dr ₹32L, Accounts Payable: Cr ₹52L, Loans Payable: Cr ₹80L, Outstanding Expenses: Cr ₹15L, Owner's Capital: Cr ₹65L, Retained Earnings: Cr ₹26.78L. Total Dr = Total Cr = ₹7.03 Cr (Balanced).

FORMAT: Use markdown with ## headers, ### subheaders, tables (| format), totals, margins, and analysis. Keep it professional and audit-ready. Use ₹ with Indian notation. Do NOT use any emojis or special symbols like ✅, ❌, ⚡, 📊 etc.`;

const DASHBOARD_PROMPT = `You are a data analyst for Amrutanjan Health Care Ltd.
Based on the user's query, return a JSON object for dashboard visualizations.
ONLY return valid JSON, no other text.

JSON structure:
{"title":"...","kpis":[{"label":"...","value":"...","sub":"..."}],"charts":[{"type":"bar"|"pie","title":"...","data":[{"name":"...","value":NUMBER}]}],"summary":"..."}

FY25 data: Revenue ₹451.82 Cr, Gross Profit ₹229 Cr, EBITDA ₹58 Cr, PBT ₹69 Cr, PAT ₹51 Cr, EPS ₹17.58. OTC ₹290 Cr, Comfy ₹124 Cr, Beverages ₹36 Cr. ROCE 21.44%.
P&L: COGS ₹222.82 Cr, Gross Margin 50.69%, EBITDA Margin 12.88%, PBT Margin 15.27%, Net Margin 11.29%, OTC Gross Margin 55.24%.
OpEx: Employee Cost ₹59.1L, Rent ₹18L, Depreciation ₹24L, Utilities ₹6.5L, Marketing ₹32L.
Trial balance: Total Dr = Total Cr = ₹7.03 Cr. Assets ₹3.65Cr, Revenue ₹4.64Cr, Expenses ₹3.38Cr, Liabilities ₹1.47Cr, Equity ₹0.92Cr.

RULES: Return ONLY valid JSON. 2-4 KPIs, 1-2 charts. Use ₹ Indian notation. Do NOT use any emojis.`;

export default function ChartsPanel({ lastQuery, onClose, onChartOpen }) {
  const [activeChart, setActiveChart] = useState(null);
  const [viewMode, setViewMode] = useState("insights"); // "insights" | "report" | "dashboard"
  const [reportContent, setReportContent] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const { colors, mode } = useTheme();
  const gridColor = mode === "light" ? "rgba(0,0,0,0.08)" : "#005a56";
  const tickColor = mode === "light" ? "#757575" : "#b0dbd9";
  const tooltipBg = mode === "light" ? "#FFFFFF" : "#007a75";
  const tooltipBorder = mode === "light" ? "#E0E0D8" : "#005a56";

  // Generate KPI card backgrounds from theme colors
  const kpiCardStyle = (index) => {
    const baseColor = colors[index % colors.length];
    if (mode === "light") {
      return { background: "#FFFFFF", borderLeft: `4px solid ${baseColor}` };
    }
    return { background: baseColor + "22", borderLeft: `4px solid ${baseColor}` };
  };

  const openChart = (chartId) => {
    const chart = CHARTS.find((c) => c.id === chartId);
    if (onChartOpen) onChartOpen(chart);
    else setActiveChart(chart);
  };

  const generateReport = async () => {
    const query = lastQuery || "Generate a financial overview report";
    setViewMode("report");
    setReportLoading(true);
    setReportContent("");
    try {
      const reply = await askAI([{ role: "user", text: query }], REPORT_PROMPT, 1500);
      setReportContent(reply);
    } catch { setReportContent("Failed to generate report. Please try again."); }
    setReportLoading(false);
  };

  const generateDashboard = async () => {
    const query = lastQuery || "Show a financial overview dashboard";
    setViewMode("dashboard");
    setDashboardLoading(true);
    setDashboardData(null);
    try {
      const reply = await askAI([{ role: "user", text: query }], DASHBOARD_PROMPT, 1000);
      const cleaned = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      setDashboardData(JSON.parse(cleaned));
    } catch { setDashboardData({ error: "Failed to generate dashboard. Please try again." }); }
    setDashboardLoading(false);
  };

  const stripEmoji = (str) => str.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{2B55}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}\u{2702}-\u{27B0}\u{E0020}-\u{E007F}✅❌⚡📊🔹🔸▶►●○★☆✓✔✗✘⬆⬇➡⭐💡🚀📈📉🎯💰📋🏆🔑❗❓⚠️℗®™©]/gu, "").trim();

  const renderReport = (text) => {
    const renderInline = (str) => {
      const clean = stripEmoji(str);
      const parts = clean.split(/(\*{2,3}.*?\*{2,3})/g);
      return parts.map((p, j) => {
        if (p.startsWith("***") && p.endsWith("***"))
          return <strong key={j}><em>{p.slice(3, -3)}</em></strong>;
        if (p.startsWith("**") && p.endsWith("**"))
          return <strong key={j}>{p.slice(2, -2)}</strong>;
        return p;
      });
    };

    const parseTable = (lines) => {
      const rows = lines.map(l =>
        l.split("|").filter(c => c.trim() !== "").map(c => c.trim())
      );
      if (rows.length < 1) return null;
      const header = rows[0];
      const body = rows.filter((_, i) => {
        if (i === 0) return false;
        // skip separator rows like |---|---|
        if (lines[i] && /^\|[\s\-:|]+\|$/.test(lines[i].trim())) return false;
        return true;
      });
      return (
        <table className="cp-report-table">
          <thead>
            <tr>{header.map((h, i) => <th key={i}>{renderInline(h)}</th>)}</tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i}>{row.map((cell, j) => <td key={j}>{renderInline(cell)}</td>)}</tr>
            ))}
          </tbody>
        </table>
      );
    };

    const lines = text.split("\n");
    const elements = [];
    let i = 0;
    while (i < lines.length) {
      const l = stripEmoji(lines[i]);
      // Collect consecutive table lines
      if (l.startsWith("|")) {
        const tableLines = [];
        while (i < lines.length && stripEmoji(lines[i]).startsWith("|")) {
          tableLines.push(stripEmoji(lines[i]));
          i++;
        }
        elements.push(<div key={`tbl-${i}`} className="cp-report-table-wrap">{parseTable(tableLines)}</div>);
        continue;
      }
      if (l.startsWith("### ")) { elements.push(<h4 key={i} className="cp-report-h4">{renderInline(l.slice(4))}</h4>); }
      else if (l.startsWith("## ")) { elements.push(<h3 key={i} className="cp-report-h3">{renderInline(l.slice(3))}</h3>); }
      else if (l.startsWith("# ")) { elements.push(<h2 key={i} className="cp-report-h2">{renderInline(l.slice(2))}</h2>); }
      else if (l.startsWith("---")) { elements.push(<hr key={i} className="cp-report-hr" />); }
      else if (l.startsWith("- ")) { elements.push(<p key={i} className="cp-report-bullet">{renderInline(l)}</p>); }
      else if (!l.trim()) { elements.push(<br key={i} />); }
      else { elements.push(<p key={i} className="cp-report-line">{renderInline(l)}</p>); }
      i++;
    }
    return elements;
  };

  const renderDashboard = () => {
    if (!dashboardData) return null;
    if (dashboardData.error) return <p className="cp-dash-error">{dashboardData.error}</p>;
    return (
      <div className="cp-dash-content">
        <h3 className="cp-dash-title">{dashboardData.title}</h3>
        {dashboardData.kpis && (
          <div className="cp-dash-kpis">
            {dashboardData.kpis.map((kpi, i) => (
              <div key={i} className="cp-dash-kpi" style={{ borderLeft: `3px solid ${colors[i % colors.length]}` }}>
                <p className="cp-dash-kpi-label">{kpi.label}</p>
                <p className="cp-dash-kpi-value">{kpi.value}</p>
                {kpi.sub && <p className="cp-dash-kpi-sub">{kpi.sub}</p>}
              </div>
            ))}
          </div>
        )}
        {dashboardData.charts?.map((chart, ci) => (
          <div key={ci} className="cp-dash-chart">
            <p className="cp-dash-chart-title">{chart.title}</p>
            {chart.type === "pie" ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={chart.data} cx="50%" cy="50%" innerRadius={30} outerRadius={60} dataKey="value" paddingAngle={2}>
                    {chart.data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => typeof v === "number" && v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : v} />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chart.data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: tickColor, fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Amount" radius={[3, 3, 0, 0]}>
                    {chart.data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        ))}
        {dashboardData.summary && (
          <p className="cp-dash-summary">{dashboardData.summary}</p>
        )}
      </div>
    );
  };

  return (
    <>
      <aside className="charts-panel">
        <div className="panel-header">
          <h2 className="panel-title">Insights</h2>
          <div className="panel-header-actions">
            <div className="cp-view-btns">
              <button className={`cp-view-btn${viewMode === "insights" ? " cp-view-active" : ""}`} onClick={() => setViewMode("insights")}>Static</button>
              <button className={`cp-view-btn cp-btn-report${viewMode === "report" ? " cp-view-active" : ""}`} onClick={generateReport}>Report</button>
              <button className={`cp-view-btn cp-btn-dash${viewMode === "dashboard" ? " cp-view-active" : ""}`} onClick={generateDashboard}>Dashboard</button>
            </div>
            {onClose && (
              <button className="panel-close-btn" onClick={onClose} title="Close Insights">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="15" y1="3" x2="15" y2="21" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* === INSIGHTS (default) === */}
        {viewMode === "insights" && (
        <div className="charts-scroll">
          {/* KPI Row */}
          <div
            className="insights-kpi-grid"
            aria-label="Amrutanjan Health Care KPI summary cards"
          >
            {KPI_CARDS.map((kpi, index) => (
              <article className="insights-kpi-card" key={kpi.title} style={kpiCardStyle(index)}>
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
        )}

        {/* === REPORT VIEW === */}
        {viewMode === "report" && (
          <div className="charts-scroll cp-report-scroll">
            {reportLoading ? (
              <div className="cp-loading">
                <div className="cp-spinner" />
                <p>Generating report…</p>
              </div>
            ) : (
              <div className="cp-report-body">
                {reportContent ? renderReport(reportContent) : (
                  <p className="cp-empty">Ask something in Chat first, then click Report.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* === DASHBOARD VIEW === */}
        {viewMode === "dashboard" && (
          <div className="charts-scroll cp-dash-scroll">
            {dashboardLoading ? (
              <div className="cp-loading">
                <div className="cp-spinner" />
                <p>Building dashboard…</p>
              </div>
            ) : (
              renderDashboard()
            )}
          </div>
        )}
      </aside>

      {activeChart && !onChartOpen && (
        <ChartModal chart={activeChart} onClose={() => setActiveChart(null)} />
      )}
    </>
  );
}
