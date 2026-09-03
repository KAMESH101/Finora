// Coupon Marketplace Engine for Finora
export interface Coupon {
  id: string;
  title: string;
  brand: string;
  value: number;
  expiryDate: string;
  category: string;
  description: string;
  seller: string;
  price: number; // In Finora credits
  listedDate: string;
  status: 'active' | 'sold' | 'expired';
  popularity: number;
  autoSell: boolean;
  daysListed: number;
}

const COUPON_KEY = 'finora_coupons';
const USER_CREDITS_KEY = 'finora_credits';

// Initialize user credits
export const getUserCredits = (): number => {
  const stored = localStorage.getItem(USER_CREDITS_KEY);
  return stored ? parseInt(stored) : 500; // Initial 500 credits
};

export const updateUserCredits = (amount: number): void => {
  const current = getUserCredits();
  localStorage.setItem(USER_CREDITS_KEY, (current + amount).toString());
  window.dispatchEvent(new Event('creditsUpdate'));
};

// Get all coupons
export const getAllCoupons = (): Coupon[] => {
  const stored = localStorage.getItem(COUPON_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Initialize with sample coupons
  const sampleCoupons: Coupon[] = [
    {
      id: 'cpn_1',
      title: '₹500 off on ₹2000',
      brand: 'Amazon',
      value: 500,
      expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Shopping',
      description: 'Get ₹500 off on minimum purchase of ₹2000',
      seller: 'User123',
      price: 200,
      listedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      popularity: 85,
      autoSell: false,
      daysListed: 3
    },
    {
      id: 'cpn_2',
      title: 'Flat 40% off',
      brand: 'Swiggy',
      value: 200,
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Food',
      description: 'Flat 40% off on your next 3 orders',
      seller: 'FoodLover',
      price: 80,
      listedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      popularity: 92,
      autoSell: false,
      daysListed: 1
    },
    {
      id: 'cpn_3',
      title: '₹300 Cashback',
      brand: 'Flipkart',
      value: 300,
      expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      category: 'Shopping',
      description: 'Cashback on electronics',
      seller: 'TechGuru',
      price: 150,
      listedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      popularity: 78,
      autoSell: false,
      daysListed: 2
    }
  ];
  
  localStorage.setItem(COUPON_KEY, JSON.stringify(sampleCoupons));
  return sampleCoupons;
};

// List new coupon
export const listCoupon = (couponData: Omit<Coupon, 'id' | 'listedDate' | 'status' | 'daysListed'>): Coupon => {
  const coupons = getAllCoupons();
  
  const newCoupon: Coupon = {
    ...couponData,
    id: `cpn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    listedDate: new Date().toISOString(),
    status: 'active',
    daysListed: 0
  };
  
  coupons.unshift(newCoupon);
  localStorage.setItem(COUPON_KEY, JSON.stringify(coupons));
  window.dispatchEvent(new Event('couponsUpdate'));
  
  return newCoupon;
};

// Buy coupon
export const buyCoupon = (couponId: string): boolean => {
  const coupons = getAllCoupons();
  const coupon = coupons.find(c => c.id === couponId);
  
  if (!coupon || coupon.status !== 'active') {
    return false;
  }
  
  const userCredits = getUserCredits();
  if (userCredits < coupon.price) {
    return false; // Insufficient credits
  }
  
  // Deduct credits
  updateUserCredits(-coupon.price);
  
  // Mark as sold
  coupon.status = 'sold';
  localStorage.setItem(COUPON_KEY, JSON.stringify(coupons));
  window.dispatchEvent(new Event('couponsUpdate'));
  
  return true;
};

// AI Auto-Sell Logic
export const runAutoSellEngine = (): void => {
  const coupons = getAllCoupons();
  let updated = false;
  
  coupons.forEach(coupon => {
    if (coupon.status !== 'active') return;
    
    // Calculate days listed
    const listedDate = new Date(coupon.listedDate);
    const now = new Date();
    const daysListed = Math.floor((now.getTime() - listedDate.getTime()) / (1000 * 60 * 60 * 24));
    coupon.daysListed = daysListed;
    
    // Auto-list after 5 days if not already in auto-sell
    if (daysListed >= 5 && !coupon.autoSell) {
      coupon.autoSell = true;
      updated = true;
    }
    
    // AI price adjustment based on expiry and popularity
    if (coupon.autoSell) {
      const expiryDate = new Date(coupon.expiryDate);
      const daysToExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Reduce price as expiry approaches
      if (daysToExpiry < 7) {
        const reductionFactor = 0.7; // 30% off
        coupon.price = Math.round(coupon.price * reductionFactor);
        updated = true;
      } else if (daysToExpiry < 14) {
        const reductionFactor = 0.85; // 15% off
        coupon.price = Math.round(coupon.price * reductionFactor);
        updated = true;
      }
      
      // Adjust based on popularity
      if (coupon.popularity < 50) {
        coupon.price = Math.round(coupon.price * 0.9); // 10% off for low popularity
        updated = true;
      }
    }
    
    // Mark as expired
    const expiryDate = new Date(coupon.expiryDate);
    if (expiryDate < now) {
      coupon.status = 'expired';
      updated = true;
    }
  });
  
  if (updated) {
    localStorage.setItem(COUPON_KEY, JSON.stringify(coupons));
    window.dispatchEvent(new Event('couponsUpdate'));
  }
};

// Get user's listed coupons
export const getUserCoupons = (username: string = 'You'): Coupon[] => {
  const coupons = getAllCoupons();
  return coupons.filter(c => c.seller === username);
};

// Get coupon recommendations
export const getCouponRecommendations = (): Coupon[] => {
  const coupons = getAllCoupons();
  return coupons
    .filter(c => c.status === 'active')
    .sort((a, b) => {
      // Sort by expiry (urgent first) and popularity
      const aUrgency = new Date(a.expiryDate).getTime();
      const bUrgency = new Date(b.expiryDate).getTime();
      return (b.popularity - a.popularity) * 100 + (aUrgency - bUrgency);
    })
    .slice(0, 5);
};
