import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { toast } from "sonner"

import { Transaction } from "@/interfaces/transactions"
import { db } from "@/lib/firebase"

export const fetchLastTransaction = async (
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

export const fetchTransactions = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "transactions")
    )

    const transactions: Transaction[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Transaction, "id">),
    }))

    return transactions
  } catch (error) {
    toast.error("Gagal mengambil data supplier")
  }
}
