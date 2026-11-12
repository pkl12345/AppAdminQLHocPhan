
export function checkConfig() {
  const checks = {
    firebaseApiKey: !!process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseProjectId: !!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseAppId: !!process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    cloudinaryCloudName: !!process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    cloudinaryPreset: !!process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  };

  console.log("KIỂM TRA CẤU HÌNH: - checkConfig.ts:11", checks);

  return Object.values(checks).every(Boolean);
}
