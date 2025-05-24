export class CookieHandler {
  async getCookiesForDomain(domain: string): Promise<chrome.cookies.Cookie[]> {
    try {
      return await chrome.cookies.getAll({ domain });
    } catch (error) {
      console.error('Error getting cookies for domain:', domain, error);
      return [];
    }
  }

  async clearCookiesForDomain(domain: string): Promise<void> {
    const cookies = await this.getCookiesForDomain(domain);

    const clearPromises = cookies.map(async (cookie) => {
      try {
        const url = this.buildCookieUrl(cookie);
        await chrome.cookies.remove({ url, name: cookie.name });
      } catch (error) {
        
        console.warn('Failed to remove cookie:', cookie.name, error);
      }
    });

    await Promise.all(clearPromises);
  }

  async restoreCookies(cookies: chrome.cookies.Cookie[]): Promise<void> {
    const restorePromises = cookies.map(async (cookie) => {
      try {
        const cookieDetails = this.prepareCookieForRestore(cookie);
        await chrome.cookies.set(cookieDetails);
      } catch (error) {
        console.warn('Failed to restore cookie:', cookie.name, error);
      }
    });

    await Promise.all(restorePromises);
  }

  private buildCookieUrl(cookie: chrome.cookies.Cookie): string {
    const protocol = cookie.secure ? 'https' : 'http';
    const domain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
    return `${protocol}://${domain}${cookie.path}`;
  }

  private prepareCookieForRestore(cookie: chrome.cookies.Cookie): chrome.cookies.SetDetails {
    const cleanedDomain = cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain;
    const url = this.buildCookieUrl(cookie);

    const cookieDetails: chrome.cookies.SetDetails = {
      url,
      name: cookie.name,
      value: cookie.value,
      domain: cleanedDomain,
      path: cookie.path,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly
    };

    // Add expiration for persistent cookies
    if (!cookie.session && cookie.expirationDate) {
      cookieDetails.expirationDate = cookie.expirationDate;
    }

    // Add SameSite if available
    if (cookie.sameSite) {
      cookieDetails.sameSite = cookie.sameSite;
    }

    return cookieDetails;
  }
}