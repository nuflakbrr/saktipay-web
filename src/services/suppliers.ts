import { collection, getDocs } from "firebase/firestore"
import { toast } from "sonner"

import { Supplier } from "@/interfaces/suppliers"
import { db } from "@/lib/firebase"

export const fetchSuppliers = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "suppliers")
    )

    const suppliers: Supplier[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Supplier, "id">),
    }))

    return suppliers
  } catch (error) {
    toast.error("Gagal mengambil data supplier")
  }
}