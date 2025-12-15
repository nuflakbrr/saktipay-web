'use client'

import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { DollarSign, ShoppingBag, TrendingUp } from 'lucide-react'
import moment from 'moment'

import { Transaction } from '@/interfaces/transactions'
import { fetchTransactions } from '@/services/transactions'

/* ================= TYPES ================= */
type Period = 'daily' | 'weekly' | 'monthly' | 'yearly'

type SaleItem = {
  productId: string
  productName: string
  quantity: number
  priceAtSale: number
}

type Sale = {
  date: string
  total: number
  profit: number
  items: SaleItem[]
}

/* ================= COMPONENT ================= */
const ReportPage: FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [period, setPeriod] = useState<Period>('daily')

  /* ================= DATE PARSER ================= */
  const parseDate = (value: any): string | null => {
    // Firestore Timestamp
    if (value?.seconds) {
      return moment.unix(value.seconds).toISOString()
    }

    // ISO / Date
    const m = moment(value)
    return m.isValid() ? m.toISOString() : null
  }

  /* ================= ADAPTER ================= */
  const sales: Sale[] = useMemo(() => {
    return transactions
      .map((trx) => {
        const parsedDate = parseDate(trx.created_at)
        if (!parsedDate) return null

        return {
          date: parsedDate,
          total: Number(trx.total) || 0,
          profit: Number(trx.profit) || 0,
          items: trx.items.map((item) => ({
            productId: item.id,
            productName: item.name,
            quantity: Number(item.quantity),
            priceAtSale: Number(item.price),
          })),
        }
      })
      .filter(Boolean) as Sale[]
  }, [transactions])

  /* ================= GROUPING ================= */
  const reportData = useMemo(() => {
    const map = new Map<
      string,
      { revenue: number; profit: number; count: number }
    >()

    sales.forEach((sale) => {
      const m = moment(sale.date)
      if (!m.isValid()) return

      let key = ''
      switch (period) {
        case 'daily':
          key = m.format('DD MMM YYYY')
          break
        case 'weekly':
          key = `Week ${m.week()} ${m.format('YYYY')}`
          break
        case 'monthly':
          key = m.format('MMM YYYY')
          break
        case 'yearly':
          key = m.format('YYYY')
          break
      }

      if (!map.has(key)) {
        map.set(key, { revenue: 0, profit: 0, count: 0 })
      }

      const row = map.get(key)!
      row.revenue += sale.total
      row.profit += sale.profit
      row.count += 1
    })

    return Array.from(map.entries()).map(([name, v]) => ({
      name,
      revenue: v.revenue,
      profit: v.profit,
      count: v.count,
      atv: v.count === 0 ? 0 : v.revenue / v.count,
    }))
  }, [sales, period])

  /* ================= SUMMARY ================= */
  const totalRevenue = reportData.reduce((s, r) => s + r.revenue, 0)
  const totalTransactions = reportData.reduce((s, r) => s + r.count, 0)
  const avgTransactionValue =
    totalTransactions === 0 ? 0 : totalRevenue / totalTransactions

  /* ================= TOP PRODUCTS ================= */
  const topProducts = useMemo(() => {
    const map = new Map<
      string,
      { name: string; qty: number; revenue: number }
    >()

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!map.has(item.productId)) {
          map.set(item.productId, {
            name: item.productName,
            qty: 0,
            revenue: 0,
          })
        }
        const p = map.get(item.productId)!
        p.qty += item.quantity
        p.revenue += item.quantity * item.priceAtSale
      })
    })

    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)
  }, [sales])

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchTransactions().then((data) => {
      if (data) setTransactions(data)
    })
  }, [])

  /* ================= UI ================= */
  return (
    <section className="w-full p-4 md:p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Laporan Penjualan</h2>

        <div className="flex border rounded p-1">
          {(['daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1 rounded capitalize text-sm ${period === p
                ? 'bg-neutral-700 text-white'
                : 'text-gray-500'
                }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OverviewCard title="Total Revenue" value={`Rp ${totalRevenue.toLocaleString()}`} icon={<DollarSign />} />
        <OverviewCard title="Transactions" value={totalTransactions} icon={<ShoppingBag />} />
        <OverviewCard title="Avg. Transaction Value" value={`Rp ${avgTransactionValue.toLocaleString()}`} icon={<TrendingUp />} />
      </div>

      {/* CHART */}
      <div className="p-6 rounded border">
        <h3 className="font-bold mb-4 capitalize">{period} Revenue & Profit</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#4F46E5" />
              <Bar dataKey="profit" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="p-4">Period</th>
              <th className="p-4">Transactions</th>
              <th className="p-4">Revenue</th>
              <th className="p-4">Profit</th>
              <th className="p-4">Avg Value</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, i) => (
              <tr key={i} className="border-t">
                <td className="text-center p-4">{row.name}</td>
                <td className="text-center p-4">{row.count}</td>
                <td className="text-center p-4">Rp {row.revenue.toLocaleString()}</td>
                <td className="text-center p-4 text-green-600">Rp {row.profit.toLocaleString()}</td>
                <td className="text-center p-4">Rp {row.atv.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

/* ================= SMALL COMPONENT ================= */
const OverviewCard = ({
  title,
  value,
  icon,
}: {
  title: string
  value: ReactNode
  icon: ReactNode
}) => (
  <div className="p-6 rounded border flex justify-between">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
    <div className="p-3 rounded-full">{icon}</div>
  </div>
)

export default ReportPage
