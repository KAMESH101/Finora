// Payment Gateway Integration - Razorpay, Paytm, GPay
// This is a mock implementation. Replace with actual payment gateway SDKs in production.

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'upi' | 'card' | 'netbanking' | 'wallet';
  icon: string;
  enabled: boolean;
}

export interface PaymentRequest {
  amount: number;
  description: string;
  recipient?: string;
  upiId?: string;
  method: 'upi' | 'card' | 'netbanking' | 'wallet' | 'qr';
}

export interface PaymentResponse {
  id: string;
  status: 'pending' | 'success' | 'failed';
  amount: number;
  transactionId: string;
  timestamp: string;
  method: string;
  recipient?: string;
}

// Mock configuration - Replace with actual credentials in production
const RAZORPAY_CONFIG = {
  keyId: 'rzp_test_YOUR_KEY_ID', // Replace with actual Razorpay key
  keySecret: 'YOUR_RAZORPAY_SECRET', // Store securely in backend
  webhookSecret: 'YOUR_WEBHOOK_SECRET'
};

const PAYTM_CONFIG = {
  merchantId: 'YOUR_PAYTM_MERCHANT_ID',
  merchantKey: 'YOUR_PAYTM_MERCHANT_KEY',
  website: 'WEBSTAGING', // 'WEBSTAGING' for test, 'DEFAULT' for production
  industryType: 'Retail',
  channelId: 'WEB'
};

const GPAY_CONFIG = {
  merchantId: 'YOUR_GPAY_MERCHANT_ID',
  merchantName: 'FinAI India'
};

// Available payment gateways
export const paymentGateways: PaymentGateway[] = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    type: 'upi',
    icon: '💳',
    enabled: true
  },
  {
    id: 'paytm',
    name: 'Paytm',
    type: 'wallet',
    icon: '💰',
    enabled: true
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    type: 'upi',
    icon: '📱',
    enabled: true
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    type: 'upi',
    icon: '☎️',
    enabled: true
  }
];

/**
 * Initialize Razorpay payment
 * Documentation: https://razorpay.com/docs/payments/
 */
export async function initiateRazorpayPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  // Mock implementation
  // In production:
  // 1. Create order on backend: POST /api/razorpay/create-order
  // 2. Initialize Razorpay checkout:
  //    const options = {
  //      key: RAZORPAY_CONFIG.keyId,
  //      amount: request.amount * 100, // paise
  //      currency: 'INR',
  //      name: 'FinAI India',
  //      description: request.description,
  //      order_id: orderId,
  //      handler: function(response) {
  //        // Verify payment signature on backend
  //        verifyPayment(response.razorpay_payment_id);
  //      }
  //    };
  //    const rzp = new Razorpay(options);
  //    rzp.open();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'pay_' + Date.now(),
        status: 'success',
        amount: request.amount,
        transactionId: 'RZP' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        timestamp: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        method: 'Razorpay UPI',
        recipient: request.recipient
      });
    }, 2000);
  });
}

/**
 * Initialize Paytm payment
 * Documentation: https://developer.paytm.com/docs/
 */
export async function initiatePaytmPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  // Mock implementation
  // In production:
  // 1. Generate checksum on backend
  // 2. Initialize Paytm payment:
  //    const config = {
  //      merchant: {
  //        mid: PAYTM_CONFIG.merchantId,
  //        redirect: true
  //      },
  //      flow: 'DEFAULT',
  //      data: {
  //        orderId: 'ORDER_' + Date.now(),
  //        amount: request.amount.toString(),
  //        token: txnToken
  //      }
  //    };
  //    Paytm.CheckoutJS.init(config).then(() => {
  //      Paytm.CheckoutJS.invoke();
  //    });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'pay_' + Date.now(),
        status: 'success',
        amount: request.amount,
        transactionId: 'PTM' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        timestamp: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        method: 'Paytm Wallet',
        recipient: request.recipient
      });
    }, 2000);
  });
}

/**
 * Initialize Google Pay (UPI) payment
 * Documentation: https://developers.google.com/pay/india/
 */
export async function initiateGPayPayment(
  request: PaymentRequest
): Promise<PaymentResponse> {
  // Mock implementation
  // In production, use Google Pay for Web:
  // const paymentDataRequest = {
  //   apiVersion: 2,
  //   apiVersionMinor: 0,
  //   allowedPaymentMethods: [{
  //     type: 'UPI',
  //     parameters: {
  //       payeeVpa: request.upiId,
  //       payeeName: GPAY_CONFIG.merchantName,
  //       transactionReferenceId: 'TXN' + Date.now(),
  //       transactionNote: request.description
  //     }
  //   }],
  //   transactionInfo: {
  //     totalPrice: request.amount.toString(),
  //     totalPriceStatus: 'FINAL',
  //     currencyCode: 'INR'
  //   },
  //   merchantInfo: {
  //     merchantId: GPAY_CONFIG.merchantId,
  //     merchantName: GPAY_CONFIG.merchantName
  //   }
  // };
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'pay_' + Date.now(),
        status: 'success',
        amount: request.amount,
        transactionId: 'GPAY' + Math.random().toString(36).substring(2, 12).toUpperCase(),
        timestamp: new Date().toLocaleString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        method: 'Google Pay',
        recipient: request.recipient
      });
    }, 2000);
  });
}

/**
 * Generate UPI deep link for QR code
 * Standard UPI URI format
 */
export function generateUPILink(
  upiId: string,
  amount: number,
  description: string,
  transactionNote?: string
): string {
  // UPI URI Scheme: upi://pay?parameters
  const params = new URLSearchParams({
    pa: upiId, // Payee address (UPI ID)
    pn: 'FinAI India', // Payee name
    am: amount.toString(), // Amount
    cu: 'INR', // Currency
    tn: transactionNote || description // Transaction note
  });
  
  return `upi://pay?${params.toString()}`;
}

/**
 * Generate QR code data for UPI payment
 * Can be used with libraries like qrcode.react or html5-qrcode
 */
export function generateQRData(
  upiId: string,
  amount: number,
  description: string
): string {
  return generateUPILink(upiId, amount, description);
}

/**
 * Verify payment signature (for webhooks)
 * Required for security and fraud prevention
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  gateway: 'razorpay' | 'paytm'
): boolean {
  // Mock implementation
  // In production (Razorpay example):
  // const crypto = require('crypto');
  // const text = orderId + '|' + paymentId;
  // const generated = crypto
  //   .createHmac('sha256', RAZORPAY_CONFIG.keySecret)
  //   .update(text)
  //   .digest('hex');
  // return generated === signature;
  
  return true;
}

/**
 * Process refund
 */
export async function processRefund(
  paymentId: string,
  amount: number,
  gateway: 'razorpay' | 'paytm' | 'gpay'
): Promise<{ refundId: string; status: string }> {
  // Mock implementation
  // In production (Razorpay example):
  // const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': 'Basic ' + btoa(`${RAZORPAY_CONFIG.keyId}:${RAZORPAY_CONFIG.keySecret}`),
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({ amount: amount * 100 })
  // });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        refundId: 'rfnd_' + Date.now(),
        status: 'processed'
      });
    }, 1500);
  });
}

/**
 * Fetch payment status
 */
export async function getPaymentStatus(
  paymentId: string,
  gateway: 'razorpay' | 'paytm' | 'gpay'
): Promise<PaymentResponse> {
  // Mock implementation
  // In production: GET /payments/{paymentId}
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: paymentId,
        status: 'success',
        amount: 1000,
        transactionId: 'TXN123456',
        timestamp: new Date().toLocaleString('en-IN'),
        method: gateway
      });
    }, 500);
  });
}

/**
 * Setup payment webhook
 * For real-time payment status updates
 */
export async function setupPaymentWebhook(
  webhookUrl: string,
  events: string[]
): Promise<{ webhookId: string; secret: string }> {
  // Mock implementation
  // In production (Razorpay example):
  // POST https://api.razorpay.com/v1/webhooks
  // Body: {
  //   url: webhookUrl,
  //   active: true,
  //   events: ['payment.authorized', 'payment.failed', 'refund.created']
  // }
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        webhookId: 'webhook_' + Date.now(),
        secret: 'whsec_' + Math.random().toString(36).substring(7)
      });
    }, 500);
  });
}

// Payment history mock data
export const mockPaymentHistory: PaymentResponse[] = [
  {
    id: 'pay_1',
    status: 'success',
    amount: 1250,
    transactionId: 'RZP8745612ABC',
    timestamp: '27-10-2025 20:15',
    method: 'Razorpay UPI',
    recipient: 'swiggy@paytm'
  },
  {
    id: 'pay_2',
    status: 'success',
    amount: 3500,
    transactionId: 'GPAY456789XYZ',
    timestamp: '24-10-2025 18:45',
    method: 'Google Pay',
    recipient: 'uber.india@axisbank'
  },
  {
    id: 'pay_3',
    status: 'success',
    amount: 499,
    transactionId: 'PTM963852MNO',
    timestamp: '26-10-2025 08:30',
    method: 'Paytm Wallet',
    recipient: 'netflix@paytm'
  }
];
