import { StorageData } from '../../shared/types';
import { ExtensionError } from '../../shared/utils/error-handling';

export class StorageHandler {
  async getStorageData(tabId: number): Promise<StorageData> {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: this.extractStorageData
      });

      return results?.[0]?.result || { localStorage: {}, sessionStorage: {} };
    } catch (error) {
      console.error('Error getting storage data:', error);
      return { localStorage: {}, sessionStorage: {} };
    }
  }

  async restoreStorageData(tabId: number, data: StorageData): Promise<void> {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: this.injectStorageData,
        args: [data.localStorage, data.sessionStorage]
      });
    } catch (error) {
      throw new ExtensionError(`Failed to restore storage data: ${error}`);
    }
  }

  async clearStorageData(tabId: number): Promise<void> {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        func: this.clearStorage
      });
    } catch (error) {
      throw new ExtensionError(`Failed to clear storage data: ${error}`);
    }
  }

  private extractStorageData(): StorageData {
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
      console.error('Error extracting storage data:', error);
      return { localStorage: {}, sessionStorage: {} };
    }
  }

  private injectStorageData(localData: Record<string, string>, sessionData: Record<string, string>): boolean {
    try {
      // Clear existing storage
      localStorage.clear();
      sessionStorage.clear();

      // Restore localStorage
      Object.entries(localData).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });

      // Restore sessionStorage
      Object.entries(sessionData).forEach(([key, value]) => {
        sessionStorage.setItem(key, value);
      });

      return true;
    } catch (error) {
      console.error('Error injecting storage data:', error);
      return false;
    }
  }

  private clearStorage(): boolean {
    try {
      localStorage.clear();
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}