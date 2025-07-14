// Update imports to use your custom wrapper
import { parsePdf } from './pdf-parser-fix';

// Simple PDF text extraction for Node.js environment
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    console.error("No PDF data provided. Buffer:", buffer);
    throw new Error("No PDF data provided");
  }

  try {
    console.log("Starting PDF parsing... Buffer type:", typeof buffer, "Buffer length:", buffer.length);
    
    // Use your custom wrapper instead of directly importing pdf-parse
    const data = await parsePdf(buffer, {
      timeout: 30000,
      max: 0
    });
    
    if (!data || !data.text) {
      console.log("PDF parsing returned no text");
      return "Unable to extract text from this PDF. Please try pasting your CV text directly.";
    }
    
    console.log(`PDF parsing completed. Extracted ${data.text.length} characters. First 200 chars:`, data.text.substring(0, 200));
    return data.text;
  } catch (error) {
    console.error("PDF parsing failed:", error);
    
    // Try a simple text extraction as fallback
    try {
      // Simple text extraction fallback
      const text = buffer.toString('utf8', 0, Math.min(buffer.length, 10000))
                       .replace(/[^\x20-\x7E\n]/g, ' ')
                       .replace(/\s+/g, ' ');
      console.log("Fallback extraction result (first 200 chars):", text.substring(0, 200));
      if (text.length > 100) {
        console.log("Simple text extraction succeeded");
        return text;
      }
    } catch (fallbackError) {
      console.error("Fallback extraction failed:", fallbackError);
    }
    
    return "We encountered an issue parsing your PDF. Please try pasting your CV text directly using the 'Paste Text' option.";
  }
}
