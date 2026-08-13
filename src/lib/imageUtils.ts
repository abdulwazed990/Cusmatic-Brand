/**
 * Utility to compress uploaded image files into a lightweight base64 string
 * to ensure Firestore documents stay well under the 1MB payload limit.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Processes an uploaded favicon image file (PNG, JPG, WEBP, ICO, SVG)
 * Resizes images to a crisp 512x512 PNG data URL maintaining aspect ratio
 * without distortion. Preserves raw SVG data URLs when SVG is uploaded.
 */
export async function processFaviconFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.type === 'image/svg+xml' || file.name.endsWith('.svg')) {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read SVG favicon file'));
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read favicon image file'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image for favicon processing'));
      img.onload = () => {
        const targetWidth = 512;
        const targetHeight = 512;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.clearRect(0, 0, targetWidth, targetHeight);

        // Aspect-ratio-preserving fit without distortion
        const scale = Math.min(targetWidth / img.width, targetHeight / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const offsetX = (targetWidth - drawWidth) / 2;
        const offsetY = (targetHeight - drawHeight) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        const dataUrl = canvas.toDataURL('image/png', 0.95);
        resolve(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
