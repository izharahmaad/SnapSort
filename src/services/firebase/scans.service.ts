import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";
import { AnalysisResult, SavedScan } from "../../types/scan";

export async function saveScan(
  userId: string,
  result: AnalysisResult,
  imageUri?: string
) {
  const scansReference = collection(
    db,
    "users",
    userId,
    "scans"
  );

  return addDoc(scansReference, {
    itemName: result.itemName,
    category: result.category,
    confidence: result.confidence,
    ecoScore: result.ecoScore,
    disposalAdvice: result.disposalAdvice,
    reuseIdea: result.reuseIdea,
    warning: result.warning,
    imageUri: imageUri ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function getUserScans(
  userId: string
): Promise<SavedScan[]> {
  const scansReference = collection(
    db,
    "users",
    userId,
    "scans"
  );

  const scansQuery = query(
    scansReference,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(scansQuery);

  return snapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      userId,
      itemName: data.itemName,
      category: data.category,
      confidence: data.confidence,
      ecoScore: data.ecoScore,
      disposalAdvice: data.disposalAdvice,
      reuseIdea: data.reuseIdea ?? "",
      warning: data.warning ?? "",
      imageUri: data.imageUri ?? undefined,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString?.() ??
        new Date().toISOString(),
    };
  });
}