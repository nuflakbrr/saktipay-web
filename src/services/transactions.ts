import { doc, getDoc } from "firebase/firestore"
import { toast } from "sonner"

import { Transaction } from "@/interfaces/transactions"
import { db } from "@/lib/firebase"

export const fetchTransaction = async (
  id: string
): Promise<Transaction | null> => {
  try {
    const ref = doc(db, "transactions", id)
    const snapshot = await getDoc(ref)

    if (!snapshot.exists()) {
      toast.error("Data transaksi tidak ditemukan")
      return null
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Transaction, "id">),
    }
  } catch (error) {
    toast.error("Gagal mengambil data transaksi")
    return null
  }
}
