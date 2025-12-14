import { collection, getDocs } from "firebase/firestore"
import { toast } from "sonner"

import { Promotion } from "@/interfaces/promotions"
import { db } from "@/lib/firebase"

export const fetchPromotions = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "promotions")
    )

    const promotions: Promotion[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Promotion, "id">),
    }))

    return promotions
  } catch (error) {
    toast.error("Gagal mengambil data promosi")
  }
}