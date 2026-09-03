import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import {
  Wallet, Plus, QrCode, TrendingUp, TrendingDown, Camera,
  MapPin, Users, Gift, Zap, Crown, Target, Sparkles, ArrowRight, Mic
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getWallet, topUpWallet, getSpendingByCategory, getDailySpending } from '../utils/walletManager';
import { analyzeSpendingDNA, saveSpendingDNAToHistory } from '../utils/spendingDNA';
import { formatCurrency } from '../mockData';
import { toast } from 'sonner@2.0.3';

interface WalletDashboardProps {
  onNavigate: (view: string) => void;
}

function CountUpBalance({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 90, damping: 22 });
  const [display, setDisplay] = useState(formatCurrency(0));
  const mounted = useRef(false);

  useEffect(() => {
    motionValue.set(mounted.current ? motionValue.get() : 0);
    motionValue.set(value);
    mounted.current = true;
  }, [value]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => setDisplay(formatCurrency(Math.round(v))));
    return () => unsub();
  }, [spring]);

  return <>{display}</>;
}

export function WalletDashboard({ onNavigate }: WalletDashboardProps) {
  const [wallet, setWallet] = useState(getWallet());
  const [spendingDNA, setSpendingDNA] = useState(analyzeSpendingDNA());
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(1000);

  useEffect(() => {
    const handleWalletUpdate = () => {
      setWallet(getWallet());
      setSpendingDNA(analyzeSpendingDNA());
    };

    window.addEventListener('walletUpdate', handleWalletUpdate);
    const interval = setInterval(handleWalletUpdate, 2000);

    // Generate and save DNA profile on component mount
    const profile = analyzeSpendingDNA();
    saveSpendingDNAToHistory(profile);

    return () => {
      window.removeEventListener('walletUpdate', handleWalletUpdate);
      clearInterval(interval);
    };
  }, []);

  const handleTopUp = async () => {
    await topUpWallet(topUpAmount);
    toast.success(`₹${topUpAmount.toLocaleString('en-IN')} added to wallet!`, {
      description: 'Your wallet has been topped up successfully'
    });
    setShowTopUp(false);
  };

  // Prepare chart data
  const categoryData = Object.entries(getSpendingByCategory(30))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#FB923C', '#06B6D4'];

  const dailyData = getDailySpending(7).map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    amount: d.amount
  }));

  const recentTransactions = wallet.transactions.slice(0, 5);
  const totalSpent = wallet.transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalEarned = wallet.transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="max-w-7xl mx-auto space-y-6"
      >

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <img src="/finora-mark.png" alt="Finora" className="w-9 h-9 md:w-10 md:h-10 object-contain shrink-0" />
            <div>
              <h1 className="font-display text-3xl md:text-4xl mb-1" style={{ color: 'var(--ink)' }}>Finora Wallet</h1>
              <p className="text-muted-foreground">Your AI-powered financial companion</p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm px-4 py-2 gap-2" style={{ borderColor: spendingDNA.color, color: spendingDNA.color }}>
            <Crown className="w-4 h-4" />
            {spendingDNA.badge} {spendingDNA.title.split(' ').slice(1).join(' ')}
          </Badge>
        </div>

        {/* Balance Card */}
        <Card className="card-hero border-0">
          <CardContent className="p-6 md:p-8 relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-white/70 text-sm mb-1.5">Available Balance</p>
                <h2 className="balance-figure text-4xl md:text-5xl mb-2">
                  <CountUpBalance value={wallet.balance} />
                </h2>
                <p className="text-white/50 text-xs">Last updated {new Date(wallet.lastUpdated).toLocaleTimeString('en-IN')}</p>
              </div>
              <Wallet className="w-14 h-14 text-white/20" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={() => setShowTopUp(!showTopUp)}
                variant="outline"
                className="!border-white/25 !text-white hover:!bg-white/15"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
              >
                <Plus className="w-4 h-4" />
                Top Up
              </Button>
              <Button
                onClick={() => onNavigate('scan-pay')}
                variant="outline"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
              >
                <QrCode className="w-4 h-4" />
                Scan & Pay
              </Button>
              <Button
                onClick={() => onNavigate('bill-scanner')}
                variant="outline"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
              >
                <Camera className="w-4 h-4" />
                Scan Bill
              </Button>
              <Button
                onClick={() => onNavigate('split-bill')}
                variant="outline"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
              >
                <Users className="w-4 h-4" />
                Split Bill
              </Button>
              <Button
                onClick={() => onNavigate('voice-pay')}
                variant="outline"
                style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
              >
                <Mic className="w-4 h-4" />
                Voice Pay
              </Button>
            </div>

            {showTopUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="mt-4 p-4 rounded-lg backdrop-blur-sm relative"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <p className="text-sm mb-3 text-white/80">Quick Top-Up</p>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[1000, 2000, 5000, 10000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount)}
                      className="fin-btn fin-btn-sm"
                      style={topUpAmount === amount
                        ? { background: '#fff', color: 'var(--ink)' }
                        : { background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}
                    >
                      ₹{amount}
                    </button>
                  ))}
                </div>
                <Button onClick={handleTopUp} className="w-full !bg-white !text-[color:var(--ink)]" style={{ background: '#fff', color: 'var(--ink)' }}>
                  Add ₹{topUpAmount.toLocaleString('en-IN')}
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="card-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                  <h3 className="text-2xl font-display text-money-out">{formatCurrency(totalSpent)}</h3>
                </div>
                <TrendingDown className="w-9 h-9 text-money-out opacity-25" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
                  <h3 className="text-2xl font-display text-money-in">{formatCurrency(totalEarned)}</h3>
                </div>
                <TrendingUp className="w-9 h-9 text-money-in opacity-25" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-stat">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Transactions</p>
                  <h3 className="text-2xl font-display">{wallet.transactions.length}</h3>
                </div>
                <Zap className="w-9 h-9 opacity-25" style={{ color: 'var(--gold)' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending DNA Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="border-2" style={{ borderColor: spendingDNA.color }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: spendingDNA.color }} />
                    Your Spending DNA
                  </CardTitle>
                  <CardDescription>Updated weekly based on your habits</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigate('spending-dna')}>
                  View History
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{spendingDNA.badge}</div>
                  <div className="flex-1">
                    <h3 className="text-xl mb-1" style={{ color: spendingDNA.color }}>{spendingDNA.title}</h3>
                    <p className="text-muted-foreground mb-3">{spendingDNA.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {spendingDNA.traits.map((trait, idx) => (
                        <Badge key={idx} variant="secondary">{trait}</Badge>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Financial Health Score</span>
                        <span className="font-semibold">{spendingDNA.score}/100</span>
                      </div>
                      <Progress value={spendingDNA.score} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm mb-2">AI Insights:</p>
                  <ul className="space-y-2">
                    {spendingDNA.insights.map((insight, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                        <Target className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: spendingDNA.color }} />
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Last 30 days breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No spending data yet. Make your first transaction!
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Spending Trend</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                  No spending data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest wallet activity</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => onNavigate('wallet-transactions')}>
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div>
                {recentTransactions.map((txn) => (
                  <div key={txn.id} className="list-row">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-full"
                        style={{
                          background: txn.type === 'credit' ? 'color-mix(in oklab, var(--money-in) 14%, transparent)' : 'color-mix(in oklab, var(--money-out) 12%, transparent)',
                          color: txn.type === 'credit' ? 'var(--money-in)' : 'var(--money-out)',
                        }}
                      >
                        {txn.type === 'credit' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium">{txn.merchant}</p>
                        <p className="text-sm text-muted-foreground">{txn.category} • {new Date(txn.date).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold font-display ${txn.type === 'credit' ? 'text-money-in' : 'text-money-out'}`}>
                        {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">{txn.paymentMethod.toUpperCase()}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Wallet className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No transactions yet</p>
                <p className="text-sm">Start spending or top up your wallet!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="fin-clickable card-stat" onClick={() => onNavigate('coupon-marketplace')}>
            <CardContent className="p-6 text-center">
              <Gift className="w-9 h-9 mx-auto mb-3" style={{ color: 'var(--gold)' }} />
              <h3 className="mb-1">Coupon Exchange</h3>
              <p className="text-sm text-muted-foreground">Buy & sell coupons</p>
            </CardContent>
          </Card>

          <Card className="fin-clickable card-stat" onClick={() => onNavigate('geo-map')}>
            <CardContent className="p-6 text-center">
              <MapPin className="w-9 h-9 mx-auto mb-3" style={{ color: 'var(--ink)' }} />
              <h3 className="mb-1">Spending Map</h3>
              <p className="text-sm text-muted-foreground">See where you spend</p>
            </CardContent>
          </Card>

          <Card className="fin-clickable card-stat" onClick={() => onNavigate('what-if')}>
            <CardContent className="p-6 text-center">
              <Target className="w-9 h-9 mx-auto mb-3 text-money-in" />
              <h3 className="mb-1">What If?</h3>
              <p className="text-sm text-muted-foreground">Predict future spending</p>
            </CardContent>
          </Card>

          <Card className="fin-clickable card-stat" onClick={() => onNavigate('rewards')}>
            <CardContent className="p-6 text-center">
              <Crown className="w-9 h-9 mx-auto mb-3" style={{ color: 'var(--gold)' }} />
              <h3 className="mb-1">Rewards</h3>
              <p className="text-sm text-muted-foreground">Earn & redeem points</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
