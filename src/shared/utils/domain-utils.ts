export function extractDomain(hostname: string): string {
  // Remove www. prefix and extract main domain
  return hostname.replace(/^www\./, '');
}

export function getDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return extractDomain(urlObj.hostname);
  } catch (error) {
    console.error('Invalid URL:', url);
    return '';
  }
}