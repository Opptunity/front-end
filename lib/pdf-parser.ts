// Simple PDF text extraction for Node.js environment
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    throw new Error("No PDF data provided");
  }

  try {
    // Use the pdf-parse package with dynamic import 
    // to avoid issues with server-side rendering
    const pdfParse = await (await import('pdf-parse')).default;
    
    console.log("Starting PDF parsing...");
    
    // Handle case where some code might be trying to load test files
    // If buffer is a string, it might be a path to a test file that doesn't exist
    if (typeof buffer === 'string') {
      console.warn("A path was passed instead of a buffer. This is likely a test file reference.");
      console.warn("Path:", buffer);
      return "This appears to be a test. Please upload a real PDF file.";
    }
    
    // Parse with increased timeout
    const data = await pdfParse(buffer, {
      // Increase timeout to handle larger documents
      timeout: 30000,
      // Only get the text, not metadata
      max: 0
    });
    
    if (!data || !data.text) {
      console.log("PDF parsing returned no text");
      return "Unable to extract text from this PDF. Please try pasting your CV text directly.";
    }
    
    console.log(`PDF parsing completed. Extracted ${data.text.length} characters`);
    return data.text;
  } catch (error) {
    console.error("PDF parsing failed:", error);
    
    // Try a simple text extraction as fallback
    try {
      // Simple text extraction fallback
      const text = buffer.toString('utf8', 0, Math.min(buffer.length, 10000))
                       .replace(/[^\x20-\x7E\n]/g, ' ')
                       .replace(/\s+/g, ' ');
      
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
