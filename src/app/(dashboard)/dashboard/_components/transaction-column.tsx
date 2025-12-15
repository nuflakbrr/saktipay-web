'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Timestamp } from 'firebase/firestore';
import moment from 'moment';

import { Transaction } from '@/interfaces/transactions';

const TransactionColumns: ColumnDef<Transaction>[] = [
  {
    accessorKey: 'id',
    header: 'No Transaksi',
  },
  {
    accessorKey: 'cashier_name',
    header: 'Nama Kasir',
  },
  {
    accessorKey: 'total',
    header: 'Total Penjualan',
  },
  {
    accessorKey: 'discount',
    header: 'Total Diskon',
  },
  {
    accessorKey: 'profit',
    header: 'Keuntungan',
  },
  {
    accessorKey: 'payment_method',
    header: 'Metode Pembayaran',
  },
  {
    accessorKey: 'created_at',
    header: 'Dibuat Pada',
    cell: ({ row }) => {
      const value = row.original.created_at as Timestamp | null

      if (!value) return "-"

      return moment(value.toDate()).format("DD MMM YYYY, HH:mm")
    }
  },
  {
    accessorKey: 'updated_at',
    header: 'Diperbarui Pada',
    cell: ({ row }) => {
      const value = row.original.created_at as Timestamp | null

      if (!value) return "-"

      return moment(value.toDate()).format("DD MMM YYYY, HH:mm")
    }
  },
];

export default TransactionColumns;
