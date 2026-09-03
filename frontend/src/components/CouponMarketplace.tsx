import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, Plus, TrendingUp, Clock, Tag, Sparkles, Crown, ShoppingBag, ArrowRight, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getAllCoupons, listCoupon, buyCoupon, getUserCredits, runAutoSellEngine, getCouponRecommendations, Coupon } from '../utils/couponEngine';
import { formatCurrency } from '../mockData';
import { toast } from 'sonner@2.0.3';

interface CouponMarketplaceProps {
  onClose: () => void;
}

export function CouponMarketplace({ onClose }: CouponMarketplaceProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [credits, setCredits] = useState(getUserCredits());
  const [showListDialog, setShowListDialog] = useState(false);
  const [filter, setFilter] = useState('all');

  // Form state
  const [newCoupon, setNewCoupon] = useState({
    title: '',
    brand: '',
    value: 0,
    expiryDate: '',
    category: 'Shopping',
    description: '',
    price: 0,
    autoSell: false
  });

  useEffect(() => {
    loadCoupons();
    runAutoSellEngine(); // Run AI auto-sell

    const interval = setInterval(() => {
      runAutoSellEngine();
      loadCoupons();
    }, 30000); // Check every 30 seconds

    const handleUpdate = () => {
      loadCoupons();
      setCredits(getUserCredits());
    };

    window.addEventListener('couponsUpdate', handleUpdate);
    window.addEventListener('creditsUpdate', handleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('couponsUpdate', handleUpdate);
      window.removeEventListener('creditsUpdate', handleUpdate);
    };
  }, []);

  const loadCoupons = () => {
    setCoupons(getAllCoupons());
  };

  const handleListCoupon = () => {
    if (!newCoupon.title || !newCoupon.brand || newCoupon.value <= 0 || newCoupon.price <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const listed = listCoupon({
      ...newCoupon,
      seller: 'You',
      popularity: 50
    });

    toast.success('Coupon Listed Successfully!', {
      description: `${newCoupon.title} is now available in marketplace`
    });

    setShowListDialog(false);
    setNewCoupon({
      title: '',
      brand: '',
      value: 0,
      expiryDate: '',
      category: 'Shopping',
      description: '',
      price: 0,
      autoSell: false
    });
    loadCoupons();
  };

  const handleBuyCoupon = (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;

    const success = buyCoupon(couponId);
    
    if (success) {
      toast.success('Coupon Purchased!', {
        description: `You bought ${coupon.title} for ${coupon.price} credits`
      });
      setCredits(getUserCredits());
      loadCoupons();
    } else {
      toast.error('Purchase Failed', {
        description: 'Insufficient credits or coupon unavailable'
      });
    }
  };

  const getDaysToExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const filteredCoupons = coupons.filter(c => {
    if (filter === 'all') return c.status === 'active';
    if (filter === 'my-listings') return c.seller === 'You';
    if (filter === 'auto-sell') return c.autoSell && c.status === 'active';
    return c.category.toLowerCase() === filter && c.status === 'active';
  });

  const recommendations = getCouponRecommendations();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-6xl max-h-[90vh] overflow-auto my-8"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Gift className="w-6 h-6" />
                  Coupon Exchange Marketplace
                </CardTitle>
                <CardDescription>Buy, sell, and exchange unused coupons</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Credits Display */}
            <Card className="card-hero border-0">
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm mb-1">Your Finora Credits</p>
                    <p className="balance-figure text-3xl">{credits.toLocaleString()}</p>
                  </div>
                  <Crown className="w-12 h-12 text-gold opacity-60" />
                </div>
              </CardContent>
            </Card>
          </CardHeader>

          <CardContent className="space-y-6">
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={() => setShowListDialog(true)} className="flex-1">
                <Plus className="w-4 h-4 mr-2" />
                List New Coupon
              </Button>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="marketplace" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="recommendations">Top Picks</TabsTrigger>
                <TabsTrigger value="my-listings">My Listings</TabsTrigger>
              </TabsList>

              <TabsContent value="marketplace" className="space-y-4">
                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant={filter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('all')}
                  >
                    All Coupons
                  </Button>
                  <Button 
                    variant={filter === 'auto-sell' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('auto-sell')}
                  >
                    🤖 Auto-Sell
                  </Button>
                  <Button 
                    variant={filter === 'shopping' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('shopping')}
                  >
                    Shopping
                  </Button>
                  <Button 
                    variant={filter === 'food' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setFilter('food')}
                  >
                    Food
                  </Button>
                </div>

                {/* Coupons Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCoupons.map((coupon) => {
                    const daysToExpiry = getDaysToExpiry(coupon.expiryDate);
                    const isUrgent = daysToExpiry < 7;

                    return (
                      <motion.div
                        key={coupon.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <Card className={`relative overflow-hidden ${isUrgent ? 'border-money-out' : ''}`}>
                          {coupon.autoSell && (
                            <div className="absolute top-2 right-2">
                              <Badge className="border-0 text-white" style={{ background: 'var(--ink)' }}>
                                <Sparkles className="w-3 h-3 mr-1" />
                                AI Auto-Sell
                              </Badge>
                            </div>
                          )}
                          
                          <CardContent className="p-4">
                            <div className="mb-3">
                              <Badge variant="outline" className="mb-2">{coupon.category}</Badge>
                              <h3 className="font-semibold mb-1">{coupon.title}</h3>
                              <p className="text-sm text-muted-foreground">{coupon.brand}</p>
                            </div>

                            <div className="space-y-2 mb-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Value</span>
                                <span className="font-semibold text-money-in">{formatCurrency(coupon.value)}</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Price</span>
                                <span className="font-semibold">{coupon.price} credits</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Expires in
                                </span>
                                <span className={`font-semibold ${isUrgent ? 'text-money-out' : ''}`}>
                                  {daysToExpiry} days
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  Popularity
                                </span>
                                <span className="font-semibold">{coupon.popularity}%</span>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground mb-3">{coupon.description}</p>

                            <Button 
                              onClick={() => handleBuyCoupon(coupon.id)}
                              className="w-full"
                              size="sm"
                              disabled={coupon.seller === 'You'}
                            >
                              {coupon.seller === 'You' ? 'Your Listing' : `Buy for ${coupon.price} credits`}
                            </Button>

                            {coupon.daysListed >= 5 && !coupon.autoSell && (
                              <p className="text-xs text-gold mt-2 text-center">
                                Auto-sell activating soon
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredCoupons.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    <Gift className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>No coupons available in this category</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <Card className="border" style={{ background: 'color-mix(in oklab, var(--gold) 8%, var(--card))', borderColor: 'color-mix(in oklab, var(--gold) 30%, transparent)' }}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Crown className="w-5 h-5 text-gold mt-0.5" />
                      <div>
                        <h4 className="font-semibold  mb-1">AI Recommendations</h4>
                        <p className="text-sm text-muted-foreground">
                          Based on popularity, expiry urgency, and best value
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((coupon, idx) => (
                    <Card key={coupon.id} className="border-2 border-gold/30">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-gold text-white border-0">
                            #{idx + 1} Recommended
                          </Badge>
                          <Badge variant="outline">{coupon.category}</Badge>
                        </div>

                        <h3 className="font-semibold mb-1">{coupon.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{coupon.brand}</p>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Value</p>
                            <p className="font-semibold text-money-in">{formatCurrency(coupon.value)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Price</p>
                            <p className="font-semibold">{coupon.price} credits</p>
                          </div>
                        </div>

                        <Button onClick={() => handleBuyCoupon(coupon.id)} className="w-full" size="sm">
                          Buy Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="my-listings" className="space-y-4">
                {coupons.filter(c => c.seller === 'You').length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="mb-4">You haven't listed any coupons yet</p>
                    <Button onClick={() => setShowListDialog(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      List Your First Coupon
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {coupons.filter(c => c.seller === 'You').map((coupon) => (
                      <Card key={coupon.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                              {coupon.status}
                            </Badge>
                            {coupon.autoSell && (
                              <Badge variant="outline">
                                <Sparkles className="w-3 h-3 mr-1" />
                                Auto-Sell Active
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold mb-1">{coupon.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{coupon.brand}</p>

                          <div className="space-y-1 text-sm mb-3">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Value:</span>
                              <span className="font-semibold">{formatCurrency(coupon.value)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Price:</span>
                              <span className="font-semibold">{coupon.price} credits</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Days Listed:</span>
                              <span className="font-semibold">{coupon.daysListed}</span>
                            </div>
                          </div>

                          {coupon.daysListed >= 5 && !coupon.autoSell && (
                            <p className="text-xs text-gold p-2 rounded" style={{ background: 'color-mix(in oklab, var(--gold) 10%, transparent)' }}>
                              AI Auto-Sell will activate soon with dynamic pricing
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* List Coupon Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>List New Coupon</DialogTitle>
            <DialogDescription>Add your unused coupon to the marketplace</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Coupon Title *</Label>
              <Input
                id="title"
                placeholder="e.g., ₹500 off on ₹2000"
                value={newCoupon.title}
                onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Amazon"
                  value={newCoupon.brand}
                  onChange={(e) => setNewCoupon({ ...newCoupon, brand: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select 
                  value={newCoupon.category} 
                  onValueChange={(val) => setNewCoupon({ ...newCoupon, category: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Coupon Value (₹) *</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="500"
                  value={newCoupon.value || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label htmlFor="price">Selling Price (credits) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="200"
                  value={newCoupon.price || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="expiry">Expiry Date *</Label>
              <Input
                id="expiry"
                type="date"
                value={newCoupon.expiryDate}
                onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Additional details..."
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoSell"
                checked={newCoupon.autoSell}
                onChange={(e) => setNewCoupon({ ...newCoupon, autoSell: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="autoSell" className="cursor-pointer">
                Enable AI Auto-Sell (auto-price adjustment after 5 days)
              </Label>
            </div>

            <Button onClick={handleListCoupon} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              List Coupon
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
