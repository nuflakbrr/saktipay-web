'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Timestamp } from 'firebase/firestore';
import moment from 'moment';

import { Supplier } from '@/interfaces/suppliers';
import CategoryCellAction from './cell-action';

const SupplierColumns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'name',
    header: 'Nama Supplier',
  },
  {
    accessorKey: 'address',
    header: 'Alamat Supplier',
  },
  {
    accessorKey: 'contact',
    header: 'Kontak Supplier',
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
    cell: ({ row }) => <CategoryCellAction data={row.original} />,
  },
];

export default SupplierColumns;
