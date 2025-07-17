import { CSS_CLASSES } from "@popup/utils/constants";
import { getElementByIdSafe } from "@popup/utils/dom";
import { ModalList, ModalInputs } from "@shared/types/modal.types";

export class ModalManager {
  private modals: ModalList;
  private inputs: ModalInputs;

  constructor() {
    this.modals = {
      save: getElementByIdSafe("saveModal"),
      rename: getElementByIdSafe("renameModal"),
      delete: getElementByIdSafe("deleteModal"),
      error: getElementByIdSafe("errorModal")
    };

    this.inputs = {
      sessionName: getElementByIdSafe("sessionName"),
      newSessionName: getElementByIdSafe("newSessionName")
    };

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const closeButtons = [
      { id: "closeSaveModal", modal: "save" },
      { id: "cancelSave", modal: "save" },
      { id: "closeRenameModal", modal: "rename" },
      { id: "cancelRename", modal: "rename" },
      { id: "closeDeleteModal", modal: "delete" },
      { id: "cancelDelete", modal: "delete" },
      { id: "closeErrorModal", modal: "error" },
      { id: "closeErrorModalBtn", modal: "error" }
    ];

    closeButtons.forEach(({ id, modal }) => {
      getElementByIdSafe(id).addEventListener("click", () => this.hide(modal as keyof ModalList));
    });

    // Enter key handlers
    this.inputs.sessionName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        getElementByIdSafe("confirmSave").click();
      }
    });

    this.inputs.newSessionName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        getElementByIdSafe("confirmRename").click();
      }
    });

    // Global event handlers
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideVisible();
      }
      if (e.key === "Enter") {
        if (this.isVisible("delete")) {
          e.preventDefault();
          getElementByIdSafe("confirmDelete").click();
        }
        if (this.isVisible("error")) {
          e.preventDefault();
          getElementByIdSafe("closeErrorModal").click();
        }
      }
    });

    // Backdrop click handlers
    Object.entries(this.modals).forEach(([key, modal]) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) this.hide(key as keyof ModalList);
      });
    });
  }

  private isVisible(modalKey: keyof ModalList): boolean {
    return this.modals[modalKey]?.classList.contains(CSS_CLASSES.SHOW) || false;
  }

  private hideVisible(): void {
    Object.entries(this.modals).forEach(([key, modal]) => {
      if (modal.classList.contains(CSS_CLASSES.SHOW)) {
        this.hide(key as keyof ModalList);
      }
    });
  }

  private show(modalKey: keyof ModalList): void {
    this.modals[modalKey].classList.add(CSS_CLASSES.SHOW);
  }

  private hide(modalKey: keyof ModalList): void {
    this.modals[modalKey].classList.remove(CSS_CLASSES.SHOW);
  }

  showSaveModal(defaultName: string = "Unnamed Session"): void {
    this.inputs.sessionName.value = defaultName;
    this.show("save");
    this.inputs.sessionName.focus();
    this.inputs.sessionName.select();
  }

  showRenameModal(currentName: string): void {
    this.inputs.newSessionName.value = currentName;
    this.show("rename");
    this.inputs.newSessionName.focus();
    this.inputs.newSessionName.select();
  }

  showDeleteModal(sessionName: string): void {
    const deleteSessionNameEl = document.getElementById("deleteSessionName");
    if (deleteSessionNameEl) {
      deleteSessionNameEl.textContent = sessionName;
    }
    this.show("delete");
    this.modals.delete.focus();
  }

  showErrorModal(message: string): void {
    const errorMessageEl = document.getElementById("errorMessage");
    if (errorMessageEl) {
      errorMessageEl.textContent = message;
    }
    this.show("error");
    this.modals.error.focus();
  }

  getSaveModalInput(): string {
    return this.inputs.sessionName.value.trim();
  }

  getRenameModalInput(): string {
    return this.inputs.newSessionName.value.trim();
  }

  hideSaveModal(): void { this.hide("save"); }
  hideRenameModal(): void { this.hide("rename"); }
  hideDeleteModal(): void { this.hide("delete"); }
  hideErrorModal(): void { this.hide("error"); }
}
