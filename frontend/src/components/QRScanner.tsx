import { useState } from 'react';
import { motion } from 'motion/react';
import { QrCode, X, CheckCircle, AlertCircle, Scan, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { makePayment, getWallet } from '../utils/walletManager';
import { formatCurrency } from '../mockData';
import { toast } from 'sonner@2.0.3';

interface QRScannerProps {
  onClose: () => void;
}

export function QRScanner({ onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const wallet = getWallet();

  // Simulated QR codes for demo
  const mockQRCodes = [
    { id: 'qr_1', merchant: 'Chennai Cafe', upi: 'chennaicafe@paytm' },
    { id: 'qr_2', merchant: 'Mumbai Mart', upi: 'mumbaimart@phonepe' },
    { id: 'qr_3', merchant: 'Delhi Dhaba', upi: 'delhidhaba@gpay' },
    { id: 'qr_4', merchant: 'Bangalore Bakery', upi: 'blrbakery@upi' },
    { id: 'qr_5', merchant: 'Kolkata Sweets', upi: 'kolsweets@paytm' }
  ];

  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate QR scanning
    setTimeout(() => {
      const randomQR = mockQRCodes[Math.floor(Math.random() * mockQRCodes.length)];
      setScanResult(randomQR.id);
      setMerchant(randomQR.merchant);
      setIsScanning(false);
      setShowPaymentDialog(true);
    }, 2000);
  };

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    
    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (paymentAmount > wallet.balance) {
      toast.error('Insufficient balance!', {
        description: `You need ₹${(paymentAmount - wallet.balance).toLocaleString('en-IN')} more`
      });
      return;
    }

    // Get user location (mock)
    const mockLocations = [
      { lat: 13.0827, lng: 80.2707, address: 'T. Nagar, Chennai' },
      { lat: 19.0760, lng: 72.8777, address: 'Andheri, Mumbai' },
      { lat: 28.7041, lng: 77.1025, address: 'Connaught Place, Delhi' },
      { lat: 12.9716, lng: 77.5946, address: 'Indiranagar, Bangalore' },
      { lat: 22.5726, lng: 88.3639, address: 'Park Street, Kolkata' }
    ];
    const location = mockLocations[Math.floor(Math.random() * mockLocations.length)];

    const transaction = await makePayment(merchant, paymentAmount, undefined, location, undefined, 'qr');

    if (transaction) {
      setPaymentSuccess(true);
      toast.success('Payment Successful!', {
        description: `Paid ${formatCurrency(paymentAmount)} to ${merchant}`
      });

      setTimeout(() => {
        setShowPaymentDialog(false);
        setPaymentSuccess(false);
        setAmount('');
        setMerchant('');
        setScanResult(null);
        onClose();
      }, 2000);
    } else {
      toast.error('Payment failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  Scan & Pay
                </CardTitle>
                <CardDescription>Scan any QR code to make instant payments</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Balance Display */}
            <div className="card-hero p-4 rounded-lg">
              <p className="relative text-sm text-white/70 mb-1">Available Balance</p>
              <p className="relative balance-figure text-2xl">{formatCurrency(wallet.balance)}</p>
            </div>

            {/* Scanner */}
            <div className="relative">
              <div className="aspect-square rounded-lg overflow-hidden relative" style={{ background: 'var(--secondary)' }}>
                {!isScanning && !scanResult && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <QrCode className="w-24 h-24 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Position QR code within frame</p>
                    <Button onClick={handleScan} className="mt-6" size="lg">
                      <Scan className="w-5 h-5" />
                      Start Scanning
                    </Button>
                  </div>
                )}

                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity
                      }}
                      className="w-48 h-48 border-4 rounded-lg"
                      style={{ borderColor: 'var(--ink)' }}
                    />
                    <div className="absolute">
                      <Sparkles className="w-16 h-16 animate-pulse" style={{ color: 'var(--ink)' }} />
                    </div>
                  </div>
                )}

                {scanResult && !isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'color-mix(in oklab, var(--money-in) 10%, transparent)' }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      className="text-center"
                    >
                      <CheckCircle className="w-24 h-24 text-money-in mx-auto mb-4" />
                      <p className="text-xl mb-2">QR code detected!</p>
                      <Badge variant="secondary" className="text-lg px-4 py-2">{merchant}</Badge>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Demo Buttons */}
            {!isScanning && !scanResult && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Quick Demo - Try these merchants:</p>
                <div className="grid grid-cols-2 gap-2">
                  {mockQRCodes.slice(0, 4).map((qr) => (
                    <Button
                      key={qr.id}
                      variant="outline"
                      onClick={() => {
                        setScanResult(qr.id);
                        setMerchant(qr.merchant);
                        setShowPaymentDialog(true);
                      }}
                    >
                      {qr.merchant}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>Enter amount to pay {merchant}</DialogDescription>
          </DialogHeader>

          {!paymentSuccess ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="relative mt-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-8"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Paying to</span>
                <span className="font-semibold">{merchant}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Available Balance</span>
                <span className="font-semibold">{formatCurrency(wallet.balance)}</span>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handlePayment} className="flex-1">
                  Pay Now
                </Button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-8 text-center fin-confirm-flash rounded-xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              >
                <CheckCircle className="w-20 h-20 text-money-in mx-auto mb-4" />
              </motion.div>
              <h3 className="font-display text-xl mb-2">Payment successful!</h3>
              <p className="balance-figure text-2xl text-money-in mb-1">{formatCurrency(parseFloat(amount))}</p>
              <p className="text-sm text-muted-foreground">paid to {merchant}</p>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
