import { auth } from "../firebase/firebase";
import { useScanStore } from "../../stores/scan.store";
import type {
  AnalysisResult,
} from "../../types/scan";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function analyzeScanImage(): Promise<AnalysisResult> {
  const {
    imageBase64,
    imageMimeType,
  } = useScanStore.getState();

  if (!API_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_URL is missing in the root .env file."
    );
  }

  if (!imageBase64) {
    throw new Error(
      "The image has no Base64 data. Retake the photo and try again."
    );
  }

  if (!auth.currentUser) {
    throw new Error(
      "Please sign in before analyzing an image."
    );
  }

  const token = await auth.currentUser.getIdToken();

  const response = await fetch(
    `${API_URL}/api/v1/scans/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        imageBase64,
        mimeType: imageMimeType || "image/jpeg",
      }),
    }
  );

  const responseText = await response.text();

  let data: unknown;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      "The backend returned an invalid JSON response."
    );
  }

  if (!response.ok) {
    const errorData = data as {
      detail?: string;
      message?: string;
    };

    throw new Error(
      errorData.detail ||
        errorData.message ||
        "Image analysis failed."
    );
  }

  return data as AnalysisResult;
}