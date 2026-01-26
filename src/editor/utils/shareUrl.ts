import pako from 'pako';
import type { MechanicData } from '../../data/types';
import { validateMechanic, sanitizeMechanic } from './validateMechanic';

const URL_PARAM = 'data';
const MAX_URL_LENGTH = 8000;

// URL-safe Base64 encoding (RFC 4648)
function toUrlSafeBase64(data: Uint8Array): string {
  const binary = Array.from(data).map(byte => String.fromCharCode(byte)).join('');
  const base64 = btoa(binary);
  // Replace + with -, / with _, remove padding =
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// URL-safe Base64 decoding
function fromUrlSafeBase64(str: string): Uint8Array {
  // Restore standard Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if needed
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  return new Uint8Array(binary.split('').map(c => c.charCodeAt(0)));
}

export interface EncodeResult {
  url: string;
  isLong: boolean;
  length: number;
}

export function encodeMechanicToUrl(mechanic: MechanicData, baseUrl?: string): EncodeResult {
  // Serialize to JSON
  const json = JSON.stringify(mechanic);

  // Compress with gzip
  const compressed = pako.deflate(json);

  // Encode to URL-safe Base64
  const encoded = toUrlSafeBase64(compressed);

  // Build URL
  const base = baseUrl || window.location.origin + window.location.pathname;
  const url = `${base}?${URL_PARAM}=${encoded}`;

  return {
    url,
    isLong: url.length > MAX_URL_LENGTH,
    length: url.length,
  };
}

export interface DecodeResult {
  success: boolean;
  mechanic?: MechanicData;
  error?: string;
}

export function decodeMechanicFromUrl(urlOrParam?: string): DecodeResult {
  try {
    let encoded: string | null = null;

    if (urlOrParam) {
      // If it's a full URL, parse it
      if (urlOrParam.includes('?')) {
        const url = new URL(urlOrParam);
        encoded = url.searchParams.get(URL_PARAM);
      } else {
        // Assume it's just the encoded data
        encoded = urlOrParam;
      }
    } else {
      // Get from current URL
      const params = new URLSearchParams(window.location.search);
      encoded = params.get(URL_PARAM);
    }

    if (!encoded) {
      return { success: false, error: 'URLにデータが含まれていません' };
    }

    // Decode from URL-safe Base64
    const compressed = fromUrlSafeBase64(encoded);

    // Decompress
    const json = pako.inflate(compressed, { to: 'string' });

    // Parse JSON
    const data = JSON.parse(json);

    // Validate
    const validation = validateMechanic(data);
    if (!validation.isValid) {
      const errors = validation.errors.map(e => e.message).join(', ');
      return { success: false, error: `データが不正です: ${errors}` };
    }

    // Sanitize and return
    const mechanic = sanitizeMechanic(data);
    return { success: true, mechanic };

  } catch (err) {
    console.error('Failed to decode mechanic from URL:', err);
    return { success: false, error: 'URLデータの解析に失敗しました' };
  }
}

export function hasSharedData(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has(URL_PARAM);
}

export function clearSharedDataFromUrl(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(URL_PARAM);
  window.history.replaceState({}, '', url.toString());
}
