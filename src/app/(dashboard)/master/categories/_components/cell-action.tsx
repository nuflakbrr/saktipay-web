'use client';

import { FC, useState } from 'react';
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from 'sonner';
import z from "zod";

import { Category } from '@/interfaces/categories';
import { db } from '@/lib/firebase';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/Common/Modals/Modal';
import AlertModal from '@/components/Common/Modals/AlertModal';

type Props = {
  data: Category;
};

const CategoryCellAction: FC<Props> = ({ data }) => {
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
      .min(5, "Nama kategori setidaknya harus 5 karakter.")
      .max(32, "Nama kategori maksimal 32 karakter."),
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  /* =======================
     HANDLERS
  ======================== */

  const handleEditOpen = () => {
    form.setValue("name", data.name);
    setOpenEdit(true);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Category ID berhasil disalin");
  };

  /* =======================
     UPDATE CATEGORY
  ======================== */
  const onSubmit = async (formData: FormSchema) => {
    try {
      setLoading(true);

      const name = formData.name.trim().toLowerCase();

      // cek duplicate (kecuali dirinya sendiri)
      const q = query(
        collection(db, "categories"),
        where("name", "==", name)
      );

      const snapshot = await getDocs(q);
      const isDuplicate = snapshot.docs.some(
        (doc) => doc.id !== data.id
      );

      if (isDuplicate) {
        toast.error("Nama kategori sudah digunakan");
        return;
      }

      await updateDoc(doc(db, "categories", data.id), {
        name,
        updated_at: serverTimestamp(),
      });

      toast.success("Kategori berhasil diperbarui");
      setOpenEdit(false);
      form.reset();

      // simple refresh
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui kategori");
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
      await deleteDoc(doc(db, "categories", data.id));
      toast.success("Kategori berhasil dihapus");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus kategori");
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
        title="Ubah Kategori"
        description="Ubah kategori untuk produk toko Anda."
      >
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    placeholder="Nama kategori"
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

export default CategoryCellAction;
