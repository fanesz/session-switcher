import { MessageResponse, MessageType } from "@shared/types";

export class ChromeApiService {
  async getCurrentTab(): Promise<chrome.tabs.Tab> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      throw new Error("No active tab found");
    }
    return tabs[0];
  }

  async sendMessage<T>(message: MessageType): Promise<MessageResponse<T>> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response: MessageResponse<T>) => {
        if (chrome.runtime.lastError) {
          resolve({
            success: false,
            error: chrome.runtime.lastError.message,
          });
        } else {
          resolve(response);
        }
      });
    });
  }

  async getStorageData<T>(keys: (keyof T)[]): Promise<T> {
    return chrome.storage.local.get(keys) as Promise<T>;
  }

  async setStorageData(data: Record<string, unknown>): Promise<void> {
    return chrome.storage.local.set(data);
  }
}
