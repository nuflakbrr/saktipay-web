import { doc, getDoc } from "firebase/firestore"
import { toast } from "sonner"

import { db } from "@/lib/firebase"

export const STORE_ID = "deNG3hFw3SLqctWt04D8"

export const fetchStore = async (form: any) => {
  try {
    const storeRef = doc(db, "stores", STORE_ID)
    const snapshot = await getDoc(storeRef)

    if (snapshot.exists()) {
      const data = snapshot.data()

      form.setValue("name", data.name ?? "")
      form.setValue("address", data.address ?? "")
      form.setValue("phone", data.phone ?? "")
    } else {
      toast.error("Data toko tidak ditemukan")
    }
  } catch (error) {
    toast.error("Gagal mengambil data toko")
  }
}