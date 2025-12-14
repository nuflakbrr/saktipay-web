'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Timestamp } from 'firebase/firestore';
import moment from 'moment';

import { Category } from '@/interfaces/categories';
import CategoryCellAction from './cell-action';

const CategoryColumns: ColumnDef<Category>[] = [
  {
    accessorKey: 'name',
    header: 'Nama Kategori',
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

export default CategoryColumns;
