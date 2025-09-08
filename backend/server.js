// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const getStream = require('get-stream');
const stream = require('stream');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 4000;
const JWT_SECRET = 'u8S9z7mL4pR2dXyqJvWfHt6eNk0CbZGa';
const { exec } = require('child_process');

app.use(cors());
app.use(express.json());

const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});
// Configure nodemailer
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'grootboomunathi@gmail.com',
    pass: 'sddw osay mvde dxyc', 
  },
  tls: {
    rejectUnauthorized: false 
  }
});
const recipients = [
  'ncedosss@gmail.com'
];
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, is_verified, verification_token)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING userid, username, email`,
      [username, email, hashedPassword, false, token]
    );

    // send email
    const verifyUrl = `${backendUrl}/api/verify-email?token=${token}`; // adjust for your frontend/server URL
    await emailTransporter.sendMail({
      to: email,
      subject: "Verify your email",
      html: `
        <h1>Welcome, ${username}!</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verifyUrl}">Activate Account</a>
      `,
    });

    res.json({ message: "User registered. Please check your email to activate your account." });
  } catch (error) {
    console.error(error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Username or email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/api/verify-email", async (req, res) => {
  const { token } = req.query;
  try {
    const result = await pool.query(
      "UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING userid, username, email",
      [token]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Email or password could not be found' });
    }
    
    const user = userResult.rows[0];

    // Block login if email not verified
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Please verify your email before logging in' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    // Generate JWT token
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/api/profile', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userResult = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: userResult.rows[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Email not found' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour from now

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [token, expiry, email]
    );

    const resetLink = `${backendUrl}/api/reset-password?token=${token}`;
    await emailTransporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Click below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: 'Reset link sent' });
  } catch (err) {
    console.log(err);
    console.error(err);
    res.status(500).json({ error: 'Failed to send reset link' });
  }
});
app.post('/api/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      `UPDATE users
       SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL
       WHERE userid = $2`,
      [hashed, result.rows[0].userid]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Reset failed' });
  }
});
app.get('/api/manifests', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT * FROM manifests ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
app.get('/api/manifests-exports', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT * FROM manifests m LEFT JOIN waste_streams ws ON ws.manifest_id = m.id ORDER BY m.id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
app.get('/api/manifests/:id/pdf', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, JWT_SECRET);
    const manifestId = req.params.id;

    const result = await pool.query(`SELECT m.id AS manifestNo, m.transporter AS transporter_name, m.is_saved_for_later, m.reference_no, m.waste_type, m.waste_form, m.type, m.declaration_date,m.declaration_name,m.signature, m.process, m.comments, m.is_stamped, m.actual_disposal_date, m.final_disposal, m.disposal_contact_no, m.disposal_email, mt.address AS transporter_address, mt.contact_person AS transporter_contact, mt.contact_no AS transporter_contact_no, mt.ipwis_no AS transporter_ipwis_no, m.generator AS generator_name, mg.address AS generator_address, mg.contact_person AS generator_contact, mg.contact_no AS generator_contact_no, mg.ipwis_no AS generator_ipwis_no FROM manifests m LEFT JOIN entities mt ON mt.name = m.transporter AND mt.type = 'transporter' LEFT JOIN entities mg ON mg.name = m.generator AND mg.type = 'generator' WHERE m.id = $1`, [manifestId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manifest not found' });
    }
    const manifestTransporter = result.rows[0];

    const wasteItemsResults = await pool.query('SELECT * FROM waste_streams WHERE manifest_id = $1', [manifestId]);

    const wasteItems = wasteItemsResults.rows;

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=manifest-${manifestTransporter.manifest_no}.pdf`);

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    // --- Header ---
    doc.image(path.join(__dirname, 'logo.jpg'), 40, 40, { width: 150 });
    doc
      .fontSize(10)
      .text('Material Cycle (Pty) Ltd\n14 Protea Road\nPhilippi East Industrial\nCape Town\n7925',{
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
      const manifestType = manifestTransporter.is_saved_for_later ? 'Receipt No' : 'Manifest No.';
      // Manifest No. (just plain text, centered)
      doc.fontSize(10).font('Helvetica-Bold').text(manifestType, rightX-28, 40, {
          width: rightBlockWidth,
          align: 'center'
        });
      doc.fontSize(20).font('Helvetica')
        .fillColor('#ff6666')
        .text(manifestTransporter.manifestno, {
          width: rightBlockWidth,
          align: 'center'
        });

      // Draw shaded header for Reference/Delivery Note
      doc.fillColor('#d4f1f9').rect(cellX, cellY, cellWidth-12, headerHeight).fill();

      // Border around full cell (header + value)
      doc.strokeColor('#000').lineWidth(1).rect(cellX, cellY, cellWidth-12, headerHeight + valueHeight).stroke();

      // Add header text (centered)
      doc.fillColor('#000').font('Helvetica-Bold').fontSize(10)
        .text('Reference No', cellX, cellY + 3.5, {
          width: cellWidth,
          align: 'center'
        });
        
      doc.moveTo(cellX, cellY + headerHeight).lineTo(cellX + cellWidth-12, cellY + headerHeight)
      .strokeColor('#000').lineWidth(1).stroke();

      // Add reference number below header
      doc.font('Helvetica').fontSize(10).text(manifestTransporter.reference_no, cellX, cellY + headerHeight + 5, {
          width: cellWidth,
          align: 'center'
        });

    let y = 125;
    let startX = 80;
    let gap = 150; 

    let pairs = [
      { label: 'Phone:', value: '087 702 8630' },
      { label: 'After Hours:', value: '083 400 0821' },
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
    let headingType = manifestTransporter.is_saved_for_later ? 'WASTE RECEIPT' : 'WASTE MANIFEST';
    // Section Title
    doc.moveDown()
  .fontSize(14)
  .fillColor('#000000')
  .font('Helvetica-Bold')
  .text(headingType, 0, undefined, {
    align: 'center',
    width: doc.page.width,
  });

    doc.moveDown();

    let topY = doc.y;
    let sectionWidth = 250;
    let labelWidth = 80;
    let valueWidth = sectionWidth - labelWidth;
    let rowHeight = 16;
    let rowPadding = 4;

    // Define Transporter and Generator fields
    const transporterFields = [
      { label: 'Name:', value: manifestTransporter.transporter_name },
      { label: 'Address:', value: manifestTransporter.transporter_address },
      { label: 'Contact:', value: manifestTransporter.transporter_contact },
      { label: 'Contact No:', value: manifestTransporter.transporter_contact_no },
      { label: 'IPWIS No:', value: manifestTransporter.transporter_ipwis_no },
    ];

    const generatorFields = [
      { label: 'Name:', value: manifestTransporter.generator_name },
      { label: 'Address:', value: manifestTransporter.generator_address },
      { label: 'Contact:', value: manifestTransporter.generator_contact },
      { label: 'Contact No:', value: manifestTransporter.generator_contact_no },
      { label: 'IPWIS No:', value: manifestTransporter.generator_ipwis_no },
    ];

    // --- Step 1: compute max row heights across BOTH tables ---
    function computeRowHeights(fields1, fields2) {
      return fields1.map((f1, i) => {
        const f2 = fields2[i];

        // measure transporter row value
        const valueHeight1 = doc.heightOfString(f1.value || '', {
          width: valueWidth - 2 * rowPadding,
          align: 'left',
        });

        // measure generator row value
        const valueHeight2 = doc.heightOfString(f2.value || '', {
          width: valueWidth - 2 * rowPadding,
          align: 'left',
        });

        // pick max height among both + padding
        return Math.max(rowHeight, valueHeight1 + 2 * rowPadding, valueHeight2 + 2 * rowPadding);
      });
    }

    const syncedRowHeights = computeRowHeights(transporterFields, generatorFields);

    // --- Step 2: Draw function that uses precomputed rowHeights ---
    function drawSection(title, x, y, fields, rowHeights) {
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
        .text(title, x + rowPadding, y + rowPadding, {
          width: sectionWidth,
          align: 'center'
        });

      // Header border
      doc
        .strokeColor('#000')
        .rect(x, y, sectionWidth, rowHeight)
        .stroke();

      let currentY = y + rowHeight;

      fields.forEach(({ label, value }, idx) => {
        const rowH = rowHeights[idx]; // use synced row height
        const labelX = x + rowPadding;
        const valueX = x + labelWidth + rowPadding;
        const maxValueWidth = sectionWidth - labelWidth - 2 * rowPadding;

        // Label background
        doc
          .fillColor('#d4f1f9')
          .rect(x, currentY, labelWidth, rowH)
          .fill();

        // Label text
        doc
          .fillColor('#000')
          .font('Helvetica-Bold')
          .text(label, labelX, currentY + rowPadding, {
            width: labelWidth - 2 * rowPadding,
            continued: false
          });

        // Value text (with wrapping)
        doc
          .font('Helvetica')
          .fillColor('#000')
          .text(value || '', valueX, currentY + rowPadding, {
            width: maxValueWidth,
            align: 'left'
          });

        // Row border
        doc
          .strokeColor('#000')
          .rect(x, currentY, sectionWidth, rowH)
          .stroke();

        // Vertical divider
        const dividerX = x + labelWidth;
        doc
          .moveTo(dividerX, currentY)
          .lineTo(dividerX, currentY + rowH)
          .strokeColor('#000')
          .lineWidth(1)
          .stroke();

        currentY += rowH;
      });
    }

    // --- Step 3: Draw both sections with synced row heights ---
    drawSection('Waste Transporter', 49, topY, transporterFields, syncedRowHeights);
    drawSection('Waste Generator', 310, topY, generatorFields, syncedRowHeights);

    // Move cursor below that section
    if((manifestTransporter.generator_ipwis_no && manifestTransporter.generator_ipwis_no.trim() !== '') || (manifestTransporter.transporter_ipwis_no && manifestTransporter.transporter_ipwis_no.trim() !== '')){
      doc.moveDown(3);
    }else{
      doc.moveDown(2);
    }

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

      const wasteTypes = manifestTransporter.waste_type
      ? manifestTransporter.waste_type.split(',').map(item => item.trim())
      : [];
      const wasteForms = manifestTransporter.waste_form
      ? manifestTransporter.waste_form.split(',').map(item => item.trim())
      : [];
      if (wasteTypes.includes(label) || wasteForms.includes(label)) {
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
    drawLabeledCheckboxRow('Waste Type:', ['Hazardous', 'NonHazardous', 'Recyclable'], sectionX+9.5, currentY);
    currentY += rowHeight;

    // Draw "Waste Form" row
    drawLabeledCheckboxRow('Waste Form:', ['Solid', 'Sludge', 'Liquid'], sectionX+9.5, currentY);
    currentY += rowHeight;

    doc.moveDown(1);

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
      .rect(tableX+9.5, tableTop, tableWidth, 20)
      .fillAndStroke('#d4f1f9', '#000');

    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Waste Description', tableX + 90, tableTop + 7)
      .text('Packaging (L)', tableX + colWidths[0] + 10, tableTop + 7)
      .text('Volume (L)', tableX + colWidths[0] + colWidths[1] + 20, tableTop + 7)
      .text('Weight (kg)', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 20, tableTop + 7);

    // Draw data rows
    rowHeight = 16;
    for (let i = 0; i < wasteItems.length; i++) {
      const rowY = tableTop + 20 + i * rowHeight;
      // Draw row border
      doc
        .fillColor('#000')
        .font('Helvetica')
        .rect(tableX+9.5, rowY, tableWidth, rowHeight)
        .stroke();

      // Insert waste item data
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#000')
        .text(wasteItems[i].description || '', tableX + 15, rowY + 4, {
          width: colWidths[0] - 10,
          height: rowHeight,
          ellipsis: true,
        });

      doc
        .text(wasteItems[i].packaging || '', tableX + colWidths[0] + 28, rowY + 4, {
          width: colWidths[1] - 10,
          height: rowHeight,
          ellipsis: true,
        });

      doc
        .text(wasteItems[i].volume_l || '', tableX + colWidths[0] + colWidths[1] + 35, rowY + 4, {
          width: colWidths[2] - 10,
          height: rowHeight,
          ellipsis: true,
        });

      doc
        .text(wasteItems[i].weight_kg || '', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 37, rowY + 4, {
          width: colWidths[3] - 10,
          height: rowHeight,
          ellipsis: true,
        });
    }

    // Draw vertical column lines (includes header + data rows)
    let totalHeight = 20 + wasteItems.length * rowHeight;
    for (let i = 1; i < colWidths.length; i++) {
      const dividerX = tableX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .moveTo(dividerX, tableTop)
        .lineTo(dividerX, tableTop + totalHeight)
        .stroke();
    }

    doc.moveDown(1);
    // --- Transporter/Generator Declaration Section ---
    let margin = 49.5;
    let usableWidth = doc.page.width - 50 * 2;
    rowHeight = 27; 
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
      .rect(margin+0.65, startY+1, col1Width, rowHeight-12)
      .fill();

    if(manifestTransporter.type === 'Generator'){
      headingType = 'Generator Declaration'
    }else if(manifestTransporter.type === 'Transporter'){
      headingType = 'Transporter Declaration'
    }else{
      headingType = 'Transporter/Generator Declaration'
    }

    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(headingType, margin + 50, startY + 5, {
        width: col1Width - 10,
      });

    doc
      .moveTo(margin, startY + (rowHeight - 12))  
      .lineTo(margin + usableWidth-200, startY + (rowHeight - 12))
      .strokeColor('#000')
      .stroke();

    // --- LEFT COLUMN TEXT (Row 2–3, white background) ---
    doc
      .fillColor('#000')
      .font('Helvetica')
      .fontSize(9)
      .text(
        'I hereby declare that the waste is fully and accurately described in the above sections and that it has been packaged, labelled, and transported in accordance with the applicable regulations.',
        margin + 2,
        startY + rowHeight,
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
    const declarationDate = new Date(manifestTransporter.declaration_date)
    .toISOString()
    .split('T')[0];
    const values = [manifestTransporter.declaration_name, manifestTransporter.signature, declarationDate];
    const labels = ['Name', 'Signature', 'Date'];

    // Draw the signature image first
    if (values[1]) {
      const base64Data = values[1].replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      const sigY = startY + rowHeight; 
      doc.image(imgBuffer, rightColX + sideLabelWidth + 60, sigY - 30, {
        fit: [sideValueWidth + 100, rowHeight + 50],
        align: 'left',
        valign: 'center'
      });
    }

    // Draw each row (labels, lines, and text)
    labels.forEach((label, i) => {
      const y = startY + i * rowHeight;

      // Side header background
      doc
        .fillColor('#d4f1f9')
        .rect(rightColX - 9, y + 2, sideLabelWidth + 12.1, rowHeight - 3)
        .fill();

      // Side label text
      doc
        .fillColor('#000')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`${label}:`, rightColX - 5, y + 9);

      // Bottom line
      const lineY = y + rowHeight;
      doc
        .strokeColor('#000')
        .moveTo(rightColX - 9.5, lineY)
        .lineTo(rightColX - 9.5 + sideLabelWidth + 14, lineY)
        .stroke();

      // Value area box
      doc
        .strokeColor('#000')
        .rect(rightColX + sideLabelWidth + 5.1, y, sideValueWidth - 5, rowHeight)
        .stroke();

      // Text values (skip signature text since image already drawn)
      if (label !== 'Signature') {
        doc
          .fillColor('#000')
          .font('Helvetica')
          .fontSize(10)
          .text(values[i] || '', rightColX + sideLabelWidth + 60, y + 8);
      }
    });

    // Draw vertical divider between col1 and col2
    doc
      .moveTo(margin + col1Width - 9.9, startY)
      .lineTo(margin + col1Width - 9.9, startY + rowHeight * 3)
      .stroke();

    // Advance Y
    doc.y = startY + rowHeight * 3 + 10;
if(manifestType !== 'Receipt No'){
  // --- Management Activity Section ---
  margin = 49.5;
    sectionWidth = doc.page.width - 50 * 2;
    const checkboxOptions = ['Donation', 'Reuse', 'Sorting', 'Recycling', 'Treatment', 'Storage'];
    checkboxSize = 8;
    rowHeight = 16;
    const colCount = 6;
    const colWidth = sectionWidth / colCount;
    startY = doc.y;

    // Total height: header row + checkbox row
    totalHeight = rowHeight * 2;

    // --- Draw table background ---
  doc
    .fillColor('#d4f1f4')
    .rect(margin, startY, sectionWidth, rowHeight)
    .fill(); // header row background

  doc
    .fillColor('#fff')
    .rect(margin, startY + rowHeight, sectionWidth, rowHeight)
    .fill(); // checkbox row background

  // --- Draw outer border ---
  doc
    .lineWidth(1)
    .strokeColor('#000')
    .rect(margin, startY, sectionWidth, totalHeight)
    .stroke();

  // --- Draw horizontal line separating header and checkbox row ---
  doc
    .moveTo(margin, startY + rowHeight)
    .lineTo(margin + sectionWidth, startY + rowHeight)
    .stroke();

  // --- Draw vertical column lines ---
  for (let i = 1; i < colCount; i++) {
    const x = margin + i * colWidth;
    doc
      .moveTo(x, startY+16)
      .lineTo(x, startY + totalHeight)
      .stroke();
  }

  // --- Draw header text ---
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#000')
    .text('Management Activity', margin, startY + 5, { width: sectionWidth, align: 'center' });

  // --- Draw checkboxes + labels centered in each column ---
  checkboxOptions.forEach((label, i) => {
    const colX = margin + i * colWidth;
    const labelWidth = doc.widthOfString(label);
    const totalWidth = labelWidth + 5 + checkboxSize;
    const startX = colX + (colWidth - totalWidth) / 2;
    const checkboxY = startY + rowHeight + (rowHeight - checkboxSize) / 2;

    // Draw label
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#000')
      .text(label, startX, checkboxY - 1);

    // Draw checkbox
    doc
      .rect(startX + labelWidth + 5, checkboxY, checkboxSize, checkboxSize)
      .stroke();

    // Draw X if selected
    const processArray = manifestTransporter.process
      ? manifestTransporter.process.split(',').map(item => item.trim())
      : [];
    if (processArray.includes(label)) {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('X', startX + labelWidth + 6, checkboxY - 0);
    }
  });

  // Advance Y below table
  doc.y = startY + totalHeight + 10;
}

    //----"Additional Comments"-----
    margin = 49.5;
    sectionWidth = doc.page.width - 50 * 2;
    rowHeight = 16;
    const numCommentRows = 4;
    startY = doc.y;
    totalHeight = rowHeight * (1 + numCommentRows); // 1 for header

    let leftWidth = sectionWidth * 0.6;  // 60% for comments
    let rightWidth = sectionWidth * 0.4; // 40% for stamp

    // --- Draw full outer border (header + 4 comment rows) ---
    doc
      .strokeColor('#000')
      .rect(margin, startY, sectionWidth, totalHeight)
      .stroke();

    // --- Draw light blue header row ---
    doc
      .fillColor('#d4f1f4')
      .rect(margin, startY, sectionWidth-1, rowHeight)
      .fill();

    // --- Draw header label ---
    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Additional Comments', margin + 5, startY + 5,{ width: leftWidth - 10, align: 'center' });

    doc
      .text('Stamp', margin + leftWidth + 5, startY + 5, { width: rightWidth - 10, align: 'center' });

    doc
      .moveTo(margin, startY + rowHeight)           
      .lineTo(margin + sectionWidth - 1, startY + rowHeight) 
      .lineWidth(1)                                
      .strokeColor('#000')                         
      .stroke();

    // --- Vertical divider between comments and stamp ---
    doc
      .moveTo(margin + leftWidth, startY)
      .lineTo(margin + leftWidth, startY + totalHeight)
      .stroke();

    // --- Horizontal lines for left side only ---
    for (let i = 1; i <= numCommentRows; i++) {
      const y = startY + i * rowHeight;
      doc
        .moveTo(margin, y)
        .lineTo(margin + leftWidth, y)
        .stroke();
    }
    // --- Render each comment line separately with padding ---
    const comments = (manifestTransporter.comments || '').split('\n');
    const padding = 3; // space from top of row
    comments.forEach((line, index) => {
      if (index < numCommentRows) { // limit to available rows
        const yPos = startY + rowHeight * (index + 1) + padding;
        doc.font('Helvetica')
          .fontSize(10)
          .fillColor('#000')
          .text(line, margin + 5, yPos, { width: leftWidth - 10, height: rowHeight - padding, ellipsis: true });
      }
    });
      // --- Render stamp image in right column ---
      if (manifestTransporter.is_stamped) {
        const stampPath = path.join(__dirname, 'stamp.png');
        if (fs.existsSync(stampPath)) {
          const stampImage = fs.readFileSync(stampPath);
          doc.image(stampImage,
            margin + leftWidth + 5.5,         
            startY + rowHeight + 5,          
            {
              width: rightWidth - 12,
              height: totalHeight - rowHeight - 7,
              align: 'center',
              valign: 'center',
            }
          );
        }
      }

    doc.y = startY + totalHeight + 10;
if(manifestType !== 'Receipt No'){
    // --- Final Disposal Section ---
    margin = 49.5;
    sectionWidth = doc.page.width - 50 * 2;
    rowHeight = 16;
    const numRows = 4;
    startY = doc.y;
    totalHeight = rowHeight * (1 + numRows); // header + 4 rows

    // Column split (60% left, 40% right)
    leftWidth = sectionWidth * 0.6;
    rightWidth = sectionWidth * 0.4;

    // --- Outer border for whole section ---
    doc
      .strokeColor('#000')
      .rect(margin, startY, sectionWidth, totalHeight)
      .stroke();

    // --- Header row background ---
    doc
      .fillColor('#d4f1f4')
      .rect(margin+1, startY, sectionWidth-2, rowHeight)
      .fill();

    // --- Column headers ---
    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Final Disposal', margin + 5, startY + 5, {
        width: leftWidth - 10,
        align: 'center',
      });

    doc
      .text('Stamp / Signature', margin + leftWidth + 5, startY + 5, {
        width: rightWidth - 10,
        align: 'center',
      });

    doc
      .moveTo(margin, startY + rowHeight)           
      .lineTo(margin + sectionWidth - 1, startY + rowHeight) 
      .lineWidth(1)                                
      .strokeColor('#000')                         
      .stroke();

    // --- Vertical divider between left and right ---
    doc
      .moveTo(margin + leftWidth, startY)
      .lineTo(margin + leftWidth, startY + totalHeight)
      .stroke();

    // --- Horizontal lines for left side rows ---
    for (let i = 1; i <= numRows; i++) {
      const y = startY + i * rowHeight;
      doc
        .moveTo(margin, y)
        .lineTo(margin + leftWidth, y)
        .stroke();
    }

    // --- Field labels and values ---
    const fieldLabels = ['Facility', 'Contact No', 'Email', 'Date'];
    const dateObj = manifestTransporter.actual_disposal_date
      ? new Date(manifestTransporter.actual_disposal_date)
      : null;
    const formattedDate = dateObj
      ? `${dateObj.getDate().toString().padStart(2, '0')}/${
          (dateObj.getMonth() + 1).toString().padStart(2, '0')
        }/${dateObj.getFullYear()}`
      : '';

    const fieldValues = [
      manifestTransporter.final_disposal || '',
      manifestTransporter.disposal_contact_no || '',
      manifestTransporter.disposal_email || '',
      formattedDate,
    ];

    fieldLabels.forEach((label, i) => {
      const y = startY + rowHeight * (i + 1);
      doc
        .fillColor('#000')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(label + ':', margin + 5, y + 4,{
          width: leftWidth - 75,
          lineBreak: false
        });

      doc
        .fillColor('#000')
        .font('Helvetica')
        .fontSize(9)
        .text(fieldValues[i], margin + 70, y + 4, {
          width: leftWidth - 75,
          ellipsis: true,
          lineBreak: false
        });
    });
    doc.y = startY + totalHeight + 10;
  }

    doc.end();

  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Invalid token' });
  }
});
app.get('/api/entities', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT * FROM entities ORDER BY id ASC');

    res.json(result.rows);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
app.post('/api/entities', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const { type, name, address, contact_person, contact_no, email, ipwis_no } = req.body;

    // Basic validation
    if (!['generator', 'transporter'].includes(type)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }
    if (!name || !address || !contact_no || !contact_person || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await pool.query(
      `INSERT INTO entities (type, name, address, contact_person, contact_no, email, ipwis_no)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [type, name.trim(), address.trim(), contact_person.trim(), contact_no.trim(), email.trim(), ipwis_no.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving entity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.put('/api/entities/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const { id } = req.params;
    const { name, address, contact_person, contact_no, email, ipwis_no } = req.body;

    // Basic validation
    if (!name || !address || !contact_no || !contact_person || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Optional: check if the entity exists first
    const existing = await pool.query('SELECT * FROM entities WHERE id = $1', [id]);
    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    // Update
    const result = await pool.query(
      `UPDATE entities
       SET name = $1, address = $2, contact_person = $3, contact_no = $4, email = $5, ipwis_no = $6
       WHERE id = $7
       RETURNING *`,
      [name.trim(), address.trim(), contact_person.trim(), contact_no.trim(), email.trim(), ipwis_no.trim(), id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating entity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
app.delete('/api/entities/:id', async (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Delete Entity
    const result = await pool.query('DELETE FROM entities WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    res.json({ message: 'Entity deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.post('/api/manifest', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const {
      generator, transporter, waste_type,
      waste_form, process, final_disposal,
      declaration_name, declaration_date,
      contact_no, date, comments, wasteItems,
      isStamped, signature, reference_no, disposal_email, saveForLater, type
    } = req.body;

    const username = decoded.username;
    const insertDate = new Date().toISOString().split('T')[0];
    const now = new Date();
    const insertTime = now.toTimeString().split(' ')[0];

    // Check required fields
    if (!generator || !transporter || !Array.isArray(process) || process.length === 0 ||
        !final_disposal || !contact_no || !date || !declaration_name ||
        !declaration_date || !reference_no || !type) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // 🔹 Check if reference_no already exists
    const existing = await pool.query(
      `SELECT id FROM manifests WHERE reference_no = $1`,
      [reference_no]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'A manifest with this reference number already exists.', manifest: {id: existing.rows[0].id} });
    }

    // 🔹 Get the next manifest_no
    const refResult = await pool.query(`
      SELECT COALESCE(MAX(manifest_no::int), 0) + 1 AS next_manifest FROM manifests
    `);
    const nextManifestNo = refResult.rows[0].next_manifest;

    const wasteTypeString = Array.isArray(waste_type) ? waste_type.join(', ') : waste_type;
    const wasteFormString = Array.isArray(waste_form) ? waste_form.join(', ') : waste_form;
    const processString = process.join(',');

    // 🔹 Insert new manifest
    const result = await pool.query(
      `INSERT INTO manifests (
        reference_no, manifest_no, date, time, username,
        generator, transporter, waste_type, waste_form, process,
        declaration_name, declaration_date, final_disposal,
        disposal_contact_no, actual_disposal_date, comments,
        is_stamped, signature, disposal_email, is_saved_for_later,type
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
      RETURNING *`,
      [
        reference_no, nextManifestNo, insertDate, insertTime, username,
        generator, transporter, wasteTypeString, wasteFormString, processString,
        declaration_name, declaration_date, final_disposal, contact_no,
        date, comments, isStamped, signature, disposal_email, saveForLater,type
      ]
    );

    const manifestId = result.rows[0].id;

    // Insert waste items
    if (Array.isArray(wasteItems) && wasteItems.length > 0) {
      for (const item of wasteItems) {
        await pool.query(
          `INSERT INTO waste_streams (
            manifest_id, description, packaging, volume_l, weight_kg
          ) VALUES ($1,$2,$3,$4,$5)`,
          [manifestId, item.description, item.packaging, item.volume, item.weight]
        );
      }
    }

    res.status(201).json({ success: true, manifest: result.rows[0] });
  } catch (error) {
    console.log(error);
    console.error('Error saving manifest:', error);
    res.status(500).json({ error: 'Failed to save manifest' });
  }
});
app.post('/api/manifest/:manifestId/send-email', async (req, res) => {
  try {
    const manifestId = req.params.manifestId;
    const { showStamp, signature, sendEmail } = req.body;
    const result = await pool.query(`SELECT m.id AS manifestNo, m.transporter AS transporter_name, m.is_saved_for_later, m.reference_no, m.waste_type, m.waste_form, m.type, m.declaration_date,m.declaration_name,m.signature, m.process, m.comments, m.is_stamped, m.actual_disposal_date, m.final_disposal, m.disposal_contact_no, m.disposal_email, mt.address AS transporter_address, mt.contact_person AS transporter_contact, mt.contact_no AS transporter_contact_no, mt.ipwis_no AS transporter_ipwis_no , mt.email AS transporter_email, m.generator AS generator_name, mg.address AS generator_address, mg.contact_person AS generator_contact, mg.contact_no AS generator_contact_no, mg.ipwis_no AS generator_ipwis_no, mg.email AS generator_email FROM manifests m LEFT JOIN entities mt ON mt.name = m.transporter AND mt.type = 'transporter' LEFT JOIN entities mg ON mg.name = m.generator AND mg.type = 'generator' WHERE m.id = $1`, [manifestId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Manifest not found' });
    }

    const manifestTransporter = result.rows[0];
    const wasteItemsResults = await pool.query('SELECT * FROM waste_streams WHERE manifest_id = $1', [manifestId]);

    const wasteItems = wasteItemsResults.rows;

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    const pdfStream = new stream.PassThrough();
    doc.pipe(pdfStream);

    // --- Header ---
    doc.image(path.join(__dirname, 'logo.jpg'), 40, 40, { width: 150 });
    doc
      .fontSize(10)
      .text('Material Cycle (Pty) Ltd\n14 Protea Road\nPhilippi East Industrial\nCape Town\n7925',{
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
      const manifestType = manifestTransporter.is_saved_for_later ? 'Receipt No' : 'Manifest No.';
      // Manifest No. (just plain text, centered)
      doc.fontSize(10).font('Helvetica-Bold').text(manifestType, rightX-28, 40, {
          width: rightBlockWidth,
          align: 'center'
        });
      doc.fontSize(20).font('Helvetica')
        .fillColor('red')
        .text(manifestTransporter.manifestno, {
          width: rightBlockWidth,
          align: 'center'
        });

      // Draw shaded header for Reference/Delivery Note
      doc.fillColor('#d4f1f9').rect(cellX, cellY, cellWidth-12, headerHeight).fill();

      // Border around full cell (header + value)
      doc.strokeColor('#000').lineWidth(1).rect(cellX, cellY, cellWidth-12, headerHeight + valueHeight).stroke();

      // Add header text (centered)
      doc.fillColor('#000').font('Helvetica-Bold').fontSize(10)
        .text('Reference No', cellX, cellY + 3.5, {
          width: cellWidth,
          align: 'center'
        });
        
      doc.moveTo(cellX, cellY + headerHeight).lineTo(cellX + cellWidth-12, cellY + headerHeight)
      .strokeColor('#000').lineWidth(1).stroke();

      // Add reference number below header
      doc.font('Helvetica').fontSize(10).text(manifestTransporter.reference_no, cellX, cellY + headerHeight + 5, {
          width: cellWidth,
          align: 'center'
        });

    let y = 125;
    let startX = 80;
    let gap = 150; 

    let pairs = [
      { label: 'Phone:', value: '087 702 8630' },
      { label: 'After Hours:', value: '083 400 0821' },
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

    let headingType = manifestTransporter.is_saved_for_later ? 'WASTE RECEIPT' : 'WASTE MANIFEST';
    // Section Title
    doc.moveDown()
  .fontSize(14)
  .fillColor('#000000')
  .font('Helvetica-Bold')
  .text(headingType, 0, undefined, {
    align: 'center',
    width: doc.page.width,
  });

    doc.moveDown();

    let topY = doc.y;
    let sectionWidth = 250;
    let labelWidth = 80;
    let valueWidth = sectionWidth - labelWidth;
    let rowHeight = 16;
    let rowPadding = 4;

    // Define Transporter and Generator fields
    const transporterFields = [
      { label: 'Name:', value: manifestTransporter.transporter_name },
      { label: 'Address:', value: manifestTransporter.transporter_address },
      { label: 'Contact:', value: manifestTransporter.transporter_contact },
      { label: 'Contact No:', value: manifestTransporter.transporter_contact_no },
      { label: 'IPWIS No:', value: manifestTransporter.transporter_ipwis_no },
    ];

    const generatorFields = [
      { label: 'Name:', value: manifestTransporter.generator_name },
      { label: 'Address:', value: manifestTransporter.generator_address },
      { label: 'Contact:', value: manifestTransporter.generator_contact },
      { label: 'Contact No:', value: manifestTransporter.generator_contact_no },
      { label: 'IPWIS No:', value: manifestTransporter.generator_ipwis_no },
    ];

    // --- Step 1: compute max row heights across BOTH tables ---
    function computeRowHeights(fields1, fields2) {
      return fields1.map((f1, i) => {
        const f2 = fields2[i];

        // measure transporter row value
        const valueHeight1 = doc.heightOfString(f1.value || '', {
          width: valueWidth - 2 * rowPadding,
          align: 'left',
        });

        // measure generator row value
        const valueHeight2 = doc.heightOfString(f2.value || '', {
          width: valueWidth - 2 * rowPadding,
          align: 'left',
        });

        // pick max height among both + padding
        return Math.max(rowHeight, valueHeight1 + 2 * rowPadding, valueHeight2 + 2 * rowPadding);
      });
    }

    const syncedRowHeights = computeRowHeights(transporterFields, generatorFields);

    // --- Step 2: Draw function that uses precomputed rowHeights ---
    function drawSection(title, x, y, fields, rowHeights) {
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
        .text(title, x + rowPadding, y + rowPadding, {
          width: sectionWidth,
          align: 'center'
        });

      // Header border
      doc
        .strokeColor('#000')
        .rect(x, y, sectionWidth, rowHeight)
        .stroke();

      let currentY = y + rowHeight;

      fields.forEach(({ label, value }, idx) => {
        const rowH = rowHeights[idx]; // use synced row height
        const labelX = x + rowPadding;
        const valueX = x + labelWidth + rowPadding;
        const maxValueWidth = sectionWidth - labelWidth - 2 * rowPadding;

        // Label background
        doc
          .fillColor('#d4f1f9')
          .rect(x, currentY, labelWidth, rowH)
          .fill();

        // Label text
        doc
          .fillColor('#000')
          .font('Helvetica-Bold')
          .text(label, labelX, currentY + rowPadding, {
            width: labelWidth - 2 * rowPadding,
            continued: false
          });

        // Value text (with wrapping)
        doc
          .font('Helvetica')
          .fillColor('#000')
          .text(value || '', valueX, currentY + rowPadding, {
            width: maxValueWidth,
            align: 'left'
          });

        // Row border
        doc
          .strokeColor('#000')
          .rect(x, currentY, sectionWidth, rowH)
          .stroke();

        // Vertical divider
        const dividerX = x + labelWidth;
        doc
          .moveTo(dividerX, currentY)
          .lineTo(dividerX, currentY + rowH)
          .strokeColor('#000')
          .lineWidth(1)
          .stroke();

        currentY += rowH;
      });
    }

    // --- Step 3: Draw both sections with synced row heights ---
    drawSection('Waste Transporter', 49, topY, transporterFields, syncedRowHeights);
    drawSection('Waste Generator', 310, topY, generatorFields, syncedRowHeights);

    // Move cursor below that section
    // Move cursor below that section
    if((manifestTransporter.generator_ipwis_no && manifestTransporter.generator_ipwis_no.trim() !== '') || (manifestTransporter.transporter_ipwis_no && manifestTransporter.transporter_ipwis_no.trim() !== '')){
      doc.moveDown(3);
    }else{
      doc.moveDown(2);
    }

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
      const wasteTypes = manifestTransporter.waste_type
      ? manifestTransporter.waste_type.split(',').map(item => item.trim())
      : [];
      const wasteForms = manifestTransporter.waste_form
      ? manifestTransporter.waste_form.split(',').map(item => item.trim())
      : [];
      if (wasteTypes.includes(label) || wasteForms.includes(label)) {
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
    drawLabeledCheckboxRow('Waste Type:', ['Hazardous', 'NonHazardous', 'Recyclable'], sectionX+9.5, currentY);
    currentY += rowHeight;

    // Draw "Waste Form" row
    drawLabeledCheckboxRow('Waste Form:', ['Solid', 'Sludge', 'Liquid'], sectionX+9.5, currentY);
    currentY += rowHeight;

    doc.moveDown(1);

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
      .rect(tableX+9.5, tableTop, tableWidth, 20)
      .fillAndStroke('#d4f1f9', '#000');

    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Waste Description', tableX + 90, tableTop + 7)
      .text('Packaging (L)', tableX + colWidths[0] + 10, tableTop + 7)
      .text('Volume (L)', tableX + colWidths[0] + colWidths[1] + 20, tableTop + 7)
      .text('Weight (kg)', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 20, tableTop + 7);

    // Draw data rows
    rowHeight = 16;
    for (let i = 0; i < wasteItems.length; i++) {
      const rowY = tableTop + 20 + i * rowHeight;
      // Draw row border
      doc
        .fillColor('#000')
        .font('Helvetica')
        .rect(tableX+9.5, rowY, tableWidth, rowHeight)
        .stroke();

      // Insert waste item data
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#000')
        .text(wasteItems[i].description || '', tableX + 15, rowY + 4, {
          width: colWidths[0] - 10,
          height: rowHeight,
          ellipsis: true,
        });

      doc
        .text(wasteItems[i].packaging || '', tableX + colWidths[0] + 28, rowY + 4, {
          width: colWidths[1] - 10,
          height: rowHeight,
          ellipsis: true,
        });

      doc
        .text(wasteItems[i].volume_l || '', tableX + colWidths[0] + colWidths[1] + 35, rowY + 4, {
          width: colWidths[2] - 10,
          height: rowHeight,
          ellipsis: true,
        });

      doc
        .text(wasteItems[i].weight_kg || '', tableX + colWidths[0] + colWidths[1] + colWidths[2] + 37, rowY + 4, {
          width: colWidths[3] - 10,
          height: rowHeight,
          ellipsis: true,
        });
    }

    // Draw vertical column lines (includes header + data rows)
    let totalHeight = 20 + wasteItems.length * rowHeight;
    for (let i = 1; i < colWidths.length; i++) {
      const dividerX = tableX + colWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc
        .moveTo(dividerX, tableTop)
        .lineTo(dividerX, tableTop + totalHeight)
        .stroke();
    }

    doc.moveDown(1);
    // --- Transporter/Generator Declaration Section ---
    let margin = 49.5;
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
      .rect(margin+0.65, startY+1, col1Width, rowHeight-12)
      .fill();
    if(manifestTransporter.type === 'Generator'){
      headingType = 'Generator Declaration'
    }else if(manifestTransporter.type === 'Transporter'){
      headingType = 'Transporter Declaration'
    }else{
      headingType = 'Transporter/Generator Declaration'
    }
    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text(headingType, margin + 50, startY + 5, {
        width: col1Width - 10,
      });

    doc
      .moveTo(margin, startY + (rowHeight - 12))  
      .lineTo(margin + usableWidth-200, startY + (rowHeight - 12))
      .strokeColor('#000')
      .stroke();

    // --- LEFT COLUMN TEXT (Row 2–3, white background) ---
    doc
      .fillColor('#000')
      .font('Helvetica')
      .fontSize(9)
      .text(
        'I hereby declare that the waste is fully and accurately described in the above sections and that it has been packaged, labelled, and transported in accordance with the applicable regulations.',
        margin + 2,
        startY + rowHeight,
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
    const declarationDate = new Date(manifestTransporter.declaration_date)
    .toISOString()
    .split('T')[0];
    const values = [manifestTransporter.declaration_name, manifestTransporter.signature, declarationDate];
    const labels = ['Name', 'Signature', 'Date'];

    // Draw the signature image first
    if (values[1]) {
      const base64Data = values[1].replace(/^data:image\/\w+;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      const sigY = startY + rowHeight; // Signature row index = 1
      doc.image(imgBuffer, rightColX + sideLabelWidth + 60, sigY - 30, {
        fit: [sideValueWidth + 100, rowHeight + 50],
        align: 'left',
        valign: 'center'
      });
    }

    // Draw each row (labels, lines, and text)
    labels.forEach((label, i) => {
      const y = startY + i * rowHeight;

      // Side header background
      doc
        .fillColor('#d4f1f9')
        .rect(rightColX - 9, y + 2, sideLabelWidth + 12.1, rowHeight - 3)
        .fill();

      // Side label text
      doc
        .fillColor('#000')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(`${label}:`, rightColX - 5, y + 9);

      // Bottom line
      const lineY = y + rowHeight;
      doc
        .strokeColor('#000')
        .moveTo(rightColX - 9.5, lineY)
        .lineTo(rightColX - 9.5 + sideLabelWidth + 14, lineY)
        .stroke();

      // Value area box
      doc
        .strokeColor('#000')
        .rect(rightColX + sideLabelWidth + 5.1, y, sideValueWidth - 5, rowHeight)
        .stroke();

      // Text values (skip signature text since image already drawn)
      if (label !== 'Signature') {
        doc
          .fillColor('#000')
          .font('Helvetica')
          .fontSize(10)
          .text(values[i] || '', rightColX + sideLabelWidth + 60, y + 8);
      }
    });

    // Draw vertical divider between col1 and col2
    doc
      .moveTo(margin + col1Width - 9.9, startY)
      .lineTo(margin + col1Width - 9.9, startY + rowHeight * 3)
      .stroke();

    // Advance Y
    doc.y = startY + rowHeight * 3 + 10;
if(manifestType !== 'Receipt No'){
  // --- Management Activity Section ---
  margin = 49.5;
    sectionWidth = doc.page.width - 50 * 2;
    const checkboxOptions = ['Donation', 'Reuse', 'Sorting', 'Recycling', 'Treatment', 'Storage'];
    checkboxSize = 8;
    rowHeight = 16;
    const colCount = 6;
    const colWidth = sectionWidth / colCount;
    startY = doc.y;

    // Total height: header row + checkbox row
    totalHeight = rowHeight * 2;

    // --- Draw table background ---
  doc
    .fillColor('#d4f1f4')
    .rect(margin, startY, sectionWidth, rowHeight)
    .fill(); // header row background

  doc
    .fillColor('#fff')
    .rect(margin, startY + rowHeight, sectionWidth, rowHeight)
    .fill(); // checkbox row background

  // --- Draw outer border ---
  doc
    .lineWidth(1)
    .strokeColor('#000')
    .rect(margin, startY, sectionWidth, totalHeight)
    .stroke();

  // --- Draw horizontal line separating header and checkbox row ---
  doc
    .moveTo(margin, startY + rowHeight)
    .lineTo(margin + sectionWidth, startY + rowHeight)
    .stroke();

  // --- Draw vertical column lines ---
  for (let i = 1; i < colCount; i++) {
    const x = margin + i * colWidth;
    doc
      .moveTo(x, startY+16)
      .lineTo(x, startY + totalHeight)
      .stroke();
  }

  // --- Draw header text ---
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#000')
    .text('Management Activity', margin, startY + 5, { width: sectionWidth, align: 'center' });

  // --- Draw checkboxes + labels centered in each column ---
  checkboxOptions.forEach((label, i) => {
    const colX = margin + i * colWidth;
    const labelWidth = doc.widthOfString(label);
    const totalWidth = labelWidth + 5 + checkboxSize;
    const startX = colX + (colWidth - totalWidth) / 2;
    const checkboxY = startY + rowHeight + (rowHeight - checkboxSize) / 2;

    // Draw label
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#000')
      .text(label, startX, checkboxY - 1);

    // Draw checkbox
    doc
      .rect(startX + labelWidth + 5, checkboxY, checkboxSize, checkboxSize)
      .stroke();

    // Draw X if selected
    const processArray = manifestTransporter.process
      ? manifestTransporter.process.split(',').map(item => item.trim())
      : [];
    if (processArray.includes(label)) {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('X', startX + labelWidth + 6, checkboxY - 0);
    }
  });

  // Advance Y below table
  doc.y = startY + totalHeight + 10;
}
    //----"Additional Comments"-----
    margin = 49.5;
    sectionWidth = doc.page.width - 50 * 2;
    rowHeight = 16;
    const numCommentRows = 4;
    startY = doc.y;
    totalHeight = rowHeight * (1 + numCommentRows); // 1 for header

    let leftWidth = sectionWidth * 0.6;  // 60% for comments
    let rightWidth = sectionWidth * 0.4; // 40% for stamp

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
      .text('Additional Comments', margin + 5, startY + 5,{ width: leftWidth - 10, align: 'center' });

    doc
      .text('Stamp', margin + leftWidth + 5, startY + 5, { width: rightWidth - 10, align: 'center' });

    doc
      .moveTo(margin, startY + rowHeight)           
      .lineTo(margin + sectionWidth - 1, startY + rowHeight) 
      .lineWidth(1)                                
      .strokeColor('#000')                         
      .stroke();

    // --- Vertical divider between comments and stamp ---
    doc
      .moveTo(margin + leftWidth, startY)
      .lineTo(margin + leftWidth, startY + totalHeight)
      .stroke();

    // --- Horizontal lines for left side only ---
    for (let i = 1; i <= numCommentRows; i++) {
      const y = startY + i * rowHeight;
      doc
        .moveTo(margin, y)
        .lineTo(margin + leftWidth, y)
        .stroke();
    }
    // --- Render comments text ---
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#000')
      .text(manifestTransporter.comments || '', margin + 5, startY + rowHeight + 4, {
        width: leftWidth - 10,
        height: rowHeight * numCommentRows,
        ellipsis: true,
      });
      // --- Render stamp image in right column ---
      if (showStamp) {
        const stampPath = path.join(__dirname, 'stamp.png');
        if (fs.existsSync(stampPath)) {
          const stampImage = fs.readFileSync(stampPath);
          doc.image(stampImage,
            margin + leftWidth + 5.5,         
            startY + rowHeight + 5,          
            {
              width: rightWidth - 12,
              height: totalHeight - rowHeight - 7,
              align: 'center',
              valign: 'center',
            }
          );
        }
      }

    doc.y = startY + totalHeight + 10;

if(manifestType !== 'Receipt No'){
    // --- Final Disposal Section ---
    margin = 49.5;
    sectionWidth = doc.page.width - 50 * 2;
    rowHeight = 16;
    const numRows = 4;
    startY = doc.y;
    totalHeight = rowHeight * (1 + numRows); // header + 4 rows

    // Column split (60% left, 40% right)
    leftWidth = sectionWidth * 0.6;
    rightWidth = sectionWidth * 0.4;

    // --- Outer border for whole section ---
    doc
      .strokeColor('#000')
      .rect(margin, startY, sectionWidth, totalHeight)
      .stroke();

    // --- Header row background ---
    doc
      .fillColor('#d4f1f4')
      .rect(margin+1, startY, sectionWidth-2, rowHeight)
      .fill();

    // --- Column headers ---
    doc
      .fillColor('#000')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('Final Disposal', margin + 5, startY + 5, {
        width: leftWidth - 10,
        align: 'center',
      });

    doc
      .text('Stamp / Signature', margin + leftWidth + 5, startY + 5, {
        width: rightWidth - 10,
        align: 'center',
      });

    doc
      .moveTo(margin, startY + rowHeight)           
      .lineTo(margin + sectionWidth - 1, startY + rowHeight) 
      .lineWidth(1)                                
      .strokeColor('#000')                         
      .stroke();

    // --- Vertical divider between left and right ---
    doc
      .moveTo(margin + leftWidth, startY)
      .lineTo(margin + leftWidth, startY + totalHeight)
      .stroke();

    // --- Horizontal lines for left side rows ---
    for (let i = 1; i <= numRows; i++) {
      const y = startY + i * rowHeight;
      doc
        .moveTo(margin, y)
        .lineTo(margin + leftWidth, y)
        .stroke();
    }

    // --- Field labels and values ---
    const fieldLabels = ['Facility', 'Contact No', 'Email', 'Date'];
    const dateObj = manifestTransporter.actual_disposal_date
      ? new Date(manifestTransporter.actual_disposal_date)
      : null;
    const formattedDate = dateObj
      ? `${dateObj.getDate().toString().padStart(2, '0')}/${
          (dateObj.getMonth() + 1).toString().padStart(2, '0')
        }/${dateObj.getFullYear()}`
      : '';

    const fieldValues = [
      manifestTransporter.final_disposal || '',
      manifestTransporter.disposal_contact_no || '',
      manifestTransporter.disposal_email || '',
      formattedDate,
    ];

    fieldLabels.forEach((label, i) => {
      const y = startY + rowHeight * (i + 1);
      doc
        .fillColor('#000')
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(label + ':', margin + 5, y + 4);

      doc
        .fillColor('#000')
        .font('Helvetica')
        .fontSize(9)
        .text(fieldValues[i], margin + 70, y + 4, {
          width: leftWidth - 75,
          ellipsis: true,
        });
    });

    // --- Stamp box (just empty, spanning 4 rows) ---
    // Already drawn by outer border + vertical divider, so nothing to do here
    // It's a neat white box aligned with the 4 rows
    doc.y = startY + totalHeight + 10;
}

    doc.end();
    // Capture the PDF into a buffer
    const pdfBuffer = await getStream.buffer(pdfStream);

    const recipients = [
      ...(sendEmail.disposal ? [manifestTransporter.disposal_email] : []),
      ...(sendEmail.generator ? [manifestTransporter.generator_email] : []),
      manifestTransporter.transporter_email
    ];
    await emailTransporter.sendMail({
      from: 'grootboomunathi@gmail.com',
      to: recipients.join(','),
      subject: `Manifest #${manifestId}`,
      text: 'Attached is the generated waste manifest.',
      attachments: [{
        filename: `manifest-${manifestId}.pdf`,
        content: pdfBuffer
      }]
    });
  } catch (error) {
    console.error('Error saving manifest:', error);
    res.status(500).json({ error: 'Failed to save manifest' });
  }
});
app.put('/api/manifests/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const username = decoded.username;
    const manifestId = req.params.id;
    const {
      generator,
      transporter,
      waste_type,
      waste_form,
      wasteItems,
      process,
      final_disposal,
      contact_no,
      date,
      comments,
      isStamped,
      signature,
      declaration_name,
      declaration_date,
      reference_no,
      disposal_email,
      saveForLater, 
      type
    } = req.body;

    if (!generator || !transporter || !Array.isArray(process) || process.length === 0 || !contact_no || !date || !declaration_name || !declaration_date || !reference_no || !type) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    //Check if the manifest exists
    const check = await pool.query('SELECT * FROM manifests WHERE id = $1', [manifestId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Manifest not found.' });
    }
    const wasteTypeString = waste_type.join(', ');
    const wasteFormString = waste_form.join(', ');
    const processString = process.join(', ');
    //Update the manifest
    const result = await pool.query(
      `UPDATE manifests SET
        generator = $1,
        transporter = $2,
        waste_type = $3,
        waste_form = $4,
        process = $5,
        declaration_name = $6,
        declaration_date = $7,
        final_disposal = $8,
        disposal_contact_no = $9,
        actual_disposal_date = $10,
        comments = $11,
        is_stamped = $12,
        username = $13,
        signature = $14,
        reference_no = $15,
        disposal_email = $16,
        is_saved_for_later = $17,
        type = $18 
      WHERE id = $19
      RETURNING *`,
      [
        generator,
        transporter,
        wasteTypeString,
        wasteFormString,
        processString,
        declaration_name,
        declaration_date,
        final_disposal,
        contact_no,
        date,
        comments,
        isStamped,
        username,
        signature,
        reference_no,
        disposal_email,
        saveForLater,
        type,
        manifestId,
      ]
    );
    await pool.query('DELETE FROM waste_streams WHERE manifest_id = $1', [manifestId]);
    if (Array.isArray(wasteItems) && wasteItems.length > 0) {
      for (const item of wasteItems) {
        await pool.query(
          `INSERT INTO waste_streams (manifest_id, description, packaging, volume_l, weight_kg)
          VALUES ($1, $2, $3, $4, $5)`,
          [
            manifestId,
            item.description,
            item.packaging,
            item.volume,
            item.weight
          ]
        );
      }
    }
    res.json({ success: true, manifest: result.rows[0] });

  } catch (error) {
    console.error('Error updating manifest:', error);
    res.status(500).json({ error: 'Failed to update manifest' });
  }
});
app.delete('/api/manifests/:id', async (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Optional: Validate user exists
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [decoded.username]);
    if (userResult.rowCount === 0) {
      return res.status(403).json({ error: 'User not found' });
    }

    // Delete manifest
    const result = await pool.query('DELETE FROM manifests WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Manifest not found' });
    }

    res.json({ message: 'Manifest deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
app.get('/api/manifests/:id', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, JWT_SECRET);
    const manifestId = req.params.id;

    const result = await pool.query(`SELECT m.id,
                                            m.date,
                                            m.time,
                                            m.transporter,
                                            m.generator,
                                            m.reference_no,
                                            m.manifest_no,
                                            m.waste_type,
                                            m.waste_form,
                                            m.process,
                                            m.final_disposal,
                                            m.planned_disposal_date,
                                            m.actual_disposal_date,
                                            m.disposal_contact_no,
                                            m.disposal_ref_no,
                                            m.quote_no,
                                            m.po_no,
                                            m.comments,
                                            m.username,
                                            m.created_at,
                                            m.declaration_name,
                                            m.declaration_date,
                                            m.signature,
                                            m.disposal_email,
                                            m.type,
                                            wi.manifest_id,
                                            wi.id,
                                            wi.description,
                                            wi.packaging,
                                            wi.volume_l,
                                            wi.weight_kg
                                       FROM manifests m 
                                 inner join entities e on e.name = m.transporter OR e.name = m.generator 
                                 left join waste_streams wi on m.id = wi.manifest_id 
                                      WHERE m.id = $1 
                                   group by m.id, 
                                            wi.manifest_id, 
                                            wi.id`, [manifestId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Manifest not found' });
    }

    const manifest = result.rows;
    res.json(manifest);
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});
// Signature API
app.get("/api/signature", async (req, res) => {
  const batPath = path.join(__dirname, "JScript", "Run-JS.bat");
  const jsFile = "CaptureImage_Binary.js";

  exec(`cmd /c "${batPath}" ${jsFile}`, { cwd: path.dirname(batPath) }, (error, stdout, stderr) => {
    if (error) {
      console.error("Error executing script:", error);
      return res.status(500).json({ error: "Execution failed", details: error.message });
    }
    if (stderr) {
      console.error("Stderr:", stderr);
    }

    try {
      var dataUriIndex = stdout.indexOf("data:image");
      const cleanData = (dataUriIndex >= 0) ? stdout.substring(dataUriIndex) : "";
      const jsonData = JSON.stringify({ data: cleanData });
      const sigObj = JSON.parse(jsonData);
      if (sigObj.error) {
        return res.status(400).json({ error: "Signature capture failed", code: sigObj.code });
      }
      res.json({
        image: sigObj,
      });
    } catch (e) {
      // console.error("Failed to parse signature JSON:", e, stdout);
      res.status(500).json({ error: e });
    }
  });
});

// Serve React frontend
const buildPath = path.join(__dirname, '..', 'waste-manifest-app', 'build');
app.use(express.static(buildPath));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
