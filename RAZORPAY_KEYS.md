# Razorpay Keys - Quick Setup

## Your Keys (Replace with actual keys)

```env
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
```

## Where to Paste?

File: `backend/.env`

Replace these lines:
```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

With your actual keys:
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXX
```

## Test Payment

After adding keys:

1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Add items to cart
4. Click "Pay Now"
5. Use test card:
   - Card: 4111 1111 1111 1111
   - CVV: 123
   - Expiry: 12/25

## Troubleshooting

If payment not working:
- Check if keys are correct in .env
- Restart backend server
- Check browser console for errors
- Make sure you're logged in

## Important Links

- Dashboard: https://dashboard.razorpay.com/
- API Keys: https://dashboard.razorpay.com/app/keys
- Test Cards: https://razorpay.com/docs/payments/payments/test-card-details/
