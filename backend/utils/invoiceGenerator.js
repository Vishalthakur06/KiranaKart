const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoice = async (orderData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      
      // Create invoices directory if not exists
      const invoicesDir = path.join(__dirname, "../invoices");
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `invoice-${orderData.orderId}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header with orange gradient effect
      doc.rect(0, 0, doc.page.width, 150).fill("#F97316");
      
      // Company name
      doc.fillColor("#FFFFFF")
         .fontSize(28)
         .font("Helvetica-Bold")
         .text("E-COMMERCE STORE", 50, 40);
      
      doc.fontSize(10)
         .font("Helvetica")
         .text("Your Trusted Online Shopping Partner", 50, 75);
      
      // Invoice title
      doc.fontSize(24)
         .font("Helvetica-Bold")
         .text("INVOICE", 400, 50);
      
      doc.fontSize(10)
         .font("Helvetica")
         .fillColor("#FFFFFF")
         .text(`Invoice #: ${orderData.invoiceNumber}`, 400, 85)
         .text(`Date: ${new Date(orderData.orderDate).toLocaleDateString("en-IN")}`, 400, 100);

      // Reset position after header
      let yPosition = 180;

      // Company Details (Left)
      doc.fillColor("#1F2937")
         .fontSize(12)
         .font("Helvetica-Bold")
         .text("FROM:", 50, yPosition);
      
      yPosition += 20;
      doc.fontSize(10)
         .font("Helvetica")
         .text("E-Commerce Store Pvt. Ltd.", 50, yPosition)
         .text("123 Business Park, Sector 18", 50, yPosition + 15)
         .text("Gurugram, Haryana - 122001", 50, yPosition + 30)
         .text("GSTIN: 06AAAAA0000A1Z5", 50, yPosition + 45)
         .text("Email: support@ecommerce.com", 50, yPosition + 60)
         .text("Phone: +91 9876543210", 50, yPosition + 75);

      // Customer Details (Right)
      doc.fontSize(12)
         .font("Helvetica-Bold")
         .text("BILL TO:", 320, 180);
      
      doc.fontSize(10)
         .font("Helvetica")
         .text(orderData.customerName, 320, 200)
         .text(orderData.shippingAddress.address, 320, 215, { width: 200 })
         .text(`${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}`, 320, 230)
         .text(`PIN: ${orderData.shippingAddress.pincode}`, 320, 245)
         .text(`Email: ${orderData.customerEmail}`, 320, 260)
         .text(`Phone: ${orderData.shippingAddress.phone}`, 320, 275);

      yPosition = 320;

      // Divider line
      doc.strokeColor("#E5E7EB")
         .lineWidth(1)
         .moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .stroke();

      yPosition += 20;

      // Table Header
      doc.rect(50, yPosition, 500, 25).fill("#F97316");
      
      doc.fillColor("#FFFFFF")
         .fontSize(10)
         .font("Helvetica-Bold")
         .text("Item", 60, yPosition + 8)
         .text("Qty", 320, yPosition + 8)
         .text("Price", 380, yPosition + 8)
         .text("GST (18%)", 440, yPosition + 8)
         .text("Total", 510, yPosition + 8);

      yPosition += 25;

      // Table Rows
      doc.fillColor("#1F2937").font("Helvetica");
      
      let subtotal = 0;
      let totalGST = 0;

      orderData.items.forEach((item, index) => {
        const itemTotal = item.quantity * item.price;
        const gst = itemTotal * 0.18;
        const total = itemTotal + gst;
        
        subtotal += itemTotal;
        totalGST += gst;

        // Alternate row background
        if (index % 2 === 0) {
          doc.rect(50, yPosition, 500, 25).fill("#F9FAFB");
        }

        doc.fillColor("#1F2937")
           .fontSize(9)
           .text(item.name.substring(0, 30), 60, yPosition + 8, { width: 240 })
           .text(item.quantity.toString(), 320, yPosition + 8)
           .text(`₹${item.price}`, 380, yPosition + 8)
           .text(`₹${gst.toFixed(2)}`, 440, yPosition + 8)
           .text(`₹${total.toFixed(2)}`, 510, yPosition + 8);

        yPosition += 25;
      });

      yPosition += 10;

      // Divider
      doc.strokeColor("#E5E7EB")
         .lineWidth(1)
         .moveTo(50, yPosition)
         .lineTo(550, yPosition)
         .stroke();

      yPosition += 20;

      // Summary
      const grandTotal = subtotal + totalGST;

      doc.fontSize(10)
         .font("Helvetica")
         .fillColor("#6B7280")
         .text("Subtotal:", 380, yPosition)
         .fillColor("#1F2937")
         .text(`₹${subtotal.toFixed(2)}`, 510, yPosition, { align: "right" });

      yPosition += 20;
      doc.fillColor("#6B7280")
         .text("GST (18%):", 380, yPosition)
         .fillColor("#1F2937")
         .text(`₹${totalGST.toFixed(2)}`, 510, yPosition, { align: "right" });

      yPosition += 20;
      doc.fillColor("#6B7280")
         .text("Shipping:", 380, yPosition)
         .fillColor("#16A34A")
         .text("FREE", 510, yPosition, { align: "right" });

      yPosition += 10;

      // Grand Total Box
      doc.rect(370, yPosition, 180, 35).fill("#F97316");
      
      doc.fillColor("#FFFFFF")
         .fontSize(12)
         .font("Helvetica-Bold")
         .text("GRAND TOTAL:", 380, yPosition + 10)
         .fontSize(14)
         .text(`₹${grandTotal.toFixed(2)}`, 510, yPosition + 10, { align: "right" });

      yPosition += 60;

      // Payment Info
      doc.fillColor("#1F2937")
         .fontSize(10)
         .font("Helvetica-Bold")
         .text("Payment Information:", 50, yPosition);
      
      yPosition += 20;
      doc.font("Helvetica")
         .fillColor("#6B7280")
         .text(`Payment Method: ${orderData.paymentMethod}`, 50, yPosition)
         .text(`Payment Status: ${orderData.paymentStatus.toUpperCase()}`, 50, yPosition + 15)
         .text(`Order Status: ${orderData.deliveryStatus.toUpperCase()}`, 50, yPosition + 30);

      // Footer
      const footerY = doc.page.height - 100;
      
      doc.rect(0, footerY, doc.page.width, 100).fill("#F3F4F6");
      
      doc.fillColor("#6B7280")
         .fontSize(9)
         .font("Helvetica")
         .text("Thank you for shopping with us!", 50, footerY + 20, { align: "center", width: 500 })
         .text("For any queries, contact us at support@ecommerce.com or call +91 9876543210", 50, footerY + 35, { align: "center", width: 500 })
         .fontSize(8)
         .text("This is a computer-generated invoice and does not require a signature.", 50, footerY + 60, { align: "center", width: 500 });

      doc.end();

      stream.on("finish", () => {
        resolve({ success: true, filePath, fileName });
      });

      stream.on("error", (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoice };
