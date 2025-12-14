'use client'
import { FC, useEffect } from 'react'
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { db } from '@/lib/firebase'
import { fetchStoreForm, STORE_ID } from '@/services/stores'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group'
import Heading from '@/components/Common/Heading'

const StorePage: FC = () => {
  const formSchema = z.object({
    name: z
      .string()
      .min(5, "Nama Toko setidaknya harus memiliki 5 karakter.")
      .max(32, "Nama Toko maksimal 32 karakter."),
    address: z
      .string()
      .min(20, "Alamat harus memiliki setidaknya 20 karakter.")
      .max(100, "Alamat maksimal 100 karakter."),
    phone: z
      .string()
      .min(10, "Nomor telepon harus memiliki setidaknya 10 karakter.")
      .max(15, "Nomor telepon maksimal 15 karakter."),
  })

  type FormSchema = z.infer<typeof formSchema>

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      phone: "",
    },
  })

  async function onSubmit(data: FormSchema) {
    try {
      const storeRef = doc(db, "stores", STORE_ID)

      await updateDoc(storeRef, {
        name: data.name,
        address: data.address,
        phone: data.phone,
        updated_at: serverTimestamp(),
      })

      toast.success("Profil toko berhasil diperbarui")
    } catch (error) {
      toast.error("Gagal memperbarui data toko")
    }
  }

  useEffect(() => {
    fetchStoreForm(form)
  }, [form])

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title="Profil Toko"
          description="Kelola informasi toko Anda"
        />
      </div>

      <Separator />

      <form id="form-store" className='w-1/2' onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-name">
                  Nama Toko
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
          <Controller
            name="address"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-address">
                  Alamat Toko
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="form-address"
                    placeholder="Alamat Toko Anda"
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
            name="phone"
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
                  placeholder="Nomor Telepon Toko Anda"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="flex items-center justify-end">
            <Button type="submit" form="form-store" className='w-auto'>
              Simpan
            </Button>
          </div>
        </FieldGroup>
      </form>
    </>
  )
}

export default StorePage