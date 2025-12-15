import { ColumnDef } from "@tanstack/react-table"

import { Product } from "@/interfaces/products"
import ProductCellAction from "./product-cell-action"

const ProductColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Produk",
  },
  {
    accessorKey: "stock",
    header: "Stok",
    cell: ({ row }) => (
      <span className="text-red-500 font-bold">
        {row.original.stock}
      </span>
    )
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => <ProductCellAction data={row.original} />,
  },
]

export default ProductColumns