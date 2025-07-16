export function validateSessionName(name: string): string {
  const trimmed = name.trim();
  return trimmed || "Unnamed Session";
}

export function isValidDomain(domain: string): boolean {
  return domain.length > 0 && !domain.includes(" ");
}