export interface OpenRouterResponse {
  choices?: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
    code: number;
    metadata?: {
      raw: string;
      provider_name: string;
      isDownstreamPipeClean: boolean;
      isErrorUpstreamFault: boolean;
    };
  };
}

export interface PDFDocumentInfo {
  textContent: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}

export interface TokenInfo {
  tokensRemaining: number;
  tokensUsed: number;
  lastReset: string;
  nextReset: string;
}
