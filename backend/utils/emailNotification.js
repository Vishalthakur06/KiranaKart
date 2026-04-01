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

const sendViaSendGrid = async (orderDetails) => {
  try {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
    const adminEmail = process.env.ADMIN_EMAIL;

    const adminHTML = `<h1>New Order #${orderDetails.orderId}</h1><p>Amount: ₹${orderDetails.totalAmount}</p>`;
    const customerHTML = `<h1>Order Confirmed!</h1><p>Thank you ${orderDetails.customerName}!</p>`;

    if (adminEmail) {
      await sgMail.send({
        to: adminEmail,
        from: fromEmail,
        subject: `🛒 New Order #${orderDetails.orderId}`,
        html: adminHTML,
      });
    }

    if (orderDetails.customerEmail) {
      await sgMail.send({
        to: orderDetails.customerEmail,
        from: fromEmail,
        subject: `✅ Order Confirmed #${orderDetails.orderId}`,
        html: customerHTML,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("SendGrid error:", error);
    return { success: false, error: error.message };
  }
};

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

    if (adminEmail) {
      await transporter.sendMail({
        from: `"E-Commerce Store" <${emailUser}>`,
        to: adminEmail,
        subject: `🛒 New Order #${orderDetails.orderId}`,
        html: `<h1>New Order #${orderDetails.orderId}</h1><p>Amount: ₹${orderDetails.totalAmount}</p>`,
      });
    }

    if (orderDetails.customerEmail) {
      await transporter.sendMail({
        from: `"E-Commerce Store" <${emailUser}>`,
        to: orderDetails.customerEmail,
        subject: `✅ Order Confirmed #${orderDetails.orderId}`,
        html: `<h1>Order Confirmed!</h1><p>Thank you ${orderDetails.customerName}!</p>`,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Nodemailer error:", error);
    return { success: false, error: error.message };
  }
};

const sendDeliveryStatusEmail = async (orderDetails) => {
  try {
    const useSendGrid = process.env.SENDGRID_API_KEY;
    const statusConfig = {
      shipped: { icon: "🚚", title: "Order Shipped!" },
      delivered: { icon: "✅", title: "Order Delivered!" },
    };

    const config = statusConfig[orderDetails.status];
    if (!config) return { success: false };

    const html = `<h1>${config.icon} ${config.title}</h1><p>Order #${orderDetails.orderId}</p>`;

    if (useSendGrid) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;
      await sgMail.send({
        to: orderDetails.customerEmail,
        from: fromEmail,
        subject: `${config.icon} ${config.title}`,
        html,
      });
    } else {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      if (!emailUser || !emailPass) return { success: false };

      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: emailUser, pass: emailPass },
      });

      await transporter.sendMail({
        from: `"E-Commerce Store" <${emailUser}>`,
        to: orderDetails.customerEmail,
        subject: `${config.icon} ${config.title}`,
        html,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Delivery status email error:", error);
    return { success: false, error: error.message };
  }
};

const sendReturnRequestEmail = async (orderDetails) => {
  try {
    const useSendGrid = process.env.SENDGRID_API_KEY;
    const adminEmail = process.env.ADMIN_EMAIL;

    const userHTML = `
      <h1>🔄 Return Request Received</h1>
      <p>Hi ${orderDetails.customerName},</p>
      <p>We've received your return request for Order #${orderDetails.orderId.toString().slice(-6).toUpperCase()}</p>
      <p><strong>Reason:</strong> ${orderDetails.reason}</p>
      <p>Our team will review it within 24-48 hours.</p>
    `;

    const adminHTML = `
      <h1>⚠️ New Return Request</h1>
      <p><strong>Customer:</strong> ${orderDetails.customerName} (${orderDetails.customerEmail})</p>
      <p><strong>Order ID:</strong> #${orderDetails.orderId.toString().slice(-6).toUpperCase()}</p>
      <p><strong>Amount:</strong> ₹${orderDetails.amount}</p>
      <p><strong>Reason:</strong> ${orderDetails.reason}</p>
      <p><strong>Description:</strong> ${orderDetails.description}</p>
    `;

    if (useSendGrid) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;

      await sgMail.send({
        to: orderDetails.customerEmail,
        from: fromEmail,
        subject: `Return Request Received - Order #${orderDetails.orderId.toString().slice(-6).toUpperCase()}`,
        html: userHTML,
      });

      if (adminEmail) {
        await sgMail.send({
          to: adminEmail,
          from: fromEmail,
          subject: `🚨 New Return Request - Order #${orderDetails.orderId.toString().slice(-6).toUpperCase()}`,
          html: adminHTML,
        });
      }

      console.log("✅ Return request emails sent via SendGrid");
    } else {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

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

      await transporter.sendMail({
        from: `"E-Commerce Store" <${emailUser}>`,
        to: orderDetails.customerEmail,
        subject: `Return Request Received - Order #${orderDetails.orderId.toString().slice(-6).toUpperCase()}`,
        html: userHTML,
      });

      if (adminEmail) {
        await transporter.sendMail({
          from: `"E-Commerce Store" <${emailUser}>`,
          to: adminEmail,
          subject: `🚨 New Return Request - Order #${orderDetails.orderId.toString().slice(-6).toUpperCase()}`,
          html: adminHTML,
        });
      }

      console.log("✅ Return request emails sent via Nodemailer");
    }

    return { success: true };
  } catch (error) {
    console.error("Return request email error:", error);
    return { success: false, error: error.message };
  }
};

const sendReturnStatusEmail = async (orderDetails) => {
  try {
    const useSendGrid = process.env.SENDGRID_API_KEY;

    const statusConfig = {
      approved: {
        icon: "✅",
        title: "Return Approved!",
        message: `Your refund of ₹${orderDetails.refundAmount} will be processed within 5-7 business days.`,
      },
      rejected: {
        icon: "❌",
        title: "Return Request Update",
        message: `Unfortunately, we cannot process your return request. ${orderDetails.adminNote || ''}`,
      },
      completed: {
        icon: "💰",
        title: "Refund Completed!",
        message: `Your refund of ₹${orderDetails.refundAmount} has been processed successfully!`,
      }
    };

    const config = statusConfig[orderDetails.status];
    if (!config) return { success: false };

    const html = `
      <h1>${config.icon} ${config.title}</h1>
      <p>Hi ${orderDetails.customerName},</p>
      <p>${config.message}</p>
      <p><strong>Order ID:</strong> #${orderDetails.orderId.toString().slice(-6).toUpperCase()}</p>
    `;

    if (useSendGrid) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.EMAIL_USER;

      await sgMail.send({
        to: orderDetails.customerEmail,
        from: fromEmail,
        subject: `${config.icon} ${config.title} - Order #${orderDetails.orderId.toString().slice(-6).toUpperCase()}`,
        html,
      });

      console.log(`✅ Return ${orderDetails.status} email sent via SendGrid`);
    } else {
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;

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

      await transporter.sendMail({
        from: `"E-Commerce Store" <${emailUser}>`,
        to: orderDetails.customerEmail,
        subject: `${config.icon} ${config.title} - Order #${orderDetails.orderId.toString().slice(-6).toUpperCase()}`,
        html,
      });

      console.log(`✅ Return ${orderDetails.status} email sent via Nodemailer`);
    }

    return { success: true };
  } catch (error) {
    console.error("Return status email error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { 
  sendOrderNotifications, 
  sendDeliveryStatusEmail, 
  sendReturnRequestEmail, 
  sendReturnStatusEmail 
};
