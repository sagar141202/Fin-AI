import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useTheme } from "../hooks/useTheme"
import { LogOut, LayoutDashboard, ArrowLeftRight, AlertTriangle, Lightbulb, Sun, Moon, Menu, X } from "lucide-react"
import Overview from "./Overview"
import Transactions from "./Transactions"
import Anomalies from "./Anomalies"
import BudgetInsights from "./BudgetInsights"

export default function Dashboard() {
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navItems = [
    { id: "overview",      label: "Overview",      icon: LayoutDashboard, color: "text-sky-400" },
    { id: "transactions",  label: "Transactions",  icon: ArrowLeftRight,  color: "text-green-400" },
    { id: "anomalies",     label: "Anomalies",     icon: AlertTriangle,   color: "text-orange-400" },
    { id: "budget",        label: "Budget AI",     icon: Lightbulb,       color: "text-yellow-400" },
  ]

  const handleNav = (id) => {
    setActivePage(id)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* ── Desktop Sidebar ───────────────────────────── */}
      <div className="hidden md:flex w-64 bg-gray-900 border-r border-gray-800 flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">💰 Fin-AI</h1>
          <p className="text-gray-500 text-xs mt-1">Finance Dashboard</p>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left
                ${activePage === id ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
            >
              <Icon size={18} className={activePage === id ? color : ""} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 flex flex-col gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            {theme === "dark"
              ? <><Sun size={18} className="text-yellow-400" /><span>Light Mode</span></>
              : <><Moon size={18} className="text-sky-400" /><span>Dark Mode</span></>
            }
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer Overlay ─────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile Drawer ─────────────────────────────── */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 flex flex-col transform transition-transform duration-300 md:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">💰 Fin-AI</h1>
            <p className="text-gray-500 text-xs mt-1">Finance Dashboard</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left
                ${activePage === id ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
            >
              <Icon size={18} className={activePage === id ? color : ""} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 flex flex-col gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            {theme === "dark"
              ? <><Sun size={18} className="text-yellow-400" /><span>Light Mode</span></>
              : <><Moon size={18} className="text-sky-400" /><span>Dark Mode</span></>
            }
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu size={22} />
          </button>
          <h1 className="text-white font-bold text-lg">💰 Fin-AI</h1>
          <button onClick={toggleTheme} className="text-gray-400 hover:text-white">
            {theme === "dark" ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-sky-400" />}
          </button>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto pb-20 md:pb-0">
          {activePage === "overview"     && <Overview />}
          {activePage === "transactions" && <Transactions />}
          {activePage === "anomalies"    && <Anomalies />}
          {activePage === "budget"       && <BudgetInsights />}
        </div>

        {/* ── Mobile Bottom Nav ──────────────────────── */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-30">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors flex-1
                  ${activePage === id ? "bg-gray-800" : ""}`}
              >
                <Icon size={20} className={activePage === id ? color : "text-gray-500"} />
                <span className={`text-xs font-medium ${activePage === id ? "text-white" : "text-gray-500"}`}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
