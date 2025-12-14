'use client';

import { FC, useState } from 'react';
import { collection, doc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from 'sonner';
import z from "zod";

import { Supplier } from '@/interfaces/suppliers';
import { db } from '@/lib/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/Common/Modals/Modal';
import AlertModal from '@/components/Common/Modals/AlertModal';
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from '@/components/ui/input-group';

type Props = {
  data: Supplier;
};

const SupplierCellAction: FC<Props> = ({ data }) => {
  /* =======================
     STATE
  ======================== */
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  /* =======================
     FORM
  ======================== */
  const formSchema = z.object({
    name: z
      .string()
      .min(5, "Nama supplier setidaknya harus 5 karakter.")
      .max(32, "Nama supplier maksimal 32 karakter."),
    address: z
      .string()
      .min(20, "Alamat supplier harus memiliki setidaknya 20 karakter.")
      .max(100, "Alamat supplier maksimal 100 karakter."),
    contact: z
      .string()
      .min(10, "Nomor telepon supplier harus memiliki setidaknya 10 karakter.")
      .max(15, "Nomor telepon supplier maksimal 15 karakter."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      contact: "",
    },
  });

  /* =======================
     HANDLERS
  ======================== */

  const handleEditOpen = () => {
    form.setValue("name", data.name);
    form.setValue("address", data.address);
    form.setValue("contact", data.contact);
    setOpenEdit(true);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Supplier ID berhasil disalin");
  };

  /* =======================
     UPDATE SUPPLIER
  ======================== */
  const onSubmit = async (formData: FormSchema) => {
    try {
      setLoading(true);

      const name = formData.name.trim();
      const address = formData.address.trim();
      const contact = formData.contact.trim();

      // cek duplicate (kecuali dirinya sendiri)
      const q = query(
        collection(db, "suppliers"),
        where("name", "==", name),
        where("contact", "==", contact)
      );

      const snapshot = await getDocs(q);
      const isDuplicate = snapshot.docs.some(
        (doc) => doc.id !== data.id
      );

      if (isDuplicate) {
        toast.error("Nama supplier sudah digunakan");
        return;
      }

      await updateDoc(doc(db, "suppliers", data.id), {
        name,
        address,
        contact,
        updated_at: serverTimestamp(),
      });

      toast.success("Supplier berhasil diperbarui");
      setOpenEdit(false);
      form.reset();

      // simple refresh
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui supplier");
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     DELETE CATEGORY
  ======================== */
  const onConfirmDelete = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "suppliers", data.id));
      toast.success("Supplier berhasil dihapus");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus supplier");
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
        title="Ubah Supplier"
        description="Ubah supplier untuk produk toko Anda."
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
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

export default SupplierCellAction;
