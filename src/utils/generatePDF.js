import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateBillPDF = (billData) => {
  const doc = new jsPDF();
  let tableCount = 1; // Counter for Table S.No
  
  // --- Helpers ---
  const n = (val) => (val && val.toString().trim() !== '') ? val : 'Nil';

  const fmtDropdown = (dropdownVal, textVal, defaultVal = 'Normal') => {
    const drop = (dropdownVal && dropdownVal.trim() !== '') ? dropdownVal : defaultVal;
    const text = (textVal && textVal.trim() !== '') ? ` - ${textVal}` : '';
    return drop + text;
  };

  // --- 1. CLINIC HEADER SECTION ---
  // Color "Healthy" in Blue, "Eye Clinic" in Dark Grey
  doc.setFontSize(26);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(30, 64, 175); // Blue
  doc.text("Healthy", 75, 22); 
  doc.setTextColor(40, 40, 40); // Dark Grey
  doc.text("Eye Clinic", 110, 22);
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text("PATIENT MEDICAL REPORT", 105, 30, { align: "center", charSpace: 1 });
  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(1);
  doc.line(14, 34, 196, 34); 

  // --- 2. DOCTOR & PATIENT DETAILS ---
  let currentY = 45;

  // Doctor Details
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text("Dr. Nandhini K", 14, currentY);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text("Consulting Optometrist", 14, currentY + 6);

  currentY += 18;

  // Patient Info Block
  const patient = billData.patient || billData.patientDetails || {};
  const pName = billData.patientName || patient.name || 'Unknown';
  const pMR = billData.mrNo || patient.mrNo || 'N/A';
  const reportDate = billData.createdAt?.toDate 
    ? billData.createdAt.toDate().toLocaleDateString() 
    : new Date().toLocaleDateString();

  // Draw a light background box for Patient Details
  doc.setFillColor(245, 247, 250);
  doc.rect(14, currentY, 182, 35, 'F');
  
  doc.setFontSize(11);
  currentY += 8;

  // Column 1
  doc.setTextColor(30, 64, 175); doc.setFont(undefined, 'bold'); doc.text("Patient Name:", 18, currentY);
  doc.setTextColor(0, 0, 0); doc.text(n(pName), 48, currentY);

  doc.setTextColor(30, 64, 175); doc.text("MR Number:", 115, currentY);
  doc.setTextColor(0, 0, 0); doc.text(n(pMR), 145, currentY);

  // Column 2
  currentY += 8;
  doc.setTextColor(30, 64, 175); doc.text("Age / Gender:", 18, currentY);
  doc.setTextColor(0, 0, 0); doc.text(`${n(patient.age)} Yrs / ${n(patient.gender)}`, 48, currentY);

  doc.setTextColor(30, 64, 175); doc.text("Phone:", 115, currentY);
  doc.setTextColor(0, 0, 0); doc.text(n(patient.phone), 135, currentY);

  // Column 3
  currentY += 8;
  doc.setTextColor(30, 64, 175); doc.text("Visit Date:", 18, currentY);
  doc.setTextColor(0, 0, 0); doc.text(reportDate, 48, currentY);

  // Purpose of Visit (Moved here)
  currentY += 12;
  doc.setTextColor(30, 64, 175); doc.setFont(undefined, 'bold');
  doc.text("Purpose of Visit:", 14, currentY);
  doc.setTextColor(0, 0, 0);
  const purposeText = doc.splitTextToSize(n(billData.purposeOfVisit), 150);
  doc.text(purposeText, 48, currentY);

  currentY += (purposeText.length * 5) + 10;

  // --- 3. HELPER FUNCTION TO DRAW TABLES ---
  const drawNumberedTable = (title, head, body) => {
    if (!body || body.length === 0) return;
    
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(`${tableCount}. ${title}`, 14, currentY);
    tableCount++;

    autoTable(doc, {
      startY: currentY + 4,
      head: [['S.No', ...head]],
      body: body.map((row, index) => [index + 1, ...row]),
      theme: 'grid',
      headStyles: { fillColor: [30, 64, 175], fontStyle: 'bold', fontSize: 10 },
      styles: { fontSize: 10, textColor: [0, 0, 0], fontStyle: 'bold' }, // Body content in Bold Black
      margin: { left: 14, right: 14 },
      columnStyles: { 0: { cellWidth: 12, halign: 'center' } }
    });
    
    currentY = doc.lastAutoTable.finalY + 12;
  };

  // --- 4. DRAWING THE TABLES ---

  const genData = (billData.generalData || []).filter(r => r.eye || r.complaint);
  drawNumberedTable("General Data", ['Eye', 'Complaint', 'Glass', 'Duration', 'Distance'], 
    genData.map(r => [n(r.eye), n(r.complaint), n(r.glass), n(r.duration), n(r.distance)]));

  const meds = (billData.medications || []).filter(r => r.medication);
  drawNumberedTable("Current Medications", ['Medication Name'], 
    meds.map((r) => [n(r.medication)]));

  const va = (billData.visualAcuity || []).filter(r => r.eye);
  drawNumberedTable("Visual Acuity", ['Eye', 'Without Glass', 'With Glass', 'With PH', 'Contact Lens'], 
    va.map(r => [n(r.eye), n(r.withoutGlass), n(r.withGlass), n(r.withPh), n(r.contactLens)]));

  const ref = (billData.refraction || []).filter(r => r.eye);
  drawNumberedTable("Refraction", ['Eye', 'Retinoscopy', 'D.SPH', 'D.CYL', 'Axis'], 
    ref.map(r => [n(r.eye), n(r.retinoscopy), n(r.dsph), n(r.dcyl), n(r.axis)]));

  const gp = (billData.glassPrescription || []).filter(r => r.eye);
  drawNumberedTable("Glass Prescription", ['Eye', 'SPH', 'CYL', 'Axis', 'Add'], 
    gp.map(r => [n(r.eye), n(r.sph), n(r.cyl), n(r.axis), n(r.add)]));

  if (billData.iop && (billData.iop.iopOd || billData.iop.iopOs)) {
    drawNumberedTable("Intraocular Pressure (IOP)", ['Test', 'OD (mmHg)', 'OS (mmHg)', 'Time'], 
      [['Applanation Tonometry', n(billData.iop.iopOd), n(billData.iop.iopOs), n(billData.iop.iopTime)]]);
  }

  if (billData.colourDryEye) {
    const cde = billData.colourDryEye;
    drawNumberedTable("Special Tests (Color/Dry Eye)", ['Test Name', 'OD (Right Eye)', 'OS (Left Eye)'], [
      ['Ishihara Book', n(cde.ishiharaOd), n(cde.ishiharaOs)],
      ['TBUT', n(cde.tbutOd), n(cde.tbutOs)],
      ['Schirmer\'s Test', n(cde.schirmerOd), n(cde.schirmerOs)]
    ]);
  }

  if (billData.corneaAnteriorChamber) {
    const c = billData.corneaAnteriorChamber;
    drawNumberedTable("Anterior Segment Examination", ['Structure', 'OD (Right Eye)', 'OS (Left Eye)'], [
        ['Sclera', fmtDropdown(c.scleraOd, c.scleraOdText), fmtDropdown(c.scleraOs, c.scleraOsText)],
        ['Cornea', fmtDropdown(c.corneaOd, c.corneaOdText), fmtDropdown(c.corneaOs, c.corneaOsText)],
        ['AC Depth', fmtDropdown(c.acDepthOd, c.acDepthOdText), fmtDropdown(c.acDepthOs, c.acDepthOsText)]
    ]);
  }

  if (billData.irisLens) {
    const i = billData.irisLens;
    drawNumberedTable("Iris & Lens Evaluation", ['Structure', 'OD (Right Eye)', 'OS (Left Eye)'], [
        ['Iris', fmtDropdown(i.irisOd, i.irisOdText), fmtDropdown(i.irisOs, i.irisOsText)],
        ['Lens', fmtDropdown(i.lensOd, i.lensOdText, 'Clear'), fmtDropdown(i.lensOs, i.lensOsText, 'Clear')]
    ]);
  }

  // --- 5. FOOTER ---
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 12, { align: 'center' });
  }

  doc.save(`Report_${pMR}_${pName.replace(/\s+/g, '_')}.pdf`);
};