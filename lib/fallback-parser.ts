// A simple fallback parser that attempts to extract text from a PDF buffer
// This is not as robust as pdf-parse but can serve as a backup

export async function fallbackExtractText(buffer: Buffer): Promise<string> {
  try {
    // Convert buffer to string and look for text content
    const bufferString = buffer.toString("utf-8", 0, Math.min(buffer.length, 10000))

    // Simple regex to extract text content from PDF
    // This is a very basic approach and won't work for all PDFs
    const textMatches = bufferString.match(/$$([^)]+)$$/g)

    if (textMatches && textMatches.length > 0) {
      // Extract text from matches and clean it up
      return textMatches
        .map((match) => match.slice(1, -1))
        .join(" ")
        .replace(/\$$\d{3}|n|r|t|f|\\|\(|$$)/g, " ")
    }

    return "Failed to extract text with fallback parser. Please try a different PDF."
  } catch (error) {
    console.error("Fallback parser error:", error)
    return "Error in fallback text extraction."
  }
}
