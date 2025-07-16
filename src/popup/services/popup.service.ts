import { SessionData, PopupState, ExtensionStorage, StoredSession } from "../../shared/types";
import { MESSAGE_ACTIONS } from "../../shared/constants/messages";
import { STORAGE_KEYS } from "../../shared/constants/storageKeys";
import { generateId } from "../../shared/utils/idGenerator";
import { validateSessionName } from "../../shared/utils/validation";
import { getDomainFromUrl } from "../../shared/utils/domain";
import { ExtensionError, handleError } from "../../shared/utils/errorHandling";
import { ChromeApiService } from "./chromeApi.service";
import { storedSessionDefaultValue } from "@popup/utils/defaultValue";

export class PopupService {
  private chromeApi = new ChromeApiService();
  private state: PopupState = {
    currentDomain: "",
    currentTab: {} as chrome.tabs.Tab,
    sessions: [],
    activeSessions: {},
    currentRenameSessionId: "",
    currentDeleteSessionId: ""
  };

  async initialize(): Promise<PopupState> {
    try {
      this.state.currentTab = await this.chromeApi.getCurrentTab();
      if (!this.state.currentTab.url) {
        throw new ExtensionError("Unable to get current tab URL");
      }

      this.state.currentDomain = getDomainFromUrl(this.state.currentTab.url);
      await this.loadStorageData();

      return { ...this.state };
    } catch (error) {
      throw new ExtensionError(handleError(error, "PopupService.initialize"));
    }
  }

  async saveCurrentSession(name: string): Promise<SessionData> {
    try {
      const validatedName = validateSessionName(name);

      const response = await this.chromeApi.sendMessage<StoredSession | null>({
        action: MESSAGE_ACTIONS.GET_CURRENT_SESSION,
        domain: this.state.currentDomain,
        tabId: this.state.currentTab.id!
      });

      if (!response.success) {
        throw new ExtensionError(response.error || "Failed to get current session");
      }

      const storedSession = response.data ?? storedSessionDefaultValue;

      const newSession: SessionData = {
        ...storedSession,
        id: generateId(),
        name: validatedName,
        domain: this.state.currentDomain,
        createdAt: Date.now(),
        lastUsed: Date.now(),
      };

      this.state.sessions.push(newSession);
      this.state.activeSessions[this.state.currentDomain] = newSession.id;
      await this.saveStorageData();

      return newSession;
    } catch (error) {
      throw new ExtensionError(handleError(error, "PopupService.saveCurrentSession"));
    }
  }

  async switchToSession(sessionId: string): Promise<void> {
    try {
      const session = this.state.sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new ExtensionError("Session not found");
      }

      const response = await this.chromeApi.sendMessage({
        action: MESSAGE_ACTIONS.SWITCH_SESSION,
        sessionData: session,
        tabId: this.state.currentTab.id!
      });

      if (!response.success) {
        throw new ExtensionError(response.error || "Failed to switch session");
      }

      this.state.activeSessions[this.state.currentDomain] = sessionId;
      session.lastUsed = Date.now();

      await this.saveStorageData();
    } catch (error) {
      throw new ExtensionError(handleError(error, "PopupService.switchToSession"));
    }
  }

  async createNewSession(): Promise<void> {
    try {
      const response = await this.chromeApi.sendMessage({
        action: MESSAGE_ACTIONS.CLEAR_SESSION,
        domain: this.state.currentDomain,
        tabId: this.state.currentTab.id!
      });

      if (!response.success) {
        throw new ExtensionError(response.error || "Failed to clear session");
      }

      delete this.state.activeSessions[this.state.currentDomain];
      await this.saveStorageData();
    } catch (error) {
      throw new ExtensionError(handleError(error, "PopupService.createNewSession"));
    }
  }

  async renameSession(sessionId: string, newName: string): Promise<void> {
    try {
      const session = this.state.sessions.find(s => s.id === sessionId);
      if (!session) {
        throw new ExtensionError("Session not found");
      }

      session.name = validateSessionName(newName);
      await this.saveStorageData();
    } catch (error) {
      throw new ExtensionError(handleError(error, "PopupService.renameSession"));
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      this.state.sessions = this.state.sessions.filter(s => s.id !== sessionId);

      if (this.state.activeSessions[this.state.currentDomain] === sessionId) {
        delete this.state.activeSessions[this.state.currentDomain];
      }

      await this.saveStorageData();
    } catch (error) {
      throw new ExtensionError(handleError(error, "PopupService.deleteSession"));
    }
  }

  getSession(sessionId: string): SessionData | undefined {
    return this.state.sessions.find(s => s.id === sessionId);
  }

  getState(): PopupState {
    return { ...this.state };
  }

  setState(newState: Partial<PopupState>): void {
    this.state = { ...this.state, ...newState };
  }

  private async loadStorageData(): Promise<void> {
    try {
      const result = await this.chromeApi.getStorageData<ExtensionStorage>([
        STORAGE_KEYS.SESSIONS,
        STORAGE_KEYS.ACTIVE_SESSIONS
      ]);

      this.state.sessions = result[STORAGE_KEYS.SESSIONS] || [];
      this.state.activeSessions = result[STORAGE_KEYS.ACTIVE_SESSIONS] || {};
    } catch (error) {
      console.error("Error loading storage data:", error);
      this.state.sessions = [];
      this.state.activeSessions = {};
    }
  }

  private async saveStorageData(): Promise<void> {
    await this.chromeApi.setStorageData({
      [STORAGE_KEYS.SESSIONS]: this.state.sessions,
      [STORAGE_KEYS.ACTIVE_SESSIONS]: this.state.activeSessions
    });
  }
}
