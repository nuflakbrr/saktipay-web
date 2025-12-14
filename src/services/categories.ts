import { collection, getDocs } from "firebase/firestore"
import { toast } from "sonner"

import { Category } from "@/interfaces/categories"
import { db } from "@/lib/firebase"

export const fetchCategories = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "categories")
    )

    const categories: Category[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Category, "id">),
    }))

    return categories
  } catch (error) {
    toast.error("Gagal mengambil data kategori produk")
  }
}