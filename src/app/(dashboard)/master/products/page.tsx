'use client'
import { FC, useEffect, useState } from 'react'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"
import { Plus } from 'lucide-react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Category } from '@/interfaces/categories'
import { Supplier } from '@/interfaces/suppliers'
import { Product } from '@/interfaces/products'
import { db } from '@/lib/firebase'
import { fetchProducts } from '@/services/products'
import { fetchCategories } from '@/services/categories'
import { fetchSuppliers } from '@/services/suppliers'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Heading from '@/components/Common/Heading'
import Modal from '@/components/Common/Modals/Modal'
import ProductColumns from './_components/column'

const ProductsPage: FC = () => {
  const [data, setData] = useState<Product[]>([])
  const [dataCategories, setDataCategories] = useState<Category[]>([])
  const [dataSuppliers, setDataSuppliers] = useState<Supplier[]>([])
  const [open, setOpen] = useState(false)

  const handleOpenModal = () => setOpen(!open)

  const formSchema = z.object({
    category_id: z
      .string()
      .min(1, "Kategori produk wajib dipilih."),
    supplier_id: z
      .string()
      .min(1, "Supplier produk wajib dipilih."),
    name: z
      .string()
      .min(5, "Nama produk setidaknya harus memiliki 5 karakter.")
      .max(100, "Nama produk maksimal 100 karakter."),
    cost: z
      .string()
      .min(1, "Biaya produk harus diisi."),
    price: z
      .string()
      .min(1, "Harga produk harus diisi."),
    stock: z
      .string()
      .min(1, "Stok produk harus diisi."),
  })

  type FormSchema = z.infer<typeof formSchema>

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_id: "",
      supplier_id: "",
      name: "",
      cost: "",
      price: "",
      stock: "",
    },
  })

  async function onSubmit(formData: FormSchema) {
    try {
      const category_id = formData.category_id.trim()
      const supplier_id = formData.supplier_id.trim()
      const name = formData.name.trim()
      const cost = formData.cost.trim()
      const price = formData.price.trim()
      const stock = formData.stock.trim()

      // 1. cek apakah nama kategori sudah ada
      const q = query(
        collection(db, "products"),
        where("name", "==", name),
      )

      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        toast.error("Produk sudah ada")
        return
      }

      // 2. create supplier baru
      await addDoc(collection(db, "products"), {
        category_id,
        supplier_id,
        name,
        cost,
        price,
        stock,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      toast.success("Produk berhasil ditambahkan")

      // 3. reset & close modal
      form.reset()
      setOpen(false)

      // 4. refresh table (simple version)
      const products = await fetchProducts()
      if (products) setData(products)

    } catch (error) {
      console.error(error)
      toast.error("Gagal membuat produk")
    }
  }

  useEffect(() => {
    fetchProducts().then(products => {
      if (products) {
        setData(products)
      }
    })
    fetchCategories().then(categories => {
      if (categories) {
        setDataCategories(categories)
      }
    })
    fetchSuppliers().then(suppliers => {
      if (suppliers) {
        setDataSuppliers(suppliers)
      }
    })
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Data Produk"
          description="Kelola data produk toko Anda"
        />
        <Button onClick={handleOpenModal}>
          <Plus className="mr-2 h-4 w-4" /> Tambahkan Produk Baru
        </Button>
      </div>

      <Separator />

      <DataTable searchKey="name" columns={ProductColumns} data={data} />

      <Modal isOpen={open} onClose={handleOpenModal} title='Tambah Produk Baru' description='Buat produk baru untuk toko Anda.'>
        <form id="form-supplier" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-name">
                    Nama Produk
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Nama Produk Anda"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="category_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-name">
                    Kategori Produk
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="supplier_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-name">
                    Supplier
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataSuppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="cost"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-cost">
                    Biaya Produk
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-cost"
                    aria-invalid={fieldState.invalid}
                    placeholder="Biaya Produk Anda"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="price"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-price">
                    Harga Produk
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-price"
                    aria-invalid={fieldState.invalid}
                    placeholder="Harga Produk Anda"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="stock"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-stock">
                    Stok Produk
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-stock"
                    aria-invalid={fieldState.invalid}
                    placeholder="Stok Produk Anda"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="flex items-center justify-end">
              <Button type="submit" form="form-supplier" className='w-auto'>
                Simpan
              </Button>
            </div>
          </FieldGroup>
        </form>
      </Modal>
    </>
  )
}

export default ProductsPage