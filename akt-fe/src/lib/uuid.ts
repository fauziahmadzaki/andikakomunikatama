/**
 * Safe UUID v4 generator with universal fallback.
 * Works in non-secure contexts (HTTP IP addresses) where crypto.randomUUID is not available in browsers.
 */
export function generateUUID(): string {
  if (
    typeof globalThis !== "undefined" &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    try {
      return globalThis.crypto.randomUUID();
    } catch {
      // Fallback below
    }
  }

  // RFC4122 version 4 compliant fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Global polyfill for browser and node environments
if (typeof globalThis !== "undefined") {
  try {
    if (!globalThis.crypto) {
      (globalThis as any).crypto = {};
    }
    if (typeof globalThis.crypto.randomUUID !== "function") {
      Object.defineProperty(globalThis.crypto, "randomUUID", {
        value: generateUUID,
        writable: true,
        configurable: true,
      });
    }
  } catch {
    // If crypto object is strictly sealed/frozen, generateUUID is still imported directly
  }
}
