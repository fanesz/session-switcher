import { SessionData, ActiveSessions } from "../../shared/types";
import { escapeHtml } from "../utils/dom";
import { formatDate } from "../../shared/utils/date";
import { CSS_CLASSES, UI_TEXT } from "../utils/constants";

export class SessionList {
  private container: HTMLElement;
  private onSessionClick?: (sessionId: string) => void;
  private onRenameClick?: (sessionId: string) => void;
  private onDeleteClick?: (sessionId: string) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.addEventListener("click", this.handleClick.bind(this));
  }

  setEventHandlers(handlers: {
    onSessionClick?: (sessionId: string) => void;
    onRenameClick?: (sessionId: string) => void;
    onDeleteClick?: (sessionId: string) => void;
  }): void {
    this.onSessionClick = handlers.onSessionClick;
    this.onRenameClick = handlers.onRenameClick;
    this.onDeleteClick = handlers.onDeleteClick;
  }

  render(sessions: SessionData[], activeSessions: ActiveSessions, currentDomain: string): void {
    const domainSessions = sessions.filter(s => s.domain === currentDomain);
    const activeSessionId = activeSessions[currentDomain];

    if (domainSessions.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.renderSessions(domainSessions, activeSessionId);
  }

  private renderEmptyState(): void {
    this.container.innerHTML = `<div class="${CSS_CLASSES.NO_SESSIONS}">${UI_TEXT.NO_SESSIONS}</div>`;
  }

  private renderSessions(sessions: SessionData[], activeSessionId?: string): void {
    const sessionsHtml = sessions.map(session => {
      const isActive = session.id === activeSessionId;
      const lastUsed = formatDate(session.lastUsed);

      return `
        <div class="${CSS_CLASSES.SESSION_ITEM} ${isActive ? CSS_CLASSES.ACTIVE : ""}" data-session-id="${session.id}">
          <div class="session-info">
            <div class="session-name">${escapeHtml(session.name)}</div>
            <div class="session-meta">${UI_TEXT.LAST_USED} ${lastUsed}</div>
          </div>
          <div class="session-actions">
            <button class="${CSS_CLASSES.SESSION_BTN} rename-btn" data-action="rename" data-session-id="${session.id}">
              ✏️
            </button>
            <button class="${CSS_CLASSES.SESSION_BTN} delete-btn" data-action="delete" data-session-id="${session.id}">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join("");

    this.container.innerHTML = sessionsHtml;
  }

  private handleClick(e: Event): void {
    const target = e.target as HTMLElement;

    if (target.classList.contains(CSS_CLASSES.SESSION_BTN)) {
      e.stopPropagation();
      const action = target.dataset.action;
      const sessionId = target.dataset.sessionId;

      if (!sessionId) return;

      if (action === "rename" && this.onRenameClick) {
        this.onRenameClick(sessionId);
      } else if (action === "delete" && this.onDeleteClick) {
        this.onDeleteClick(sessionId);
      }
      return;
    }

    // Handle session switching
    const sessionItem = target.closest(`.${CSS_CLASSES.SESSION_ITEM}`) as HTMLElement;
    if (sessionItem && this.onSessionClick) {
      const sessionId = sessionItem.dataset.sessionId;
      if (sessionId) {
        this.onSessionClick(sessionId);
      }
    }
  }
}