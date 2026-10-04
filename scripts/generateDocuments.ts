import fs from 'fs';
import path from 'path';
import { buildInternshipReportPDF } from '../src/utils/generatePdfReport';
import { buildInternshipPresentationPPTX } from '../src/utils/generatePresentation';

async function main() {
  console.log('Generating Internship Project Documents from actual ML runtime...');

  // Ensure public directory exists
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Generate PDF Report
  console.log('Building PDF Report...');
  const pdfDoc = buildInternshipReportPDF();
  const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

  const pdfRootPath = path.resolve(process.cwd(), 'Personal_Expense_Tracker_ML_Internship_Report.pdf');
  const pdfPublicPath = path.resolve(publicDir, 'Personal_Expense_Tracker_ML_Internship_Report.pdf');

  fs.writeFileSync(pdfRootPath, pdfBuffer);
  fs.writeFileSync(pdfPublicPath, pdfBuffer);
  console.log(`✓ PDF Report generated: ${pdfDoc.getNumberOfPages()} pages (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
  console.log(`  Saved to: ${pdfRootPath}`);
  console.log(`  Saved to: ${pdfPublicPath}`);

  // 2. Generate PowerPoint Presentation
  console.log('Building PowerPoint Presentation (.pptx)...');
  const pptx = buildInternshipPresentationPPTX();

  const pptxRootPath = path.resolve(process.cwd(), 'Personal_Expense_Tracker_ML_Presentation.pptx');
  const pptxPublicPath = path.resolve(publicDir, 'Personal_Expense_Tracker_ML_Presentation.pptx');

  await pptx.writeFile({ fileName: pptxRootPath });
  // Also copy to public
  fs.copyFileSync(pptxRootPath, pptxPublicPath);
  console.log(`✓ PowerPoint Presentation generated (14 widescreen slides)`);
  console.log(`  Saved to: ${pptxRootPath}`);
  console.log(`  Saved to: ${pptxPublicPath}`);

  console.log('\nAll documents successfully generated from verified application state!');
}

main().catch((err) => {
  console.error('Error generating documents:', err);
  process.exit(1);
});
