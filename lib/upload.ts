import { supabase } from "./supabase";

export type UploadProgress = {
  progress: number;
  status: "uploading" | "success" | "error";
};

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error("[UPLOAD] Avatar upload error:", error);
    return {
      url: null,
      error: error instanceof Error ? error.message : "Failed to upload avatar",
    };
  }
}

export async function uploadMilestoneFile(
  userId: string,
  taskId: string,
  file: File
): Promise<{ path: string | null; error: string | null }> {
  try {
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const fileName = `${userId}/${taskId}/${timestamp}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("milestones")
      .upload(fileName, file, { upsert: false });

    if (uploadError) throw uploadError;

    return { path: fileName, error: null };
  } catch (error) {
    console.error("[UPLOAD] Milestone file upload error:", error);
    return {
      path: null,
      error: error instanceof Error ? error.message : "Failed to upload file",
    };
  }
}

export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("[UPLOAD] File deletion error:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to delete file",
    };
  }
}

export function validateFile(
  file: File,
  options: {
    maxSizeMB?: number;
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error: string | null } {
  const { maxSizeMB = 5, allowedTypes = [] } = options;

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed: ${allowedTypes.join(", ")}`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true, error: null };
}
