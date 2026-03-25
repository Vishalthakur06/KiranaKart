# WhatsApp Notification Setup Guide

## Method 1: Twilio WhatsApp Sandbox (FREE - Best for Testing)

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up with email (FREE account)
3. Verify your phone number
4. Complete the form

### Step 2: Get WhatsApp Sandbox
1. Login to Twilio Console: https://console.twilio.com
2. Left sidebar me "Messaging" > "Try it out" > "Send a WhatsApp message"
3. Ya direct: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
4. Sandbox number dikhega (e.g., +1 415 523 8886)
5. Join code dikhega (e.g., "join <code>")

### Step 3: Connect Your WhatsApp
1. Apne phone se WhatsApp open karo
2. Twilio ke sandbox number ko message karo: "join <your-code>"
3. Confirmation message aayega
4. Ab tumhara WhatsApp connected hai!

### Step 4: Get Twilio Credentials
1. Twilio Console me jao
2. Dashboard pe "Account SID" aur "Auth Token" dikhega
3. Copy karo dono

### Step 5: Update .env File
```
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP=whatsapp:+919876543210
```

### Step 6: Install Twilio Package
```bash
cd backend
npm install twilio
```

---

## Method 2: CallMeBot (Completely FREE - No Registration)

### Step 1: Get API Key
1. WhatsApp pe is number ko message karo: **+34 644 31 81 96**
2. Message bhejo: "I allow callmebot to send me messages"
3. Tumhe API key milega reply me

### Step 2: Update .env
```
CALLMEBOT_PHONE=919876543210
CALLMEBOT_API_KEY=your_api_key_here
```

### Step 3: No package needed!
Simple fetch API se kaam ho jayega

---

## Method 3: WhatsApp Business API (Production - Paid)

### Providers:
1. **Gupshup** - https://www.gupshup.io
2. **Interakt** - https://www.interakt.shop
3. **Wati** - https://www.wati.io
4. **Aisensy** - https://www.aisensy.com

### Steps:
1. Sign up on any provider
2. Get API credentials
3. Verify your business
4. Get WhatsApp Business number
5. Use their API

---

## Recommendation:
- **Testing**: Use Twilio Sandbox (FREE)
- **Production**: Use CallMeBot (FREE but limited) or WhatsApp Business API (Paid)

Choose karo konsa method use karna hai, main code update kar dunga!
