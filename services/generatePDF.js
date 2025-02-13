// // generatePDF.js
// const PDFDocument = require('pdfkit');
// const fs = require('fs');
// const path = require('path');

// const generatePDF = (invoice) => {
//     // Function logic for generating PDF
//     const invoicesDir = path.join(__dirname, '../invoices');
    
//     // Ensure the directory exists
//     if (!fs.existsSync(invoicesDir)) {
//         fs.mkdirSync(invoicesDir, { recursive: true });
//     }

//     const pdfPath = path.join(invoicesDir, `invoice_${invoice._id}.pdf`);
//     const doc = new PDFDocument();
//     doc.pipe(fs.createWriteStream(pdfPath));
    
//     // Add content to the PDF
//     doc.fontSize(18).text('Invoice', { align: 'center' });
//     doc.moveDown();
//     doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
//     doc.text(`Customer: ${invoice.customerName}`);
//     doc.text(`Salesperson: ${invoice.salespersonName}`);
//     doc.text(`Invoice Date: ${invoice.invoiceDate}`);
//     doc.text(`Due Date: ${invoice.dueDate}`);
//     doc.text(`Terms: ${invoice.terms}`);
//     doc.text(`Subtotal: ${invoice.subtotal}`);
//     doc.text(`Total: ${invoice.total}`);
//     doc.text('Items:');
//     invoice.items.forEach((item) => {
//         doc.text(` - ${item.quantity} x ${item.price} (${item.tax} tax) = ${item.total}`);
//     });

//     doc.end();
//     return pdfPath;
// };

// const ejs = require('ejs');
// const fs = require('fs');
// const path = require('path');
// const puppeteer = require('puppeteer');

// const generatePDF = async (invoice, templateId , customerMobile, customerEmail, paymentLink) => {
//   try {    
//     const invoicesDir = path.join(__dirname, '../invoices');
//     if (!fs.existsSync(invoicesDir)) {
//       fs.mkdirSync(invoicesDir, { recursive: true });
//     }

//      templateID = Number(templateId);

     
    
//     // Determine which template to use based on the templateId
//     let templateFile;
//     switch (templateID) {
//       case 1:
//         templateFile = 'invoice_1.ejs';
//         break;
//       case 2:
//         templateFile = 'invoice_2.ejs';
//         break;
//       case 3:
//         templateFile = 'invoice_3.ejs';
//         break;
//       default:
//         throw new Error('Invalid templateId');
//     }

//     const templatePath = path.join(__dirname, templateFile);
//     if (!fs.existsSync(templatePath)) {
//       throw new Error(`Template not found at ${templatePath}`);
//     }

//     const html = await ejs.renderFile(templatePath, { invoice, customerMobile, customerEmail, paymentLink });

//     const pdfPath = path.join(invoicesDir, `invoice_${invoice._id}.pdf`);

//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox'],
//     });
//     const page = await browser.newPage();

//     await page.setContent(html, { waitUntil: 'load' });

//     await page.pdf({
//       path: pdfPath,
//       format: 'A4',
//       printBackground: true,
//     });

//     await browser.close();

//     return pdfPath;
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//     throw error;
//   }
// };

// module.exports = generatePDF;



const ejs = require('ejs');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const generatePDF = async (invoice, templateId, customerMobile, customerEmail, paymentLink) => {
  try {
    const invoicesDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const templateID = Number(templateId);

    let templateFile;
    switch (templateID) {
      case 1:
        templateFile = 'invoice_1.ejs';
        break;
      case 2:
        templateFile = 'invoice_2.ejs';
        break;
      case 3:
        templateFile = 'invoice_3.ejs';
        break;
      default:
        throw new Error('Invalid templateId');
    }

    const templatePath = path.join(__dirname, templateFile);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at ${templatePath}`);
    }

    const html = await ejs.renderFile(templatePath, { invoice, customerMobile, customerEmail, paymentLink });

    const pdfPath = path.join(invoicesDir, `invoice_${invoice._id}.pdf`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',          
        '--no-zygote',           
      ],
      executablePath: process.env.CHROME_BINARY || undefined, 
    });

    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'load' });

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
    });

    await browser.close();

    return pdfPath;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

module.exports = generatePDF;
