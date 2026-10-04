import { buildInternshipReportPDF } from './generatePdfReport';
import { buildInternshipPresentationPPTX } from './generatePresentation';

/**
 * Downloads the full Internship Project Report in PDF format.
 * Generates dynamically from current live application state.
 */
export async function downloadPdfReport(): Promise<void> {
  try {
    const doc = buildInternshipReportPDF();
    doc.save('Personal_Expense_Tracker_ML_Internship_Report.pdf');
  } catch (err) {
    console.error('Error generating PDF client-side, falling back to static file:', err);
    const link = document.createElement('a');
    link.href = '/Personal_Expense_Tracker_ML_Internship_Report.pdf';
    link.download = 'Personal_Expense_Tracker_ML_Internship_Report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Downloads the Internship Project Presentation in PowerPoint (.pptx) format.
 * Generates dynamically from current live application state.
 */
export async function downloadPresentationPPTX(): Promise<void> {
  try {
    const pres = buildInternshipPresentationPPTX();
    await pres.writeFile({ fileName: 'Personal_Expense_Tracker_ML_Presentation.pptx' });
  } catch (err) {
    console.error('Error generating PPTX client-side, falling back to static file:', err);
    const link = document.createElement('a');
    link.href = '/Personal_Expense_Tracker_ML_Presentation.pptx';
    link.download = 'Personal_Expense_Tracker_ML_Presentation.pptx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
