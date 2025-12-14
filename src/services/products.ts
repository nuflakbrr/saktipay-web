import { collection, getDocs } from "firebase/firestore"
import { toast } from "sonner"

import { Product } from "@/interfaces/products"
import { db } from "@/lib/firebase"

export const fetchProducts = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "products")
    )

    const products: Product[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Product, "id">),
    }))

    return products
  } catch (error) {
    toast.error("Gagal mengambil data produk")
  }
}