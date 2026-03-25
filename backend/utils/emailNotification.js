const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");

const sendOrderNotifications = async (orderDetails) => {
  try {
    const useSendGrid = process.env.SENDGRID_API_KEY;
    
    if (useSendGrid) {
      return await sendViaSendGrid(orderDetails);
    } else {
      return await sendViaNodemailer(orderDetails);
    }
  } catch (error) {
    console.error("Email notification error:", error);
    return { success: false, error: error.message };
  }
};

// SendGrid method (for production - Render)
const sendViaSendGrid = async (orderDetails) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
    const adminEmail = process.env.ADMIN_EMAIL;

    const adminHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { background: white; border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #F97316, #EF4444); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .order-id { background: #FFF7ED; border-left: 4px solid #F97316; padding: 15px; margin: 20px 0; }
          .order-id strong { color: #F97316; font-size: 18px; }
          .details { background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #E5E7EB; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #6B7280; width: 140px; }
          .detail-value { color: #1F2937; flex: 1; }
          .address-box { background: #ECFDF5; border: 2px solid #10B981; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .address-box h3 { margin: 0 0 10px 0; color: #10B981; font-size: 16px; }
          .footer { text-align: center; color: #6B7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
          .amount { font-size: 28px; font-weight: 800; color: #F97316; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 New Order Received!</h1>
          </div>
          
          <div class="order-id">
            <strong>📦 Order ID: #${orderDetails.orderId}</strong>
          </div>

          <div class="amount">
            💰 ₹${orderDetails.totalAmount}
          </div>

          <div class="details">
            <div class="detail-row">
              <div class="detail-label">👤 Customer:</div>
              <div class="detail-value">${orderDetails.customerName}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">📧 Email:</div>
              <div class="detail-value">${orderDetails.customerEmail}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">📱 Phone:</div>
              <div class="detail-value">${orderDetails.customerPhone}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">💳 Payment:</div>
              <div class="detail-value">${orderDetails.paymentMethod}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">🛍️ Items:</div>
              <div class="detail-value">${orderDetails.itemCount} item(s)</div>
            </div>
          </div>

          <div class="address-box">
            <h3>📍 Delivery Address</h3>
            <p style="margin: 5px 0; line-height: 1.6;">
              ${orderDetails.address}<br>
              ${orderDetails.city}, ${orderDetails.state}<br>
              PIN: ${orderDetails.pincode}
            </p>
          </div>

          <div class="footer">
            <p>✅ Please check your admin panel for complete order details.</p>
            <p style="margin-top: 10px; font-size: 12px;">
              This is an automated notification from your E-Commerce Store
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const customerHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
          .container { background: white; border-radius: 12px; padding: 30px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .order-id { background: #ECFDF5; border-left: 4px solid #10B981; padding: 15px; margin: 20px 0; text-align: center; }
          .order-id strong { color: #10B981; font-size: 18px; }
          .details { background: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid #E5E7EB; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #6B7280; width: 140px; }
          .detail-value { color: #1F2937; flex: 1; }
          .address-box { background: #FFF7ED; border: 2px solid #F97316; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .address-box h3 { margin: 0 0 10px 0; color: #F97316; font-size: 16px; }
          .footer { text-align: center; color: #6B7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; }
          .amount { font-size: 28px; font-weight: 800; color: #10B981; text-align: center; margin: 20px 0; }
          .thank-you { background: #ECFDF5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .thank-you h2 { color: #10B981; margin: 0 0 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
          </div>
          
          <div class="success-icon">🎉</div>

          <div class="thank-you">
            <h2>Thank You, ${orderDetails.customerName}!</h2>
            <p style="margin: 5px 0; color: #6B7280;">Your order has been successfully placed.</p>
          </div>
          
          <div class="order-id">
            <strong>📦 Order ID: #${orderDetails.orderId}</strong>
          </div>

          <div class="amount">
            Total Amount: ₹${orderDetails.totalAmount}
          </div>

          <div class="details">
            <div class="detail-row">
              <div class="detail-label">💳 Payment:</div>
              <div class="detail-value">${orderDetails.paymentMethod}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">🛍️ Items:</div>
              <div class="detail-value">${orderDetails.itemCount} item(s)</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">🚚 Status:</div>
              <div class="detail-value">Processing</div>
            </div>
          </div>

          <div class="address-box">
            <h3>📍 Delivery Address</h3>
            <p style="margin: 5px 0; line-height: 1.6;">
              ${orderDetails.address}<br>
              ${orderDetails.city}, ${orderDetails.state}<br>
              PIN: ${orderDetails.pincode}
            </p>
          </div>

          <div class="footer">
            <p>🚚 Your order will be delivered within 2-3 business days.</p>
            <p style="margin-top: 10px;">📞 For any queries, contact us</p>
            <p style="margin-top: 10px; font-size: 12px;">
              This is an automated email from E-Commerce Store
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to admin
    if (adminEmail) {
      await sgMail.send({
        to: adminEmail,
        from: fromEmail,
        subject: `🛒 New Order #${orderDetails.orderId} - ₹${orderDetails.totalAmount}`,
        html: adminHTML,
      });
      console.log("✅ Admin email sent via SendGrid");
    }

    // Send to customer
    if (orderDetails.customerEmail) {
      await sgMail.send({
        to: orderDetails.customerEmail,
        from: fromEmail,
        subject: `✅ Order Confirmed #${orderDetails.orderId} - Thank You!`,
        html: customerHTML,
      });
      console.log("✅ Customer email sent via SendGrid");
    }

    return { success: true };
  } catch (error) {
    console.error("SendGrid error:", error);
    return { success: false, error: error.message };
  }
};

// Nodemailer method (for local development)
const sendViaNodemailer = async (orderDetails) => {
  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!emailUser || !emailPass) {
      console.log("Email credentials not configured");
      return { success: false };
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: emailUser, pass: emailPass },
    });

    // Send to admin
    if (adminEmail) {
      await transporter.sendMail({
        from: `"E-Commerce Store" <${emailUser}>`,
        to: adminEmail,
        subject: `🛒 New Order #${orderDetails.orderId} - ₹${orderDetails.totalAmount}`,
        html: `<h1>New Order #${orderDetails.orderId}</h1><p>Amount: ₹${orderDetails.totalAmount}</p>`,
      });
      console.log("✅ Admin email sent via Nodemailer");
    }

    // Send to customer
    if (orderDetails.customerEmail) {
      await transporter.sendMail({
        from: `"E-Commerce Store" <${emailUser}>`,
        to: orderDetails.customerEmail,
        subject: `✅ Order Confirmed #${orderDetails.orderId}`,
        html: `<h1>Order Confirmed!</h1><p>Thank you ${orderDetails.customerName}!</p>`,
      });
      console.log("✅ Customer email sent via Nodemailer");
    }

    return { success: true };
  } catch (error) {
    console.error("Nodemailer error:", error);
    return { success: false, error: error.message };
  }
};

// Delivery status email
const sendDeliveryStatusEmail = async (orderDetails) => {
  try {
    const useSendGrid = process.env.SENDGRID_API_KEY;

    if (useSendGrid) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;

      const statusConfig = {
        shipped: { icon: "🚚", title: "Order Shipped!", color: "#3B82F6" },
        delivered: { icon: "✅", title: "Order Delivered!", color: "#10B981" },
      };

      const config = statusConfig[orderDetails.status];
      if (!config) return { success: false };

      await sgMail.send({
        to: orderDetails.customerEmail,
        from: fromEmail,
        subject: `${config.icon} ${config.title} - Order #${orderDetails.orderId}`,
        html: `<h1>${config.icon} ${config.title}</h1><p>Order #${orderDetails.orderId}</p>`,
      });

      console.log(`✅ ${config.title} email sent via SendGrid`);
      return { success: true };
    }

    return { success: false };
  } catch (error) {
    console.error("Delivery status email error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendOrderNotifications, sendDeliveryStatusEmail };
