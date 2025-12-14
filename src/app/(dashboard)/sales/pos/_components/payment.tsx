'use client'
import { FC } from 'react'
import { Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react'

import Modal from '@/components/Common/Modals/Modal'

type PaymentMethod = 'cash' | 'gopay' | 'ovo' | 'dana' | 'transfer'

type Props = {
  open: boolean
  onClose: () => void
  total: number
  discount: number
  onPay: (method: PaymentMethod) => void
}

const PaymentModal: FC<Props> = ({ open, onClose, total, discount, onPay }) => {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Pilih Pembayaran"
      description="Pilih metode pembayaran untuk transaksi ini"
    >
      <div className="space-y-6">
        {/* Total */}
        <div className="text-center">
          <div className="text-sm text-neutral-500">Total Pembayaran</div>
          <div className="text-3xl font-bold text-green-600">
            Rp {total.toLocaleString()}
          </div>
          {discount > 0 && (
            <div className="text-xs text-red-500">
              Hemat Rp {discount.toLocaleString()}
            </div>
          )}
        </div>

        {/* Methods */}
        <div className="grid grid-cols-2 gap-3">
          <PayButton icon={<Banknote />} label="Cash" onClick={() => onPay('cash')} />
          <PayButton icon={<Wallet />} label="GoPay" onClick={() => onPay('gopay')} />
          <PayButton icon={<Smartphone />} label="OVO" onClick={() => onPay('ovo')} />
          <PayButton icon={<CreditCard />} label="Dana" onClick={() => onPay('dana')} />
        </div>

        <button
          onClick={() => onPay('transfer')}
          className="w-full border rounded-lg p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700"
        >
          Transfer Bank
        </button>

        <button
          onClick={onClose}
          className="w-full text-sm text-neutral-500 hover:text-neutral-800"
        >
          Batal
        </button>
      </div>
    </Modal>
  )
}

const PayButton = ({ icon, label, onClick }: any) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
  >
    <div className="w-8 h-8 mb-1">{icon}</div>
    <span className="text-sm font-medium">{label}</span>
  </button>
)

export default PaymentModal
