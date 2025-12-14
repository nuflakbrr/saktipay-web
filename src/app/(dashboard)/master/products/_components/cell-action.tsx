'use client';

import { FC, useEffect, useState } from 'react';
import { collection, doc, updateDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { Copy, Edit, MoreHorizontal, Trash } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from 'sonner';
import z from "zod";

import { Category } from '@/interfaces/categories';
import { Supplier } from '@/interfaces/suppliers';
import { Product } from '@/interfaces/products';
import { db } from '@/lib/firebase';
import { fetchCategories } from '@/services/categories';
import { fetchSuppliers } from '@/services/suppliers';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Modal from '@/components/Common/Modals/Modal';
import AlertModal from '@/components/Common/Modals/AlertModal';

type Props = {
  data: Product;
};

const ProductCellAction: FC<Props> = ({ data }) => {
  /* =======================
     STATE
  ======================== */
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataCategories, setDataCategories] = useState<Category[]>([])
  const [dataSuppliers, setDataSuppliers] = useState<Supplier[]>([])

  /* =======================
     FORM
  ======================== */
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
  });

  type FormSchema = z.infer<typeof formSchema>;

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category_id: "",
      supplier_id: "",
      cost: "",
      price: "",
      stock: "",
    },
  });

  /* =======================
     LOAD DATA
  ======================== */
  useEffect(() => {
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

  /* =======================
     HANDLERS
  ======================== */

  const handleEditOpen = () => {
    form.setValue("name", data.name);
    form.setValue("category_id", data.category_id);
    form.setValue("supplier_id", data.supplier_id);
    form.setValue("cost", data.cost);
    form.setValue("price", data.price);
    form.setValue("stock", data.stock);
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

      const name = formData.name.trim();

      // cek duplicate (kecuali dirinya sendiri)
      const q = query(
        collection(db, "products"),
        where("name", "==", name)
      );

      const snapshot = await getDocs(q);
      const isDuplicate = snapshot.docs.some(
        (doc) => doc.id !== data.id
      );

      if (isDuplicate) {
        toast.error("Nama produk sudah digunakan");
        return;
      }

      await updateDoc(doc(db, "products", data.id), {
        name,
        category_id: formData.category_id,
        supplier_id: formData.supplier_id,
        cost: formData.cost,
        price: formData.price,
        stock: formData.stock,
        updated_at: serverTimestamp(),
      });

      toast.success("Produk berhasil diperbarui");
      setOpenEdit(false);
      form.reset();

      // simple refresh
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Gagal memperbarui produk");
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
      await deleteDoc(doc(db, "products", data.id));
      toast.success("Produk berhasil dihapus");
      window.location.reload();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus produk");
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

export default ProductCellAction;
