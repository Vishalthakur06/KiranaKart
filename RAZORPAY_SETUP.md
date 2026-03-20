# Razorpay Payment Gateway Setup

## Backend Setup ✅ DONE

1. ✅ Installed Razorpay package
2. ✅ Created payment routes (`/api/payment/create-order` and `/api/payment/verify-payment`)
3. ✅ Added payment route to server.js
4. ✅ Added Razorpay credentials to .env file

## Frontend Setup ✅ DONE

1. ✅ Created RazorpayPayment component
2. ✅ Integrated payment in Cart page
3. ✅ Payment flow: Create Order → Open Razorpay → Verify Payment → Place Order

## How to Get Razorpay Keys

1. Go to https://razorpay.com/
2. Sign up for FREE account
3. Go to Settings → API Keys
4. Generate Test Keys (for development)
5. Copy Key ID and Key Secret

## Update .env File

Open `backend/.env` and replace:

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

With your actual keys from Razorpay dashboard.

## Test Mode

- Razorpay provides test mode for development
- Use test cards for testing payments
- Test Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

## Payment Flow

1. User adds items to cart
2. Clicks "Pay Now" button
3. Razorpay popup opens
4. User enters payment details
5. Payment is verified on backend
6. Order is placed in database
7. Success message shown

## Features

✅ Secure payment processing
✅ Payment verification with signature
✅ Order creation after successful payment
✅ Error handling for failed payments
✅ Loading states
✅ Test mode support

## Run the Project

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Important Notes

- Never commit real API keys to Git
- Use environment variables for sensitive data
- Test thoroughly before going live
- Switch to live keys only in production
