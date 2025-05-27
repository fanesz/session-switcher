import { StorageData } from '../../shared/types';
import { ExtensionError } from '../../shared/utils/error-handling';
import { clearStorage, extractStorageData, injectStorageData } from '../services/storageData-service';

export class StorageHandler {
  async getStorageData(tabId: number): Promise<StorageData> {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: extractStorageData
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
        func: injectStorageData,
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
        func: clearStorage
      });
    } catch (error) {
      throw new ExtensionError(`Failed to clear storage data: ${error}`);
    }
  }
}