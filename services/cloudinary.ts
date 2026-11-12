
import { File } from "expo-file-system";
import { fetch } from "expo/fetch";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadLecturerImage(
  Image: string
): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Chưa cấu hình Cloudinary trong file .env");
  }

  try {
    const file = new File(Image);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error?.message || "Tải ảnh lên Cloudinary thất bại."
      );
    }

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error: - cloudinary.ts:40", error);
    throw error;
  }
}
