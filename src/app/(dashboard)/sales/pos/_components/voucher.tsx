import { FC } from 'react'

import Modal from '@/components/Common/Modals/Modal'
import { Promotion } from '@/interfaces/promotions'
import { Button } from '@/components/ui/button'

type Props = {
  open: boolean
  handleOpenModal: () => void
  voucherList?: Promotion[]
  setSelectedVoucher?: (voucher: Promotion | null) => void
}

const VoucherModal: FC<Props> = ({ open, handleOpenModal, voucherList, setSelectedVoucher }) => {
  return (
    <Modal isOpen={open} onClose={handleOpenModal} title='Pilih Voucher' description='Pilih voucher yang ingin digunakan untuk transaksi ini.'>
      {voucherList && voucherList.length > 0 ? (
        <div className='flex flex-col gap-4 max-h-80 overflow-y-auto'>
          {voucherList.map((voucher) => (
            <button
              key={voucher.id}
              onClick={() => {
                if (setSelectedVoucher) {
                  setSelectedVoucher(voucher)
                }
                handleOpenModal()
              }}
              className='w-full text-left p-4 border rounded hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer'
            >
              <div className='font-medium'>{voucher.code}</div>
              <div className='text-sm text-neutral-500 dark:text-neutral-400'>{voucher.description}</div>
            </button>
          ))}

          <button
            onClick={() => {
              if (setSelectedVoucher) {
                setSelectedVoucher(null)
              }
              handleOpenModal()
            }}
            className='w-full text-center p-4 border rounded hover:bg-red-50 dark:hover:bg-red-800 bg-red-700 cursor-pointer'
          >
            <div className='font-medium'>Tidak Ada Voucher</div>
          </button>
        </div>
      ) : (
        <div className='text-center text-gray-500 dark:text-gray-400'>Tidak ada voucher tersedia.</div>
      )}
    </Modal>
  )
}

export default VoucherModal