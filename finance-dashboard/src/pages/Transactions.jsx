import { useState, useEffect, useCallback } from "react"
import { getTransactions, deleteTransaction } from "../api/transactions"
import { Search, Trash2, Plus, ArrowUp, ArrowDown, AlertTriangle } from "lucide-react"
import AddTransactionModal from "../components/ui/AddTransactionModal"

const CATEGORIES = ["Food", "Transport", "Housing", "Entertainment", "Shopping", "Health", "Education", "Utilities", "Salary", "Freelance", "Investment", "Other"]

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState("")
  const [sortField, setSortField] = useState("date")
  const [sortDir, setSortDir] = useState("desc")
  const [showModal, setShowModal] = useState(false)
  const perPage = 15

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: perPage }
      if (search) params.search = search
      if (category) params.category = category
      if (type) params.type = type
      const data = await getTransactions(params)
      setTransactions(data.transactions)
      setTotal(data.total)
    } catch (err) {
      console.error("Failed to fetch transactions", err)
    } finally {
      setLoading(false)
    }
  }, [page, search, category, type])

  useEffect(() => {
    const timer = setTimeout(fetchTransactions, 300)
    return () => clearTimeout(timer)
  }, [fetchTransactions])

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return
    await deleteTransaction(id)
    fetchTransactions()
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDir("desc")
    }
  }

  const sorted = [...transactions].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]
    if (sortField === "date") { valA = new Date(valA); valB = new Date(valB) }
    if (sortField === "amount") { valA = Number(valA); valB = Number(valB) }
    if (valA < valB) return sortDir === "asc" ? -1 : 1
    if (valA > valB) return sortDir === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(total / perPage)

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-gray-600 ml-1">↕</span>
    return sortDir === "asc"
      ? <ArrowUp size={12} className="inline ml-1 text-sky-400" />
      : <ArrowDown size={12} className="inline ml-1 text-sky-400" />
  }

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric"
  })

 const formatAmount = (amount, type) =>
  `${type === "income" ? "+" : "-"}₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Modal */}
      {showModal && (
        <AddTransactionModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchTransactions(); setShowModal(false) }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-gray-400 text-sm mt-1">{total} total transactions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search merchant, description..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500 text-sm"
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1) }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 text-sm"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={type}
          onChange={e => { setType(e.target.value); setPage(1) }}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 text-sm"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        {(search || category || type) && (
          <button
            onClick={() => { setSearch(""); setCategory(""); setType(""); setPage(1) }}
            className="text-gray-400 hover:text-white text-sm px-3 py-2 border border-gray-700 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th onClick={() => handleSort("date")} className="text-left px-6 py-4 text-gray-400 text-sm font-medium cursor-pointer hover:text-white">
                  Date <SortIcon field="date" />
                </th>
                <th className="text-left px-6 py-4 text-gray-400 text-sm font-medium">Merchant</th>
                <th onClick={() => handleSort("category")} className="text-left px-6 py-4 text-gray-400 text-sm font-medium cursor-pointer hover:text-white">
                  Category <SortIcon field="category" />
                </th>
                <th onClick={() => handleSort("amount")} className="text-right px-6 py-4 text-gray-400 text-sm font-medium cursor-pointer hover:text-white">
                  Amount <SortIcon field="amount" />
                </th>
                <th className="text-center px-6 py-4 text-gray-400 text-sm font-medium">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">Loading transactions...</td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-500">No transactions found</td></tr>
              ) : (
                sorted.map(tx => (
                  <tr key={tx.id} className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${tx.is_anomaly ? "bg-orange-500/5" : ""}`}>
                    <td className="px-6 py-4 text-gray-300 text-sm">{formatDate(tx.date)}</td>
                    <td className="px-6 py-4">
                      <div className="text-white text-sm font-medium">{tx.merchant || "—"}</div>
                      {tx.description && <div className="text-gray-500 text-xs mt-0.5">{tx.description}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">{tx.category}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-semibold text-sm ${tx.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                      {formatAmount(tx.amount, tx.type)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tx.is_anomaly ? (
                        <span className="flex items-center justify-center gap-1 text-orange-400 text-xs">
                          <AlertTriangle size={12} /> Anomaly
                        </span>
                      ) : (
                        <span className="text-gray-600 text-xs">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleDelete(tx.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm">Page {page} of {totalPages} — {total} transactions</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 bg-gray-800 text-gray-300 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-700 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
