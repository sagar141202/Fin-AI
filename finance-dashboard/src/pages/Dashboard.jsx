import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useTheme } from "../hooks/useTheme"
import { LogOut, LayoutDashboard, ArrowLeftRight, AlertTriangle, Lightbulb, Sun, Moon } from "lucide-react"
import Overview from "./Overview"
import Transactions from "./Transactions"
import Anomalies from "./Anomalies"
import BudgetInsights from "./BudgetInsights"

export default function Dashboard() {
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState("overview")

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, color: "text-sky-400" },
    { id: "transactions", label: "Transactions", icon: ArrowLeftRight, color: "text-green-400" },
    { id: "anomalies", label: "Anomalies", icon: AlertTriangle, color: "text-orange-400" },
    { id: "budget", label: "Budget AI", icon: Lightbulb, color: "text-yellow-400" },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">💰 Fin-AI</h1>
          <p className="text-gray-500 text-xs mt-1">Finance Dashboard</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors w-full text-left
                ${activePage === id
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
            >
              <Icon size={18} className={activePage === id ? color : ""} />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom: Theme toggle + Logout */}
        <div className="p-4 border-t border-gray-800 flex flex-col gap-2">
          {/* Dark/Light Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full"
          >
            {theme === "dark"
              ? <><Sun size={18} className="text-yellow-400" /> Light Mode</>
              : <><Moon size={18} className="text-sky-400" /> Dark Mode</>
            }
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activePage === "overview" && <Overview />}
        {activePage === "transactions" && <Transactions />}
        {activePage === "anomalies" && <Anomalies />}
        {activePage === "budget" && <BudgetInsights />}
      </div>
    </div>
  )
}
