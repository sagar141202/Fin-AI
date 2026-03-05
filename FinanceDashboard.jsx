import { useState, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const monthlyData = [
  { month: "Aug", income: 52000, expense: 34200, savings: 17800 },
  { month: "Sep", income: 52000, expense: 38100, savings: 13900 },
  { month: "Oct", income: 55000, expense: 31500, savings: 23500 },
  { month: "Nov", income: 52000, expense: 41200, savings: 10800 },
  { month: "Dec", income: 68000, expense: 52300, savings: 15700 },
  { month: "Jan", income: 52000, expense: 29800, savings: 22200 },
  { month: "Feb", income: 52000, expense: 33400, savings: 18600 },
  { month: "Mar", income: 57000, expense: 36100, savings: 20900 },
];

const forecastData = [
  { month: "Mar", actual: 36100, predicted: null },
  { month: "Apr", actual: null, predicted: 35200, lower: 31000, upper: 39400 },
  { month: "May", actual: null, predicted: 37800, lower: 33200, upper: 42400 },
  { month: "Jun", actual: null, predicted: 34500, lower: 29800, upper: 39200 },
];

const categoryData = [
  { name: "Housing", value: 12000, color: "#6366f1", budget: 14000 },
  { name: "Food", value: 8400, color: "#f59e0b", budget: 8000 },
  { name: "Transport", value: 4200, color: "#10b981", budget: 5000 },
  { name: "Entertainment", value: 5800, color: "#ef4444", budget: 4000 },
  { name: "Health", value: 2100, color: "#06b6d4", budget: 3000 },
  { name: "Shopping", value: 3600, color: "#8b5cf6", budget: 3500 },
];

const transactions = [
  { id: 1, merchant: "Amazon", category: "Shopping", amount: -2499, date: "Mar 04", anomaly: false, icon: "🛒" },
  { id: 2, merchant: "Salary Credit", category: "Income", amount: 57000, date: "Mar 01", anomaly: false, icon: "💰" },
  { id: 3, merchant: "Swiggy", category: "Food", amount: -1840, date: "Mar 03", anomaly: true, icon: "🍔" },
  { id: 4, merchant: "Uber", category: "Transport", amount: -340, date: "Mar 04", anomaly: false, icon: "🚗" },
  { id: 5, merchant: "Netflix", category: "Entertainment", amount: -649, date: "Mar 03", anomaly: false, icon: "🎬" },
  { id: 6, merchant: "Apollo Pharmacy", category: "Health", amount: -1200, date: "Mar 02", anomaly: false, icon: "💊" },
  { id: 7, merchant: "Unknown Transfer", category: "Transfer", amount: -18000, date: "Mar 02", anomaly: true, icon: "⚠️" },
  { id: 8, merchant: "Zomato", category: "Food", amount: -980, date: "Mar 01", anomaly: false, icon: "🍕" },
];

const aiInsights = [
  { icon: "📈", title: "Savings on track", desc: "You're saving 36% of income this month — above your 30% goal.", type: "good" },
  { icon: "⚠️", title: "Entertainment overspend", desc: "Entertainment is 45% over budget. Consider cutting OTT subscriptions.", type: "warn" },
  { icon: "🤖", title: "AI Forecast", desc: "Predicted spend for April: ₹35,200 — ₹900 less than this month.", type: "info" },
  { icon: "🚨", title: "Anomaly Detected", desc: "Unusual ₹18,000 transfer detected on Mar 02. Please verify.", type: "alert" },
];

// ─── Subcomponents ─────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl p-5 ${className}`} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, color, icon }) => (
  <Card>
    <div className="flex items-start justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: color + "22", color }}>{sub}</span>
    </div>
    <div className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Mono', monospace" }}>{value}</div>
    <div className="text-sm" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
  </Card>
);

const InsightCard = ({ icon, title, desc, type }) => {
  const colors = { good: "#10b981", warn: "#f59e0b", info: "#6366f1", alert: "#ef4444" };
  const c = colors[type];
  return (
    <div className="flex gap-3 p-3 rounded-xl" style={{ background: c + "11", border: `1px solid ${c}33` }}>
      <span className="text-xl mt-0.5">{icon}</span>
      <div>
        <div className="text-sm font-semibold mb-0.5" style={{ color: c, fontFamily: "'DM Sans', sans-serif" }}>{title}</div>
        <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{desc}</div>
      </div>
    </div>
  );
};

const BudgetBar = ({ name, value, budget, color }) => {
  const pct = Math.min((value / budget) * 100, 100);
  const over = value > budget;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <span style={{ color: "rgba(255,255,255,0.7)" }}>{name}</span>
        <span style={{ color: over ? "#ef4444" : "rgba(255,255,255,0.5)" }}>
          ₹{(value / 1000).toFixed(1)}k / ₹{(budget / 1000).toFixed(1)}k
        </span>
      </div>
      <div className="rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: over ? "#ef4444" : color }} />
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl p-3 text-xs" style={{ background: "#0f1117", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="font-semibold mb-2 text-white">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }} className="mb-0.5">
          {p.name}: ₹{Number(p.value).toLocaleString()}
        </div>
      ))}
    </div>
  );
};

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function FinanceDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080b14",
      fontFamily: "'DM Sans', sans-serif",
      color: "white",
      backgroundImage: "radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(16,185,129,0.08) 0%, transparent 60%)"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .tab-btn { transition: all 0.2s ease; }
        .tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "16px 32px" }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #10b981)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💳</div>
          <div>
            <div className="font-bold text-base" style={{ letterSpacing: "-0.02em" }}>FinanceAI</div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Personal Finance Intelligence</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>
            {time.toLocaleTimeString()}
          </div>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>S</div>
        </div>
      </div>

      <div style={{ padding: "0 32px 32px" }}>
        {/* Welcome */}
        <div className="flex items-end justify-between mt-6 mb-6">
          <div>
            <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>March 2026</div>
            <h1 className="text-3xl font-bold" style={{ letterSpacing: "-0.03em" }}>Good morning, Sagar 👋</h1>
            <div className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>2 anomalies detected · AI forecast ready</div>
          </div>
          <div className="flex gap-2">
            {["overview", "transactions", "ai insights"].map(tab => (
              <button key={tab} className="tab-btn text-xs px-4 py-2 rounded-xl capitalize font-medium" onClick={() => setActiveTab(tab)}
                style={{ background: activeTab === tab ? "rgba(99,102,241,0.25)" : "rgba(255,255,255,0.04)", color: activeTab === tab ? "#a5b4fc" : "rgba(255,255,255,0.45)", border: activeTab === tab ? "1px solid rgba(99,102,241,0.4)" : "1px solid transparent" }}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard icon="💰" label="Net Balance" value="₹2,84,500" sub="+12.4%" color="#10b981" />
          <StatCard icon="📥" label="Monthly Income" value="₹57,000" sub="Mar 2026" color="#6366f1" />
          <StatCard icon="📤" label="Monthly Spend" value="₹36,100" sub="-3.2%" color="#f59e0b" />
          <StatCard icon="🎯" label="Savings Rate" value="36.7%" sub="Goal: 30%" color="#06b6d4" />
        </div>

        {/* Main Grid */}
        {(activeTab === "overview" || activeTab === "transactions") && (
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>

            {/* Income vs Expense Chart */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold">Income vs Expenses</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Last 8 months</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="income" fill="#6366f1" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* AI Forecast */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold">🤖 AI Spending Forecast</div>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(99,102,241,0.2)", color: "#a5b4fc" }}>Prophet ML</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={[...monthlyData.slice(-3).map(d => ({ month: d.month, actual: d.expense, predicted: null })), ...forecastData.slice(1)]}>
                  <defs>
                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="actual" stroke="#6366f1" fill="url(#actualGrad)" strokeWidth={2} dot={false} name="Actual" connectNulls />
                  <Area type="monotone" dataKey="predicted" stroke="#10b981" fill="url(#predGrad)" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Predicted" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            {/* Spending by Category */}
            <Card>
              <div className="text-sm font-semibold mb-4">Spending by Category</div>
              <div className="flex gap-4">
                <ResponsiveContainer width="45%" height={160}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 flex flex-col justify-center gap-2">
                  {categoryData.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                        <span style={{ color: "rgba(255,255,255,0.6)" }}>{c.name}</span>
                      </div>
                      <span className="font-medium" style={{ fontFamily: "'Space Mono', monospace" }}>₹{(c.value / 1000).toFixed(1)}k</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Budget Tracker */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold">Budget Tracker</div>
                <div className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>1 over budget</div>
              </div>
              <div>
                {categoryData.map((c, i) => <BudgetBar key={i} {...c} />)}
              </div>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {(activeTab === "overview" || activeTab === "transactions") && (
          <Card className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold">Recent Transactions</div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>⚠️ 2 anomalies</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl" style={{ background: tx.anomaly ? "rgba(239,68,68,0.06)" : "rgba(255,255,255,0.02)", border: tx.anomaly ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{tx.icon}</span>
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">
                        {tx.merchant}
                        {tx.anomaly && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", fontSize: 10 }}>ANOMALY</span>}
                      </div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{tx.category} · {tx.date}</div>
                    </div>
                  </div>
                  <div className="font-bold text-sm" style={{ fontFamily: "'Space Mono', monospace", color: tx.amount > 0 ? "#10b981" : tx.anomaly ? "#ef4444" : "rgba(255,255,255,0.8)" }}>
                    {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* AI Insights Tab */}
        {activeTab === "ai insights" && (
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <Card>
                <div className="text-sm font-semibold mb-4">🤖 AI Insights Engine</div>
                <div className="flex flex-col gap-3">
                  {aiInsights.map((ins, i) => <InsightCard key={i} {...ins} />)}
                </div>
              </Card>
            </div>
            <div>
              <Card>
                <div className="text-sm font-semibold mb-4">📊 3-Month Savings Trend</div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="savings" stroke="#10b981" fill="url(#savingsGrad)" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} name="Savings" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
              <Card className="mt-4">
                <div className="text-sm font-semibold mb-3">🎯 Financial Health Score</div>
                <div className="flex items-center gap-4">
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "conic-gradient(#10b981 0% 74%, rgba(255,255,255,0.08) 74% 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#080b14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, fontFamily: "'Space Mono', monospace", color: "#10b981" }}>74</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1" style={{ color: "#10b981" }}>Good Standing</div>
                    <div className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                      Savings rate is excellent. Reduce entertainment spend to reach 80+.
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
