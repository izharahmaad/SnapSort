import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";
import type {
  AnalysisResult,
  ScanRecord,
} from "../../types/scan";

export async function saveScan(
  userId: string,
  result: AnalysisResult,
  imageUri?: string
) {
  return addDoc(
    collection(db, "users", userId, "scans"),
    {
      ...result,
      userId,
      imageUri: imageUri ?? null,
      createdAt: serverTimestamp(),
    }
  );
}

export async function getUserScans(
  userId: string
): Promise<ScanRecord[]> {
  const scansQuery = query(
    collection(db, "users", userId, "scans"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(scansQuery);

  return snapshot.docs.map((scan) => ({
    id: scan.id,
    ...(scan.data() as Omit<ScanRecord, "id">),
  }));
}

export async function deleteScan(
  userId: string,
  scanId: string
): Promise<void> {
  await deleteDoc(
    doc(db, "users", userId, "scans", scanId)
  );
}