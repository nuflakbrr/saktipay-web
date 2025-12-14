'use client'
import { FC, useEffect } from 'react'
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { db } from '@/lib/firebase'
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
      .min(5, "Bug title must be at least 5 characters.")
      .max(32, "Bug title must be at most 32 characters."),
    address: z
      .string()
      .min(20, "Description must be at least 20 characters.")
      .max(100, "Description must be at most 100 characters."),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 characters.")
      .max(15, "Phone number must be at most 15 characters."),
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

  const STORE_ID = "deNG3hFw3SLqctWt04D8"

  async function onSubmit(data: FormSchema) {
    try {
      const storeRef = doc(db, "stores", STORE_ID)

      await updateDoc(storeRef, {
        name: data.name,
        address: data.address,
        phone: data.phone,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      toast.success("Profil toko berhasil diperbarui")
    } catch (error) {
      console.error(error)
      toast.error("Gagal memperbarui data toko")
    }
  }


  useEffect(() => {
    const fetchStore = async () => {
      try {
        const storeRef = doc(db, "stores", STORE_ID)
        const snapshot = await getDoc(storeRef)

        if (snapshot.exists()) {
          const data = snapshot.data()

          form.setValue("name", data.name ?? "")
          form.setValue("address", data.address ?? "")
          form.setValue("phone", data.phone ?? "")
        } else {
          toast.error("Data toko tidak ditemukan")
        }
      } catch (error) {
        console.error(error)
        toast.error("Gagal mengambil data toko")
      }
    }

    fetchStore()
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