import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export async function generatePDF(elementId: string, filename = "assessment-results.pdf") {
  // Get the element to be converted to PDF
  const element = document.getElementById(elementId)
  if (!element) {
    console.error("Element not found")
    return
  }

  try {
    // Show a loading state or notification here if needed

    // Use html2canvas to capture the element as an image
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for images
      logging: false,
      backgroundColor: "#ffffff",
    })

    // Calculate dimensions to maintain aspect ratio
    const imgWidth = 210 // A4 width in mm (210mm × 297mm)
    const pageHeight = 297 // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Create PDF with A4 dimensions
    const pdf = new jsPDF("p", "mm", "a4")
    let position = 0

    // Add company logo or header if needed
    pdf.setFontSize(18)
    pdf.setTextColor(79, 70, 229) // Indigo color
    pdf.text("Workforce Skills Assessment Results", 105, 15, { align: "center" })
    pdf.setFontSize(12)
    pdf.setTextColor(100, 116, 139) // Slate-500
    pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: "center" })

    // Add a line
    pdf.setDrawColor(226, 232, 240) // Slate-200
    pdf.setLineWidth(0.5)
    pdf.line(20, 25, 190, 25)

    position = 30 // Start position after header

    // Add the captured image to the PDF
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)

    // If content exceeds a page, handle pagination
    let heightLeft = imgHeight

    while (heightLeft >= pageHeight - position) {
      position = 0
      heightLeft -= pageHeight - position
      pdf.addPage()
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position - (imgHeight - heightLeft), imgWidth, imgHeight)
    }

    // Add footer with page numbers
    const pageCount = pdf.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i)
      pdf.setFontSize(10)
      pdf.setTextColor(148, 163, 184) // Slate-400
      pdf.text(`Page ${i} of ${pageCount} | Powered by Opptunity`, 105, 290, { align: "center" })
    }

    // Save the PDF
    pdf.save(filename)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    return false
  }
}

