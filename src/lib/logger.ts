import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "./firebase";

export const logActivity = async (activity: string) => {
  try {
    const user = auth.currentUser;
    await addDoc(collection(db, "logs"), {
      userId: user?.uid || "anonymous",
      userEmail: user?.email || "anonymous",
      activity,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};
