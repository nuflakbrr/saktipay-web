'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Timestamp } from 'firebase/firestore';
import moment from 'moment';

import { Product } from '@/interfaces/products';
import ProductCellAction from './cell-action';

const ProductColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Nama Produk',
  },
  {
    accessorKey: 'cost',
    header: 'Biaya Produk',
    cell: ({ row }) => {
      const value = Number(row.original.cost)
      return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }
  },
  {
    accessorKey: 'price',
    header: 'Harga Produk',
    cell: ({ row }) => {
      const value = Number(row.original.price)
      return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }
  },
  {
    accessorKey: 'stock',
    header: 'Stok Produk',
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
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => <ProductCellAction data={row.original} />,
  },
];

export default ProductColumns;
