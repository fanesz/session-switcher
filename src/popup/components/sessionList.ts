import { CSS_CLASSES, UI_TEXT } from "@popup/utils/constants";
import { escapeHtml } from "@popup/utils/dom";
import { ActiveSessions, SessionData } from "@shared/types";
import { formatDate } from "@shared/utils/date";

export class SessionList {
  private container: HTMLElement;
  private onSessionClick?: (sessionId: string) => void;
  private onRenameClick?: (sessionId: string) => void;
  private onDeleteClick?: (sessionId: string) => void;
  private onReorder?: (sessionIds: string[]) => void;
  private sessions: SessionData[] = [];
  private reorderMode: boolean = false;
  private originalOrder: SessionData[] = [];
  private pendingOrderChanges: Map<string, number> = new Map();

  constructor(container: HTMLElement) {
    this.container = container;
    this.container.addEventListener("click", this.handleClick.bind(this));
    this.container.addEventListener("input", this.handleInput.bind(this));
  }

  setEventHandlers(handlers: {
    onSessionClick?: (sessionId: string) => void;
    onRenameClick?: (sessionId: string) => void;
    onDeleteClick?: (sessionId: string) => void;
    onReorder?: (sessionIds: string[]) => void;
  }): void {
    this.onSessionClick = handlers.onSessionClick;
    this.onRenameClick = handlers.onRenameClick;
    this.onDeleteClick = handlers.onDeleteClick;
    this.onReorder = handlers.onReorder;
  }

  enableReorderMode(): void {
    this.reorderMode = true;
    this.originalOrder = [...this.sessions];
    this.pendingOrderChanges.clear();
    this.container.classList.add("reorder-mode");
    this.updateSessionsForReorderMode();
  }

  disableReorderMode(): void {
    this.reorderMode = false;
    this.container.classList.remove("reorder-mode");
    this.updateSessionsForReorderMode();
  }

  cancelReorderMode(): void {
    this.sessions = [...this.originalOrder];
    this.pendingOrderChanges.clear();
    this.disableReorderMode();
  }

  isReorderMode(): boolean {
    return this.reorderMode;
  }

  private updateSessionsForReorderMode(): void {
    const sessionItems = this.container.querySelectorAll(`.${CSS_CLASSES.SESSION_ITEM}`);
    sessionItems.forEach((item) => {
      const element = item as HTMLElement;
      const editOrderInput = element.querySelector(".reorder-input") as HTMLInputElement;
      const normalActions = element.querySelector(".session-actions") as HTMLInputElement;

      if (this.reorderMode) {
        if (editOrderInput) editOrderInput.style.display = "block";
        if (normalActions) normalActions.style.display = "none";
      } else {
        if (editOrderInput) editOrderInput.style.display = "none";
        if (normalActions) normalActions.style.display = "flex";
      }
    });
  }

  render(sessions: SessionData[], activeSessions: ActiveSessions, currentDomain: string): void {
    this.sessions = sessions.filter((s) => s.domain === currentDomain)
      .sort((a, b) => a.order - b.order);
    const activeSessionId = activeSessions[currentDomain];

    if (this.sessions.length === 0) {
      this.renderEmptyState();
      return;
    }

    this.renderSessions(this.sessions, activeSessionId);
  }

  private renderEmptyState(): void {
    this.container.innerHTML = `<div class="${CSS_CLASSES.NO_SESSIONS}">${UI_TEXT.NO_SESSIONS}</div>`;
  }

  private renderSessions(sessions: SessionData[], activeSessionId?: string): void {
    const sessionsHtml = sessions
      .map((session: SessionData) => {
        const isActive = session.id === activeSessionId;
        const lastUsed = formatDate(session.lastUsed);

        return `
        <div class="${CSS_CLASSES.SESSION_ITEM} ${isActive ? CSS_CLASSES.ACTIVE : ""}" data-session-id="${session.id}" data-order="${session.order}">
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
          <div class="reorder-input">
            <input value="${session.order}" data-session-id="${session.id}" />
          </div>
        </div>
      `;
      })
      .join("");

    this.container.innerHTML = sessionsHtml;
    if (this.reorderMode) {
      this.updateSessionsForReorderMode();
    }
  }

  private handleInput(e: Event): void {
    const target = e.target as HTMLInputElement;

    if (target.matches(".reorder-input input")) {
      const sessionId = target.dataset.sessionId;
      const newOrder = parseInt(target.value, 10);

      if (sessionId && !isNaN(newOrder)) {
        this.pendingOrderChanges.set(sessionId, newOrder);
      }
    }
  }

  private handleClick(e: Event): void {
    const target = e.target as HTMLElement;

    // Prevent all interactions in reorder mode except input changes
    if (this.reorderMode) {
      return;
    }

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

  saveReorderedSessions(): void {
    if (!this.onReorder) return;

    // Apply pending order changes to sessions
    this.sessions.forEach((session) => {
      if (this.pendingOrderChanges.has(session.id)) {
        session.order = this.pendingOrderChanges.get(session.id)!;
      }
    });

    // Sort by the new order values and return session IDs
    const result: string[] = this.sessions
      .sort((a, b) => a.order - b.order)
      .map((session) => session.id);

    this.pendingOrderChanges.clear();
    this.onReorder(result);
  }
}
