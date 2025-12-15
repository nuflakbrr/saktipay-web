import { collection, getDocs } from "firebase/firestore"
import { toast } from "sonner"

import { AppUser } from "@/interfaces/user"
import { db } from "@/lib/firebase"

export const fetchUsers = async () => {
  try {
    const querySnapshot = await getDocs(
      collection(db, "users")
    )

    const users: AppUser[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<AppUser, "id">),
    }))

    return users
  } catch (error) {
    toast.error("Gagal mengambil data users")
  }
}