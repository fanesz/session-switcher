import { SessionData } from "./session.types";

export interface BaseMessage {
  action: string;
}

export interface GetCurrentSessionMessage extends BaseMessage {
  action: 'getCurrentSession';
  domain: string;
  tabId: number;
}

export interface SwitchSessionMessage extends BaseMessage {
  action: 'switchSession';
  sessionData: SessionData;
  tabId: number;
}

export interface ClearSessionMessage extends BaseMessage {
  action: 'clearSession';
  domain: string;
  tabId: number;
}

export type MessageType = GetCurrentSessionMessage | SwitchSessionMessage | ClearSessionMessage;

export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}