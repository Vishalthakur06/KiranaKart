# 🚀 E-Commerce Project - Complete Setup Guide

## ✅ What's Done:

1. ✅ Backend setup with Express, MongoDB, JWT
2. ✅ Frontend setup with React, Redux, Vite
3. ✅ Product seeding with real images (Unsplash)
4. ✅ Stripe payment gateway integration
5. ✅ Authentication & Authorization
6. ✅ Cart management
7. ✅ Order placement

## 📋 Prerequisites:

- Node.js installed
- MongoDB installed and running
- Stripe account with API keys

## 🔧 Setup Steps:

### 1. Add Stripe Keys

**Backend (.env file):**
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/mern-ecommerce
JWT_SECRET=Thakur@454775
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_SECRET_KEY
```

**Frontend (src/components/StripePayment.jsx):**
```javascript
const stripePromise = loadStripe("pk_test_YOUR_ACTUAL_PUBLISHABLE_KEY");
```

### 2. Start MongoDB

Open a terminal and run:
```bash
mongod
```

Or if MongoDB is a service, it should already be running.

### 3. Seed Database (First Time Only)

```bash
cd backend
node seed.js
```

This will populate your database with products.

### 4. Start Backend Server

```bash
cd backend
npm start
```

Backend will run on: http://localhost:5001

### 5. Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Frontend will run on: http://localhost:5173

## 🧪 Testing the Application:

### 1. Register/Login
- Go to http://localhost:5173
- Click "Login" or "Sign Up"
- Create an account

### 2. Browse Products
- View all products on home page
- Filter by category
- Search products

### 3. Add to Cart
- Click on any product
- Add to cart
- View cart

### 4. Make Payment
- Go to cart
- Click "Pay" button
- Enter test card details:
  - Card: 4242 4242 4242 4242
  - Expiry: 12/34
  - CVC: 123
  - ZIP: 12345

### 5. Admin Features (Optional)
- Register with admin credentials
- Access admin panel
- Manage products

## 🐛 Troubleshooting:

**MongoDB not connecting?**
- Check if MongoDB is running: `mongod`
- Check connection string in .env

**Stripe payment not working?**
- Verify keys are correct
- Check if test mode is enabled
- Check browser console for errors

**Port already in use?**
- Backend: Change PORT in .env
- Frontend: Change port in vite.config.js

**Images not loading?**
- Check internet connection (Unsplash CDN)
- Images are loaded from Unsplash API

## 📱 Features:

✅ User Authentication (JWT)
✅ Product Catalog with Images
✅ Shopping Cart
✅ Stripe Payment Integration
✅ Order Management
✅ Admin Panel
✅ Responsive Design
✅ Real-time Updates

## 🔑 Test Credentials:

**Regular User:**
- Register any new account

**Test Payment:**
- Card: 4242 4242 4242 4242
- Any future expiry date
- Any 3-digit CVC

## 📞 Need Help?

If you face any issues, check:
1. MongoDB is running
2. Both servers are running
3. Stripe keys are correct
4. No port conflicts
