// Utility to extract plain text from JIRA's rich text/ADF (Atlassian Document Format) objects

/**
 * Extract plain text from JIRA description which can be either string or ADF object
 */
export function extractTextFromJiraDescription(description: any): string {
  if (!description) {
    return ''
  }
  
  // If it's already a string, return it
  if (typeof description === 'string') {
    return description
  }
  
  // If it's an object, try to extract text from ADF (Atlassian Document Format)
  if (typeof description === 'object') {
    return extractTextFromADF(description)
  }
  
  return String(description)
}

/**
 * Extract text content from Atlassian Document Format (ADF) object
 */
function extractTextFromADF(adfObject: any): string {
  if (!adfObject || typeof adfObject !== 'object') {
    return ''
  }
  
  const textParts: string[] = []
  
  function traverse(node: any) {
    if (!node) return
    
    // If this node has text content, add it
    if (node.text && typeof node.text === 'string') {
      textParts.push(node.text)
    }
    
    // Handle specific node types
    if (node.type) {
      switch (node.type) {
        case 'paragraph':
        case 'text':
          // Already handled above
          break
        case 'hardBreak':
          textParts.push('\n')
          break
        case 'bullet_list':
        case 'ordered_list':
          // Add spacing around lists
          if (textParts.length > 0 && textParts[textParts.length - 1] !== '\n') {
            textParts.push('\n')
          }
          break
        case 'listItem':
          textParts.push('- ')
          break
        case 'heading':
          // Add spacing around headings
          if (textParts.length > 0) {
            textParts.push('\n\n')
          }
          break
        default:
          // For unknown types, just traverse content if it exists
          break
      }
    }
    
    // Recursively process children - ONLY ONCE
    if (Array.isArray(node.content)) {
      node.content.forEach(traverse)
    }
    
    // Add line break after paragraphs and headings
    if (node.type === 'paragraph' || (node.type && node.type.includes('heading'))) {
      textParts.push('\n')
    }
  }
  
  traverse(adfObject)
  
  // Clean up the extracted text
  return textParts
    .join('')
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/^\s+|\s+$/g, '') // Trim whitespace from start/end
}

/**
 * Extract text from various JIRA text formats including:
 * - Plain text strings
 * - ADF (Atlassian Document Format) objects  
 * - Legacy wiki markup
 * - HTML content
 */
export function extractJiraTextContent(content: any): string {
  if (!content) {
    return ''
  }
  
  // Handle string content
  if (typeof content === 'string') {
    // Check if it's HTML
    if (content.includes('<') && content.includes('>')) {
      return extractTextFromHTML(content)
    }
    return content
  }
  
  // Handle ADF object
  if (typeof content === 'object' && content.type) {
    return extractTextFromADF(content)
  }
  
  // Try to convert to string as fallback
  return String(content)
}

/**
 * Simple HTML text extraction
 */
function extractTextFromHTML(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim()
} 