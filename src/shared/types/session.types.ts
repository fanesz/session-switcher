export interface SessionData {
  id: string;
  name: string;
  domain: string;
  cookies: chrome.cookies.Cookie[];
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  createdAt: number;
  lastUsed: number;
}

export interface ActiveSessions {
  [domain: string]: string; // domain -> sessionId
}