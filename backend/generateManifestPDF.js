import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import * as getStream from 'get-stream';
import stream from 'stream';

export default async function generateManifestPDF(manifest) {
  const doc = new PDFDocument({ margin: 40 });
  const docStream = new stream.PassThrough();
  doc.pipe(docStream);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

// Set headers

    // --- Header ---
    doc.image(path.join(__dirname, 'logo.JPG'), 40, 40, { width: 150 });
    doc
      .fontSize(10)
      .text('Material Cycle (Pty) Ltd\n14 Brickfield Rd\nSalt River\nCape Town\n7925',{
        align: 'center'
      });
    
      // Positioning
      const pageWidth = doc.page.width;
      const rightBlockWidth = 150;
      const rightX = pageWidth - rightBlockWidth - 40; // For Manifest No.
      const cellWidth = 200;
      const cellX = pageWidth - cellWidth - 40;        // Same as rightX
      const cellY = 80;
      let headerHeight = 15;
      const valueHeight = 15;

      // Manifest No. (just plain text, centered)
      doc.fontSize(10).font('Helvetica-Bold').text('Manifest No.', rightX, 40, {
          width: rightBlockWidth,
          align: 'center'
        });
      doc.fontSize(10).font('Helvetica')
        .fillColor('red')
        .text(manifest.manifest_no, {
          width: rightBlockWidth,
          align: 'center'
        });

      // Draw shaded header for Reference/Delivery Note
      doc.fillColor('#d4f1f9').rect(cellX, cellY, cellWidth, headerHeight).fill();

      // Border around full cell (header + value)
      doc.strokeColor('#000').lineWidth(1).rect(cellX, cellY, cellWidth, headerHeight + valueHeight).stroke();

      // Add header text (centered)
      doc.fillColor('#000').font('Helvetica-Bold').fontSize(10)
        .text('Reference/Delivery Note', cellX, cellY + 3.5, {
          width: cellWidth,
          align: 'center'
        });
        
      doc.moveTo(cellX, cellY + headerHeight).lineTo(cellX + cellWidth, cellY + headerHeight)
      .strokeColor('#000').lineWidth(1).stroke();

      // Add reference number below header
      doc.font('Helvetica').fontSize(10).text(manifest.reference_no, cellX, cellY + headerHeight + 5, {
          width: cellWidth,
          align: 'center'
        });

    let y = 125;
    let startX = 80;
    let gap = 150; 

    let pairs = [
      { label: 'Phone:', value: '087 702 8630' },
      { label: 'After Hours:', value: '063 400 0821' },
      { label: 'Email:', value: 'info@materialcycle.co.za' }
    ];

    let currentX = startX;

    pairs.forEach(({ label, value }) => {
      doc.font('Helvetica-Bold').fontSize(10).text(label, currentX, y);
      const labelWidth = doc.widthOfString(label) + 5; 
      doc.font('Helvetica').text(value, currentX + labelWidth, y);
      currentX += gap;
    });
    y = 135;
    startX = 80;
    gap = 150; // horizontal gap between pairs, adjust as needed

    pairs = [
      { label: 'Reg. No.:', value: '2021/687354/07' },
      { label: 'VAT No.:', value: '444299560' },
      { label: 'IPWIS No.:', value: 'D18070-01' }
    ];

    currentX = startX;

    pairs.forEach(({ label, value }) => {
      doc.font('Helvetica-Bold').fontSize(10).text(label, currentX, y);
      const labelWidth = doc.widthOfString(label) + 5; 
      doc.font('Helvetica').text(value, currentX + labelWidth, y);
      currentX += gap;
    });

    // Section Title
    doc.moveDown()
  .fontSize(12)
  .fillColor('#000000')
  .font('Helvetica-Bold')
  .text('Waste Manifest & Receipt Document', 0, undefined, {
    align: 'center',
    width: doc.page.width,
  });

    doc.moveDown();

    let topY = doc.y;
    let sectionHeight = 100;
    let sectionWidth = 250;
    let labelWidth = 80;
    let valueWidth = sectionWidth - labelWidth;
    let rowHeight = 16;
    let rowPadding = 4;

    // Define Transporter and Generator fields
    const transporterFields = [
      { label: 'Name:', value: manifest.transporter },
      { label: 'Address:', value: manifest.address },
      { label: 'Contact:', value: manifest.transporter_contact },
      { label: 'Contact No:', value: manifest.contact_no },
      { label: 'IPWIS No:', value: manifest.ipwis_no },
    ];

    const generatorFields = [
      { label: 'Name:', value: manifest.generator },
      { label: 'Address:', value: manifest.address },
      { label: 'Contact:', value: manifest.generator_contact },
      { label: 'Contact No:', value: manifest.contact_no },
      { label: 'IPWIS No:', value: manifest.ipwis_no },
    ];

    // Helper to draw a section
    function drawSection(title, x, y, fields) {
      // Header background
      doc
        .fillColor('#d4f1f9')
        .rect(x, y, sectionWidth, rowHeight)
        .fill();

      // Header text
      doc
        .fillColor('#000')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(title, x + rowPadding, y + rowPadding,{
          width: sectionWidth,
          align: 'center'
        });

      // Header border
      doc
        .strokeColor('#000')
        .rect(x, y, sectionWidth, rowHeight)
        .stroke();

      let currentY = y + rowHeight;

      fields.forEach(({ label, value }) => {
        // Label background
        doc
          .fillColor('#d4f1f9')
          .rect(x, currentY, labelWidth, rowHeight)
          .fill();

        // Label text
        doc
          .fillColor('#000')
          .font('Helvetica-Bold')
          .text(label, x + rowPadding, currentY + rowPadding);

        // Value text
        doc
          .font('Helvetica')
          .text(value || '', x + labelWidth + rowPadding, currentY + rowPadding);

        // Full row border
        doc
          .strokeColor('#000')
          .rect(x, currentY, sectionWidth, rowHeight)
          .stroke();

          // Vertical divider between label and value
          const dividerX = x + labelWidth;
          doc
            .moveTo(dividerX, currentY)
            .lineTo(dividerX, currentY + rowHeight)
            .strokeColor('#000')
            .lineWidth(1)
            .stroke();

        currentY += rowHeight;
      });
    }

    // Draw both sections side by side
    drawSection('Waste Transporter', 40, topY, transporterFields);
    drawSection('Waste Generator', 300, topY, generatorFields);

    // Move cursor below that section
    doc.moveDown(2);

    // --- Waste Type Section ---
    // Setup
    rowHeight = 16;
    labelWidth = 80;
    valueWidth = doc.page.width - 101 - labelWidth; // 80 = left+right margins (40 each)
    let checkboxSize = 8;
    rowPadding = 4;

    let sectionX = 40;
    let currentY = doc.y;

    // Reusable checkbox function (label first, then box)
    function drawCheckbox(label, x, y, columnWidth) {
      const labelWidthText = doc.widthOfString(label);
      const totalWidth = labelWidthText + 3 + checkboxSize;

      // Calculate starting X to center the label + checkbox within the column
      const startX = x + (columnWidth - totalWidth) / 2;
      const boxX = startX + labelWidthText + 3;
      const boxY = y;

      doc
        .font('Helvetica')
        .text(label, startX, y - 1);

      doc
        .rect(boxX, boxY, checkboxSize, checkboxSize)
        .stroke();

      if (label === manifest.waste_type || label === manifest.waste_form) {
        // Draw X inside the checkbox
        doc
          .moveTo(boxX, boxY)
          .lineTo(boxX + checkboxSize, boxY + checkboxSize)
          .moveTo(boxX + checkboxSize, boxY)
          .lineTo(boxX, boxY + checkboxSize)
          .stroke();
      }

      doc
        .rect(startX + labelWidthText + 3, y, checkboxSize, checkboxSize)
        .stroke();
    }

    // Function to draw a labeled row with checkboxes
    function drawLabeledCheckboxRow(label, options, x, y) {
      // Draw label background
      doc
        .fillColor('#d4f1f9')
        .rect(x, y, labelWidth, rowHeight)
        .fill();

      // Draw label text
      doc
        .fillColor('#000')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(label, x + rowPadding, y + rowPadding);

      // Draw full border around the row
      doc
        .strokeColor('#000')
        .rect(x, y, labelWidth + valueWidth, rowHeight)
        .stroke();

      // Draw vertical divider between label and value area
      const dividerX = x + labelWidth;
      doc
        .moveTo(dividerX, y)
        .lineTo(dividerX, y + rowHeight)
        .stroke();

      // --- Draw 3-column layout for checkboxes ---
      const numColumns = 3;
      const columnWidth = valueWidth / numColumns;
      const columnXStart = dividerX;

      // Draw vertical borders for each column
      for (let i = 1; i < numColumns; i++) {
        const columnX = columnXStart + columnWidth * i;
        doc
          .moveTo(columnX, y)
          .lineTo(columnX, y + rowHeight)
          .stroke();
      }

      // Distribute options into columns
      const optionsPerColumn = Math.ceil(options.length / numColumns);
      for (let col = 0; col < numColumns; col++) {
        const colX = columnXStart + col * columnWidth + rowPadding;
        const option = options[col]; // Only one option per column, for single-row layout

        if (option) {
          drawCheckbox(option, colX, y + rowPadding, columnWidth);
        }
      }
    } 

    // Draw "Waste Type" row
    drawLabeledCheckboxRow('Waste Type:', ['Hazardous', 'Non-Hazardous', 'Recyclable'], sectionX, currentY);
    currentY += rowHeight;

    // Draw "Waste Form" row
    drawLabeledCheckboxRow('Waste Form:', ['Solid', 'Sludge', 'Liquid'], sectionX, currentY);
    currentY += rowHeight;

    doc.moveDown(1.2);

    // --- Waste Description Table ---
    const pageMargin = 40;
    const tableX = pageMargin;
    const tableWidth = doc.page.width - 50 * 2;
    const tableTop = doc.y;

    // Define relative column proportions
    const colProportions = [0.5, 0.1667, 0.1667, 0.1666]; // Should total to 1
    const colWidths = colProportions.map(p => tableWidth * p);

    // Draw header row background
    doc
      .rect(tableX, tableTop, tableWidth, 20)
      .fillAndStroke('#d4f1f9', '#000');

    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Waste Description', tableX + 5, tableTop + 7)
      .text('Packaging (L)', tableX + colWidths[0] + 5, tableTop + 7)
      .text('Volume (L)', tableX + colWidths[0] + colWidths[1] + 5, tableTop + 7)
      .text('Weight (kg)', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, tableTop + 7);

    // Draw data rows
    const numRows = 4;
    rowHeight = 16;

    for (let i = 0; i < numRows; i++) {
      const rowY = tableTop + 20 + i * rowHeight;

      // Draw row border
      doc
        .fillColor('#000')
        .font('Helvetica')
        .rect(tableX, rowY, tableWidth, rowHeight)
        .stroke();

          // Insert manifest.description into the first row
          if (i === 0) {
            doc
              .font('Helvetica')
              .fontSize(10)
              .fillColor('#000')
              .text(manifest.description || '', tableX + 5, rowY + 4, {
                width: colWidths[0] - 10,
                height: rowHeight,
                ellipsis: true,
              });
            doc
              .font('Helvetica')
              .fontSize(10)
              .fillColor('#000')
              .text(manifest.packaging || '', tableX + colWidths[0] + 5, rowY + 4, {
                width: colWidths[1] - 10,
                height: rowHeight,
                ellipsis: true,
              });
            doc
              .font('Helvetica')
              .fontSize(10)
              .fillColor('#000')
              .text(manifest.volume_l || '', tableX + colWidths[0] + colWidths[1] + 5, rowY + 4, {
                width: colWidths[2] - 10,
                height: rowHeight,
                ellipsis: true,
              });
            doc
              .font('Helvetica')
              .fontSize(10)
              .fillColor('#000')
              .text(manifest.volume_l || '', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 5, rowY + 4, {
                width: colWidths[3] - 10,
                height: rowHeight,
                ellipsis: true,
              });
          }
    }

    // Draw vertical column lines (includes header + data rows)
    let totalHeight = 20 + numRows * rowHeight;
    for (let i = 1; i < colWidths.length; i++) {
      const dividerX = tableX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .moveTo(dividerX, tableTop)
        .lineTo(dividerX, tableTop + totalHeight)
        .stroke();
    }


    doc.moveDown(5);
    // --- Transporter/Generator Declaration Section ---
    let margin = 40;
    let usableWidth = doc.page.width - 50 * 2;
    rowHeight = 27; // slightly reduced to conserve space
    let col1Width = usableWidth * 0.5;
    let col2Width = usableWidth - col1Width;
    let startY = doc.y;

    // --- Outer border (3-row block) ---
    doc
      .strokeColor('#000')
      .rect(margin, startY, usableWidth, rowHeight * 3)
      .stroke();

    // --- LEFT COLUMN HEADING (Row 1 only, blue background) ---
    doc
      .fillColor('#d4f1f9')
      .rect(margin, startY, col1Width, rowHeight)
      .fill();

    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Transporter/Generator Declaration:', margin + 5, startY + 5, {
        width: col1Width - 10,
      });

    // --- LEFT COLUMN TEXT (Row 2–3, white background) ---
    doc
      .fillColor('#000')
      .font('Helvetica')
      .fontSize(9)
      .text(
        'I hereby declare that the waste is fully and accurately described in the above sections and that it has been packaged, labelled, and transported in accordance with the applicable regulations.',
        margin + 5,
        startY + rowHeight + 5,
        {
          width: col1Width - 10,
          lineGap: 2,
          align: 'center'
        }
      );

    // --- RIGHT COLUMN (3 side-heading rows with blue background and value area) ---
    const rightColX = margin + col1Width;
    const sideLabelWidth = 70;
    const sideValueWidth = col2Width - sideLabelWidth;

    // Draw each row
    ['Name', 'Signature', 'Date'].forEach((label, i) => {
      const y = startY + i * rowHeight;

      // Side header background (left part of right column)
      doc
        .fillColor('#d4f1f9')
        .rect(rightColX, y, sideLabelWidth, rowHeight)
        .fill();

      // Side label text
      doc
        .fillColor('#000')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`${label}:`, rightColX + 5, y + 5);

      // Value area (keep white)
      doc
        .strokeColor('#000')
        .rect(rightColX + sideLabelWidth, y, sideValueWidth, rowHeight)
        .stroke();
    });

    // Draw vertical divider between col1 and col2
    doc
      .moveTo(margin + col1Width, startY)
      .lineTo(margin + col1Width, startY + rowHeight * 3)
      .stroke();

    // Advance Y
    doc.y = startY + rowHeight * 3 + 10;

  // --- Management Activity Section ---
  margin = 40;
    sectionWidth = doc.page.width - 50 * 2;
    const checkboxOptions = ['Donation', 'Reuse', 'Sorting', 'Recycling', 'Treatment', 'Storage'];
    checkboxSize = 8;
    rowHeight = 16;
    const colCount = 6;
    const colWidth = sectionWidth / colCount;
    startY = doc.y;

    // Total height: header row + checkbox row
    totalHeight = rowHeight * 2;

    // Draw full table background & border
    doc
      .fillColor('#d4f1f4')
      .rect(margin, startY, sectionWidth, totalHeight)
      .fillAndStroke();

    // Draw header row (full width, light blue)
    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Management Activity', margin + 5, startY + 5,{align:'center'});

    // Draw horizontal line separating header and checkbox row
    doc
      .strokeColor('#000')
      .moveTo(margin, startY + rowHeight)
      .lineTo(margin + sectionWidth, startY + rowHeight)
      .stroke();

    // Draw checkbox row background (white)
    doc
      .fillColor('#fff')
      .rect(margin, startY + rowHeight, sectionWidth, rowHeight)
      .fill();

    // Draw vertical column lines (between checkbox columns) for second row
    for (let i = 1; i < colCount; i++) {
      const x = margin + i * colWidth;
      doc
        .moveTo(x, startY + rowHeight)
        .lineTo(x, startY + totalHeight)
        .stroke();
    }

    // Draw checkboxes + labels centered in each column
    checkboxOptions.forEach((label, i) => {
      const colX = margin + i * colWidth;
      const labelWidth = doc.widthOfString(label);
      const totalWidth = labelWidth + 5 + checkboxSize;
      const startX = colX + (colWidth - totalWidth) / 2;
      const checkboxY = startY + rowHeight + (rowHeight - checkboxSize) / 2;
      const checkboxX = startX + labelWidth + 5;

      // Draw label first
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#000')
        .text(label, startX, checkboxY - 1);

      // Draw checkbox after label
      doc
        .rect(startX + labelWidth + 5, checkboxY, checkboxSize, checkboxSize)
        .stroke();

      if (label === manifest.process) {
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .text('X', checkboxX + 1, checkboxY - 0);
      }
    });

    // Advance Y below table
    doc.y = startY + totalHeight + 10;

    //----"Additional Comments"-----
    margin = 40;
    sectionWidth = doc.page.width - 50 * 2;
    rowHeight = 16;
    const numCommentRows = 4;
    startY = doc.y;
    totalHeight = rowHeight * (1 + numCommentRows); // 1 for header

    // --- Draw full outer border (header + 4 comment rows) ---
    doc
      .strokeColor('#000')
      .rect(margin, startY, sectionWidth, totalHeight)
      .stroke();

    // --- Draw light blue header row ---
    doc
      .fillColor('#d4f1f4')
      .rect(margin, startY, sectionWidth, rowHeight)
      .fill();

    // --- Draw header label ---
    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Additional Comments', margin + 5, startY + 5,{align:'center'});

    // --- Draw horizontal lines to separate each comment row ---
    for (let i = 1; i <= numCommentRows; i++) {
      const y = startY + i * rowHeight;
      doc
        .moveTo(margin, y)
        .lineTo(margin + sectionWidth, y)
        .stroke();
    }
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#000')
      .text(manifest.comments || '', margin + 5, startY + rowHeight + 4, {
        width: sectionWidth - 10,
        height: rowHeight,
        ellipsis: true,
      });

    doc.y = startY + totalHeight + 10;

    // --- Final Disposal ---
    margin = 40;
    sectionWidth = doc.page.width - 50 * 2;
    rowHeight = 16;
    headerHeight = 20;
    const fieldLabels = ['Facility', 'Contact No', 'Date'];
    startY = doc.y;

    // Column widths
    col1Width = 80;  // label
    col2Width = 150; // value
    const col3Width = 100; // "Stamp/Signature"
    const col4Width = sectionWidth - (col1Width + col2Width + col3Width); // remaining for signature box

    // --- Full-width Section Header ("Final Disposal") ---
    doc
      .fillColor('#d4f1f4')
      .rect(margin, startY, sectionWidth, headerHeight)
      .fillAndStroke();

    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Final Disposal', margin + 5, startY + 5, {align:'center'});

    // --- Draw 4-row form block below header ---
    const blockStartY = startY + headerHeight;
    const blockHeight = rowHeight * 3;

    // Outer border for whole block
    doc
      .strokeColor('#000')
      .rect(margin, blockStartY, sectionWidth, blockHeight)
      .stroke();

    // --- Draw horizontal row lines (separating label/value rows) ---
    for (let i = 1; i < 3; i++) {
      const y = blockStartY + i * rowHeight;
      doc
        .moveTo(margin, y)
        .lineTo(margin + col1Width + col2Width, y)
        .stroke();
    }

    // --- Vertical lines: full height columns ---
    const colX1 = margin + col1Width;
    const colX2 = colX1 + col2Width;
    const colX3 = colX2 + col3Width;

    doc
      .moveTo(colX1, blockStartY)
      .lineTo(colX1, blockStartY + blockHeight)
      .stroke();

    doc
      .moveTo(colX2, blockStartY)
      .lineTo(colX2, blockStartY + blockHeight)
      .stroke();

    doc
      .moveTo(colX3, blockStartY)
      .lineTo(colX3, blockStartY + blockHeight)
      .stroke();

    // --- LEFT COLUMN: Labels with light blue background ---
    fieldLabels.forEach((label, i) => {
      const y = blockStartY + i * rowHeight;

      // Background
      doc
        .fillColor('#d4f1f4')
        .rect(margin, y, col1Width, rowHeight)
        .fill();

      // Label
      doc
        .fillColor('#000')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(label + ':', margin + 5, y + 5);
    });

    // --- STAMP/SIGNATURE COLUMN (light blue, spans 4 rows) ---
    doc
      .fillColor('#d4f1f4')
      .rect(colX2, blockStartY, col3Width, blockHeight)
      .fill();

    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Stamp / Signature:', colX2 + 5, blockStartY + 5);

    // Advance doc.y below section
    doc.y = blockStartY + blockHeight + 10;


    doc.end();
  const buffer = await getStream.buffer(docStream);
  return buffer;
}