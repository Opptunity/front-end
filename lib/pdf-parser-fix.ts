import fs from 'fs';
import path from 'path';

export async function getPdfParser() {
  console.log("getPdfParser called");
  try {
    // Dynamically import pdf-parse
    const pdfParseModule = await import('pdf-parse');
    // Return the default export (the parser function)
    return pdfParseModule.default;
  } catch (error) {
    // Catch the specific error related to test files
    if (error instanceof Error && 
        error.message && 
        error.message.includes('no such file or directory') && 
        error.message.includes('05-versions-space.pdf')) {
      console.warn("Ignoring pdf-parse test file error, proceeding with actual parsing");
      // Try importing again with a workaround
      try {
        // Mock fs functionality to handle the test file request
        const originalReadFileSync = fs.readFileSync;
        fs.readFileSync = function(path: fs.PathOrFileDescriptor, options?: any): any {
          if (typeof path === 'string' && path.includes('05-versions-space.pdf')) {
            return Buffer.from('');
          }
          return originalReadFileSync(path, options);
        };
        
        const pdfParseModule = await import('pdf-parse');
        // Restore original function
        fs.readFileSync = originalReadFileSync;
        return pdfParseModule.default;
      } catch (innerError) {
        console.error("Second attempt at importing pdf-parse failed:", innerError);
        throw innerError;
      }
    }
    
    console.error("Error importing pdf-parse:", error);
    throw error;
  }
}

// This function can be used instead of directly importing pdf-parse
export async function parsePdf(buffer: Buffer, options = {}) {
  console.log("parsePdf called. Buffer length:", buffer.length, "Options:", options);
  const parser = await getPdfParser();
  return parser(buffer, options);
} 