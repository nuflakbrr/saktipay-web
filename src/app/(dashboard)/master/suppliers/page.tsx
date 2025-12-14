'use client'
import { FC, useEffect, useState } from 'react'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"
import { Plus } from 'lucide-react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Supplier } from '@/interfaces/suppliers'
import { db } from '@/lib/firebase'
import { fetchSuppliers } from '@/services/suppliers'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Heading from '@/components/Common/Heading'
import Modal from '@/components/Common/Modals/Modal'
import SupplierColumns from './_components/column'

const SuppliersPage: FC = () => {
  const [data, setData] = useState<Supplier[]>([])
  const [open, setOpen] = useState(false)

  const handleOpenModal = () => setOpen(!open)

  const formSchema = z.object({
    name: z
      .string()
      .min(5, "Nama supplier setidaknya harus memiliki 5 karakter.")
      .max(32, "Nama supplier maksimal 32 karakter."),
    address: z
      .string()
      .min(20, "Alamat supplier harus memiliki setidaknya 20 karakter.")
      .max(100, "Alamat supplier maksimal 100 karakter."),
    contact: z
      .string()
      .min(10, "Nomor telepon supplier harus memiliki setidaknya 10 karakter.")
      .max(15, "Nomor telepon supplier maksimal 15 karakter."),
  })

  type FormSchema = z.infer<typeof formSchema>

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      contact: "",
    },
  })

  async function onSubmit(formData: FormSchema) {
    try {
      const name = formData.name.trim()
      const contact = formData.contact.trim()
      const address = formData.address.trim()

      // 1. cek apakah nama kategori sudah ada
      const q = query(
        collection(db, "suppliers"),
        where("name", "==", name),
        where("contact", "==", contact)
      )

      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        toast.error("Supplier sudah ada")
        return
      }

      // 2. create supplier baru
      await addDoc(collection(db, "suppliers"), {
        name,
        address,
        contact,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      toast.success("Supplier berhasil ditambahkan")

      // 3. reset & close modal
      form.reset()
      setOpen(false)

      // 4. refresh table (simple version)
      const suppliers = await fetchSuppliers()
      if (suppliers) setData(suppliers)

    } catch (error) {
      toast.error("Gagal membuat supplier")
    }
  }

  useEffect(() => {
    fetchSuppliers().then(suppliers => {
      if (suppliers) {
        setData(suppliers)
      }
    })
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Data Supplier"
          description="Kelola data supplier toko Anda"
        />
        <Button onClick={handleOpenModal}>
          <Plus className="mr-2 h-4 w-4" /> Tambahkan Supplier Baru
        </Button>
      </div>

      <Separator />

      <DataTable searchKey="name" columns={SupplierColumns} data={data} />

      <Modal isOpen={open} onClose={handleOpenModal} title='Tambah Supplier Baru' description='Buat supplier baru untuk toko Anda.'>
        <form id="form-supplier" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-name">
                    Nama Supplier
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Nama Supplier Anda"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="address"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-address">
                    Alamat Supplier
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-address"
                      placeholder="Alamat Supplier Anda"
                      rows={6}
                      className="min-h-24 resize-none"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="block-end">
                      <InputGroupText className="tabular-nums">
                        {field.value.length}/100 characters
                      </InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="contact"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-phone">
                    Nomor Telepon
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-phone"
                    aria-invalid={fieldState.invalid}
                    placeholder="Nomor Telepon Supplier Anda"
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

export default SuppliersPage