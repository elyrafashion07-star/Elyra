/**
 * Shrinks a picked photo in the browser, before it is ever submitted.
 *
 * A phone camera JPEG is several megabytes and a server action refuses a request
 * body much bigger than that — the save died with a server error rather than
 * anything the form could report. Both admin forms use this.
 *
 * Returns null when the browser cannot decode the file (an iPhone HEIC outside
 * Safari, say); the caller falls back to the original and the size check catches
 * it.
 */
export async function shrinkImage(file: File, maxEdge: number): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    if (!blob) return null;

    const name = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${name}.jpg`, { type: "image/jpeg" });
  } catch {
    return null;
  }
}
