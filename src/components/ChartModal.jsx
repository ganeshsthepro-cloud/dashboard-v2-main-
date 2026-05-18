import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  ComposedChart,
  FunnelChart,
  Funnel,
  Sankey,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  LabelList,
  Treemap,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useTheme } from "../ThemeContext.jsx";
import { askAI } from "../services/aiService.js";
import "./ChartModal.css";

const PIE_COLORS = ["#00c4ba", "#0091a7", "#005a56", "#80dbd8"];
const FUNNEL_COLORS = [
  "#00c4ba",
  "#0091a7",
  "#007a75",
  "#005a56",
  "#004a44",
  "#003e39",
];

const COLOR_TEMPLATES = [
  { name: "Brand", colors: ["#F5C200", "#2E7B34", "#C62828", "#1565C0", "#F57F00", "#6A1B9A"] },
  { name: "Ocean", colors: ["#0077B6", "#00B4D8", "#90E0EF", "#023E8A", "#48CAE4", "#ADE8F4"] },
  { name: "Sunset", colors: ["#FF6B35", "#F7C59F", "#EFEFD0", "#004E89", "#1A659E", "#FF9F1C"] },
  { name: "Forest", colors: ["#2D6A4F", "#40916C", "#74C69D", "#1B4332", "#52B788", "#B7E4C7"] },
  { name: "Berry", colors: ["#7B2CBF", "#9D4EDD", "#C77DFF", "#3C096C", "#E0AAFF", "#5A189A"] },
  { name: "Warm", colors: ["#E63946", "#F4A261", "#E9C46A", "#264653", "#2A9D8F", "#8AB17D"] },
];

const DRILLDOWN = {
  "OTC Gross Sales": [
    { label: "Pain Management", value: 48 },
    { label: "Headache", value: 27 },
    { label: "Cold & Congestion", value: 15 },
    { label: "Others", value: 10 },
  ],
  "Comfy Revenue": [
    { label: "Sanitary Pads", value: 63 },
    { label: "Panty Liners", value: 22 },
    { label: "Tampons", value: 9 },
    { label: "Others", value: 6 },
  ],
  "Beverage Revenue": [
    { label: "Fruit Pulp Drinks", value: 58 },
    { label: "Health Drinks", value: 29 },
    { label: "Others", value: 13 },
  ],
  "E-Comm + QCOM": [
    { label: "Marketplace", value: 54 },
    { label: "Quick Commerce", value: 34 },
    { label: "D2C", value: 12 },
  ],
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="modal-tooltip">
      {label && <p className="modal-tooltip-label">{label}</p>}
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

const AI_REPLIES = [
  "Updated — color scheme shifted to match your request.",
  "Done. Chart title and axis labels refined.",
  "Applied. Legend repositioned to the right side.",
  "Done — data smoothed using 2-period moving average.",
  "Updated. Bar radius increased for a softer look.",
];

const SANKEY_BLUE = "#7B9BD4";
const SANKEY_PINK = "#F09898";

const SANKEY_NODE_COLORS = {
  "OTC Products":                    SANKEY_BLUE,
  "Women's Hygiene":                 SANKEY_BLUE,
  "Beverages":                       SANKEY_BLUE,
  "Others & Other Income":           SANKEY_BLUE,
  "Revenue":                         SANKEY_BLUE,
  "Cost of Materials":               SANKEY_PINK,
  "Gross Profit":                    SANKEY_PINK,
  "Employee Cost":                   SANKEY_PINK,
  "Advertising & Selling Exp.":      SANKEY_PINK,
  "Other Expenses":                  SANKEY_PINK,
  "EBITDA":                          SANKEY_BLUE,
  "Depreciation & Amortization":     SANKEY_PINK,
  "Other Income":                    SANKEY_BLUE,
  "Profit Before Tax (PBT)":         SANKEY_BLUE,
  "Tax":                             SANKEY_PINK,
  "Profit After Tax (PAT)":          SANKEY_BLUE,
  "EPS (₹17.58 per share)":          SANKEY_BLUE,
};

const SANKEY_SHORT_LABELS = {
  "Others & Other Income":       "Others & OI",
  "Advertising & Selling Exp.":  "Advt. & Selling",
  "Depreciation & Amortization": "D&A",
  "Profit Before Tax (PBT)":     "PBT",
  "Profit After Tax (PAT)":      "PAT",
  "EPS (₹17.58 per share)":      "EPS (₹17.58)",
};

const SankeyNodeWithLabel = ({ x, y, width, height, payload }) => {
  const fullName = payload?.name?.split("·")?.[0]?.trim() ?? "";
  const displayName = SANKEY_SHORT_LABELS[fullName] || fullName;
  const value = Number(payload?.value);
  let formattedValue = "";
  if (payload?.displayValue) {
    formattedValue = payload.displayValue;
  } else if (Number.isFinite(value)) {
    formattedValue = `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} cr`;
  }

  const nodeFill = SANKEY_NODE_COLORS[fullName] ?? "#0091a7";
  const isRightSide = x > 700;
  const labelX = isRightSide ? x - 8 : x + width + 8;
  const anchor = isRightSide ? "end" : "start";
  const midY = y + height / 2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={3}
        fill={nodeFill}
        fillOpacity={0.9}
        stroke={nodeFill}
        strokeWidth={1}
      />
      <text
        x={labelX}
        y={midY - (formattedValue ? 5 : 0)}
        fill="#1A1A1A"
        fontSize="10"
        fontWeight="600"
        textAnchor={anchor}
        dominantBaseline="middle"
      >
        {displayName}
      </text>
      {formattedValue && (
        <text
          x={labelX}
          y={midY + 9}
          fill="#555555"
          fontSize="9"
          textAnchor={anchor}
          dominantBaseline="middle"
        >
          {formattedValue}
        </text>
      )}
    </g>
  );
};

const SankeyColoredLink = (props) => {
  const { payload, sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, ...rest } = props;
  const targetName = payload?.target?.name || "";
  const color = SANKEY_NODE_COLORS[targetName] || SANKEY_BLUE;
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

const buildLocalChartReply = (question, chart) => {
  const q = question.toLowerCase();
  const data = Array.isArray(chart.data) ? chart.data : [];

  if (!data.length) {
    return `This chart ("${chart.title}") contains data that I can analyze once the AI service is connected. For now, the chart displays the visual breakdown above.`;
  }

  // Detect value key from data
  const sample = data[0] || {};
  const valueKey = Object.keys(sample).find(
    (k) => typeof sample[k] === "number" && !["id"].includes(k)
  );
  const nameKey = Object.keys(sample).find(
    (k) => typeof sample[k] === "string"
  ) || Object.keys(sample)[0];

  if (valueKey) {
    const sorted = [...data].sort((a, b) => (b[valueKey] || 0) - (a[valueKey] || 0));
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    const total = sorted.reduce((s, d) => s + (d[valueKey] || 0), 0);

    if (q.includes("highest") || q.includes("lowest") || q.includes("compare") || q.includes("top") || q.includes("bottom") || q.includes("max") || q.includes("min")) {
      return `**Highest:** ${highest[nameKey]} at **${highest[valueKey]}** (${((highest[valueKey] / total) * 100).toFixed(1)}% of total)\n\n**Lowest:** ${lowest[nameKey]} at **${lowest[valueKey]}** (${((lowest[valueKey] / total) * 100).toFixed(1)}% of total)\n\nDifference: **${(highest[valueKey] - lowest[valueKey]).toFixed(1)}** (${((highest[valueKey] / lowest[valueKey])).toFixed(1)}x).`;
    }

    if (q.includes("total") || q.includes("sum")) {
      return `The total across all segments is **${total.toFixed(1)}**.`;
    }

    if (q.includes("average") || q.includes("avg") || q.includes("mean")) {
      return `The average value is **${(total / data.length).toFixed(1)}** across ${data.length} segments.`;
    }

    if (q.includes("break") || q.includes("detail") || q.includes("list") || q.includes("all")) {
      const lines = sorted.map(
        (d, i) => `${i + 1}. **${d[nameKey]}:** ${d[valueKey]} (${((d[valueKey] / total) * 100).toFixed(1)}%)`
      );
      return `**${chart.title} breakdown:**\n\n${lines.join("\n")}`;
    }

    // Default summary
    return `**${chart.title}** has ${data.length} segments. **${highest[nameKey]}** leads at **${highest[valueKey]}** (${((highest[valueKey] / total) * 100).toFixed(1)}%), while **${lowest[nameKey]}** is the smallest at **${lowest[valueKey]}** (${((lowest[valueKey] / total) * 100).toFixed(1)}%). Total: **${total.toFixed(1)}**.`;
  }

  return `This chart shows "${chart.title}" with ${data.length} data points. Connect the AI service for deeper analysis.`;
};

export default function ChartModal({ chart, onClose }) {
  const { colors: globalColors, colorTemplate, setColorTemplate, COLOR_TEMPLATES, mode } = useTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSlice, setActiveSlice] = useState(null);
  const [runwayStage, setRunwayStage] = useState(0);
  const [chartType, setChartType] = useState(chart.id);
  const [colorOverrides, setColorOverrides] = useState({});
  const [chatMode, setChatMode] = useState(null); // null | "command" | "question"
  const [chartReady, setChartReady] = useState(false);
  const inputRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus();
    // Delay chart render by one frame so container is properly sized
    const raf = requestAnimationFrame(() => setChartReady(true));
    return () => {
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [onClose]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const isStagedModal = chart.id === "runway" || chart.id === "conversion";
    if (!isStagedModal) {
      setRunwayStage(0);
      return undefined;
    }

    setRunwayStage(0);
    const first = setTimeout(() => setRunwayStage(1), 120);
    const second = setTimeout(() => setRunwayStage(2), 700);

    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, [chart.id]);

  useEffect(() => {
    setChartType(chart.id);
    setActiveSlice(null);
  }, [chart.id]);

  const COLOR_MAP = {
    red: "#E53935", crimson: "#DC143C", maroon: "#800000",
    blue: "#1E88E5", navy: "#001F5C", skyblue: "#87CEEB", "sky blue": "#87CEEB",
    green: "#43A047", lime: "#CDDC39", emerald: "#50C878",
    orange: "#FB8C00", amber: "#FFC107",
    yellow: "#FFEB3B", gold: "#FFD700",
    purple: "#8E24AA", violet: "#7B1FA2", indigo: "#3F51B5",
    pink: "#EC407A", magenta: "#E91E63",
    teal: "#00897B", cyan: "#00BCD4", turquoise: "#40E0D0",
    brown: "#795548", tan: "#D2B48C",
    black: "#212121", grey: "#9E9E9E", gray: "#9E9E9E", white: "#FAFAFA",
    coral: "#FF7043", salmon: "#FA8072", peach: "#FFAB91",
  };

  const parseColorCommand = (text) => {
    const lower = text.toLowerCase();
    // Match patterns like "change bar to red", "make revenue red", "bar color red", "change color to #FF0000"
    const hexMatch = lower.match(/#([0-9a-f]{3,6})\b/);
    const colorNames = Object.keys(COLOR_MAP).join("|");
    const targetRe = new RegExp(`(?:change|make|set)\\s+(?:the\\s+)?(?:(bar|line|pie|revenue|target|first|second|1st|2nd|all|chart|background)\\s+)?(?:color\\s+)?(?:to\\s+|color\\s+)?(${colorNames}|#[0-9a-f]{3,6})`, "i");
    const match = lower.match(targetRe);
    if (!match && !hexMatch) return null;

    const colorToken = match ? match[2] : hexMatch[0];
    const resolvedColor = colorToken.startsWith("#") ? colorToken : COLOR_MAP[colorToken];
    if (!resolvedColor) return null;

    const target = match?.[1] || "all";
    const result = {};
    if (["revenue", "bar", "first", "1st"].includes(target)) {
      result.primary = resolvedColor;
    } else if (["target", "second", "2nd"].includes(target)) {
      result.secondary = resolvedColor;
    } else {
      result.primary = resolvedColor;
    }
    return result;
  };

  const parseChartCommand = (text) => {
    const lower = text.toLowerCase();
    if (/\b(pie|donut|doughnut)\b/.test(lower)) return "pie";
    if (/\b(line|trend)\b/.test(lower)) return "line";
    if (/\b(bar|column|histogram)\b/.test(lower)) return "bar";
    if (/\b(tree\s*map)\b/.test(lower)) return "treemap";
    if (/\b(scatter|dot\s*plot)\b/.test(lower)) return "scatter";
    if (/\b(radar|spider|web)\b/.test(lower)) return "radar";
    if (/\b(pyramid|population)\b/.test(lower)) return "pyramid";
    if (/\b(rank|ranking|horizontal\s*bar)\b/.test(lower)) return "rank";
    if (/\b(heat\s*map|heatmap)\b/.test(lower)) return "heatmap";
    if (/\b(gauge|meter|speedometer)\b/.test(lower)) return "gauge";
    if (/\b(funnel)\b/.test(lower)) return "funnel";
    return null;
  };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const requestedType = parseChartCommand(text);
    const colorCmd = parseColorCommand(text);

    // Handle color change commands locally
    if (colorCmd) {
      setChatMode("command");
      setColorOverrides((prev) => ({ ...prev, ...colorCmd }));
      const colorName = Object.values(colorCmd)[0];
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `Done — chart color updated to **${colorName}**.` },
      ]);
      setLoading(false);
    } else if (requestedType && ["bar", "pie", "line"].includes(chart.id)) {
      setChatMode("command");
      setChartType(requestedType);
      const typeLabels = {
        bar: "bar chart", pie: "pie chart", line: "line chart",
        treemap: "treemap", scatter: "scatter plot", radar: "radar chart",
        pyramid: "population pyramid", rank: "rank chart", heatmap: "heat map",
        gauge: "gauge chart", funnel: "funnel chart",
      };
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: `Done — switched to ${typeLabels[requestedType] || requestedType}. You can ask me to change it again anytime.` },
      ]);
      setLoading(false);
    } else {
      setChatMode("question");
      try {
        let dataSnippet;
        try {
          const d = Array.isArray(chart.data) ? chart.data.slice(0, 6) : { summary: chart.title };
          dataSnippet = JSON.stringify(d);
        } catch { dataSnippet = chart.title; }
        const systemPrompt = `You are a STRICTLY FINANCE-ONLY data analyst assistant for Amrutanjan Health Care Ltd dashboard. The user is viewing a chart titled "${chart.title}". The chart data: ${dataSnippet}.

CRITICAL DOMAIN RESTRICTION — YOU MUST FOLLOW THIS WITHOUT EXCEPTION:
- You are ONLY allowed to discuss: AHCL financial data, revenue, profit, loss, P&L, balance sheets, cash flow, EBITDA, margins, ratios, segments, costs, expenses, tax, EPS, ROCE, business performance, financial trends, financial terminology, accounting concepts, chart data analysis, and chart modifications (change chart type, change colors).
- If the user asks ANYTHING outside finance and AHCL business data — including but not limited to: general knowledge, science, history, geography, coding, programming, jokes, stories, recipes, health advice, personal questions, politics, sports, entertainment, technology, weather, travel, or ANY other non-finance topic — you MUST reply EXACTLY:
"I am a finance-only assistant for Amrutanjan Health Care Ltd. I can only help with AHCL financial data, chart analysis, and chart modifications. Please ask me a finance-related question."
- Do NOT attempt to answer, do NOT provide partial answers, do NOT say "I don't know but...". Just give the rejection message above.
- Even if the user says "please", "just this once", or tries to trick you, ALWAYS reject non-finance questions.

RULES:
- ONLY answer questions related to finance, revenue, sales, costs, profit, business metrics, chart data, trends, and financial analysis.
- You can help change chart types (bar, pie, line) and chart colors.
- Keep answers short (2-4 sentences). Be precise with numbers from the data.
- NEVER use emojis or unicode symbols.
- Use markdown bold (**text**) for emphasis.`;
        const reply = await askAI(newMessages, systemPrompt);
        setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      } catch (err) {
        console.error("ChartModal AI error:", err);
        // Fallback: generate a local response from chart data
        const fallback = buildLocalChartReply(text, chart);
        setMessages((prev) => [
          ...prev,
          { role: "ai", text: fallback },
        ]);
      }
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const pickSlice = (entry) => {
    const selected = entry?.payload ?? entry;
    if (!selected?.name) return;
    setActiveSlice((prev) => (prev?.name === selected.name ? null : selected));
  };

  const renderChart = () => {
    // For bar/pie/line charts, use dynamic chartType
    const effectiveType = ["bar", "pie", "line"].includes(chart.id) ? chartType : chart.id;
    const tplColors = [
      colorOverrides.primary || globalColors[0],
      colorOverrides.secondary || globalColors[1],
      ...globalColors.slice(2),
    ];

    if (effectiveType === "bar") {
      // Render bar chart from any source data
      const barData = chart.id === "pie"
        ? chart.data.map((d) => ({ quarter: d.name, revenue: d.value }))
        : chart.id === "line"
        ? chart.data.map((d) => ({ quarter: d.year, revenue: d.otc, target: d.comfy }))
        : chart.data;
      const hasTarget = barData[0]?.target !== undefined;
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            barGap={4}
            margin={{ top: 16, right: 24, bottom: 8, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="quarter" tick={{ fill: "#757575", fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#757575", fontSize: 13 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(245,194,0,0.06)" }} />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
            <Bar dataKey="revenue" fill={tplColors[0]} radius={[4, 4, 0, 0]} name="Revenue" />
            {hasTarget && <Bar dataKey="target" fill={tplColors[1]} radius={[4, 4, 0, 0]} name="Target" />}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (effectiveType === "pie") {
      // Render pie chart from any source data
      const pieData = chart.id === "bar"
        ? chart.data.map((d) => ({ name: d.quarter, value: d.revenue }))
        : chart.id === "line"
        ? chart.data.map((d) => ({ name: d.year, value: d.otc }))
        : chart.data;
      const pieColors = tplColors;
      const drillData = activeSlice ? DRILLDOWN[activeSlice.name] : null;
      const sliceColor = activeSlice
        ? pieColors[pieData.findIndex((d) => d.name === activeSlice.name) % pieColors.length]
        : pieColors[0];

      const hasDrilldown = chart.id === "pie";

      if (!hasDrilldown) {
        // Simple full-width pie (no drill-down panel)
        return (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="28%"
                  outerRadius="60%"
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive
                  animationDuration={500}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `₹${v} Cr`}
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E0E0D8",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-modal-legend">
              {pieData.map((d, i) => (
                <div key={i} className="pie-modal-legend-item">
                  <span className="pie-modal-dot" style={{ background: pieColors[i % pieColors.length] }} />
                  <span className="pie-modal-name">{d.name}</span>
                  <span className="pie-modal-pct">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="pie-modal-layout">
          <div className={`pie-modal-left ${activeSlice ? "pie-shrunk" : ""}`}>
            <ResponsiveContainer width="100%" height="75%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius="28%"
                  outerRadius="60%"
                  paddingAngle={4}
                  dataKey="value"
                  onClick={pickSlice}
                  cursor="pointer"
                  isAnimationActive
                  animationDuration={500}
                >
                  {pieData.map((d, i) => (
                    <Cell
                      key={i}
                      fill={pieColors[i % pieColors.length]}
                      opacity={activeSlice && activeSlice.name !== d.name ? 0.3 : 1}
                      stroke={activeSlice?.name === d.name ? "#fff" : "transparent"}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E0E0D8",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-modal-legend">
              {pieData.map((d, i) => (
                <div
                  key={i}
                  className={`pie-modal-legend-item ${activeSlice?.name === d.name ? "active" : ""} ${activeSlice && activeSlice.name !== d.name ? "dimmed" : ""}`}
                  onClick={() => pickSlice(d)}
                >
                  <span className="pie-modal-dot" style={{ background: pieColors[i % pieColors.length] }} />
                  <span className="pie-modal-name">{d.name}</span>
                  <span className="pie-modal-pct">{d.value}%</span>
                </div>
              ))}
            </div>
            {!activeSlice && (
              <p className="pie-click-hint">Click a slice to drill down</p>
            )}
          </div>
          <div className={`pie-modal-right ${activeSlice && drillData ? "drill-visible" : ""}`}>
            {drillData && (
              <>
                <div className="drill-header">
                  <span
                    className="drill-dot"
                    style={{ background: sliceColor }}
                  />
                  <span className="drill-title">
                    {activeSlice.name} — Breakdown
                  </span>
                  <button
                    className="drill-close"
                    onClick={() => setActiveSlice(null)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M18 6L6 18M6 6l12 12"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
                <ResponsiveContainer width="100%" height="80%">
                  <BarChart
                    data={drillData}
                    layout="vertical"
                    margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#005a56"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: "#b0dbd9", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ fill: "#d8f5f4", fontSize: 13 }}
                      axisLine={false}
                      tickLine={false}
                      width={72}
                    />
                    <Tooltip
                      formatter={(v) => [`${v}%`, "Share"]}
                      contentStyle={{
                        background: "#007a75",
                        border: "1px solid #005a56",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                      cursor={{ fill: "#00c4ba10" }}
                    />
                    <Bar
                      dataKey="value"
                      fill={sliceColor}
                      radius={[0, 4, 4, 0]}
                      name="Share"
                      isAnimationActive
                      animationDuration={600}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className="drill-hint">% share within {activeSlice.name}</p>
              </>
            )}
          </div>
        </div>
      );
    }
    if (effectiveType === "line") {
      // Render line chart from any source data
      const lineData = chart.id === "bar"
        ? chart.data.map((d) => ({ year: d.quarter, otc: d.revenue, comfy: d.target }))
        : chart.id === "pie"
        ? chart.data.map((d, i) => ({ year: d.name, otc: d.value, comfy: null }))
        : chart.data;
      const hasSecondLine = lineData[0]?.comfy != null;
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={lineData}
            margin={{ top: 16, right: 24, bottom: 8, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
            <XAxis dataKey="year" tick={{ fill: "#757575", fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#757575", fontSize: 13 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: 8, fontSize: 13 }}
              formatter={(v, name) => [`₹${v} Cr`, name === "otc" ? "OTC Net" : "Comfy"]}
            />
            <Legend
              wrapperStyle={{ paddingTop: 16, fontSize: 13 }}
              formatter={(value) => value === "otc" ? "OTC Net" : "Comfy"}
            />
            <Line type="monotone" dataKey="otc" stroke={tplColors[0]} strokeWidth={2.5} dot={{ fill: tplColors[0], r: 4 }} name="otc" />
            {hasSecondLine && <Line type="monotone" dataKey="comfy" stroke={tplColors[1]} strokeWidth={2.5} dot={{ fill: tplColors[1], r: 4 }} name="comfy" />}
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Helper: normalize chart data to a common { name, value } format
    const getNormalizedData = () => {
      if (chart.id === "bar") return chart.data.map((d) => ({ name: d.quarter, value: d.revenue, value2: d.target }));
      if (chart.id === "pie") return chart.data.map((d) => ({ name: d.name, value: d.value }));
      if (chart.id === "line") return chart.data.map((d) => ({ name: d.year, value: d.otc, value2: d.comfy }));
      if (Array.isArray(chart.data)) return chart.data.map((d) => ({ name: d.name || d.quarter || d.year || d.label || "Item", value: d.value || d.revenue || d.otc || 0, value2: d.target || d.comfy || null }));
      return [];
    };

    if (effectiveType === "treemap") {
      const data = getNormalizedData();
      const treemapData = [{
        name: chart.title,
        children: data.map((d, i) => ({ name: d.name, size: Math.abs(d.value), fill: tplColors[i % tplColors.length] })),
      }];
      const TreemapContent = ({ x, y, width, height, name, fill }) => {
        if (width < 30 || height < 20) return null;
        return (
          <g>
            <rect x={x} y={y} width={width} height={height} rx={4} fill={fill || tplColors[0]} stroke="#fff" strokeWidth={2} />
            <text x={x + width / 2} y={y + height / 2 - 6} textAnchor="middle" fill="#fff" fontSize={12} fontWeight={600}>{name}</text>
            <text x={x + width / 2} y={y + height / 2 + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={11}>
              {data.find((d) => d.name === name)?.value}
            </text>
          </g>
        );
      };
      return (
        <ResponsiveContainer width="100%" height="100%">
          <Treemap data={treemapData} dataKey="size" nameKey="name" aspectRatio={4 / 3} content={<TreemapContent />}>
            <Tooltip formatter={(v) => [`₹${v} Cr`, "Value"]} contentStyle={{ background: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: 8, fontSize: 13 }} />
          </Treemap>
        </ResponsiveContainer>
      );
    }

    if (effectiveType === "scatter") {
      const data = getNormalizedData();
      const scatterData = data.map((d, i) => ({ x: i + 1, y: d.value, z: d.value2 || d.value, name: d.name }));
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 16, right: 24, bottom: 8, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
            <XAxis dataKey="x" name="Index" tick={{ fill: "#757575", fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="y" name="Value" tick={{ fill: "#757575", fontSize: 13 }} axisLine={false} tickLine={false} />
            <ZAxis dataKey="z" range={[80, 400]} />
            <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: 8, fontSize: 13 }} formatter={(v, name) => [`₹${v} Cr`, name]} />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
            <Scatter name="Data" data={scatterData} fill={tplColors[0]} isAnimationActive animationDuration={500}>
              {scatterData.map((_, i) => <Cell key={i} fill={tplColors[i % tplColors.length]} />)}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    if (effectiveType === "radar") {
      const data = getNormalizedData();
      const radarData = data.map((d) => ({ subject: d.name, A: d.value, B: d.value2 || 0, fullMark: Math.max(...data.map((x) => x.value)) * 1.2 }));
      const hasB = data.some((d) => d.value2 != null);
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="rgba(0,0,0,0.1)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#757575", fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: "#999", fontSize: 11 }} axisLine={false} />
            <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: 8, fontSize: 13 }} />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
            <Radar name="Revenue" dataKey="A" stroke={tplColors[0]} fill={tplColors[0]} fillOpacity={0.35} strokeWidth={2} isAnimationActive animationDuration={500} />
            {hasB && <Radar name="Target" dataKey="B" stroke={tplColors[1]} fill={tplColors[1]} fillOpacity={0.2} strokeWidth={2} isAnimationActive animationDuration={500} />}
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    if (effectiveType === "pyramid") {
      const data = getNormalizedData();
      const pyramidData = data.map((d) => ({
        name: d.name,
        left: -(d.value2 || d.value * 0.9),
        right: d.value,
      }));
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={pyramidData} layout="vertical" stackOffset="sign" margin={{ top: 16, right: 24, bottom: 8, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#757575", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => Math.abs(v)} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#757575", fontSize: 13 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: 8, fontSize: 13 }} formatter={(v) => `₹${Math.abs(v)} Cr`} />
            <Legend wrapperStyle={{ paddingTop: 16, fontSize: 13 }} />
            <ReferenceLine x={0} stroke="#999" />
            <Bar dataKey="left" fill={tplColors[1]} name="Target" radius={[4, 0, 0, 4]} isAnimationActive animationDuration={500} />
            <Bar dataKey="right" fill={tplColors[0]} name="Revenue" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={500} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (effectiveType === "rank") {
      const data = getNormalizedData().sort((a, b) => b.value - a.value);
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 16, right: 24, bottom: 8, left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
            <XAxis type="number" tick={{ fill: "#757575", fontSize: 13 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: "#757575", fontSize: 13 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: 8, fontSize: 13 }} formatter={(v) => [`₹${v} Cr`, "Value"]} />
            <Bar dataKey="value" name="Value" radius={[0, 6, 6, 0]} isAnimationActive animationDuration={500}>
              {data.map((_, i) => <Cell key={i} fill={tplColors[i % tplColors.length]} />)}
              <LabelList dataKey="value" position="right" fill="#757575" fontSize={12} formatter={(v) => `₹${v}`} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (effectiveType === "heatmap") {
      const data = getNormalizedData();
      const maxVal = Math.max(...data.map((d) => d.value));
      const cols = Math.ceil(Math.sqrt(data.length));
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6, width: "100%", maxWidth: 500 }}>
            {data.map((d, i) => {
              const intensity = d.value / maxVal;
              const bg = tplColors[0];
              return (
                <div key={i} style={{
                  background: bg,
                  opacity: 0.25 + intensity * 0.75,
                  borderRadius: 8,
                  padding: "18px 12px",
                  textAlign: "center",
                  color: intensity > 0.5 ? "#fff" : "#333",
                  transition: "all 0.3s",
                  cursor: "default",
                }}
                title={`${d.name}: ₹${d.value} Cr`}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>₹{d.value}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "#999", marginTop: 8 }}>Color intensity = relative value</div>
        </div>
      );
    }

    if (effectiveType === "gauge") {
      const data = getNormalizedData();
      const total = data.reduce((s, d) => s + d.value, 0);
      const avg = total / data.length;
      const maxVal = Math.max(...data.map((d) => d.value));
      const pct = Math.round((avg / maxVal) * 100);
      const gaugeData = [
        { name: "Value", value: pct },
        { name: "Remaining", value: 100 - pct },
      ];
      return (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <ResponsiveContainer width="100%" height="70%">
            <PieChart>
              <Pie
                data={gaugeData}
                cx="50%"
                cy="65%"
                startAngle={180}
                endAngle={0}
                innerRadius="55%"
                outerRadius="85%"
                paddingAngle={0}
                dataKey="value"
                isAnimationActive
                animationDuration={600}
              >
                <Cell fill={tplColors[0]} />
                <Cell fill="#E0E0E0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ marginTop: -40, textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: tplColors[0] }}>{pct}%</div>
            <div style={{ fontSize: 13, color: "#757575" }}>Avg ₹{avg.toFixed(1)} Cr of max ₹{maxVal} Cr</div>
          </div>
        </div>
      );
    }

    if (effectiveType === "funnel") {
      const data = getNormalizedData().sort((a, b) => b.value - a.value);
      const funnelColors = tplColors;
      return (
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip formatter={(v) => [`₹${v} Cr`, "Value"]} contentStyle={{ background: "#FFFFFF", border: "1px solid #E0E0D8", borderRadius: 8, fontSize: 13 }} />
            <Funnel data={data} dataKey="value" nameKey="name" isAnimationActive animationDuration={600} stroke="#fff" strokeWidth={1}>
              {data.map((_, i) => <Cell key={i} fill={funnelColors[i % funnelColors.length]} />)}
              <LabelList dataKey="name" position="center" fill="#fff" stroke="none" fontSize={12} fontWeight={600} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      );
    }

    if (chart.id === "runway") {
      return (
        <div className="runway-modal-layout">
          <div
            className={`runway-modal-chart ${runwayStage >= 1 ? "visible" : ""}`}
          >
            <div className="runway-modal-title-row">
              <span className="runway-modal-title">
                Collections vs demand notes - monthly (₹ Cr)
              </span>
              <span className="runway-modal-chip">Bar + Line</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart
                data={chart.data.collectionsVsDemand}
                margin={{ top: 8, right: 12, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#005a56"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#b0dbd9", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#b0dbd9", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    `₹${value} Cr`,
                    name === "demandNotes"
                      ? "Demand notes raised"
                      : "Collections received",
                  ]}
                  contentStyle={{
                    background: "#007a75",
                    border: "1px solid #005a56",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                  cursor={{ fill: "#00c4ba08" }}
                />
                <Bar
                  dataKey="demandNotes"
                  fill="#00c4ba"
                  radius={[5, 5, 0, 0]}
                  name="demandNotes"
                  isAnimationActive
                  animationDuration={600}
                />
                <Line
                  type="monotone"
                  dataKey="collections"
                  stroke="#E5A800"
                  strokeWidth={2.5}
                  dot={{ fill: "#E5A800", r: 3 }}
                  activeDot={{ r: 5 }}
                  name="collections"
                  isAnimationActive
                  animationDuration={800}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: 12,
                    fontSize: 12,
                    color: "#b0dbd9",
                  }}
                  formatter={(value) =>
                    value === "demandNotes"
                      ? "Demand notes raised"
                      : "Collections received"
                  }
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div
            className={`runway-modal-chart ${runwayStage >= 2 ? "visible" : ""}`}
          >
            <div className="runway-modal-title-row">
              <span className="runway-modal-title">FCF by project (₹ Cr)</span>
              <span className="runway-modal-chip">Vertical bars</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={chart.data.fcfByProject}
                barGap={4}
                barSize={80}
                margin={{ top: 8, right: 12, left: -8, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#005a56"
                  vertical={false}
                />
                <XAxis
                  dataKey="project"
                  tick={{ fill: "#b0dbd9", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-20}
                  textAnchor="end"
                  height={54}
                />
                <YAxis
                  tick={{ fill: "#b0dbd9", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "#007a75",
                    border: "1px solid #005a56",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                  cursor={{ fill: "#00c4ba08" }}
                  formatter={(value) => [`₹${value} Cr`, "FCF"]}
                />
                <ReferenceLine y={0} stroke="#80c0be" strokeDasharray="4 4" />
                <Bar
                  dataKey="fcf"
                  fill="#00c4ba"
                  radius={[5, 5, 0, 0]}
                  name="FCF"
                  isAnimationActive
                  animationDuration={500}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="runway-modal-legend">
              <span>
                <span className="dot" style={{ background: "#00c4ba" }} />
                FCF by project
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (chart.id === "conversion") {
      const conversionData = chart.data.map((item) => ({
        ...item,
        value: Math.min(100, Math.max(0, Number(item.value))),
      }));

      return (
        <div className="runway-modal-layout">
          <div
            className={`runway-modal-chart ${runwayStage >= 1 ? "visible" : ""}`}
          >
            <div className="runway-modal-title-row">
              <span className="runway-modal-title">
                Lead conversion funnel — monthly
              </span>
              <span className="runway-modal-chip">Vertical funnel</span>
            </div>
            <div className="conversion-funnel-layout">
              <div className="conversion-funnel-wrap">
                <ResponsiveContainer width="100%" height={340}>
                  <FunnelChart>
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Conversion"]}
                      contentStyle={{
                        background: "#007a75",
                        border: "1px solid #005a56",
                        borderRadius: 8,
                        fontSize: 13,
                      }}
                    />
                    <Funnel
                      data={conversionData}
                      dataKey="value"
                      nameKey="stage"
                      isAnimationActive
                      animationDuration={700}
                      stroke="#0f1020"
                      strokeWidth={1}
                      lastShapeType="rectangle"
                    >
                      {conversionData.map((entry, index) => (
                        <Cell
                          key={entry.stage}
                          fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]}
                        />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="inside"
                        fill="#f3f3ff"
                        stroke="none"
                        formatter={(value) => `${value}%`}
                      />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </div>

              <div className="funnel-stage-list">
                {conversionData.map((item, index) => {
                  const prev =
                    index === 0 ? item.value : conversionData[index - 1].value;
                  const drop =
                    index === 0 ? 0 : +(prev - item.value).toFixed(1);

                  return (
                    <div key={item.stage} className="funnel-stage-item">
                      <span className="funnel-stage-name">{item.stage}</span>
                      <span className="funnel-stage-value">{item.value}%</span>
                      <span className="funnel-stage-drop">
                        {index === 0 ? "base" : `-${drop} pts`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (chart.id === "cashflow") {
      return (
        <div className="runway-modal-layout">
          <div className="runway-modal-chart visible">
            <div className="runway-modal-title-row">
              <span className="runway-modal-title">AHCL FY 2024-25 Cash Flow Sankey</span>
              <span className="runway-modal-chip">Interactive Sankey</span>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <Sankey
                className="cashflow-sankey"
                data={chart.data}
                nodePadding={18}
                nodeWidth={16}
                margin={{ top: 8, right: 120, bottom: 8, left: 120 }}
                link={<SankeyColoredLink />}
                node={<SankeyNodeWithLabel />}
              >
                <Tooltip
                  formatter={(value, _name, item) => {
                    const nodeName = item?.payload?.name;
                    if (nodeName === "EPS (₹17.58 per share)") {
                      return ["₹17.58 per share", "EPS"];
                    }
                    return [`₹${value} Cr`, "Flow"];
                  }}
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E0E0D8",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#1A1A1A",
                  }}
                  itemStyle={{ color: "#1A1A1A" }}
                  labelStyle={{ color: "#1A1A1A" }}
                />
              </Sankey>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog">
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="#00c4ba"
                strokeWidth="2"
              />
              <path
                d="M3 9h18M9 21V9"
                stroke="#00c4ba"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <h2 className="modal-title">{chart.title}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Color template selector */}
        {["bar", "pie", "line"].includes(chart.id) && (
          <div className="modal-color-templates">
            {COLOR_TEMPLATES.map((tpl, idx) => (
              <button
                key={idx}
                className={`color-template-btn ${colorTemplate === idx ? "active" : ""}`}
                onClick={() => setColorTemplate(idx)}
                title={tpl.name}
              >
                {tpl.colors.slice(0, 4).map((c, ci) => (
                  <span key={ci} className="color-template-dot" style={{ background: c }} />
                ))}
              </button>
            ))}
          </div>
        )}

        {/* Body: chart left, chat right when messages exist */}
        <div className={`modal-body-row ${messages.length > 0 ? "chat-right" : "chat-bottom"}`}>
          {/* Chart area */}
          <div className="modal-chart-area">{chartReady && renderChart()}</div>

          {/* Chat sidebar - visible when any messages exist */}
          {messages.length > 0 && (
            <div className="modal-chat-sidebar">
              <div className="modal-chat-log">
                {messages.map((m, i) => (
                  <div key={i} className={`modal-msg modal-msg-${m.role}`}>
                    {m.role === "ai" && <span className="modal-ai-label">AI</span>}
                    <span className="modal-msg-text">{
                      m.text.split('\n').map((line, j) => {
                        const html = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
                        return <p key={j} dangerouslySetInnerHTML={{ __html: html }} />;
                      })
                    }</span>
                  </div>
                ))}
                {loading && (
                  <div className="modal-msg modal-msg-ai">
                    <span className="modal-ai-label">AI</span>
                    <span className="modal-thinking">
                      <span />
                      <span />
                      <span />
                    </span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}
        </div>

        {/* AI input - always at bottom */}
        <div className="modal-input-area">
          {messages.length === 0 && (
            <div className="modal-suggestions">
              <button className="modal-suggestion-btn" onClick={() => { setInput("What insights can you give me from this chart?"); }}>
                What insights can you give me from this chart?
              </button>
              <button className="modal-suggestion-btn" onClick={() => { setInput("Compare the highest and lowest values"); }}>
                Compare the highest and lowest values
              </button>
            </div>
          )}
          <div className="modal-input-wrapper">
            <div className="modal-input-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="#00c4ba"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              className="modal-input"
              placeholder="Ask AI to modify this chart…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              className={`modal-send ${input.trim() ? "active" : ""}`}
              onClick={send}
              disabled={!input.trim() || loading}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <p className="modal-input-hint">Enter to send · Esc to close</p>
        </div>
      </div>
    </div>
  );
}
