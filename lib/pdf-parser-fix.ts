import fs from 'fs';
import path from 'path';

export async function getPdfParser() {
  try {
    // Dynamically import pdf-parse
    const pdfParseModule = await import('pdf-parse');
    // Return the default export (the parser function)
    return pdfParseModule.default;
  } catch (error) {
    console.error("Error importing pdf-parse:", error);
    throw error;
  }
}

// This function can be used instead of directly importing pdf-parse
export async function parsePdf(buffer: Buffer, options = {}) {
  const parser = await getPdfParser();
  return parser(buffer, options);
} 