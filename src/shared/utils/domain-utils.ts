export function extractDomain(hostname: string): string {
  // Remove www. prefix and extract main domain
  return hostname.replace(/^www\./, '');
}

export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const domain = extractDomain(urlObj.hostname);
    
    const isLocalhost = domain === 'localhost' || domain.startsWith('127.');
    const port = urlObj.port;
    
    if (isLocalhost && port) {
      return `${domain}:${port}`;
    }
    
    return domain;
  } catch (error) {
    console.error('Invalid URL:', url);
    return '';
  }
}