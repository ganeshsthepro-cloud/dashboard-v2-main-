import {
  BarChart,
  Bar,
  AreaChart,
  Area,
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
import "./PeoplePage.css";

const AGE_PROFILE_DATA = [
  { name: "20-29 yrs", value: 14 },
  { name: "30-39 yrs", value: 39 },
  { name: "40-49 yrs", value: 32 },
  { name: "50+ yrs", value: 15 },
];
const AGE_COLORS = ["#F5C200", "#2E7B34", "#1565C0", "#C62828"];

const HRMS_DATA = [
  { system: "ePOD (Proof of...)", pct: 100 },
  { system: "Darwinbox HRMS", pct: 100 },
  { system: "SAP (Transportation)", pct: 100 },
  { system: "SFA - Modern tr...", pct: 100 },
  { system: "DMS (distributio...", pct: 85 },
  { system: "SAP (ERP core)", pct: 75 },
  { system: "SAP Payroll aut...", pct: 45 },
  { system: "AI/ML core team", pct: 30 },
];

const HRMS_COLORS = (pct) => (pct === 100 ? "#2E7B34" : "#F5C200");

const ENGAGEMENT_DATA = [
  { year: "2017", score: 22 },
  { year: "2018", score: 38 },
  { year: "2019", score: 55 },
  { year: "2020", score: 68 },
  { year: "2021", score: 82 },
  { year: "2022", score: 76 },
  { year: "2023", score: 68 },
];

const PpTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="pp-tooltip">
      {label && <p className="pp-tooltip-label">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#1A1A1A" }}>
          {p.name}: <strong>{p.value}{p.name === "Implementation %" ? "%" : ""}</strong>
        </p>
      ))}
    </div>
  );
};

export default function PeoplePage() {
  const { colors } = useTheme();
  return (
    <div className="pp-page">
      {/* Top KPIs */}
      <div className="pp-kpi-row">
        <div className="pp-kpi-card" style={{ borderLeft: `5px solid ${colors[0]}` }}>
          <p className="pp-kpi-label">Total employees</p>
          <p className="pp-kpi-value">631</p>
          <p className="pp-kpi-sub">Down from ~686 FY24 · productivity up 25%</p>
        </div>
        <div className="pp-kpi-card" style={{ borderLeft: `5px solid ${colors[2] || colors[0]}` }}>
          <p className="pp-kpi-label">Employee benefit cost</p>
          <p className="pp-kpi-value" style={{ color: colors[2] || "#C62828" }}>₹59.10 Cr</p>
          <p className="pp-kpi-sub">13.08% of revenue · up from 11.32%</p>
        </div>
        <div className="pp-kpi-card" style={{ borderLeft: `5px solid ${colors[1]}` }}>
          <p className="pp-kpi-label">Revenue per employee</p>
          <p className="pp-kpi-value" style={{ color: colors[1] }}>₹71.6 L</p>
          <p className="pp-kpi-sub">₹451.82 Cr ÷ 631 employees</p>
        </div>
      </div>

      {/* Charts row */}
      <div className="pp-charts-row">
        {/* Workforce age donut */}
        <div className="pp-chart-card">
          <p className="pp-chart-title">Workforce age profile</p>
          <div className="pp-pie-row">
            <ResponsiveContainer width="45%" height={160}>
              <PieChart>
                <Pie
                  data={AGE_PROFILE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={68}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {AGE_PROFILE_DATA.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{
                    background: "#FFFFFF",
                    border: "1px solid #E0E0D8",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#1A1A1A",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pp-pie-legend">
              {AGE_PROFILE_DATA.map((d, i) => (
                <div key={i} className="pp-pie-item">
                  <span
                    className="pp-pie-dot"
                    style={{ background: colors[i % colors.length] }}
                  />
                  <span className="pp-pie-name">{d.name}</span>
                  <span className="pp-pie-pct">{d.value} %</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pp-chart-footer">
            <span className="pp-view-link">⊞ View Details</span>
            <span className="pp-updated">Updated On 08-05-2026</span>
          </div>
        </div>

        {/* HRMS & IT systems */}
        <div className="pp-chart-card">
          <p className="pp-chart-title">HRMS &amp; IT systems</p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={HRMS_DATA}
              layout="vertical"
              margin={{ top: 4, right: 16, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.06)"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: "#757575", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="system"
                tick={{ fill: "#1A1A1A", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={118}
              />
              <Tooltip
                content={<PpTooltip />}
                cursor={{ fill: "rgba(245,194,0,0.08)" }}
              />
              <Bar dataKey="pct" radius={[0, 3, 3, 0]} name="Implementation %">
                {HRMS_DATA.map((d, i) => (
                  <Cell key={i} fill={d.pct === 100 ? colors[1] : colors[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="pp-chart-footer">
            <span className="pp-view-link">⊞ View Details</span>
            <span className="pp-updated">Updated On 08-05-2026</span>
          </div>
        </div>
      </div>

      {/* Employee engagement survey */}
      <div className="pp-chart-card pp-chart-full">
        <p className="pp-chart-title">
          Employee engagement survey scores — over the years
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart
            data={ENGAGEMENT_DATA}
            margin={{ top: 8, right: 8, bottom: 0, left: -10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              tick={{ fill: "#757575", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 90]}
              tick={{ fill: "#757575", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E0E0D8",
                borderRadius: 8,
                fontSize: 12,
                color: "#1A1A1A",
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke={colors[1]}
              fill={`${colors[1]}14`}
              strokeWidth={2}
              name="Engagement Score"
            />
          </AreaChart>
        </ResponsiveContainer>
        <div className="pp-chart-footer">
          <span className="pp-view-link">⊞ View Details</span>
          <span className="pp-updated">Updated On 08-05-2026</span>
        </div>
      </div>

      {/* AI Insight Cards */}
      <div className="pp-agents-row">
        {/* SalesForceWatch */}
        <div className="pp-agent-card">
          <div className="pp-agent-header">
            <div className="pp-agent-title-row">
              <span className="pp-agent-dot pp-dot-green" />
              <span className="pp-agent-name">SalesForceWatch Agent</span>
            </div>
            <span className="pp-agent-badge pp-badge-p2">P2 HRMS-CRM</span>
          </div>
          <h3 className="pp-agent-headline">
            SFA + DMS = real-time CRM foundation
          </h3>
          <div className="pp-agent-tags">
            <span className="pp-tag">SFA live</span>
            <span className="pp-tag">DMS pilot done</span>
            <span className="pp-tag">ePOD live</span>
            <span className="pp-tag">AI/ML forming</span>
          </div>
          <p className="pp-agent-copy">
            The technology stack is being built: SFA for sales rep activity
            tracking, DMS for distributor sell-through visibility, SAP
            transportation for freight optimisation, ePOD for delivery
            confirmation. When DMS goes commercial and SAP Payroll automation is
            live, Amrutanjan will have a fully integrated Finance-CRM-HRMS view
            for the first time.
          </p>
          <button className="pp-agent-btn">Future dashboard design ↗</button>
        </div>

        {/* PlantHRWatch */}
        <div className="pp-agent-card">
          <div className="pp-agent-header">
            <div className="pp-agent-title-row">
              <span className="pp-agent-dot pp-dot-red" />
              <span className="pp-agent-name">PlantHRWatch Agent</span>
            </div>
            <span className="pp-agent-badge pp-badge-p1">P1 HRMS</span>
          </div>
          <h3 className="pp-agent-headline">
            Captive plant needs new workforce in FY26
          </h3>
          <div className="pp-agent-tags">
            <span className="pp-tag">Q4 FY26 launch</span>
            <span className="pp-tag">Hiring required</span>
            <span className="pp-tag pp-tag-risk">Plant readiness risk</span>
          </div>
          <p className="pp-agent-copy">
            Hyderabad captive plant requires production workforce before launch.
            Even with automation, the plant needs QC technicians, shift
            supervisors, maintenance engineers and plant management. Hiring and
            training must begin in Q2 FY26 to be ready for Q4 launch. This is
            the next HRMS action.
          </p>
          <button className="pp-agent-btn">Plant hiring plan ↗</button>
        </div>
      </div>
    </div>
  );
}
