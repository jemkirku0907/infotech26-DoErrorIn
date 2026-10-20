import sourcesData from '../data/sources.json';
import { Citation, SourceChunk } from './types';

const sources: SourceChunk[] = sourcesData as SourceChunk[];

/**
 * Normalizes text for robust citation verification:
 * - lowercase
 * - strips punctuation & excess whitespace
 * - normalizes quotes
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[“”"']/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates a citation against the official document chunks.
 * Enforces rule 1a: Citations must be validated in code — the cited page
 * must exist in the retrieved chunks/sources, otherwise dropped or flagged.
 */
export function verifyCitation(citation: Citation): boolean {
  if (!citation.source || !citation.page || !citation.quote) {
    return false;
  }

  const cleanSource = citation.source.toLowerCase().trim();
  const baseSource = cleanSource.endsWith('.pdf') ? cleanSource : `${cleanSource}.pdf`;

  // Find corresponding source page chunks
  const pageChunks = sources.filter(
    s => s.source.toLowerCase() === baseSource && s.page === Number(citation.page)
  );

  if (pageChunks.length === 0) {
    return false;
  }

  const normalizedQuote = normalizeText(citation.quote);
  if (normalizedQuote.length < 5) {
    return false;
  }

  // Check if quote exists in any chunk of that specific page
  return pageChunks.some(chunk => {
    const normalizedChunk = normalizeText(chunk.content);
    return normalizedChunk.includes(normalizedQuote) || normalizedQuote.includes(normalizedChunk.slice(0, 30));
  });
}
