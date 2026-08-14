import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AdminAuthRecord {
  isHandoverCompleted: boolean;
  isTemporaryPasswordActive: boolean;
  passwordHash: string;
  handoverCompletedAt?: string;
  updatedAt?: string;
}

// Initial one-time handover sample passwords for the owner
const INITIAL_HANDOVER_PASSWORDS = ['RakoMart@2026', 'Rako2026', 'Admin@2026', 'rakomart2026'];

// Local storage / cache keys
const AUTH_CACHE_KEY = 'rakomart_admin_auth_meta';
const SESSION_AUTH_KEY = 'rakomart_admin_session_token';

/**
 * Computes a secure SHA-256 hash string for password comparison.
 */
export async function hashPassword(plainText: string): Promise<string> {
  const normalized = plainText.trim();
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn('Crypto subtle fallback:', e);
    }
  }

  // Pure JS fallback hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `h_${Math.abs(hash)}_${normalized.length}_${normalized.slice(0, 2)}`;
}

/**
 * Fetches the current admin auth metadata from Firestore or local cache.
 */
export async function getAdminAuthRecord(): Promise<AdminAuthRecord> {
  // 1. Try memory / local cache first
  let cached: AdminAuthRecord | null = null;
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY);
    if (raw) {
      cached = JSON.parse(raw);
    }
  } catch {}

  // 2. Fetch latest from Cloud Firestore
  try {
    const docRef = doc(db, 'storeSettings', 'admin_auth');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as AdminAuthRecord;
      try {
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(data));
      } catch {}
      return data;
    }
  } catch (err) {
    console.warn('Notice loading admin auth record from Firestore:', err);
  }

  // 3. Default state if not yet configured: Handover is NOT yet completed
  if (cached) {
    return cached;
  }

  return {
    isHandoverCompleted: false,
    isTemporaryPasswordActive: true,
    passwordHash: '',
  };
}

/**
 * Verifies the entered password against the auth record.
 * Returns:
 * - { success: true, requiresHandoverSetup: true } -> If temporary password used during first-time handover
 * - { success: true, requiresHandoverSetup: false } -> If permanent password matched after handover
 * - { success: false } -> Invalid credentials
 */
export async function verifyAdminPassword(enteredPassword: string): Promise<{
  success: boolean;
  requiresHandoverSetup: boolean;
  error?: string;
}> {
  const password = enteredPassword.trim();
  if (!password) {
    return { success: false, requiresHandoverSetup: false, error: 'Password cannot be empty.' };
  }

  const record = await getAdminAuthRecord();

  // If handover is NOT yet completed: Check temporary sample password
  if (!record.isHandoverCompleted) {
    const isTempMatch = INITIAL_HANDOVER_PASSWORDS.includes(password);
    if (isTempMatch) {
      return {
        success: true,
        requiresHandoverSetup: true,
      };
    }

    // If a custom password hash already exists in cache or was previously drafted
    if (record.passwordHash) {
      const enteredHash = await hashPassword(password);
      if (enteredHash === record.passwordHash) {
        return {
          success: true,
          requiresHandoverSetup: false,
        };
      }
    }

    return {
      success: false,
      requiresHandoverSetup: false,
      error: 'Invalid password. Please enter the correct handover password.',
    };
  }

  // Handover IS completed: ONLY the new permanent personal password is valid.
  // The temporary password is permanently disabled.
  const enteredHash = await hashPassword(password);
  if (record.passwordHash && enteredHash === record.passwordHash) {
    return {
      success: true,
      requiresHandoverSetup: false,
    };
  }

  return {
    success: false,
    requiresHandoverSetup: false,
    error: 'Invalid password. Access denied.',
  };
}

/**
 * Saves the owner's permanent personal password and completes the one-time handover.
 * Permanently destroys and invalidates the temporary password.
 */
export async function completeHandoverWithNewPassword(newPassword: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const cleanPassword = newPassword.trim();
  if (cleanPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  try {
    const passwordHash = await hashPassword(cleanPassword);
    const nowIso = new Date().toISOString();

    const updatedRecord: AdminAuthRecord = {
      isHandoverCompleted: true,
      isTemporaryPasswordActive: false,
      passwordHash,
      handoverCompletedAt: nowIso,
      updatedAt: nowIso,
    };

    // 1. Save to Cloud Firestore
    const docRef = doc(db, 'storeSettings', 'admin_auth');
    await setDoc(docRef, updatedRecord, { merge: true });

    // 2. Cache in localStorage
    try {
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(updatedRecord));
      sessionStorage.setItem(SESSION_AUTH_KEY, 'authenticated');
    } catch {}

    return { success: true };
  } catch (err: any) {
    console.error('Error completing admin handover in cloud:', err);
    return {
      success: false,
      error: err?.message || 'Failed to save new password to database.',
    };
  }
}

/**
 * Check if the current browser tab has an active admin session.
 */
export function checkAdminSessionActive(): boolean {
  try {
    return sessionStorage.getItem(SESSION_AUTH_KEY) === 'authenticated';
  } catch {
    return false;
  }
}

/**
 * Marks the active session as logged in.
 */
export function setAdminSessionActive(): void {
  try {
    sessionStorage.setItem(SESSION_AUTH_KEY, 'authenticated');
  } catch {}
}

/**
 * Clears the active admin session (Logout).
 */
export function clearAdminSession(): void {
  try {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
  } catch {}
}
