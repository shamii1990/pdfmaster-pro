const express = require('express');
const fileUpload = require('express-fileupload');
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('.'));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true
}));

// Serve static pages
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));
app.get('/merge-pdf', (req, res) => res.sendFile(__dirname + '/merge-pdf.html'));
app.get('/split-pdf', (req, res) => res.sendFile(__dirname + '/split-pdf.html'));
app.get('/compress-pdf', (req, res) => res.sendFile(__dirname + '/compress-pdf.html'));
app.get('/pdf-to-text', (req, res) => res.sendFile(__dirname + '/pdf-to-text.html'));
app.get('/images-to-pdf', (req, res) => res.sendFile(__dirname + '/images-to-pdf.html'));

// ========== REAL PDF TOOLS API ========== //

// 1. Merge PDF - REAL WORKING
app.post('/api/merge-pdf', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const mergedPdf = await PDFDocument.create();
    
    // Process each PDF file
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    
    for (const file of files) {
      try {
        const pdfDoc = await PDFDocument.load(file.data);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      } catch (error) {
        return res.status(400).json({ error: `Invalid PDF file: ${file.name}` });
      }
    }

    const mergedPdfBytes = await mergedPdf.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged-document.pdf');
    res.send(Buffer.from(mergedPdfBytes));
    
  } catch (error) {
    console.error('Merge error:', error);
    res.status(500).json({ error: 'Merge failed: ' + error.message });
  }
});

// 2. Split PDF - REAL WORKING
app.post('/api/split-pdf', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfFile = req.files.file;
    const pages = req.body.pages ? req.body.pages.split(',').map(Number) : [0];
    
    const pdfDoc = await PDFDocument.load(pdfFile.data);
    const newPdf = await PDFDocument.create();
    
    for (const pageNumber of pages) {
      if (pageNumber >= 0 && pageNumber < pdfDoc.getPageCount()) {
        const [page] = await newPdf.copyPages(pdfDoc, [pageNumber]);
        newPdf.addPage(page);
      }
    }

    const newPdfBytes = await newPdf.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=split-document.pdf');
    res.send(Buffer.from(newPdfBytes));
    
  } catch (error) {
    res.status(500).json({ error: 'Split failed: ' + error.message });
  }
});

// 3. PDF to Text - REAL WORKING
app.post('/api/pdf-to-text', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = await pdfParse(req.files.file.data);
    
    res.json({
      success: true,
      text: data.text,
      pages: data.numpages,
      info: data.info
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Text extraction failed: ' + error.message });
  }
});

// 4. Images to PDF - REAL WORKING
app.post('/api/images-to-pdf', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const pdfDoc = await PDFDocument.create();
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    
    for (const file of files) {
      try {
        // Convert image to JPEG buffer
        const jpegBuffer = await sharp(file.data)
          .jpeg()
          .toBuffer();
        
        // Add image as page
        const image = await pdfDoc.embedJpg(jpegBuffer);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      } catch (error) {
        return res.status(400).json({ error: `Invalid image file: ${file.name}` });
      }
    }

    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=images-to-pdf.pdf');
    res.send(Buffer.from(pdfBytes));
    
  } catch (error) {
    res.status(500).json({ error: 'PDF creation failed: ' + error.message });
  }
});

// 5. Compress PDF - BASIC VERSION
app.post('/api/compress-pdf', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfFile = req.files.file;
    const pdfDoc = await PDFDocument.load(pdfFile.data);
    
    // Basic compression by re-saving
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false,
      objectsPerTick: 100
    });

    const originalSize = pdfFile.data.length;
    const compressedSize = compressedBytes.length;
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=compressed-document.pdf`);
    res.setHeader('X-Original-Size', originalSize);
    res.setHeader('X-Compressed-Size', compressedSize);
    res.setHeader('X-Compression-Ratio', compressionRatio);
    res.send(Buffer.from(compressedBytes));
    
  } catch (error) {
    res.status(500).json({ error: 'Compression failed: ' + error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PDFMaster Pro - REAL PDF Tools`);
  console.log(`📊 5 Working Tools: Merge, Split, Compress, PDF to Text, Images to PDF`);
  console.log(`🌐 Server running on http://localhost:${PORT}`);
});
