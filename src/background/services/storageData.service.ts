import { StorageData } from "@shared/types";

export function extractStorageData(): StorageData {
  try {
    const localStorageData: Record<string, string> = {};
    const sessionStorageData: Record<string, string> = {};

    // Extract localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        if (value !== null) {
          localStorageData[key] = value;
        }
      }
    }

    // Extract sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) {
        const value = sessionStorage.getItem(key);
        if (value !== null) {
          sessionStorageData[key] = value;
        }
      }
    }

    return {
      localStorage: localStorageData,
      sessionStorage: sessionStorageData
    };
  } catch (error) {
    console.error("Error extracting storage data:", error);
    return { localStorage: {}, sessionStorage: {} };
  }
}

export function injectStorageData(localData: Record<string, string>, sessionData: Record<string, string>): boolean {
  try {
    localStorage.clear();
    sessionStorage.clear();

    Object.entries(localData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    Object.entries(sessionData).forEach(([key, value]) => {
      sessionStorage.setItem(key, value);
    });

    return true;
  } catch (error) {
    console.error("Error injecting storage data:", error);
    return false;
  }
}

export function clearStorage(): boolean {
  try {
    localStorage.clear();
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error("Error clearing storage:", error);
    return false;
  }
}