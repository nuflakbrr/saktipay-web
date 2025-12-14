'use client';

import { FC, useEffect, useState } from 'react';
import { collection, doc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from 'sonner';
import z from "zod";

import { Promotion } from '@/interfaces/promotions';
import { db } from '@/lib/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/Common/Modals/Modal';
import AlertModal from '@/components/Common/Modals/AlertModal';

type Props = {
  data: Promotion;
};

const PromotionCellAction: FC<Props> = ({ data }) => {
  /* =======================
     STATE
  ======================== */
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =======================
     FORM
  ======================== */
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
          code: 'custom',
          message: 'Promo persen tidak boleh lebih dari 100%',
        });
      }
      if (value <= 0) {
        ctx.addIssue({
          path: ['value'],
          code: 'custom',
          message: 'Nilai promo harus lebih dari 0',
        });
      }
    });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      type: "percent",
      value: "",
      status: "active",
      description: "",
    },
  });

  /* =======================
     HANDLERS
  ======================== */

  const handleEditOpen = () => {
    form.setValue("code", data.code);
    form.setValue("type", data.type);
    form.setValue("value", data.value);
    form.setValue("status", data.status);
    form.setValue("description", data.description);
    setOpenEdit(true);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Product ID berhasil disalin");
  };

  /* =======================
     UPDATE PRODUCT
  ======================== */
  const onSubmit = async (formData: FormSchema) => {
    try {
      setLoading(true);

      const code = formData.code.trim();

      // cek duplicate (kecuali dirinya sendiri)
      const q = query(
        collection(db, "promotions"),
        where("code", "==", code)
      );

      const snapshot = await getDocs(q);
      const isDuplicate = snapshot.docs.some(
        (doc) => doc.id !== data.id
      );

      if (isDuplicate) {
        toast.error("Kode promo sudah digunakan");
        return;
      }

      await updateDoc(doc(db, "promotions", data.id), {
        code: formData.code,
        type: formData.type,
        value: formData.value,
        status: formData.status,
        description: formData.description,
        updated_at: serverTimestamp(),
      });

      toast.success("Promo berhasil diperbarui");
      setOpenEdit(false);
      form.reset();

      // simple refresh
      window.location.reload();
    } catch (error) {
      toast.error("Gagal memperbarui promo");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     DELETE PRODUCT
  ======================== */
  const onConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "promotions", data.id));
      toast.success("Promo berhasil dihapus");
      window.location.reload();
    } catch (error) {
      toast.error("Gagal menghapus promo");
    } finally {
      setLoading(false);
      setOpenDelete(false);
    }
  };

  /* =======================
     RENDER
  ======================== */
  return (
    <>
      {/* DELETE MODAL */}
      <AlertModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={onConfirmDelete}
        loading={loading}
      />

      {/* DROPDOWN */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => handleCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" />
            Salin ID
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleEditOpen}>
            <Edit className="mr-2 h-4 w-4" />
            Ubah
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setOpenDelete(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* EDIT MODAL */}
      <Modal
        isOpen={openEdit}
        onClose={() => setOpenEdit(false)}
        title="Ubah Produk"
        description="Ubah produk toko Anda."
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
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

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </Modal>
    </>
  );
};

export default PromotionCellAction;
