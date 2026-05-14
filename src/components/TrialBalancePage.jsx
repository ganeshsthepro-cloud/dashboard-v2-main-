import { useState, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
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
import "./TrialBalancePage.css";

/* ── Amrutanjan Trial Balance Data (FY2025) ── */
const TRIAL_BALANCE_DATA = [
  { account: "Cash & Bank",              debit: 4500000,  credit: 0,        type: "Asset" },
  { account: "Accounts Receivable",      debit: 7200000,  credit: 0,        type: "Asset" },
  { account: "Inventory",                debit: 8500000,  credit: 0,        type: "Asset" },
  { account: "Plant & Machinery",        debit: 12000000, credit: 0,        type: "Asset" },
  { account: "Office Equipment",         debit: 3500000,  credit: 0,        type: "Asset" },
  { account: "Prepaid Expenses",         debit: 800000,   credit: 0,        type: "Asset" },
  { account: "Sales Revenue",            debit: 0,        credit: 45182000, type: "Revenue" },
  { account: "Service Income",           debit: 0,        credit: 1200000,  type: "Revenue" },
  { account: "Cost of Goods Sold",       debit: 19800000, credit: 0,        type: "Expense" },
  { account: "Employee Benefit Cost",    debit: 5910000,  credit: 0,        type: "Expense" },
  { account: "Rent Expense",             debit: 1800000,  credit: 0,        type: "Expense" },
  { account: "Depreciation",             debit: 2400000,  credit: 0,        type: "Expense" },
  { account: "Utility Expense",          debit: 650000,   credit: 0,        type: "Expense" },
  { account: "Marketing Expense",        debit: 3200000,  credit: 0,        type: "Expense" },
  { account: "Accounts Payable",         debit: 0,        credit: 5200000,  type: "Liability" },
  { account: "Loans Payable",            debit: 0,        credit: 8000000,  type: "Liability" },
  { account: "Outstanding Expenses",     debit: 0,        credit: 1500000,  type: "Liability" },
  { account: "Owner's Capital",          debit: 0,        credit: 6500000,  type: "Equity" },
  { account: "Retained Earnings",        debit: 0,        credit: 2678000,  type: "Equity" },
];

const totalDebit  = TRIAL_BALANCE_DATA.reduce((s, r) => s + r.debit, 0);
const totalCredit = TRIAL_BALANCE_DATA.reduce((s, r) => s + r.credit, 0);

const TYPE_SUMMARY = ["Asset", "Liability", "Equity", "Revenue", "Expense"].map((type) => ({
  type,
  debit:  TRIAL_BALANCE_DATA.filter((r) => r.type === type).reduce((s, r) => s + r.debit, 0),
  credit: TRIAL_BALANCE_DATA.filter((r) => r.type === type).reduce((s, r) => s + r.credit, 0),
}));

const PIE_DATA = TYPE_SUMMARY.map((t) => ({
  name: t.type,
  value: t.debit + t.credit,
}));

const fmt = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

/* ── AI System Prompt with trial balance training ── */
const TB_SYSTEM_PROMPT = `You are a strict financial and accounting expert assistant for the Amrutanjan Health Care Ltd dashboard — Trial Balance page.

DOMAIN KNOWLEDGE:

1. A trial balance is an accounting report listing all ledger account balances (Debit & Credit columns) at a specific date. Total Debits must equal Total Credits.

2. Debit-side accounts: Assets (Cash, Bank, Receivables, Inventory, Equipment), Expenses (Rent, Salaries, Utilities, Depreciation), Losses, Drawings.

3. Credit-side accounts: Liabilities (Payables, Loans, Outstanding Expenses), Capital/Equity (Capital, Retained Earnings), Revenue/Income (Sales, Service Income), Gains.

4. Three types of trial balance:
   - Unadjusted: Before year-end adjustments.
   - Adjusted: After adjusting entries (accruals, prepayments, depreciation).
   - Post-Closing: After closing temporary accounts; only permanent accounts remain.

5. Errors NOT detected by a trial balance: Error of Omission, Error of Commission, Error of Principle, Compensating Errors, Duplicate Entries.

6. A suspense account is a temporary ledger account used when the trial balance doesn't balance and the error is unidentified.

7. Three golden rules of accounting:
   - Personal accounts: Debit the receiver, Credit the giver.
   - Real accounts: Debit what comes in, Credit what goes out.
   - Nominal accounts: Debit all expenses/losses, Credit all incomes/gains.

8. Trial balance → P&L: Extract nominal accounts (revenue credits, expense debits) to compute Net Profit/Loss.
   Trial balance → Balance Sheet: Remaining permanent accounts (assets, liabilities, equity).

9. After closing entries, temporary accounts are zeroed and transferred to Retained Earnings/Capital. Post-Closing TB has only permanent accounts.

10. Trial balance is NOT legally mandatory (GAAP/IFRS) but is a best practice and auditors request it.

CURRENT DATA (Amrutanjan FY2025):
${JSON.stringify(TRIAL_BALANCE_DATA)}
Total Debits: ₹${totalDebit.toLocaleString("en-IN")}
Total Credits: ₹${totalCredit.toLocaleString("en-IN")}
Balance Status: ${totalDebit === totalCredit ? "Balanced ✓" : "Unbalanced ✗"}

RULES:
- ONLY answer questions related to trial balance, accounting, bookkeeping, financial statements, debit/credit rules, and the data shown above.
- If the user asks anything unrelated (jokes, recipes, coding, personal), reply EXACTLY: "I can only assist with trial balance, accounting, and financial data queries. Please ask me about the data, accounts, or accounting concepts."
- Keep answers concise (2-5 sentences). Be precise with numbers from the data.
- Format monetary values in Indian Rupee notation (₹ with commas).`;

/* ── Suggestions for the chat ── */
const SUGGESTIONS = [
  "What is a trial balance?",
  "Explain debit vs credit side",
  "What errors can't a TB detect?",
  "Prepare a P&L from this data",
  "What are the 3 golden rules?",
  "Explain adjusted trial balance",
];

/* ── Tooltip ── */
const TbTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tb-tooltip">
      {label && <p className="tb-tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#1A1A1A" }}>
          {p.name}: <strong>{fmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

/* ── Report generation prompt ── */
const TB_REPORT_PROMPT = `You are a financial report generator for Amrutanjan Health Care Ltd.
Generate a detailed, professional accounting report based on the user's query.
Use the trial balance data provided. Format the output with clear sections, tables (using markdown), totals, and analysis.

CURRENT DATA (Amrutanjan FY2025):
${JSON.stringify(TRIAL_BALANCE_DATA)}
Total Debits: ₹${totalDebit.toLocaleString("en-IN")}
Total Credits: ₹${totalCredit.toLocaleString("en-IN")}

FORMATTING RULES:
- Use markdown tables for tabular data
- Include section headers with ##
- Add totals and subtotals
- Provide brief analysis/notes at the end
- Keep it professional and audit-ready
- Use Indian Rupee notation (₹ with commas)`;

/* ── Dashboard generation prompt ── */
const TB_DASHBOARD_PROMPT = `You are a data analyst for Amrutanjan Health Care Ltd.
Based on the user's query, return a JSON object that describes dashboard visualizations.
ONLY return valid JSON, no other text.

The JSON must have this structure:
{
  "title": "Dashboard title",
  "kpis": [{"label": "...", "value": "...", "sub": "..."}],
  "charts": [{"type": "bar"|"pie", "title": "...", "data": [{"name": "...", "value": NUMBER}]}],
  "summary": "Brief text summary"
}

CURRENT DATA (Amrutanjan FY2025):
${JSON.stringify(TRIAL_BALANCE_DATA)}
Total Debits: ₹${totalDebit.toLocaleString("en-IN")}
Total Credits: ₹${totalCredit.toLocaleString("en-IN")}

RULES:
- Return ONLY valid JSON (no markdown, no code fences)
- Include 2-4 KPIs relevant to the query
- Include 1-2 charts relevant to the query
- Use Indian Rupee notation in values`;

export default function TrialBalancePage() {
  const { colors, mode } = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("chat"); // "chat" | "report" | "dashboard"
  const [reportContent, setReportContent] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [panelWidth, setPanelWidth] = useState(420);
  const chatEndRef = useRef(null);
  const resizeRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Drag to resize ── */
  const startResize = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = panelWidth;
    const onMove = (ev) => {
      const diff = startX - ev.clientX;
      const newW = Math.min(Math.max(startWidth + diff, 280), 700);
      setPanelWidth(newW);
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setLastQuery(q);
    const newMessages = [...messages, { role: "user", text: q }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const reply = await askAI(newMessages, TB_SYSTEM_PROMPT);
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch (err) {
      console.error("TrialBalance AI error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I couldn't reach the AI service. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const generateReport = async () => {
    const query = lastQuery || "Generate a complete trial balance report";
    setViewMode("report");
    setReportLoading(true);
    setReportContent("");
    try {
      const reply = await askAI(
        [{ role: "user", text: query }],
        TB_REPORT_PROMPT
      );
      setReportContent(reply);
    } catch (err) {
      setReportContent("Failed to generate report. Please try again.");
    }
    setReportLoading(false);
  };

  const generateDashboard = async () => {
    const query = lastQuery || "Show an overview of the trial balance";
    setViewMode("dashboard");
    setDashboardLoading(true);
    setDashboardData(null);
    try {
      const reply = await askAI(
        [{ role: "user", text: query }],
        TB_DASHBOARD_PROMPT
      );
      // Parse JSON from reply
      const cleaned = reply.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setDashboardData(parsed);
    } catch (err) {
      setDashboardData({ error: "Failed to generate dashboard view. Please try again." });
    }
    setDashboardLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const isBalanced = totalDebit === totalCredit;

  /* ── Render report content (basic markdown → JSX) ── */
  const renderReport = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## ")) return <h3 key={i} className="tb-report-h3">{line.slice(3)}</h3>;
      if (line.startsWith("# ")) return <h2 key={i} className="tb-report-h2">{line.slice(2)}</h2>;
      if (line.startsWith("| ")) return <p key={i} className="tb-report-table-line">{line}</p>;
      if (line.startsWith("---") || line.startsWith("|-")) return null;
      if (line.startsWith("- ")) return <p key={i} className="tb-report-bullet">{line}</p>;
      if (line.startsWith("**")) return <p key={i} className="tb-report-bold">{line.replace(/\*\*/g, "")}</p>;
      if (!line.trim()) return <br key={i} />;
      return <p key={i} className="tb-report-line">{line}</p>;
    });
  };

  /* ── Render dashboard view from AI-generated data ── */
  const renderDashboardView = () => {
    if (!dashboardData) return null;
    if (dashboardData.error) return <p className="tb-dash-error">{dashboardData.error}</p>;
    return (
      <div className="tb-dash-content">
        <h3 className="tb-dash-title">{dashboardData.title}</h3>
        {/* KPIs */}
        {dashboardData.kpis && (
          <div className="tb-dash-kpis">
            {dashboardData.kpis.map((kpi, i) => (
              <div key={i} className="tb-dash-kpi" style={{ borderLeft: `4px solid ${colors[i % colors.length]}` }}>
                <p className="tb-dash-kpi-label">{kpi.label}</p>
                <p className="tb-dash-kpi-value">{kpi.value}</p>
                {kpi.sub && <p className="tb-dash-kpi-sub">{kpi.sub}</p>}
              </div>
            ))}
          </div>
        )}
        {/* Charts */}
        {dashboardData.charts && dashboardData.charts.map((chart, ci) => (
          <div key={ci} className="tb-dash-chart-card">
            <p className="tb-card-title">{chart.title}</p>
            {chart.type === "pie" ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chart.data} cx="50%" cy="50%" innerRadius={40} outerRadius={75} dataKey="value" paddingAngle={2}>
                    {chart.data.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => typeof v === "number" ? fmt(v) : v} contentStyle={{ background: mode === "dark" ? "#1e1e1e" : "#fff", border: "1px solid #E0E0D8", borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chart.data} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: mode === "dark" ? "#ccc" : "#555", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: mode === "dark" ? "#ccc" : "#757575", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => typeof v === "number" && v >= 100000 ? `${(v / 100000).toFixed(0)}L` : v} />
                  <Tooltip content={<TbTooltip />} />
                  <Bar dataKey="value" name="Amount" radius={[3, 3, 0, 0]}>
                    {chart.data.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        ))}
        {/* Summary */}
        {dashboardData.summary && (
          <p className="tb-dash-summary">{dashboardData.summary}</p>
        )}
      </div>
    );
  };

  return (
    <div className="tb-page">
      {/* KPI Row */}
      <div className="tb-kpi-row">
        <div className="tb-kpi-card" style={{ borderLeft: `5px solid ${colors[0]}` }}>
          <p className="tb-kpi-label">Total Debits</p>
          <p className="tb-kpi-value">{fmt(totalDebit)}</p>
          <p className="tb-kpi-sub">{TRIAL_BALANCE_DATA.filter((r) => r.debit > 0).length} accounts</p>
        </div>
        <div className="tb-kpi-card" style={{ borderLeft: `5px solid ${colors[1]}` }}>
          <p className="tb-kpi-label">Total Credits</p>
          <p className="tb-kpi-value">{fmt(totalCredit)}</p>
          <p className="tb-kpi-sub">{TRIAL_BALANCE_DATA.filter((r) => r.credit > 0).length} accounts</p>
        </div>
        <div className="tb-kpi-card" style={{ borderLeft: `5px solid ${isBalanced ? colors[1] : colors[2]}` }}>
          <p className="tb-kpi-label">Balance Status</p>
          <p className="tb-kpi-value" style={{ color: isBalanced ? colors[1] : colors[2] }}>
            {isBalanced ? "Balanced ✓" : "Unbalanced ✗"}
          </p>
          <p className="tb-kpi-sub">Debits {isBalanced ? "=" : "≠"} Credits</p>
        </div>
        <div className="tb-kpi-card" style={{ borderLeft: `5px solid ${colors[3]}` }}>
          <p className="tb-kpi-label">Total Accounts</p>
          <p className="tb-kpi-value">{TRIAL_BALANCE_DATA.length}</p>
          <p className="tb-kpi-sub">Ledger entries</p>
        </div>
      </div>

      {/* Main content: Table + Charts | Resizable Panel */}
      <div className="tb-main-split">
        {/* Left: Table + Charts */}
        <div className="tb-left-col">
          <div className="tb-content-row">
            {/* Trial Balance Table */}
            <div className="tb-table-card">
              <p className="tb-card-title">Trial Balance — Amrutanjan Health Care Ltd (FY2025)</p>
              <div className="tb-table-wrap">
                <table className="tb-table">
                  <thead>
                    <tr>
                      <th>Account Name</th>
                      <th>Type</th>
                      <th className="tb-num">Debit (₹)</th>
                      <th className="tb-num">Credit (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TRIAL_BALANCE_DATA.map((row, i) => (
                      <tr key={i}>
                        <td>{row.account}</td>
                        <td>
                          <span className={`tb-type-badge tb-type-${row.type.toLowerCase()}`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="tb-num">{row.debit > 0 ? row.debit.toLocaleString("en-IN") : "—"}</td>
                        <td className="tb-num">{row.credit > 0 ? row.credit.toLocaleString("en-IN") : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="tb-total-row">
                      <td colSpan={2}><strong>Total</strong></td>
                      <td className="tb-num"><strong>{totalDebit.toLocaleString("en-IN")}</strong></td>
                      <td className="tb-num"><strong>{totalCredit.toLocaleString("en-IN")}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Charts row below table */}
          <div className="tb-content-row">
            <div className="tb-chart-card">
              <p className="tb-card-title">Debit vs Credit by Account Type</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={TYPE_SUMMARY} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                  <XAxis dataKey="type" tick={{ fill: mode === "dark" ? "#ccc" : "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: mode === "dark" ? "#ccc" : "#757575", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <Tooltip content={<TbTooltip />} />
                  <Legend />
                  <Bar dataKey="debit" name="Debit" fill={colors[0]} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="credit" name="Credit" fill={colors[1]} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="tb-chart-card">
              <p className="tb-card-title">Account Type Composition</p>
              <div className="tb-pie-row">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                      {PIE_DATA.map((_, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: mode === "dark" ? "#1e1e1e" : "#fff", border: "1px solid #E0E0D8", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="tb-pie-legend">
                  {PIE_DATA.map((d, i) => (
                    <div key={i} className="tb-pie-item">
                      <span className="tb-pie-dot" style={{ background: colors[i % colors.length] }} />
                      <span className="tb-pie-name">{d.name}</span>
                      <span className="tb-pie-val">{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        <div className="tb-resize-handle" onMouseDown={startResize} ref={resizeRef}>
          <div className="tb-resize-grip" />
        </div>

        {/* Right: Chat / Report / Dashboard Panel */}
        <div className="tb-right-panel" style={{ width: panelWidth }}>
          {/* View Mode Tabs */}
          <div className="tb-view-tabs">
            <button
              className={`tb-view-tab${viewMode === "chat" ? " tb-view-tab-active" : ""}`}
              onClick={() => setViewMode("chat")}
            >
              Chat
            </button>
            <button
              className={`tb-view-tab tb-view-tab-report${viewMode === "report" ? " tb-view-tab-active" : ""}`}
              onClick={generateReport}
            >
              Report
            </button>
            <button
              className={`tb-view-tab tb-view-tab-dashboard${viewMode === "dashboard" ? " tb-view-tab-active" : ""}`}
              onClick={generateDashboard}
            >
              Dashboard
            </button>
          </div>
          {lastQuery && <p className="tb-view-query">Query: "{lastQuery}"</p>}

          {/* === CHAT VIEW === */}
          {viewMode === "chat" && (
          <div className="tb-chat-section">
            <div className="tb-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="tb-suggestion-btn" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
            <div className="tb-chat-log">
              {messages.length === 0 && (
                <p className="tb-chat-empty">Ask about trial balance, accounting rules, or this data…</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`tb-chat-msg tb-chat-${m.role}`}>
                  <span className="tb-chat-role">{m.role === "user" ? "You" : "AI"}</span>
                  <span className="tb-chat-text">{m.text}</span>
                </div>
              ))}
              {loading && (
                <div className="tb-chat-msg tb-chat-ai">
                  <span className="tb-chat-role">AI</span>
                  <span className="tb-chat-text tb-loading">Thinking…</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="tb-chat-input-area">
              <input
                className="tb-chat-input"
                placeholder="Ask about trial balance…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
              />
              <button className="tb-chat-send" onClick={() => send()} disabled={loading || !input.trim()}>
                ➤
              </button>
            </div>
          </div>
          )}

          {/* === REPORT VIEW === */}
          {viewMode === "report" && (
            <div className="tb-report-section">
              <div className="tb-report-header">
                <p className="tb-card-title">Generated Report</p>
                {reportContent && (
                  <button className="tb-report-print" onClick={() => window.print()}>
                    Print
                  </button>
                )}
              </div>
              {reportLoading ? (
                <div className="tb-report-loading">
                  <div className="tb-spinner" />
                  <p>Generating…</p>
                </div>
              ) : (
                <div className="tb-report-body">
                  {reportContent ? renderReport(reportContent) : (
                    <p className="tb-chat-empty">Ask a question in Chat first, then click Report.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* === DASHBOARD VIEW === */}
          {viewMode === "dashboard" && (
            <div className="tb-dashboard-section">
              {dashboardLoading ? (
                <div className="tb-report-loading">
                  <div className="tb-spinner" />
                  <p>Building dashboard…</p>
                </div>
              ) : (
                renderDashboardView()
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
