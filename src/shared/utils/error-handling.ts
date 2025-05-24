export class ExtensionError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'ExtensionError';
  }
}

export function handleError(error: unknown, context: string): string {
  console.error(`Error in ${context}:`, error);
  
  if (error instanceof ExtensionError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}