'use client'
import { FC, useEffect, useState } from 'react'
import moment from 'moment'

import { Store } from '@/interfaces/stores'
import { Transaction } from '@/interfaces/transactions'
import { fetchStore } from '@/services/stores'
import { fetchLastTransaction } from '@/services/transactions'
import { Timestamp } from 'firebase/firestore'

type Props = {
  open: boolean
  onClose: () => void
  transactionId: string
}

const ReceiptModal: FC<Props> = ({ open, onClose, transactionId }) => {
  if (!open) return null

  const [store, setStore] = useState<Store>()
  const [transaction, setTransaction] = useState<Transaction>()

  const handlePrint = () => {
    window.print();
  }

  const formatDate = (value: any) => {
    if (!value) return '-'

    // Firestore Timestamp
    if (value instanceof Timestamp) {
      return moment(value.toDate()).format('DD/MM/YYYY HH:mm:ss')
    }

    // ISO String / Date
    return moment(value).format('DD/MM/YYYY HH:mm:ss')
  }

  useEffect(() => {
    fetchStore().then((data) => {
      if (data) {
        setStore(data)
      }
    })

    fetchLastTransaction(transactionId).then((data) => {
      if (data) {
        setTransaction(data)
      }
    })
  }, [transactionId])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm print:bg-white print:static print:block">
      <div
        className='bg-white rounded-lg shadow-xl w-96 max-w-full print:shadow-none print:w-full print:m-0 p-6 print:p-0'
        id="printable-receipt"
      >
        {/* Receipt Header */}
        <div className="text-center mb-4 pb-4 border-b border-dashed border-gray-300">
          <h2 className="text-2xl text-black font-bold uppercase tracking-wider">{store?.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{store?.address}</p>
          <p className="text-sm text-gray-500">{store?.phone}</p>
          <p className="text-sm text-black font-medium mt-2">Terimakasih telah berbelanja di toko kami!</p>
        </div>

        {/* Transaction Info */}
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>
            Tanggal: {formatDate(transaction?.created_at)}
          </span>
          <span>ID: #{transaction?.id}</span>
        </div>

        <div className="text-xs text-gray-500 mb-1">
          Kasir: {transaction?.cashier_name}
        </div>

        <div className="text-xs text-gray-500 mb-4 capitalize">
          Metode Pembayaran: {transaction?.payment_method}
        </div>

        {/* Items */}
        <div className="space-y-2 mb-4">
          {transaction?.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-black">
              <span className="w-1/2 truncate">{item.name}</span>
              <span className="w-1/6 text-center">x{item.quantity}</span>
              <span className="w-1/3 text-right font-mono">
                {(Number(item.price) * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="flex justify-between text-sm text-black">
          <span>Subtotal</span>
          <span className="font-mono">
            {transaction?.subtotal.toLocaleString()}
          </span>
        </div>

        {transaction && transaction.discount > 0 && (
          <div className="flex justify-between text-sm text-red-500">
            <span>
              Diskon {transaction.voucher_code ? `(${transaction.voucher_code})` : ""}
            </span>
            <span className="font-mono">
              -{transaction.discount.toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between text-xl font-bold mt-2 text-black">
          <span>Total</span>
          <span className="font-mono">
            Rp {transaction?.total.toLocaleString()}
          </span>
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          <p>Semoga hari Anda menyenangkan!</p>
        </div>

        {/* Actions (Hidden on Print) */}
        <div className="mt-6 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-medium"
          >
            Print Struk
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReceiptModal