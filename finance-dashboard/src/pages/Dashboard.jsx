import { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import Transactions from "./Transactions"
import Anomalies from "./Anomalies"
import BudgetInsights from "./BudgetInsights"
import Overview from "./Overview"
import { LogOut, LayoutDashboard, ArrowLeftRight, AlertTriangle, Lightbulb } from "lucide-react"

export default function Dashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activePage, setActivePage] = useState("overview")

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white">💰 Fin-AI</h1>
          <p className="text-gray-500 text-xs mt-1">Finance Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActivePage("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activePage === "overview"
                ? "bg-sky-500/20 text-sky-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            onClick={() => setActivePage("transactions")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activePage === "transactions"
                ? "bg-sky-500/20 text-sky-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <ArrowLeftRight size={18} />
            Transactions
          </button>

          <button
            onClick={() => setActivePage("anomalies")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activePage === "anomalies"
                ? "bg-orange-500/20 text-orange-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <AlertTriangle size={18} />
            Anomalies
          </button>

          <button
            onClick={() => setActivePage("budget")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activePage === "budget"
                ? "bg-yellow-500/20 text-yellow-400"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            <Lightbulb size={18} />
            Budget AI
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {activePage === "overview" && <Overview />}
        {activePage === "transactions" && <Transactions />}
        {activePage === "anomalies" && <Anomalies />}
        {activePage === "budget" && <BudgetInsights />}
      </div>
    </div>
  )
}
