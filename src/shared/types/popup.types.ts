import { ActiveSessions, SessionData } from "./session.types";

export interface PopupState {
  currentDomain: string;
  currentTab: chrome.tabs.Tab;
  sessions: SessionData[];
  activeSessions: ActiveSessions;
  currentRenameSessionId: string;
  currentDeleteSessionId: string;
}

export interface PopupElements {
  currentSite: HTMLElement;
  saveBtn: HTMLButtonElement;
  newSessionBtn: HTMLButtonElement;
  sessionsList: HTMLElement;
  saveModal: HTMLElement;
  renameModal: HTMLElement;
  deleteModal: HTMLElement;
  sessionNameInput: HTMLInputElement;
  newSessionNameInput: HTMLInputElement;
}
