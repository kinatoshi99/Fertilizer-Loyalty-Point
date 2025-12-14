"use client";

// App.tsx — Drop-in single file
// + create-customer
// + advanced search (name/phone/address/house no.)
// + Buy Product form on Customer Dashboard (brand, N-P-K, prices)
// + Save purchase => update Purchase History immediately

import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import UltraAiTodo from "./components/UltraAiTodo";

// ----------------------
// Types
// ----------------------
interface Customer {
  id: string
  name: string
  points: number
  email: string
  phone: string
  address?: string
  crops?: string[]
  rai?: number
}

interface Reward {
  id: string
  name: string
  pointsCost: number
  description: string
}

interface PurchaseHistory {
  id: string
  customerId: string
  date: string // YYYY-MM-DD
  time: string // HH:mm (24h)
  fertilizerType: string
  amount: number // kg
  totalPrice: number // THB
}

interface RedeemResult {
  success: boolean
  message?: string
}

type RedeemFn = (customerId: string, rewardId: string) => RedeemResult

interface BuyPayload {
  brand: string
  n: number
  p: number
  k: number
  pricePerBag?: number | null
  pricePerTon?: number | null
  bags?: number | null
}

// ----------------------
// Constants
// ----------------------
const CROPS = [
  'ข้าว',
  'อ้อย',
  'มันสำปะหลัง',
  'ข้าวโพด',
  'ผักต่างๆ',
  'ทุเรียน',
  'ยางพารา',
  'ปาล์ม',
]

const BRAND_SUGGESTIONS = ['Yara', 'ICL', 'ตรากระต่าย', 'ตราม้าบิน', 'ตราช้าง', 'ตราใบไม้']

// ----------------------
// Initial Data
// ----------------------
const PURCHASE_HISTORY_INITIAL: PurchaseHistory[] = [
  { id: 'p1', customerId: '1', date: '2025-10-20', time: '10:30', fertilizerType: 'Nitrogen (N)', amount: 50, totalPrice: 2500 },
  { id: 'p2', customerId: '1', date: '2025-10-15', time: '14:20', fertilizerType: 'Phosphorus (P)', amount: 30, totalPrice: 1800 },
  { id: 'p3', customerId: '1', date: '2025-10-10', time: '09:15', fertilizerType: 'Potassium (K)', amount: 40, totalPrice: 2200 },
  { id: 'p4', customerId: '1', date: '2025-10-05', time: '16:45', fertilizerType: 'NPK Mixed', amount: 60, totalPrice: 3600 },
  { id: 'p5', customerId: '1', date: '2025-09-28', time: '11:30', fertilizerType: 'Nitrogen (N)', amount: 45, totalPrice: 2250 },
  { id: 'p6', customerId: '2', date: '2025-10-22', time: '13:00', fertilizerType: 'Organic Compost', amount: 100, totalPrice: 4000 },
  { id: 'p7', customerId: '2', date: '2025-10-18', time: '10:00', fertilizerType: 'NPK Mixed', amount: 80, totalPrice: 4800 },
  { id: 'p8', customerId: '2', date: '2025-10-12', time: '15:30', fertilizerType: 'Phosphorus (P)', amount: 35, totalPrice: 2100 },
  { id: 'p9', customerId: '3', date: '2025-10-25', time: '09:45', fertilizerType: 'Potassium (K)', amount: 25, totalPrice: 1375 },
  { id: 'p10', customerId: '3', date: '2025-10-20', time: '14:15', fertilizerType: 'Nitrogen (N)', amount: 30, totalPrice: 1500 },
  { id: 'p11', customerId: '4', date: '2025-10-24', time: '11:20', fertilizerType: 'Organic Compost', amount: 120, totalPrice: 4800 },
  { id: 'p12', customerId: '4', date: '2025-10-19', time: '16:00', fertilizerType: 'NPK Mixed', amount: 90, totalPrice: 5400 },
  { id: 'p13', customerId: '4', date: '2025-10-14', time: '10:30', fertilizerType: 'Phosphorus (P)', amount: 40, totalPrice: 2400 },
]

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899']

// ----------------------
// Utils
// ----------------------
function parseLocalDateTime(date: string, time: string): number {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const dt = new Date(y, m - 1, d, hh, mm, 0)
  return dt.getTime()
}

// Normalize Thai digits (๐-๙) to Arabic digits (0-9)
function toArabicDigits(input: string): string {
  const th = '๐๑๒๓๔๕๖๗๘๙'
  const map: Record<string, string> = {}
  for (let i = 0; i < th.length; i++) map[th[i]] = String(i)
  return input.replace(/[๐-๙]/g, (d) => map[d])
}

// Parse numeric string to number (Thai digits safe)
function toNumber(val: string): number | null {
  const n = Number(toArabicDigits(val).replace(/[^0-9.\-]/g, ''))
  return isNaN(n) ? null : n
}

// Format date/time now to our model
function nowDateTime(): { date: string; time: string } {
  const now = new Date()
  const pad = (x: number) => String(x).padStart(2, '0')
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`
  return { date, time }
}

// ----------------------
// Modal (headless)
// ----------------------
function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        {title && <h3 className="mb-4 text-lg font-bold text-slate-900">{title}</h3>}
        {children}
      </div>
    </div>
  )
}

// ----------------------
// Tag (toggle) component
// ----------------------
function Tag({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-full border px-3 py-1 text-sm transition ${
        selected ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )
}

// ----------------------
// Create Customer Form
// ----------------------
function CreateCustomerForm({ onSubmit, onCancel }: { onSubmit: (payload: { name: string; address: string; phone: string; crops: string[]; rai: number }) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [crops, setCrops] = useState<string[]>([])
  const [rai, setRai] = useState<string>('')
  const [error, setError] = useState<string>('')

  const toggleCrop = (c: string) => {
    setCrops((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
  }

  const handleSubmit = () => {
    setError('')
    const digits = toArabicDigits(phone).replace(/\D/g, '')
    const raiNum = Number(rai)
    if (!name.trim()) return setError('กรุณากรอก ชื่อ-สกุล')
    if (digits.length < 9) return setError('กรุณากรอก เบอร์โทรศัพท์ ให้ถูกต้อง')
    if (!rai || isNaN(raiNum) || raiNum < 0) return setError('กรุณากรอก จำนวนไร่ ให้ถูกต้อง')

    onSubmit({ name: name.trim(), address: address.trim(), phone: digits, crops, rai: raiNum })
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">ชื่อ-สกุล</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">ที่อยู่</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">เบอร์โทรศัพท์</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">พืชที่ปลูก (เลือกได้หลายรายการ)</label>
        <div className="flex flex-wrap gap-2">
          {CROPS.map((c) => (
            <Tag key={c} label={c} selected={crops.includes(c)} onToggle={() => toggleCrop(c)} />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">จำนวนไร่</label>
        <div className="flex items-center gap-2">
          <input value={rai} onChange={(e) => setRai(e.target.value)} type="number" min={0} step={0.1} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
          <span className="text-slate-500">ไร่</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300">ยกเลิก</button>
        <button onClick={handleSubmit} className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700">บันทึก</button>
      </div>
    </div>
  )
}

// ----------------------
// Buy Product Form (สำหรับปุ่ม "ซื้อสินค้า")
// ----------------------
function BuyProductForm({ onClose, onSave }: { onClose: () => void; onSave: (payload: BuyPayload) => void }) {
  const [brand, setBrand] = useState('')
  const [n, setN] = useState('')
  const [p, setP] = useState('')
  const [k, setK] = useState('')
  const [bags, setBags] = useState<string>('1')
  const [perBag, setPerBag] = useState('')
  const [perTon, setPerTon] = useState('')
  const [error, setError] = useState('')

  const onChangeBagPrice = (val: string) => {
    setPerBag(val)
    const n = toNumber(val)
    if (n != null) setPerTon(String(n * 20))
  }
  const onChangeTonPrice = (val: string) => {
    setPerTon(val)
    const n = toNumber(val)
    if (n != null) setPerBag(String(n / 20))
  }

  const handleSave = () => {
    setError('')
    if (!brand.trim()) return setError('กรุณาระบุยี่ห้อปุ๋ย')
    const nN = toNumber(n) ?? 0
    const nP = toNumber(p) ?? 0
    const nK = toNumber(k) ?? 0
    if (nN < 0 || nP < 0 || nK < 0) return setError('ค่าสูตร N-P-K ต้องไม่ติดลบ')
    if (!perBag && !perTon) return setError('กรุณาระบุราคาอย่างน้อย 1 ช่อง')

    const payload: BuyPayload = {
      brand: brand.trim(),
      n: nN,
      p: nP,
      k: nK,
      pricePerBag: toNumber(perBag),
      pricePerTon: toNumber(perTon),
      bags: toNumber(bags) ?? 1,
    }
    onSave(payload)
    onClose()
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">ยี่ห้อปุ๋ย</label>
        <input
          list="brandOptions"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          placeholder="เช่น ตรากระต่าย, Yara, ICL, ตราม้าบิน"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <datalist id="brandOptions">
          {BRAND_SUGGESTIONS.map((b) => (
            <option key={b} value={b} />
          ))}
        </datalist>
        <div className="mt-2 flex flex-wrap gap-2">
          {BRAND_SUGGESTIONS.map((b) => (
            <button key={b} type="button" onClick={() => setBrand(b)} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-600 hover:bg-slate-50">
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">สูตรปุ๋ย N-P-K</label>
        <div className="grid grid-cols-3 gap-2">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-2 text-xs text-slate-500">N</span>
            <input value={n} onChange={(e) => setN(e.target.value)} inputMode="decimal" className="w-full rounded-lg border border-slate-300 px-6 py-2 text-right focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-2 text-xs text-slate-500">P</span>
            <input value={p} onChange={(e) => setP(e.target.value)} inputMode="decimal" className="w-full rounded-lg border border-slate-300 px-6 py-2 text-right focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-2 text-xs text-slate-500">K</span>
            <input value={k} onChange={(e) => setK(e.target.value)} inputMode="decimal" className="w-full rounded-lg border border-slate-300 px-6 py-2 text-right focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
        {(n || p || k) && (
          <p className="mt-1 text-xs text-slate-500">สูตร: {(toNumber(n) ?? 0)} - {(toNumber(p) ?? 0)} - {(toNumber(k) ?? 0)}</p>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ราคาต่อหน่วย : กระสอบ</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">฿</span>
            <input value={perBag} onChange={(e) => onChangeBagPrice(e.target.value)} inputMode="decimal" placeholder="เช่น 650" className="w-full rounded-lg border border-slate-300 bg-white px-6 py-2 text-right focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          {toNumber(perBag) != null && (
            <p className="mt-1 text-xs text-slate-500">≈ {toNumber(perBag)!.toLocaleString('th-TH')} บาท/กระสอบ</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">ราคาต่อตัน (20 กระสอบ)</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">฿</span>
            <input value={perTon} onChange={(e) => onChangeTonPrice(e.target.value)} inputMode="decimal" placeholder="คำนวณอัตโนมัติจาก/กระสอบ" className="w-full rounded-lg border border-slate-300 bg-white px-6 py-2 text-right focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          {toNumber(perTon) != null && (
            <p className="mt-1 text-xs text-slate-500">≈ {toNumber(perTon)!.toLocaleString('th-TH')} บาท/ตัน</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">จำนวน (กระสอบ)</label>
        <input value={bags} onChange={(e) => setBags(e.target.value)} type="number" min={1} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500" />
        <p className="mt-1 text-xs text-slate-500">ระบบถือว่า 1 กระสอบ = 50 กก.</p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300">ยกเลิก</button>
        <button onClick={handleSave} className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white hover:bg-purple-700">บันทึก</button>
      </div>
    </div>
  )
}

// ----------------------
// Customer Dashboard (rendered for a selected customer)
// ----------------------
function CustomerDashboard({ customer, onBack, purchases, onAddPurchase }: { customer: Customer; onBack: () => void; purchases: PurchaseHistory[]; onAddPurchase: (customerId: string, payload: BuyPayload) => void }) {
  const [showBuy, setShowBuy] = useState(false)
  const customerPurchases = useMemo(() => purchases.filter((p) => p.customerId === customer.id), [purchases, customer.id])

  const pieChartData = useMemo(() => {
    const fertilizerTotals: Record<string, number> = {}
    customerPurchases.forEach((purchase) => {
      fertilizerTotals[purchase.fertilizerType] = (fertilizerTotals[purchase.fertilizerType] || 0) + purchase.totalPrice
    })
    return Object.entries(fertilizerTotals).map(([name, value]) => ({ name, value }))
  }, [customerPurchases])

  const totalSpent = useMemo(() => customerPurchases.reduce((sum, p) => sum + p.totalPrice, 0), [customerPurchases])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 p-6">
      <div className="mx-auto max-w-6xl">
        <button onClick={onBack} className="mb-4 flex items-center font-medium text-purple-600 hover:text-purple-700">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Customers
        </button>

        <div className="mb-6 rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold text-slate-800">{customer.name}</h1>
              <p className="text-slate-600">{customer.email || '—'}</p>
              <p className="text-slate-600">{customer.phone}</p>
              {customer.address && <p className="text-slate-500">{customer.address}</p>}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3">
              <div className="rounded-xl bg-purple-600 px-6 py-3 text-center text-white">
                <p className="text-sm opacity-90">Points Balance</p>
                <p className="text-3xl font-bold">{customer.points}</p>
              </div>
              <button onClick={() => setShowBuy(true)} className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white shadow-sm transition hover:bg-purple-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.293 2.586A1 1 0 006.618 17H19m-6 4a1 1 0 100-2 1 1 0 000 2zm-7 0a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                ซื้อสินค้า
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Purchases</p>
                <p className="text-2xl font-bold text-slate-800">{customerPurchases.length}</p>
              </div>
              <div className="rounded-lg bg-purple-100 p-3">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Spent</p>
                <p className="text-2xl font-bold text-slate-800">฿{totalSpent.toLocaleString('th-TH')}</p>
              </div>
              <div className="rounded-lg bg-green-100 p-3">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-slate-800">
                  ฿{customerPurchases.length > 0 ? Math.round(totalSpent / customerPurchases.length).toLocaleString('th-TH') : 0}
                </p>
              </div>
              <div className="rounded-lg bg-orange-100 p-3">
                <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-slate-800">Purchase Distribution by Fertilizer Type</h2>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `฿${Number(value).toLocaleString('th-TH')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-12 text-center text-slate-500">No purchase data available</p>
            )}
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-slate-800">Purchase History</h2>
            <div className="max-h-[400px] space-y-3 overflow-y-auto">
              {customerPurchases.length > 0 ? (
                [...customerPurchases]
                  .sort((a, b) => parseLocalDateTime(b.date, b.time) - parseLocalDateTime(a.date, a.time))
                  .map((purchase) => (
                    <div key={purchase.id} className="rounded-xl border border-slate-200 bg-gradient-to-r from-purple-50 to-green-50 p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800">{purchase.fertilizerType}</h3>
                          <p className="text-sm text-slate-600">Amount: {purchase.amount} kg</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">฿{purchase.totalPrice.toLocaleString('th-TH')}</p>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>📅 {new Date(purchase.date).toLocaleDateString('th-TH')}</span>
                        <span>🕐 {purchase.time}</span>
                      </div>
                    </div>
                  ))
              ) : (
                <p className="py-8 text-center text-slate-500">No purchase history</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Buy Product Modal */}
      <Modal open={showBuy} onClose={() => setShowBuy(false)} title="ซื้อสินค้า">
        <BuyProductForm
          onClose={() => setShowBuy(false)}
          onSave={(payload) => onAddPurchase(customer.id, payload)}
        />
      </Modal>
    </div>
  )
}

// ----------------------
// Redeem Reward Form
// ----------------------
interface RedeemRewardFormProps {
  customers: Customer[]
  reward: Reward
  onRedeem: RedeemFn
  onClose: () => void
}

function RedeemRewardForm({ customers, reward, onRedeem, onClose }: RedeemRewardFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [error, setError] = useState<string>('')

  const sortedCustomers = useMemo(() => [...customers].sort((a, b) => b.points - a.points), [customers])
  const selectedCustomer = useMemo(() => customers.find((c) => c.id === selectedCustomerId), [customers, selectedCustomerId])
  const hasEnoughPoints = selectedCustomer ? selectedCustomer.points >= reward.pointsCost : false

  const handleSubmit = () => {
    setError('')
    if (!selectedCustomerId) return setError('Please select a customer')
    if (!hasEnoughPoints) return setError('Selected customer does not have enough points')
    const result = onRedeem(selectedCustomerId, reward.id)
    if (result.success) onClose()
    else setError(result.message || 'Failed to redeem reward')
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-700">
        Redeeming <span className="font-semibold text-purple-600">{reward.name}</span> for {reward.pointsCost} points.
      </p>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="customer" className="mb-1 block text-sm font-medium text-slate-700">
          Select Customer
        </label>
        <select
          id="customer"
          value={selectedCustomerId}
          onChange={(e) => {
            setSelectedCustomerId(e.target.value)
            setError('')
          }}
          className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">-- Select a customer --</option>
          {sortedCustomers.map((c) => (
            <option key={c.id} value={c.id} disabled={c.points < reward.pointsCost}>
              {c.name} ({c.points} points){c.points < reward.pointsCost ? ' - Insufficient points' : ''}
            </option>
          ))}
        </select>
        {selectedCustomerId && !hasEnoughPoints && (
          <p className="mt-1 text-sm text-red-500">
            This customer does not have enough points. Need {reward.pointsCost - (selectedCustomer?.points || 0)} more points.
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose} className="rounded-lg bg-slate-200 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-300">
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedCustomerId || !hasEnoughPoints}
          className="rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Redeem
        </button>
      </div>
    </div>
  )
}

// ----------------------
// Bottom Nav
// ----------------------
function BottomNav({
  active,
  onHome,
  onRewards,
  onProfile,
}: {
  active: 'home' | 'rewards' | 'profile'
  onHome: () => void
  onRewards: () => void
  onProfile: () => void
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white shadow-lg">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-around px-4">
        <button onClick={onHome} className={`flex flex-1 flex-col items-center justify-center transition ${active === 'home' ? 'text-purple-600' : 'text-slate-400'}`}>
          <svg className="mb-1 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-medium">Home</span>
        </button>

        <button onClick={onRewards} className={`flex flex-1 flex-col items-center justify-center transition ${active === 'rewards' ? 'text-green-600' : 'text-slate-400'}`}>
          <svg className="mb-1 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <span className="text-xs font-medium">Rewards</span>
        </button>

        <button onClick={onProfile} className={`flex flex-1 flex-col items-center justify-center transition ${active === 'profile' ? 'text-purple-600' : 'text-slate-400'}`}>
          <svg className="mb-1 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs font-medium">Profile</span>
        </button>
      </div>
    </div>
  )
}

// ----------------------
// Main App (drop-in)
// ----------------------
export default function App() {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: 'John Smith', points: 1500, email: 'john@farm.com', phone: '081-234-5678', address: '123/4 หมู่ 5 ต.เขาใหญ่ อ.เมือง' },
    { id: '2', name: 'Sarah Johnson', points: 2300, email: 'sarah@garden.com', phone: '082-345-6789', address: '88 หมู่บ้านสวนทอง ซ.3' },
    { id: '3', name: 'Mike Williams', points: 850, email: 'mike@agro.com', phone: '083-456-7890' },
    { id: '4', name: 'Emily Brown', points: 3200, email: 'emily@crops.com', phone: '084-567-8901', address: '55/12 ถ.สุขาภิบาล 2' },
  ])

  const [rewards] = useState<Reward[]>([
    { id: 'r1', name: '10% Discount Coupon', pointsCost: 500, description: 'Save 10% on your next purchase' },
    { id: 'r2', name: 'Free Soil Test Kit', pointsCost: 1000, description: 'Professional soil analysis kit' },
    { id: 'r3', name: 'Premium Fertilizer Bag', pointsCost: 1500, description: '50lb bag of premium fertilizer' },
    { id: 'r4', name: 'Consultation Session', pointsCost: 2000, description: '1-hour expert consultation' },
  ])

  // ✅ Inventory (Thai labels per requirement)
  const [rewardInventory] = useState<{ id: string; name: string; stock: number }[]>([
    { id: 'i1', name: 'กระเป๋าย่าม', stock: 24 },
    { id: 'i2', name: 'ส่วนลด 100 บาท', stock: 50 },
    { id: 'i3', name: 'เสื้อยืดแขนยาว', stock: 18 },
    { id: 'i4', name: 'เสื้อลายสก็อต', stock: 12 },
    { id: 'i5', name: 'กระติกน้ำ', stock: 30 },
    { id: 'i6', name: 'ปุ๋ยขนาดทดลอง 500 กรัม', stock: 80 },
  ])

  // ✅ Purchase history state (so it updates immediately)
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>(PURCHASE_HISTORY_INITIAL)

  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState<'home' | 'rewards' | 'profile'>('home')
  const [currentView, setCurrentView] = useState<'main' | 'rewardsOnly' | 'profile'>('main')
  const [showCreate, setShowCreate] = useState(false)

  const handleRedeem: RedeemFn = (customerId, rewardId) => {
    const customer = customers.find((c) => c.id === customerId)
    const reward = rewards.find((r) => r.id === rewardId)
    if (!customer || !reward) return { success: false, message: 'Invalid customer or reward' }
    if (customer.points < reward.pointsCost) return { success: false, message: 'Insufficient points' }

    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, points: c.points - reward.pointsCost } : c)))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    return { success: true, message: 'Reward redeemed successfully!' }
  }

  // 🔎 Advanced search: name, phone, address, house no. (supports Thai digits)
  const filteredCustomers = useMemo(() => {
    const raw = searchQuery.trim()
    if (!raw) return customers

    const q = toArabicDigits(raw.toLowerCase())
    const qDigits = q.replace(/\D/g, '')

    return customers.filter((customer) => {
      const nameMatch = customer.name.toLowerCase().includes(q)

      const phoneDigits = toArabicDigits(customer.phone || '').replace(/\D/g, '')
      const phoneMatch = qDigits.length > 0 && phoneDigits.includes(qDigits)

      const address = toArabicDigits((customer.address || '').toLowerCase())
      const addressMatch = address.includes(q)
      const addressDigits = address.replace(/\D/g, '')
      const houseNoMatch = qDigits.length > 0 && addressDigits.includes(qDigits)

      return nameMatch || phoneMatch || addressMatch || houseNoMatch
    })
  }, [customers, searchQuery])

  const totalPointsAllCustomers = useMemo(() => customers.reduce((sum, c) => sum + c.points, 0), [customers])
  const pointsBarData = useMemo(() => customers.map((c) => ({ name: c.name.split(' ')[0], points: c.points })), [customers])
  const inventoryBarData = useMemo(() => rewardInventory.map((i) => ({ name: i.name, stock: i.stock })), [rewardInventory])

  const createCustomer = (payload: { name: string; address: string; phone: string; crops: string[]; rai: number }) => {
    const next = String((customers.map((c) => Number(c.id)).filter((n) => !isNaN(n)).sort((a, b) => b - a)[0] || 0) + 1)
    const newCustomer: Customer = {
      id: next,
      name: payload.name,
      points: 0,
      email: '—',
      phone: payload.phone,
      address: payload.address,
      crops: payload.crops,
      rai: payload.rai,
    }
    setCustomers((prev) => [newCustomer, ...prev])
    setShowCreate(false)
    setActiveTab('home')
    setCurrentView('main')
  }

  // ✅ Add a purchase from Buy form => update list immediately
  const addPurchase = (customerId: string, payload: BuyPayload) => {
    // Determine fertilizer type from NPK
    const isN = payload.n > 0 && payload.p === 0 && payload.k === 0
    const isP = payload.p > 0 && payload.n === 0 && payload.k === 0
    const isK = payload.k > 0 && payload.n === 0 && payload.p === 0

    let fertilizerType = ''
    if (isN) fertilizerType = 'Nitrogen (N)'
    else if (isP) fertilizerType = 'Phosphorus (P)'
    else if (isK) fertilizerType = 'Potassium (K)'
    else fertilizerType = `NPK ${payload.n}-${payload.p}-${payload.k}`

    // Amount (kg) from bags
    const bags = Math.max(1, Math.floor(payload.bags ?? 1))
    const amountKg = bags * 50 // 1 bag = 50kg

    // Price
    let totalPrice = 0
    if (payload.pricePerBag && bags) totalPrice = Math.round(payload.pricePerBag * bags)
    else if (payload.pricePerTon) totalPrice = Math.round(payload.pricePerTon)

    const { date, time } = nowDateTime()
    const newItem: PurchaseHistory = {
      id: `p${Date.now()}`,
      customerId,
      date,
      time,
      fertilizerType: `${payload.brand} - ${fertilizerType}`,
      amount: amountKg,
      totalPrice,
    }

    setPurchaseHistory((prev) => [newItem, ...prev])
  }

  // If viewing a specific customer
  if (selectedCustomer) {
    return (
      <div className="pb-20">
        <CustomerDashboard
          customer={selectedCustomer}
          onBack={() => {
            setSelectedCustomer(null)
            setActiveTab('home')
          }}
          purchases={purchaseHistory}
          onAddPurchase={addPurchase}
        />
        <BottomNav
          active={activeTab}
          onHome={() => {
            setSelectedCustomer(null)
            setActiveTab('home')
            setCurrentView('main')
          }}
          onRewards={() => {
            setSelectedCustomer(null)
            setActiveTab('rewards')
            setCurrentView('rewardsOnly')
          }}
          onProfile={() => {
            setSelectedCustomer(null)
            setActiveTab('profile')
            setCurrentView('profile')
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 p-6 pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-2xl bg-white p-8 shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="h-7 w-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            </svg>
            <h1 className="mb-2 text-3xl font-bold text-slate-800">🌱 Fertilizer Loyalty Points System</h1>
          </div>
          <p className="text-slate-600">Reward your customers for their continued support</p>
        </div>

        {showSuccess && (
          <div className="mb-6 animate-pulse rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-700">✓ Reward redeemed successfully!</p>
          </div>
        )}

        {currentView === 'main' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Customers */}
	    <UltraAiTodo />
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 1118 10h-1a3 3 0 100 6h-1a4 4 0 01-3.874 3.997M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h2 className="text-xl font-bold text-slate-800">Customers</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">{filteredCustomers.length} customers</span>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    สร้างลูกค้าใหม่
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ค้นหาด้วยชื่อ-สกุล, เบอร์, บ้านเลขที่ หรือที่อยู่..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 pl-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <svg className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[500px] space-y-3 overflow-y-auto">
                {filteredCustomers.length > 0 ? (
                  [...filteredCustomers]
                    .sort((a, b) => b.points - a.points)
                    .map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setActiveTab('profile')
                        }}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-gradient-to-r from-purple-50 to-green-50 p-4 transition-all hover:scale-[1.02] hover:shadow-md"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-800 hover:text-purple-600">{customer.name}</h3>
                            {customer.email && <p className="text-sm text-slate-600">{customer.email}</p>}
                            <p className="text-sm text-slate-500">{customer.phone}</p>
                            {customer.address && <p className="text-sm text-slate-500">{customer.address}</p>}
                          </div>
                          <div className="rounded-full bg-purple-600 px-3 py-1 text-sm font-bold text-white">{customer.points} pts</div>
                        </div>
                        {customer.crops && customer.crops.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {customer.crops.map((c) => (
                              <span key={c} className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600">
                                {c}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-slate-500">No customers found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Rewards */}
            <div className="rounded-2xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <h2 className="text-xl font-bold text-slate-800">Available Rewards</h2>
              </div>
              <div className="space-y-3">
                {rewards.map((reward) => (
                  <div key={reward.id} className="rounded-xl border border-slate-200 bg-gradient-to-r from-green-50 to-purple-50 p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-semibold text-slate-800">{reward.name}</h3>
                      <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-bold text-white">{reward.pointsCost} pts</span>
                    </div>
                    <p className="mb-3 text-sm text-slate-600">{reward.description}</p>
                    <button onClick={() => setSelectedReward(reward)} className="w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700">
                      Redeem
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'rewardsOnly' && (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-slate-800">🎁 All Rewards</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {rewards.map((reward) => (
                <div key={reward.id} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-green-50 to-purple-50 p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{reward.name}</h3>
                      <p className="text-sm text-slate-600">{reward.description}</p>
                    </div>
                    <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-bold text-white">{reward.pointsCost} pts</span>
                  </div>
                  <button onClick={() => setSelectedReward(reward)} className="mt-3 w-full rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition hover:bg-purple-700">
                    Redeem
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'profile' && (
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <h2 className="mb-6 text-2xl font-bold text-slate-800">👤 โปรไฟล์ระบบสะสมแต้ม</h2>

            {/* Summary cards */}
            <div className="mb-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-purple-50 to-white p-6">
                <p className="text-sm text-slate-600">แต้มทั้งหมดของลูกค้าทั้งหมด</p>
                <p className="mt-1 text-3xl font-bold text-purple-700">{totalPointsAllCustomers.toLocaleString('th-TH')} pts</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-green-50 to-white p-6">
                <p className="text-sm text-slate-600">จำนวนลูกค้า</p>
                <p className="mt-1 text-3xl font-bold text-green-700">{customers.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-orange-50 to-white p-6">
                <p className="text-sm text-slate-600">ชนิดของรางวัลในสต็อก</p>
                <p className="mt-1 text-3xl font-bold text-orange-600">{rewardInventory.length}</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 font-semibold text-slate-800">คะแนนสะสมตามลูกค้า</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={pointsBarData} barCategoryGap="30%">
                    <defs>
                      <linearGradient id="barGradientPoints" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a78bfa" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(v: number) => `${v.toLocaleString('th-TH')} pts`} />
                    <Legend />
                    <Bar dataKey="points" fill="url(#barGradientPoints)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 font-semibold text-slate-800">สต็อกของรางวัล</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={inventoryBarData} barCategoryGap="30%">
                    <defs>
                      <linearGradient id="barGradientInv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6ee7b7" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" interval={0} angle={-10} height={70} tickMargin={10} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="url(#barGradientInv)" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Inventory list */}
            <div className="mt-6">
              <h3 className="mb-3 font-semibold text-slate-800">รายการของรางวัลที่มีอยู่</h3>
              <div className="grid gap-3 md:grid-cols-2">
                {rewardInventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <span className="font-medium text-slate-800">{item.name}</span>
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-white">{item.stock.toLocaleString('th-TH')} ชิ้น</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Redeem Modal */}
      <Modal open={!!selectedReward} onClose={() => setSelectedReward(null)} title="Redeem Reward">
        {selectedReward && (
          <RedeemRewardForm customers={customers} reward={selectedReward} onRedeem={handleRedeem} onClose={() => setSelectedReward(null)} />
        )}
      </Modal>

      {/* Create Customer Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="สร้างลูกค้าใหม่">
        <CreateCustomerForm onSubmit={createCustomer} onCancel={() => setShowCreate(false)} />
      </Modal>

      {/* Bottom nav (global) */}
      <BottomNav
        active={activeTab}
        onHome={() => {
          setActiveTab('home')
          setCurrentView('main')
        }}
        onRewards={() => {
          setActiveTab('rewards')
          setCurrentView('rewardsOnly')
        }}
        onProfile={() => {
          setActiveTab('profile')
          setCurrentView('profile')
        }}
      />
    </div>
  )
}
