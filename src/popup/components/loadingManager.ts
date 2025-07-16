import { CSS_CLASSES } from "../utils/constants";

export class LoadingManager {
  private isLoading = false;

  showLoading(): void {
    if (!this.isLoading) {
      document.body.classList.add(CSS_CLASSES.LOADING);
      this.isLoading = true;
    }
  }

  hideLoading(): void {
    if (this.isLoading) {
      document.body.classList.remove(CSS_CLASSES.LOADING);
      this.isLoading = false;
    }
  }

  async withLoading<T>(operation: () => Promise<T>): Promise<T> {
    try {
      this.showLoading();
      return await operation();
    } finally {
      this.hideLoading();
    }
  }
}