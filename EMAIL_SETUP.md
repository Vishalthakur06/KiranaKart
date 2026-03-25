# Email Notification Setup Guide (100% FREE)

## Step 1: Gmail App Password Generate Karo

### Method:
1. **Google Account me jao:** https://myaccount.google.com
2. **Security** section me jao
3. **2-Step Verification** enable karo (agar already nahi hai)
4. **App passwords** search karo ya direct: https://myaccount.google.com/apppasswords
5. **Select app:** Mail
6. **Select device:** Other (Custom name) - "E-Commerce Backend" likh do
7. **Generate** button pe click karo
8. **16-digit password** milega - copy kar lo

## Step 2: .env File Update Karo

```env
ADMIN_EMAIL=tumhara_email@gmail.com
EMAIL_USER=tumhara_email@gmail.com
EMAIL_PASS=16_digit_app_password_yaha_paste_karo
```

**Example:**
```env
ADMIN_EMAIL=vishal@gmail.com
EMAIL_USER=vishal@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

## Step 3: Backend Restart Karo

```bash
cd backend
npm start
```

## Step 4: Test Karo!

Order place karo aur tumhare email pe beautiful notification aayega! 📧

---

## Features:

✅ **Beautiful HTML Email** with colors and styling
✅ **Order details** - ID, customer, amount, address
✅ **Payment method** - COD/Online
✅ **Delivery address** in highlighted box
✅ **100% FREE** - No cost, unlimited emails
✅ **Instant delivery** - Email turant aayega

---

## Troubleshooting:

**Agar email nahi aa raha:**
1. Check karo 2-Step Verification enabled hai
2. App Password sahi se copy kiya hai (spaces allowed)
3. Gmail account use kar rahe ho (Yahoo/Outlook nahi)
4. Backend console me error check karo

---

## Alternative Email Services:

### Gmail (Recommended):
- FREE
- 500 emails/day limit
- Best for small businesses

### Outlook/Hotmail:
```env
# Change service to 'hotmail'
```

### Yahoo:
```env
# Change service to 'yahoo'
```

---

**Enjoy FREE email notifications!** 🎉
