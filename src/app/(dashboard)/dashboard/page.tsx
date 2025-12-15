'use client'
import { FC, useEffect, useState } from 'react'

import { AppUser } from '@/interfaces/user'
import { Category } from '@/interfaces/categories'
import { Product } from '@/interfaces/products'
import { Transaction } from '@/interfaces/transactions'
import { fetchUsers } from '@/services/users'
import { fetchCategories } from '@/services/categories'
import { fetchTransactions } from '@/services/transactions'
import { fetchProducts } from '@/services/products'
import { DataTable } from '@/components/ui/data-table'
import GreetingCard from '@/components/Common/GreetingCard'
import TransactionColumns from './_components/transaction-column'
import ProductColumns from './_components/product-column'

const DashboardPage: FC = () => {
  const [users, setUsers] = useState<AppUser[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const productsLowStock = products?.filter((product) => Number(product.stock) <= 5)

  useEffect(() => {
    fetchUsers().then((data) => {
      if (data) {
        setUsers(data)
      }
    })

    fetchCategories().then((data) => {
      if (data) {
        setCategories(data)
      }
    })

    fetchTransactions().then((data) => {
      if (data) {
        setTransactions(data)
      }
    })

    fetchProducts().then((data) => {
      if (data) {
        setProducts(data)
      }
    })
  }, [])

  return (
    <section className="flex flex-col w-full items-center justify-center gap-3">
      <GreetingCard />

      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-sidebar rounded-lg shadow-md p-4 sm:p-6 flex flex-col justify-between items-start">
            <h2 className="text-gray-500 dark:text-white text-sm sm:text-base font-medium">
              Pegawai
            </h2>
            <div className="mt-1 sm:mt-2 flex items-end justify-end w-full mx-auto">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A2647] dark:text-white">
                {users?.length || "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-sidebar rounded-lg shadow-md p-4 sm:p-6 flex flex-col justify-between items-start">
            <h2 className="text-gray-500 dark:text-white text-sm sm:text-base font-medium">
              Total Transaksi
            </h2>
            <div className="mt-1 sm:mt-2 flex items-end justify-end w-full mx-auto">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A2647] dark:text-white">
                {transactions?.length || "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-sidebar rounded-lg shadow-md p-4 sm:p-6 flex flex-col justify-between items-start">
            <h2 className="text-gray-500 dark:text-white text-sm sm:text-base font-medium">
              Total Kategori Produk
            </h2>
            <div className="mt-1 sm:mt-2 flex items-end justify-end w-full mx-auto">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A2647] dark:text-white">
                {categories?.length || "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-sidebar rounded-lg shadow-md p-4 sm:p-6 flex flex-col justify-between items-start">
            <h2 className="text-gray-500 dark:text-white text-sm sm:text-base font-medium">
              Stok Produk Hampir Habis
            </h2>
            <div className="mt-1 sm:mt-2 flex items-end justify-end w-full mx-auto">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0A2647] dark:text-white">
                {productsLowStock?.length || "0"}
              </span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-8">
          <div className="bg-white w-full dark:bg-sidebar rounded-lg shadow-md p-4 sm:p-6 flex flex-col justify-start items-start h-full">
            <h2 className="text-gray-500 dark:text-white text-sm sm:text-base font-medium">
              Transaksi Terakhir
            </h2>

            <div className="w-full">
              <DataTable searchKey="id" columns={TransactionColumns} data={transactions} />
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="bg-white dark:bg-sidebar rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-start h-full">
            <h2 className="text-gray-500 dark:text-white text-sm sm:text-base font-medium mb-5">
              Notifikasi Stok Produk Hampir Habis
            </h2>

            <div className="w-full">
              <DataTable
                searchKey="name"
                columns={ProductColumns}
                data={productsLowStock || []}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage