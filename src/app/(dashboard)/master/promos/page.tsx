'use client'
import { FC, useEffect, useState } from 'react'
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "firebase/firestore"
import { Plus } from 'lucide-react'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Promotion } from '@/interfaces/promotions'
import { db } from '@/lib/firebase'
import { fetchPromotions } from '@/services/promotions'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Heading from '@/components/Common/Heading'
import Modal from '@/components/Common/Modals/Modal'
import PromotionColumns from './_components/column'

const PromotionsPage: FC = () => {
  const [data, setData] = useState<Promotion[]>([])
  const [open, setOpen] = useState(false)

  const handleOpenModal = () => setOpen(!open)

  const formSchema = z
    .object({
      code: z
        .string()
        .min(5, "Kode promo setidaknya harus memiliki 5 karakter."),
      type: z.enum(['percent', 'fixed'], "Jenis promo harus dipilih."),
      value: z
        .string()
        .min(1, "Nilai promo harus diisi.")
        .refine(
          (val) => !isNaN(Number(val)),
          "Nilai promo harus berupa angka"
        ),
      status: z.enum(['active', 'inactive'], "Status promo harus dipilih."),
      description: z
        .string()
        .min(1, "Deskripsi promo harus diisi.")
        .max(100, "Deskripsi promo maksimal 100 karakter."),
    })
    .superRefine((data, ctx) => {
      const value = Number(data.value);
      if (data.type === 'percent' && value > 100) {
        ctx.addIssue({
          path: ['value'],
          code: "custom",
          message: 'Promo persen tidak boleh lebih dari 100%',
        });
      }
      if (value <= 0) {
        ctx.addIssue({
          path: ['value'],
          code: "custom",
          message: 'Nilai promo harus lebih dari 0',
        });
      }
    });

  type FormSchema = z.infer<typeof formSchema>

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      type: "percent",
      value: "",
      status: "active",
      description: "",
    },
  })

  async function onSubmit(formData: FormSchema) {
    try {
      const code = formData.code.trim()
      const type = formData.type.trim()
      const value = formData.value.trim()
      const status = formData.status.trim()
      const description = formData.description.trim()

      // 1. cek apakah nama kategori sudah ada
      const q = query(
        collection(db, "promotions"),
        where("code", "==", code),
      )

      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        toast.error("Promo sudah ada")
        return
      }

      // 2. create supplier baru
      await addDoc(collection(db, "promotions"), {
        code,
        type,
        value,
        status,
        description,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      toast.success("Promo berhasil ditambahkan")
      // 3. reset & close modal
      form.reset()
      setOpen(false)

      // 4. refresh table (simple version)
      const promotions = await fetchPromotions()
      if (promotions) setData(promotions)

    } catch (error) {
      console.error(error)
      toast.error("Gagal membuat promo")
    }
  }

  useEffect(() => {
    fetchPromotions().then(promotions => {
      if (promotions) {
        setData(promotions)
      }
    })
  }, [])

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Data Kode Promo"
          description="Kelola data kode promo toko Anda"
        />
        <Button onClick={handleOpenModal}>
          <Plus className="mr-2 h-4 w-4" /> Tambahkan Kode Promo Baru
        </Button>
      </div>

      <Separator />

      <DataTable searchKey="code" columns={PromotionColumns} data={data} />

      <Modal isOpen={open} onClose={handleOpenModal} title='Tambah Produk Baru' description='Buat produk baru untuk toko Anda.'>
        <form id="form-supplier" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-code">
                    Kode Promo
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-code"
                    aria-invalid={fieldState.invalid}
                    placeholder="Kode Promo Anda"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-type">
                    Tipe Promo
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Tipe Promo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="percent" value="percent">
                        Persentase
                      </SelectItem>
                      <SelectItem key="fixed" value="fixed">
                        Tetap
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="value"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-value">
                    Nilai Promo
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-value"
                    aria-invalid={fieldState.invalid}
                    placeholder="Nilai Promo Anda"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-status">
                    Status Promo
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Status Promo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="active" value="active">
                        Aktif
                      </SelectItem>
                      <SelectItem key="inactive" value="inactive">
                        Tidak Aktif
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-description">
                    Deskripsi Promo
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupTextarea
                      {...field}
                      id="form-description"
                      placeholder="Deskripsi Promo Anda"
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

export default PromotionsPage