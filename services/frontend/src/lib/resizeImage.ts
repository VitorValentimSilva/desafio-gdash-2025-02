export async function resizeImage(file: File, maxSize = 1024): Promise<Blob> {
  const imgBitmap = await createImageBitmap(file);
  const ratio = Math.min(
    1,
    maxSize / Math.max(imgBitmap.width, imgBitmap.height)
  );
  const width = Math.round(imgBitmap.width * ratio);
  const height = Math.round(imgBitmap.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imgBitmap, 0, 0, width, height);

  return await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.85)
  );
}
