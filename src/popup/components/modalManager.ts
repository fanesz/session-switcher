import { getElementByIdSafe } from '../utils/dom';
import { CSS_CLASSES } from '../utils/constants';

export class ModalManager {
  private saveModal: HTMLElement;
  private renameModal: HTMLElement;
  private deleteModal: HTMLElement;
  private sessionNameInput: HTMLInputElement;
  private newSessionNameInput: HTMLInputElement;

  constructor() {
    this.saveModal = getElementByIdSafe('saveModal');
    this.renameModal = getElementByIdSafe('renameModal');
    this.deleteModal = getElementByIdSafe('deleteModal');
    this.sessionNameInput = getElementByIdSafe('sessionName');
    this.newSessionNameInput = getElementByIdSafe('newSessionName');

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Save modal events
    getElementByIdSafe('closeSaveModal').addEventListener('click', () => this.hideSaveModal());
    getElementByIdSafe('cancelSave').addEventListener('click', () => this.hideSaveModal());

    // Rename modal events
    getElementByIdSafe('closeRenameModal').addEventListener('click', () => this.hideRenameModal());
    getElementByIdSafe('cancelRename').addEventListener('click', () => this.hideRenameModal());

    // Delete modal events
    getElementByIdSafe('closeDeleteModal').addEventListener('click', () => this.hideDeleteModal());
    getElementByIdSafe('cancelDelete').addEventListener('click', () => this.hideDeleteModal());

    // Enter key handlers for input fields
    this.sessionNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const confirmSaveBtn = getElementByIdSafe('confirmSave');
        confirmSaveBtn.click();
      }
    });

    this.newSessionNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const confirmRenameBtn = getElementByIdSafe('confirmRename');
        confirmRenameBtn.click();
      }
    });

    // Enter key handler for delete modal
    this.deleteModal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.deleteModal.classList.contains(CSS_CLASSES.SHOW)) {
        e.preventDefault();
        const confirmDeleteBtn = getElementByIdSafe('confirmDelete');
        confirmDeleteBtn.click();
      }
    });

    // Escape key handlers for all modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.saveModal.classList.contains(CSS_CLASSES.SHOW)) {
          this.hideSaveModal();
        } else if (this.renameModal.classList.contains(CSS_CLASSES.SHOW)) {
          this.hideRenameModal();
        } else if (this.deleteModal.classList.contains(CSS_CLASSES.SHOW)) {
          this.hideDeleteModal();
        }
      }
    });

    // Close on backdrop click
    this.saveModal.addEventListener('click', (e) => {
      if (e.target === this.saveModal) this.hideSaveModal();
    });

    this.renameModal.addEventListener('click', (e) => {
      if (e.target === this.renameModal) this.hideRenameModal();
    });

    this.deleteModal.addEventListener('click', (e) => {
      if (e.target === this.deleteModal) this.hideDeleteModal();
    });
  }

  showSaveModal(defaultName: string = 'Unnamed Session'): void {
    this.sessionNameInput.value = defaultName;
    this.saveModal.classList.add(CSS_CLASSES.SHOW);
    this.sessionNameInput.focus();
    this.sessionNameInput.select();
  }

  hideSaveModal(): void {
    this.saveModal.classList.remove(CSS_CLASSES.SHOW);
  }

  showRenameModal(currentName: string): void {
    this.newSessionNameInput.value = currentName;
    this.renameModal.classList.add(CSS_CLASSES.SHOW);
    this.newSessionNameInput.focus();
    this.newSessionNameInput.select();
  }

  hideRenameModal(): void {
    this.renameModal.classList.remove(CSS_CLASSES.SHOW);
  }

  showDeleteModal(sessionName: string): void {
    const deleteSessionNameEl = document.getElementById('deleteSessionName');
    if (deleteSessionNameEl) {
      deleteSessionNameEl.textContent = sessionName;
    }
    this.deleteModal.classList.add(CSS_CLASSES.SHOW);
    this.deleteModal.focus();
  }

  hideDeleteModal(): void {
    this.deleteModal.classList.remove(CSS_CLASSES.SHOW);
  }

  getSaveModalInput(): string {
    return this.sessionNameInput.value.trim();
  }

  getRenameModalInput(): string {
    return this.newSessionNameInput.value.trim();
  }
}