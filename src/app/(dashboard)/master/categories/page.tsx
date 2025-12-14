'use client'
import { FC, useEffect, useState } from 'react'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"
import { Plus } from 'lucide-react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Category } from '@/interfaces/categories'
import { db } from '@/lib/firebase'
import { fetchCategories } from '@/services/categories'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Heading from '@/components/Common/Heading'
import Modal from '@/components/Common/Modals/Modal'
import CategoryColumns from './_components/column'

const CategoriesPage: FC = () => {
  const [data, setData] = useState<Category[]>([])
  const [open, setOpen] = useState(false)

  const handleOpenModal = () => setOpen(!open)

  const formSchema = z.object({
    name: z
      .string()
      .min(5, "Nama kategori setidaknya harus memiliki 5 karakter.")
      .max(32, "Nama kategori maksimal 32 karakter."),
  })

  type FormSchema = z.infer<typeof formSchema>

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  async function onSubmit(formData: FormSchema) {
    try {
      const name = formData.name.trim()

      // 1. cek apakah nama kategori sudah ada
      const q = query(
        collection(db, "categories"),
        where("name", "==", name)
      )

      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        toast.error("Nama kategori sudah digunakan")
        return
      }

      // 2. create kategori baru
      await addDoc(collection(db, "categories"), {
        name,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      toast.success("Kategori produk berhasil dibuat")

      // 3. reset & close modal
      form.reset()
      setOpen(false)

      // 4. refresh table (simple version)
      const categories = await fetchCategories()
      if (categories) setData(categories)

    } catch (error) {
      console.error(error)
      toast.error("Gagal membuat kategori produk")
    }
  }

  useEffect(() => {
    fetchCategories().then(categories => {
      if (categories) {
        setData(categories)
      }
    })
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Kategori Produk"
          description="Kelola kategori produk toko Anda"
        />
        <Button onClick={handleOpenModal}>
          <Plus className="mr-2 h-4 w-4" /> Buat Kategori Baru
        </Button>
      </div>

      <Separator />

      <DataTable searchKey="name" columns={CategoryColumns} data={data} />

      <Modal isOpen={open} onClose={handleOpenModal} title='Buat Kategori Baru' description='Buat kategori baru untuk produk toko Anda.'>
        <form id="form-category" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-name">
                    Nama Kategori Produk
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Nama Toko Anda"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="flex items-center justify-end">
              <Button type="submit" form="form-category" className='w-auto'>
                Simpan
              </Button>
            </div>
          </FieldGroup>
        </form>
      </Modal>
    </>
  )
}

export default CategoriesPage