import { useState, useEffect, useCallback } from "react";
import { PopupService } from "./services/popup.service";
import { handleError } from "@shared/utils/errorHandling";
import { getDomainFromUrl } from "@shared/utils/domain";
import { CSS_CLASSES, UI_TEXT } from "./utils/constants";
import { formatDate } from "@shared/utils/date";

export default function App() {
  const [popupService] = useState(() => new PopupService());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState("");

  // MARK: - Modal states
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalSessionName, setModalSessionName] = useState("");
  const [currentRenameSessionId, setCurrentRenameSessionId] = useState<string | null>(null);
  const [currentDeleteSessionId, setCurrentDeleteSessionId] = useState<string | null>(null);

  const state = popupService.getState();

  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      const newState = await popupService.initialize();
      setCurrentDomain(newState.currentDomain);
      setError(null);
    } catch (err) {
      setError(handleError(err, "popup.App.initialize"));
    } finally {
      setIsLoading(false);
    }
  }, [popupService]);

  useEffect(() => {
    initialize();

    // MARK: - Tab change listeners
    const tabActivatedListener = async (activeInfo: { tabId: number }) => {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab.url) {
        const newDomain = getDomainFromUrl(tab.url);
        if (newDomain !== currentDomain) {
          await initialize();
        }
      }
    };

    const tabUpdatedListener = async (_: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (changeInfo.status === "complete" && tab.url) {
        const newDomain = getDomainFromUrl(tab.url);
        if (newDomain !== currentDomain) {
          await initialize();
        }
      }
    };

    chrome.tabs.onActivated.addListener(tabActivatedListener);
    chrome.tabs.onUpdated.addListener(tabUpdatedListener);

    return () => {
      chrome.tabs.onActivated.removeListener(tabActivatedListener);
      chrome.tabs.onUpdated.removeListener(tabUpdatedListener);
    };
  }, [initialize, currentDomain]);

  // MARK: - Save Current Session handler

  const handleSaveSession = async () => {
    try {
      setIsLoading(true);
      await popupService.saveCurrentSession(modalSessionName);
      setShowSaveModal(false);
      setModalSessionName("");
    } catch (err) {
      setError(handleError(err, "save session"));
    } finally {
      setIsLoading(false);
    }
  };

  // MARK: - New Session handler

  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      await popupService.createNewSession();
    } catch (err) {
      setError(handleError(err, "create new session"));
    } finally {
      setIsLoading(false);
    }
  };

  // MARK: - Session switch handler

  const handleSessionSwitch = async (sessionId: string) => {
    try {
      setIsLoading(true);
      await popupService.switchToSession(sessionId);
    } catch (err) {
      setError(handleError(err, "switch session"));
    } finally {
      setIsLoading(false);
    }
  };

  // MARK: - Rename handlers

  const handleRenameClick = (sessionId: string) => {
    const session = popupService.getSession(sessionId);
    if (session) {
      setCurrentRenameSessionId(sessionId);
      setModalSessionName(session.name);
      setShowRenameModal(true);
    }
  };

  const handleConfirmRename = async () => {
    if (currentRenameSessionId) {
      try {
        setIsLoading(true);
        await popupService.renameSession(currentRenameSessionId, modalSessionName);
        setShowRenameModal(false);
        setModalSessionName("");
        setCurrentRenameSessionId(null);
      } catch (err) {
        setError(handleError(err, "rename session"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // MARK: - Delete handlers

  const handleDeleteClick = (sessionId: string) => {
    const session = popupService.getSession(sessionId);
    if (session) {
      setCurrentDeleteSessionId(sessionId);
      setModalSessionName(session.name);
      setShowDeleteModal(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (currentDeleteSessionId) {
      try {
        setIsLoading(true);
        await popupService.deleteSession(currentDeleteSessionId);
        setShowDeleteModal(false);
        setCurrentDeleteSessionId(null);
      } catch (err) {
        setError(handleError(err, "delete session"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // MARK: - Getting sessions for domain

  const domainSessions = state.sessions.filter((s) => s.domain === currentDomain);
  const activeSessionId = state.activeSessions[currentDomain];

  // MARK: - Main render

  return (
    <div className={`container ${isLoading ? "loading" : ""}`}>
      {/* MARK: - Header */}
      <header className="header">
        <h1 className="title">
          Session Switcher{" "}
          <a className="byline" href="https://github.com/fanesz/session-switcher">
            by Fanesz
          </a>
          <span className="info-icon">
            i
            <div className="info-tooltip">
              <h4>How to use Session Switcher:</h4>
              <p><strong>1.</strong> Login to your first account</p>
              <p><strong>2.</strong> Press "Save Current Session"</p>
              <p><strong>3.</strong> Press "New Session"</p>
              <p><strong>4.</strong> Login to your other account</p>
              <p><strong>5.</strong> Press "Save Current Session"</p>
              <p><strong>6.</strong> Now you can easily switch between saved sessions!</p>
            </div>
          </span>
        </h1>
        <div className="current-site" id="currentSite">
          {
            isLoading
              ? (currentDomain || "Loading...")
              : (currentDomain || "No Domain Found")
          }
        </div>
      </header>

      <main className="content">
        <div className="actions-top">

          {/* MARK: - Save Current Session */}
          <button
            id="saveBtn"
            className="btn btn-primary"
            onClick={() => {
              setModalSessionName("Unnamed Session");
              setShowSaveModal(true);
            }}
          >
            <span className="btn-icon">💾</span>
            Save Current Session
          </button>

          {/* MARK: - New Session */}
          <button
            id="newSessionBtn"
            className="btn btn-secondary"
            onClick={handleNewSession}
          >
            <span className="btn-icon">🆕</span>
            New Session
          </button>
        </div>

        <div className="sessions-section">
          <h3 className="section-title">Saved Sessions</h3>
          <div id="sessionsList" className="sessions-list">
            {domainSessions.length === 0 && (
              <div className={CSS_CLASSES.NO_SESSIONS}>
                {UI_TEXT.NO_SESSIONS}
              </div>
            )}
            {domainSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const lastUsed = formatDate(session.lastUsed);

              return (
                <div
                  key={session.id}
                  className={`${CSS_CLASSES.SESSION_ITEM} ${isActive ? CSS_CLASSES.ACTIVE : ""}`}
                  onClick={() => handleSessionSwitch(session.id)}
                >
                  <div className="session-info">
                    <div className="session-name">{session.name}</div>
                    <div className="session-meta">
                      {UI_TEXT.LAST_USED} {lastUsed}
                    </div>
                  </div>
                  <div className="session-actions">
                    <button
                      className={`${CSS_CLASSES.SESSION_BTN} rename-btn`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameClick(session.id);
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      className={`${CSS_CLASSES.SESSION_BTN} delete-btn`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(session.id);
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* MARK: - Save Current Session Modal */}
      {showSaveModal && (
        <div className="modal" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Save Session</h2>
              <button className="close-btn" onClick={() => setShowSaveModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="modal-input"
                value={modalSessionName}
                onChange={(e) => setModalSessionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveSession();
                  if (e.key === "Escape") setShowSaveModal(false);
                }}
                placeholder="Session name"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveSession}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK: - Rename Modal */}
      {showRenameModal && (
        <div className="modal" onClick={() => setShowRenameModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rename Session</h2>
              <button className="close-btn" onClick={() => setShowRenameModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="modal-input"
                value={modalSessionName}
                onChange={(e) => setModalSessionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmRename();
                  if (e.key === "Escape") setShowRenameModal(false);
                }}
                placeholder="New session name"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRenameModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmRename}>
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK: - Delete Modal */}
      {showDeleteModal && (
        <div className="modal" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Session</h2>
              <button className="close-btn" onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete "{modalSessionName}"?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK: - Error Modal */}
      {error && (
        <div className="modal" onClick={() => setError(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Error</h2>
              <button className="close-btn" onClick={() => setError(null)}>×</button>
            </div>
            <div className="modal-body">
              <p>{error}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setError(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK: - Loading overlay */}
      {isLoading && (
        <div className="loading"></div>
      )}
    </div>
  );
}
