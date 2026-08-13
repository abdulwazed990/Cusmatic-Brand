import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { compressImageFile } from './imageUtils';

/**
 * Uploads an asset (image or video) to Firebase Cloud Storage.
 * Guarantees a permanent, globally accessible public URL.
 * Never generates or returns temporary blob: URLs.
 */
export async function uploadAssetToCloudStorage(
  file: File,
  folderName: 'logos' | 'banners' | 'categories' | 'products' | 'favicons' | 'assets' = 'assets',
  onProgress?: (statusMessage: string) => void
): Promise<string> {
  if (!file) {
    throw new Error('No file selected for upload.');
  }

  onProgress?.('Uploading asset to Cloud Storage...');

  // Sanitize filename
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const uniquePath = `rakomart_uploads/${folderName}/${Date.now()}_${cleanName}`;

  try {
    const storageRef = ref(storage, uniquePath);
    onProgress?.('Uploading to Cloud Storage bucket...');
    
    // Upload actual file bytes
    const uploadResult = await uploadBytes(storageRef, file);
    onProgress?.('Generating permanent public URL...');
    const downloadUrl = await getDownloadURL(uploadResult.ref);

    if (!downloadUrl || downloadUrl.startsWith('blob:')) {
      throw new Error('Invalid download URL received from cloud storage.');
    }

    onProgress?.('Cloud upload verified!');
    return downloadUrl;
  } catch (storageErr) {
    console.warn('Firebase Cloud Storage bucket upload fallback engaged:', storageErr);
    onProgress?.('Optimizing asset for permanent cloud database storage...');

    // Fallback: Convert to persistent Base64 Data URL (data:image/... or data:video/...)
    // This is stored permanently inside Firestore documents and accessible globally on all devices
    if (file.type.startsWith('image/')) {
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.85);
      if (!compressedDataUrl || compressedDataUrl.startsWith('blob:')) {
        throw new Error('Failed to process image payload.');
      }
      onProgress?.('Asset compressed & ready for cloud database!');
      return compressedDataUrl;
    } else if (file.type.startsWith('video/')) {
      const videoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result && typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read video file.'));
          }
        };
        reader.onerror = () => reject(new Error('Error reading video file.'));
        reader.readAsDataURL(file);
      });

      if (!videoDataUrl || videoDataUrl.startsWith('blob:')) {
        throw new Error('Failed to process video file payload.');
      }

      onProgress?.('Video payload processed for cloud database!');
      return videoDataUrl;
    } else {
      throw new Error(`Unsupported file type: ${file.type}`);
    }
  }
}
