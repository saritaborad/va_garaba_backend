const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require('path');
const imagePath = path.join(__dirname, '../public/images/logo.png');
// function createInvoice(invoice, path) {
//   let doc = new PDFDocument({ size: "A4", margin: 50 });
//   const buffers = [];
//   doc.on('data', buffer => buffers.push(buffer));
//   generateHeader(doc);
//   generateCustomerInformation(doc, invoice);
//   generateInvoiceTable(doc, invoice);
//   generateFooter(doc);
//   doc.end();
//   // return pdfBuffer = Buffer.concat(buffers);
//   doc.pipe(fs.createWriteStream(path));
// }
function createInvoice(invoice, path) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];
    doc.on('data', buffer => buffers.push(buffer));
    generateHeader(doc);
    generateCustomerInformation(doc, invoice);
    generateInvoiceTable(doc, invoice);
    generateFooter(doc);
    doc.on('end', () => {
      console.log('PDF buffer generated.');
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer); // Resolve the Promise with the generated buffer
    });
    doc.end();
  });
}
function generateHeader(doc) {
  doc
    .image(imagePath, 50, 45, { width: 100 })
    .fillColor("#444444")
    .fontSize(20)
    .text("The Memories Event", 200, 57)
    .fontSize(10)
    .text("GST: 24AJDPJ5941M1Z1 ", 230, 85)
    .font("Helvetica-Bold")
    .text("Shop 708,709 ", 200, 50, { align: "right" })
    .text("Elephanta Business Hub", 200, 65, { align: "right" })
    .text("Singanpor road, Dabholi", 200, 80, { align: "right" })
    .text("Surat, Gujrat- 395004", 200, 95, { align: "right" })
    .moveDown();
}
function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Ticket Invoice", 50, 160);
  generateHr(doc, 185);
  const customerInformationTop = 200;
  doc
    .fontSize(10)
    .text("Invoice Info", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .font("Helvetica")
    .text("Invoice ID:", 50, customerInformationTop + 15)
    .text(invoice?.invoice_nr, 150, customerInformationTop + 15)
    .text("Invoice Date:", 50, customerInformationTop + 30)
    .text(invoice?.invoice_date, 150, customerInformationTop + 30)
    .text("Transection ID:", 50, customerInformationTop + 45)
    .text(invoice?.transaction_id, 150, customerInformationTop + 45)
    .font("Helvetica-Bold")
    .text("Customer Info", 300, customerInformationTop)
    .font("Helvetica")
    .text("Name:", 300, customerInformationTop + 15)
    .text(invoice?.shipping?.name, 380, customerInformationTop + 15)
    .text("Mobile:", 300, customerInformationTop + 30)
    .text(invoice?.shipping?.mobile, 380, customerInformationTop + 30)
    .text("Business Name:", 300, customerInformationTop + 45)
    .text(invoice?.gst_name, 380, customerInformationTop + 45)
    .text("GST No:", 300, customerInformationTop + 60)
    .text(invoice?.gst_in, 380, customerInformationTop + 60)
    // .text(invoice.shipping.address, 300, customerInformationTop + 15)
    // .text(invoice.shipping.address, 300, customerInformationTop + 15)
    // .text(
    //   invoice.shipping.city +
    //   ", " +
    //   invoice.shipping.state +
    //   ", " +
    //   invoice.shipping.country,
    //   300,
    //   customerInformationTop + 30
    // )
    .moveDown();
  generateHr(doc, 285);
}
function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    // "Description",
    "HSN",
    "Unit Cost",
    "Quantity",
    "Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");
  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      // item.description,
      invoice.hsn,
      formatCurrency(item.amount / item.quantity),
      item.quantity,
      formatCurrency(item.amount)
    );
    generateHr(doc, position + 20);
  }
  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  const subtotalPosition1 = invoiceTableTop + (i + 1) * 35;
  const subtotalPosition2 = invoiceTableTop + (i + 1) * 40;
  const subtotalPosition3 = invoiceTableTop + (i + 1) * 45;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Base Price",
    "",
    formatCurrency(invoice.base_price)
  );
  generateTableRow(
    doc,
    subtotalPosition1,
    "",
    "",
    "Applied Discount",
    "",
    formatCurrency(invoice.discount)  // Here you need to put discount variable
  );
  generateTableRow(
    doc,
    subtotalPosition2,
    "",
    "",
    `Included GST ${invoice.eventaxval ? `( ${invoice.eventaxval} %)` : ''}`,
    "",
    formatCurrency(invoice.total_tax)
  );
  generateTableRow(
    doc,
    subtotalPosition3,
    "",
    "",
    "Total Price",
    "",
    formatCurrency(invoice.total)
  );
}
// hsn:852364 value
function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      // "We're Excited To see you at Sarsana Navratri !!",
      "** END **",
      50,
      780,
      { align: "center", width: 500 }
    );
}
function generateTableRow(
  doc,
  y,
  item,
  hsn,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(hsn, 250, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}
function generateHr(doc, y) {
  doc
    .strokeColor("#AAAAAA")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}
function formatCurrency(cents) {
  return "Rs." + (+cents).toFixed(2);
}
function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return year + "/" + month + "/" + day;
}
module.exports = {
  createInvoice
};