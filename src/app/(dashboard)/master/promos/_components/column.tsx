'use client';
import { ColumnDef } from '@tanstack/react-table';
import { Timestamp } from 'firebase/firestore';
import moment from 'moment';

import { Promotion } from '@/interfaces/promotions';
import PromotionCellAction from './cell-action';
import { Badge } from '@/components/ui/badge';

const PromotionColumns: ColumnDef<Promotion>[] = [
  {
    accessorKey: 'code',
    header: 'Kode Promo',
  },
  {
    accessorKey: 'type',
    header: 'Tipe Promo',
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.original.type === "percent" ? "Persentase (%)" : "Tetap (Rp)"}
      </Badge>
    )
  },
  {
    accessorKey: 'value',
    header: 'Nilai Promo',
    cell: ({ row }) => {
      const value = Number(row.original.value)
      return row.original.type === "percent" ? `${value}%` : value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
    }
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi Promo',
  },
  {
    accessorKey: 'status',
    header: 'Status Promo',
    cell: ({ row }) => (
      <Badge variant={row.original.status === "active" ? "default" : "destructive"}>
        {row.original.status === "active" ? "Aktif" : "Tidak Aktif"}
      </Badge>
    )
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
    cell: ({ row }) => <PromotionCellAction data={row.original} />,
  },
];

export default PromotionColumns;
