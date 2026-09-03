# API Integration Guide - Banking & Payment Gateways

## Overview

This guide provides comprehensive instructions for integrating production-ready APIs for banking (Sigma Open Banking) and payment gateways (Razorpay, Paytm, Google Pay) into FinAI India.

---

## 🏦 SIGMA OPEN BANKING API INTEGRATION

### 1. Registration & Setup

#### Step 1: Register for API Access
1. Visit [Sigma API Portal](https://sigma.co.in/developers) (placeholder URL)
2. Complete the developer registration form
3. Submit business documentation:
   - Company registration documents
   - PAN card
   - GST certificate
   - Use case description
4. Wait for approval (typically 2-5 business days)

#### Step 2: Obtain Credentials
After approval, you'll receive:
- **Client ID**: `YOUR_SIGMA_CLIENT_ID`
- **Client Secret**: `YOUR_SIGMA_CLIENT_SECRET`
- **Webhook Secret**: For verifying webhook signatures
- **Sandbox API Key**: For testing

#### Step 3: Update Configuration
File: `/utils/bankingAPI.ts`

```typescript
const SIGMA_CONFIG = {
  apiUrl: 'https://api.sigma.co.in/v1', // Production URL
  clientId: process.env.SIGMA_CLIENT_ID, // Store in environment variables
  clientSecret: process.env.SIGMA_CLIENT_SECRET,
  redirectUri: 'https://yourdomain.com/auth/callback',
  environment: 'production' // Change from 'sandbox' to 'production'
};
```

### 2. OAuth2 Implementation

#### Authorization Flow

```typescript
// 1. Redirect user to Sigma's OAuth consent page
export async function initiateBankAccountLink(): Promise<string> {
  const authUrl = `${SIGMA_CONFIG.apiUrl}/oauth/authorize?` +
    `client_id=${SIGMA_CONFIG.clientId}&` +
    `redirect_uri=${encodeURIComponent(SIGMA_CONFIG.redirectUri)}&` +
    `response_type=code&` +
    `scope=accounts transactions&` +
    `state=${generateSecureState()}`; // CSRF protection
  
  window.location.href = authUrl;
}

// 2. Handle callback and exchange code for token
export async function handleAuthCallback(code: string): Promise<string> {
  const response = await fetch(`${SIGMA_CONFIG.apiUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${SIGMA_CONFIG.clientId}:${SIGMA_CONFIG.clientSecret}`)
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SIGMA_CONFIG.redirectUri
    })
  });
  
  const data = await response.json();
  return data.access_token; // Store securely (encrypted in database)
}
```

### 3. API Endpoints

#### Fetch Bank Accounts
```typescript
export async function fetchBankAccounts(accessToken: string): Promise<BankAccount[]> {
  const response = await fetch(`${SIGMA_CONFIG.apiUrl}/accounts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Request-ID': generateRequestId() // For tracking
    }
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return await response.json();
}
```

#### Fetch Transactions
```typescript
export async function fetchTransactions(
  accessToken: string,
  accountId: string,
  filters?: {
    startDate?: string; // Format: YYYY-MM-DD
    endDate?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }
): Promise<Transaction[]> {
  const queryParams = new URLSearchParams();
  
  if (filters?.startDate) queryParams.append('from_date', filters.startDate);
  if (filters?.endDate) queryParams.append('to_date', filters.endDate);
  if (filters?.category) queryParams.append('category', filters.category);
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  if (filters?.offset) queryParams.append('offset', filters.offset.toString());
  
  const response = await fetch(
    `${SIGMA_CONFIG.apiUrl}/accounts/${accountId}/transactions?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return await response.json();
}
```

### 4. Webhook Setup

#### Register Webhook
```typescript
export async function registerWebhook(
  accessToken: string,
  webhookUrl: string,
  events: string[]
): Promise<{ webhookId: string; secret: string }> {
  const response = await fetch(`${SIGMA_CONFIG.apiUrl}/webhooks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: webhookUrl,
      events: events, // ['transaction.created', 'account.updated', etc.]
      active: true
    })
  });
  
  return await response.json();
}
```

#### Verify Webhook Signature
```typescript
import crypto from 'crypto';

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Express.js webhook handler example
app.post('/webhooks/sigma', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-sigma-signature'] as string;
  const payload = req.body.toString();
  
  if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  
  // Handle different event types
  switch (event.type) {
    case 'transaction.created':
      handleNewTransaction(event.data);
      break;
    case 'account.updated':
      handleAccountUpdate(event.data);
      break;
    // ... other events
  }
  
  res.status(200).send('OK');
});
```

### 5. Consent Management (RBI-AA Compliance)

```typescript
export async function requestConsent(
  accessToken: string,
  userId: string,
  dataTypes: string[],
  purpose: string,
  expiryDays: number = 365
): Promise<ConsentRequest> {
  const response = await fetch(`${SIGMA_CONFIG.apiUrl}/consent/request`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      data_types: dataTypes, // ['accounts', 'transactions', 'balance']
      purpose: purpose,
      expiry_date: addDays(new Date(), expiryDays).toISOString(),
      frequency: {
        unit: 'DAY',
        value: 1
      }
    })
  });
  
  return await response.json();
}

export async function revokeConsent(
  accessToken: string,
  consentId: string
): Promise<void> {
  await fetch(`${SIGMA_CONFIG.apiUrl}/consent/${consentId}/revoke`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}
```

### 6. Security Best Practices

1. **Encryption**: All data must be encrypted at rest (AES-256) and in transit (TLS 1.3)
2. **Token Storage**: Store access tokens encrypted in secure database
3. **Token Refresh**: Implement automatic token refresh before expiry
4. **Rate Limiting**: Respect API rate limits (typically 100 req/min)
5. **Error Handling**: Implement exponential backoff for retries
6. **Audit Logging**: Log all API calls for compliance

```typescript
// Token refresh implementation
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch(`${SIGMA_CONFIG.apiUrl}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${SIGMA_CONFIG.clientId}:${SIGMA_CONFIG.clientSecret}`)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });
  
  const data = await response.json();
  return data.access_token;
}
```

---

## 💳 RAZORPAY INTEGRATION

### 1. Setup

#### Register & Get Credentials
1. Visit [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Complete KYC verification
3. Navigate to Settings → API Keys
4. Generate Key ID and Secret

#### Update Configuration
File: `/utils/paymentGateway.ts`

```typescript
const RAZORPAY_CONFIG = {
  keyId: process.env.RAZORPAY_KEY_ID, // e.g., rzp_live_xxxxx
  keySecret: process.env.RAZORPAY_KEY_SECRET, // NEVER expose in frontend
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
};
```

### 2. Backend Implementation (Node.js/Express)

```typescript
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create order endpoint
app.post('/api/razorpay/create-order', async (req, res) => {
  const { amount, currency = 'INR', receipt } = req.body;
  
  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
      payment_capture: 1 // Auto-capture payment
    });
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment signature
app.post('/api/razorpay/verify-payment', (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  
  const text = `${orderId}|${paymentId}`;
  const generated = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  if (generated === signature) {
    // Payment is authentic
    // Update database, send confirmation email, etc.
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false });
  }
});
```

### 3. Frontend Implementation

```typescript
export async function initiateRazorpayPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  // Step 1: Create order on backend
  const orderResponse = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: request.amount,
      receipt: `receipt_${Date.now()}`
    })
  });
  
  const { orderId, amount } = await orderResponse.json();
  
  // Step 2: Open Razorpay checkout
  const options = {
    key: process.env.RAZORPAY_KEY_ID, // Only key_id in frontend
    amount: amount,
    currency: 'INR',
    name: 'FinAI India',
    description: request.description,
    order_id: orderId,
    handler: async function (response: any) {
      // Step 3: Verify payment on backend
      const verifyResponse = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature
        })
      });
      
      const { verified } = await verifyResponse.json();
      
      if (verified) {
        toast.success('Payment successful!');
      } else {
        toast.error('Payment verification failed');
      }
    },
    prefill: {
      name: 'User Name',
      email: 'user@example.com',
      contact: '9999999999'
    },
    theme: {
      color: '#1E3A8A'
    },
    method: {
      upi: true,
      card: true,
      netbanking: true,
      wallet: true
    }
  };
  
  const razorpay = new (window as any).Razorpay(options);
  razorpay.open();
}
```

### 4. Load Razorpay Script

Add to `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

### 5. Webhook Handler

```typescript
app.post('/webhooks/razorpay', express.raw({ type: 'application/json' }), (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookBody = req.body.toString();
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(webhookBody)
    .digest('hex');
  
  if (webhookSignature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(webhookBody);
  
  switch (event.event) {
    case 'payment.captured':
      handlePaymentCaptured(event.payload.payment.entity);
      break;
    case 'payment.failed':
      handlePaymentFailed(event.payload.payment.entity);
      break;
    case 'refund.created':
      handleRefundCreated(event.payload.refund.entity);
      break;
  }
  
  res.status(200).send('OK');
});
```

---

## 💰 PAYTM INTEGRATION

### 1. Setup

1. Register at [Paytm Dashboard](https://dashboard.paytm.com/next/signup)
2. Complete KYC and business verification
3. Get credentials:
   - Merchant ID (MID)
   - Merchant Key
   - Website name

### 2. Backend Implementation

```typescript
import crypto from 'crypto';
import axios from 'axios';

// Generate checksum
function generateChecksum(params: any, merchantKey: string): string {
  const data = Object.keys(params)
    .sort()
    .reduce((obj: any, key) => {
      obj[key] = params[key];
      return obj;
    }, {});
  
  const dataString = JSON.stringify(data);
  const checksum = crypto
    .createHmac('sha256', merchantKey)
    .update(dataString)
    .digest('base64');
  
  return checksum;
}

// Create transaction
app.post('/api/paytm/initiate-transaction', async (req, res) => {
  const { amount, orderId, customerId } = req.body;
  
  const params = {
    MID: process.env.PAYTM_MERCHANT_ID,
    WEBSITE: process.env.PAYTM_WEBSITE || 'WEBSTAGING',
    INDUSTRY_TYPE_ID: 'Retail',
    CHANNEL_ID: 'WEB',
    ORDER_ID: orderId,
    CUST_ID: customerId,
    TXN_AMOUNT: amount.toString(),
    CALLBACK_URL: `${process.env.APP_URL}/api/paytm/callback`
  };
  
  const checksum = generateChecksum(params, process.env.PAYTM_MERCHANT_KEY);
  
  res.json({
    ...params,
    CHECKSUMHASH: checksum,
    txnToken: checksum // For Paytm All-in-One SDK
  });
});

// Handle callback
app.post('/api/paytm/callback', (req, res) => {
  const { CHECKSUMHASH, ...responseData } = req.body;
  
  // Verify checksum
  const isValid = verifyChecksum(
    responseData,
    CHECKSUMHASH,
    process.env.PAYTM_MERCHANT_KEY
  );
  
  if (isValid && responseData.STATUS === 'TXN_SUCCESS') {
    // Payment successful
    // Update database
    res.redirect('/payment/success');
  } else {
    res.redirect('/payment/failed');
  }
});
```

### 3. Frontend Implementation

```typescript
export async function initiatePaytmPayment(request: PaymentRequest): Promise<PaymentResponse> {
  // Get transaction token from backend
  const response = await fetch('/api/paytm/initiate-transaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: request.amount,
      orderId: `ORDER_${Date.now()}`,
      customerId: 'CUST_001'
    })
  });
  
  const { txnToken, MID, ORDER_ID } = await response.json();
  
  // Initialize Paytm All-in-One SDK
  const config = {
    root: '',
    flow: 'DEFAULT',
    data: {
      orderId: ORDER_ID,
      token: txnToken,
      tokenType: 'TXN_TOKEN',
      amount: request.amount.toString()
    },
    merchant: {
      mid: MID,
      redirect: false
    },
    handler: {
      notifyMerchant: function (eventName: string, data: any) {
        if (eventName === 'APP_CLOSED') {
          console.log('Payment cancelled');
        }
      },
      transactionStatus: function (data: any) {
        if (data.STATUS === 'TXN_SUCCESS') {
          toast.success('Payment successful!');
        } else {
          toast.error('Payment failed');
        }
      }
    }
  };
  
  if ((window as any).Paytm && (window as any).Paytm.CheckoutJS) {
    (window as any).Paytm.CheckoutJS.init(config).then(() => {
      (window as any).Paytm.CheckoutJS.invoke();
    });
  }
}
```

---

## 📱 GOOGLE PAY (UPI) INTEGRATION

### 1. Setup

1. Register at [Google Pay Business Console](https://pay.google.com/business/console)
2. Get Merchant ID
3. Configure payment methods

### 2. Implementation

```typescript
export async function initiateGPayPayment(request: PaymentRequest): Promise<PaymentResponse> {
  const paymentDataRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'UPI',
        parameters: {
          payeeVpa: request.upiId, // Merchant UPI ID
          payeeName: 'FinAI India',
          transactionReferenceId: `TXN${Date.now()}`,
          transactionNote: request.description,
          mcc: '5732', // Merchant Category Code
          url: 'https://yourdomain.com'
        },
        tokenizationSpecification: {
          type: 'DIRECT'
        }
      }
    ],
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: request.amount.toString(),
      currencyCode: 'INR',
      countryCode: 'IN'
    },
    merchantInfo: {
      merchantId: process.env.GPAY_MERCHANT_ID,
      merchantName: 'FinAI India'
    }
  };
  
  const paymentsClient = new google.payments.api.PaymentsClient({
    environment: 'PRODUCTION' // 'TEST' for testing
  });
  
  try {
    const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
    
    // Send payment data to backend for verification
    const response = await fetch('/api/gpay/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    return await response.json();
  } catch (error) {
    throw new Error('Payment failed');
  }
}
```

---

## 🔒 SECURITY CHECKLIST

- [ ] All API keys stored in environment variables
- [ ] Backend API routes secured with authentication
- [ ] Payment signatures verified on backend
- [ ] Webhooks validated with signature verification
- [ ] Rate limiting implemented
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection enabled
- [ ] CSRF tokens used for state-changing operations
- [ ] TLS 1.3 enabled for all API calls
- [ ] PCI-DSS compliance for card payments
- [ ] Data encrypted at rest (AES-256)
- [ ] Audit logging implemented
- [ ] Error messages don't expose sensitive data
- [ ] Session management secured
- [ ] Regular security audits scheduled

---

## 📊 TESTING

### Sandbox Testing

#### Razorpay Test Cards
- **Success**: 4111 1111 1111 1111
- **Failure**: 4222 2222 2222 2222
- **CVV**: Any 3 digits
- **Expiry**: Any future date

#### Test UPI IDs
- `success@razorpay`
- `failure@razorpay`

#### Paytm Test Credentials
- Test Merchant ID provided in dashboard
- Use staging environment

### Production Checklist
- [ ] Switch all configs to production URLs
- [ ] Replace test credentials with production keys
- [ ] Test with real bank accounts
- [ ] Verify webhook endpoints are public
- [ ] Monitor error rates
- [ ] Set up alerts for failed payments

---

## 🐛 TROUBLESHOOTING

### Common Issues

1. **"Invalid Signature" Error**
   - Verify webhook secret is correct
   - Check if payload is being modified before verification
   - Ensure using raw body for signature verification

2. **Payment Stuck in Pending**
   - Check webhook endpoint is accessible
   - Verify webhook signature validation
   - Check logs for delivery failures

3. **Bank Account Linking Fails**
   - Verify redirect URI matches exactly
   - Check OAuth2 scopes are correct
   - Ensure user has completed bank's consent flow

4. **Transaction Fetch Timeout**
   - Implement pagination
   - Add caching layer
   - Increase timeout limits

---

## 📞 SUPPORT CONTACTS

- **Razorpay**: support@razorpay.com | https://razorpay.com/docs/
- **Paytm**: business.support@paytm.com | https://business.paytm.com/docs/
- **Google Pay**: https://pay.google.com/intl/en_in/about/business/

---

## 📝 COMPLIANCE REQUIREMENTS

### RBI-AA Framework
- Explicit user consent required
- Consent expiry management
- Data access audit trails
- User right to revoke access

### PCI-DSS (Payment Card Industry)
- Never store card CVV
- Encrypt card data at rest
- Regular security assessments
- Network segmentation

### PSD2 (if applicable)
- Strong Customer Authentication (SCA)
- Secure customer authentication
- Transaction risk analysis

---

Last Updated: October 28, 2025
Version: 1.0.0
