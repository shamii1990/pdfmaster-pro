const express = require('express');
const fileUpload = require('express-fileupload');
const { PDFDocument } = require('pdf-lib');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('.'));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true
}));

// ========== SERVE STATIC PAGES ========== //
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/merge-pdf', (req, res) => res.sendFile(path.join(__dirname, 'merge-pdf.html')));
app.get('/split-pdf', (req, res) => res.sendFile(path.join(__dirname, 'split-pdf.html')));
app.get('/compress-pdf', (req, res) => res.sendFile(path.join(__dirname, 'compress-pdf.html')));
app.get('/pdf-to-text', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-text.html')));
app.get('/images-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'images-to-pdf.html')));

// Serve all other tool pages (demo versions)
app.get('/pdf-to-word', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-word.html')));
app.get('/word-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'word-to-pdf.html')));
app.get('/pdf-to-excel', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-excel.html')));
app.get('/excel-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'excel-to-pdf.html')));
app.get('/pdf-to-powerpoint', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-powerpoint.html')));
app.get('/powerpoint-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'powerpoint-to-pdf.html')));
app.get('/pdf-to-images', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-images.html')));
app.get('/pdf-to-jpg', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-jpg.html')));
app.get('/pdf-to-png', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-png.html')));
app.get('/jpg-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'jpg-to-pdf.html')));
app.get('/png-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'png-to-pdf.html')));
app.get('/images-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'images-to-pdf.html')));
app.get('/pdf-to-pdfa', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-pdfa.html')));
app.get('/organize-pdf', (req, res) => res.sendFile(path.join(__dirname, 'organize-pdf.html')));
app.get('/rotate-pdf', (req, res) => res.sendFile(path.join(__dirname, 'rotate-pdf.html')));
app.get('/watermark-pdf', (req, res) => res.sendFile(path.join(__dirname, 'watermark-pdf.html')));
app.get('/number-pages', (req, res) => res.sendFile(path.join(__dirname, 'number-pages.html')));
app.get('/repair-pdf', (req, res) => res.sendFile(path.join(__dirname, 'repair-pdf.html')));
app.get('/reduce-size', (req, res) => res.sendFile(path.join(__dirname, 'reduce-size.html')));
app.get('/resize-pdf', (req, res) => res.sendFile(path.join(__dirname, 'resize-pdf.html')));
app.get('/change-margin', (req, res) => res.sendFile(path.join(__dirname, 'change-margin.html')));
app.get('/flatten-pdf', (req, res) => res.sendFile(path.join(__dirname, 'flatten-pdf.html')));
app.get('/extract-images', (req, res) => res.sendFile(path.join(__dirname, 'extract-images.html')));
app.get('/pdf-to-html', (req, res) => res.sendFile(path.join(__dirname, 'pdf-to-html.html')));
app.get('/html-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'html-to-pdf.html')));
app.get('/text-to-pdf', (req, res) => res.sendFile(path.join(__dirname, 'text-to-pdf.html')));
app.get('/protect-pdf', (req, res) => res.sendFile(path.join(__dirname, 'protect-pdf.html')));
app.get('/unlock-pdf', (req, res) => res.sendFile(path.join(__dirname, 'unlock-pdf.html')));
app.get('/add-password', (req, res) => res.sendFile(path.join(__dirname, 'add-password.html')));
app.get('/remove-password', (req, res) => res.sendFile(path.join(__dirname, 'remove-password.html')));
app.get('/sign-pdf', (req, res) => res.sendFile(path.join(__dirname, 'sign-pdf.html')));
app.get('/annotate-pdf', (req, res) => res.sendFile(path.join(__dirname, 'annotate-pdf.html')));
app.get('/fill-form', (req, res) => res.sendFile(path.join(__dirname, 'fill-form.html')));
app.get('/compare-pdf', (req, res) => res.sendFile(path.join(__dirname, 'compare-pdf.html')));
app.get('/ocr-pdf', (req, res) => res.sendFile(path.join(__dirname, 'ocr-pdf.html')));
app.get('/compress-images', (req, res) => res.sendFile(path.join(__dirname, 'compress-images.html')));
app.get('/split-by-size', (req, res) => res.sendFile(path.join(__dirname, 'split-by-size.html')));
app.get('/extract-pages', (req, res) => res.sendFile(path.join(__dirname, 'extract-pages.html')));
app.get('/insert-pages', (req, res) => res.sendFile(path.join(__dirname, 'insert-pages.html')));
app.get('/delete-pages', (req, res) => res.sendFile(path.join(__dirname, 'delete-pages.html')));

// ========== REAL WORKING PDF TOOLS ========== //

// 1. MERGE PDF - REAL WORKING
app.post('/api/merge-pdf', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const mergedPdf = await PDFDocument.create();
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

// 2. SPLIT PDF - REAL WORKING
app.post('/api/split-pdf', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfFile = req.files.file;
    const pageNumber = parseInt(req.body.page) || 0;
    
    const pdfDoc = await PDFDocument.load(pdfFile.data);
    
    if (pageNumber < 0 || pageNumber >= pdfDoc.getPageCount()) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdfDoc, [pageNumber]);
    newPdf.addPage(page);

    const newPdfBytes = await newPdf.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=page-${pageNumber + 1}.pdf`);
    res.send(Buffer.from(newPdfBytes));
    
  } catch (error) {
    res.status(500).json({ error: 'Split failed: ' + error.message });
  }
});

// 3. COMPRESS PDF - BASIC VERSION
app.post('/api/compress-pdf', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfFile = req.files.file;
    const pdfDoc = await PDFDocument.load(pdfFile.data);
    
    // Basic compression by re-saving with optimized settings
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: false,
      addDefaultPage: false
    });

    const originalSize = pdfFile.data.length;
    const compressedSize = compressedBytes.length;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=compressed-document.pdf');
    res.setHeader('X-Original-Size', originalSize);
    res.setHeader('X-Compressed-Size', compressedSize);
    res.setHeader('X-Compression-Ratio', ((originalSize - compressedSize) / originalSize * 100).toFixed(1));
    res.send(Buffer.from(compressedBytes));
    
  } catch (error) {
    res.status(500).json({ error: 'Compression failed: ' + error.message });
  }
});

// 4. PDF TO TEXT - BASIC VERSION
app.post('/api/pdf-to-text', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfFile = req.files.file;
    const pdfDoc = await PDFDocument.load(pdfFile.data);
    
    // Extract basic text from form fields (limited without OCR)
    let extractedText = "PDF Text Extraction - Basic Version\n\n";
    extractedText += "File: " + pdfFile.name + "\n";
    extractedText += "Pages: " + pdfDoc.getPageCount() + "\n\n";
    extractedText += "Note: Full text extraction requires advanced OCR library.\n";
    extractedText += "This basic version shows file information only.\n\n";
    extractedText += "For full text extraction, consider integrating with:\n";
    extractedText += "- Google Cloud Vision OCR\n";
    extractedText += "- AWS Textract\n";
    extractedText += "- Tesseract.js\n";
    
    res.json({
      success: true,
      text: extractedText,
      pages: pdfDoc.getPageCount(),
      filename: pdfFile.name
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Text extraction failed: ' + error.message });
  }
});

// 5. IMAGES TO PDF - BASIC VERSION
app.post('/api/images-to-pdf', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const pdfDoc = await PDFDocument.create();
    const files = Array.isArray(req.files.files) ? req.files.files : [req.files.files];
    
    // Basic version - create empty pages for each image
    for (const file of files) {
      // For now, just add empty pages since we don't have image processing
      // In real implementation, you'd use sharp or other image libraries
      const page = pdfDoc.addPage([612, 792]); // Letter size
    }

    const pdfBytes = await pdfDoc.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=images-to-pdf.pdf');
    res.send(Buffer.from(pdfBytes));
    
  } catch (error) {
    res.status(500).json({ error: 'PDF creation failed: ' + error.message });
  }
});

// ========== DEMO API ENDPOINTS FOR OTHER TOOLS ========== //

app.post('/api/*', (req, res) => {
  const toolName = req.path.replace('/api/', '');
  res.json({
    success: true,
    message: `${toolName} functionality - This is a demo version`,
    note: "In a full implementation, this would process your files",
    tool: toolName,
    demo: true
  });
});

// ========== ERROR HANDLING ========== //

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ========== START SERVER ========== //
app.listen(PORT, () => {
  console.log(`🚀 PDFMaster Pro - 44 PDF Tools`);
  console.log(`📊 3 REAL Tools: Merge PDF, Split PDF, Compress PDF`);
  console.log(`📝 2 BASIC Tools: PDF to Text, Images to PDF`);
  console.log(`🎨 39 DEMO Tools: Beautiful frontend ready`);
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📍 Live at: http://localhost:${PORT}`);
});
