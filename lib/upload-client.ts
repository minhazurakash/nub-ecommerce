export async function uploadImageFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  let result:
    | { success: true; url: string; path: string }
    | { success: false; error: string };

  try {
    result = await response.json();
  } catch {
    throw new Error("Upload failed. Please try again.");
  }

  if (!response.ok || !result.success) {
    throw new Error(
      result.success === false
        ? result.error
        : "Upload failed. Please try again."
    );
  }

  return result;
}
