import { motion } from "motion/react";
import {
  TrendingUp,
  PieChart,
  Info,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Droplets,
  LineChart as LineChartIcon,
  Landmark,
  Briefcase,
  Rocket
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from "../mockData";

const recommendations = [
  {
    id: 1,
    name: 'Nifty 50 Index Fund',
    ticker: 'NIFTYBEES',
    risk: 'Moderate',
    liquidity: 'High',
    returns: '12.4%',
    investment: 500,
    description: "Broad exposure to India's top 50 companies",
    icon: LineChartIcon,
    riskColor: 'var(--gold)',
    features: ['Low expense ratio', 'Diversified', 'LTCG tax efficient']
  },
  {
    id: 2,
    name: 'High-Interest Savings Account',
    ticker: 'FD',
    risk: 'Low',
    liquidity: 'Very High',
    returns: '7.1%',
    investment: 1000,
    description: 'Safe, liquid emergency fund option',
    icon: Landmark,
    riskColor: 'var(--money-in)',
    features: ['DICGC insured up to ₹5L', 'No fees', 'Instant access']
  },
  {
    id: 3,
    name: 'Sensex Index Fund',
    ticker: 'SENSEXBEES',
    risk: 'Moderate',
    liquidity: 'High',
    returns: '13.1%',
    investment: 1000,
    description: "Track India's 30 largest companies",
    icon: Briefcase,
    riskColor: 'var(--gold)',
    features: ['Proven track record', 'Low expense ratio', 'High liquidity']
  },
  {
    id: 4,
    name: 'Nifty IT Growth Fund',
    ticker: 'ITBEES',
    risk: 'High',
    liquidity: 'High',
    returns: '18.6%',
    investment: 500,
    description: "Focus on India's technology sector growth",
    icon: Rocket,
    riskColor: 'var(--money-out)',
    features: ['High growth potential', 'Tech focus', 'Volatile']
  }
];

const portfolio = [
  { name: 'Stocks', value: 1250000, color: '#0E2A47' },
  { name: 'Bonds', value: 420000, color: '#1F7A5C' },
  { name: 'ETFs', value: 680000, color: '#C98A2C' },
  { name: 'Cash', value: 350000, color: '#2f6690' },
];

const performanceData = [
  { month: 'Apr', value: 2380000 },
  { month: 'May', value: 2510000 },
  { month: 'Jun', value: 2450000 },
  { month: 'Jul', value: 2650000 },
  { month: 'Aug', value: 2620000 },
  { month: 'Sep', value: 2750000 },
  { month: 'Oct', value: 2700000 },
];

const holdings = [
  { name: 'Reliance Industries Ltd.', ticker: 'RELIANCE', shares: 15, price: 2850, change: 1.8 },
  { name: 'Tata Consultancy Services', ticker: 'TCS', shares: 10, price: 3920, change: 1.2 },
  { name: 'HDFC Bank Ltd.', ticker: 'HDFCBANK', shares: 40, price: 1650, change: -0.4 },
  { name: 'Infosys Ltd.', ticker: 'INFY', shares: 25, price: 1480, change: 2.1 },
];

export function Investments() {
  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1>Investments & Recommendations</h1>
          <p className="text-muted-foreground">AI-powered investment suggestions tailored for you</p>
        </div>

        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recommendations">
              <Sparkles size={16} className="mr-2" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="portfolio">
              <PieChart size={16} className="mr-2" />
              My Portfolio
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp size={16} className="mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            {/* AI Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="text-white border-0" style={{ background: 'var(--ink)' }}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles size={20} />
                        <h3>Personalized Recommendations</h3>
                      </div>
                      <p className="text-white/90 mb-4">
                        Based on your moderate risk profile and ₹18,000 monthly surplus, here are investment opportunities optimized for your goals.
                      </p>
                      <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Shield size={16} />
                          <span>Risk-adjusted</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp size={16} />
                          <span>Growth-focused</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recommendations Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="card-stat">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--secondary)', color: rec.riskColor }}>
                            <rec.icon size={20} />
                          </div>
                          <div>
                            <CardTitle className="text-base">{rec.name}</CardTitle>
                            <CardDescription>{rec.ticker}</CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          style={{
                            borderColor: rec.riskColor,
                            color: rec.riskColor
                          }}
                        >
                          {rec.risk} Risk
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Projected Returns</div>
                          <div className="text-lg font-display text-money-in">{rec.returns}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Liquidity</div>
                          <div className="text-sm">{rec.liquidity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Min. Investment</div>
                          <div className="text-sm">{formatCurrency(rec.investment)}</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {rec.features.map((feature, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>

                      {/* AI Insight */}
                      <div className="p-3 rounded-lg" style={{ background: 'var(--secondary)' }}>
                        <div className="flex items-start gap-2">
                          <Sparkles className="text-gold flex-shrink-0 mt-0.5" size={14} />
                          <p className="text-xs text-muted-foreground">
                            {rec.risk === 'Low'
                              ? 'Perfect for your emergency fund surplus. Safe and accessible.'
                              : rec.risk === 'High'
                              ? 'Allocate only 10-15% here due to volatility. Great for long-term growth.'
                              : 'Ideal core holding for balanced growth with manageable risk.'}
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button className="w-full">
                        Explore {rec.ticker}
                        <ArrowRight size={16} />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Investment Strategy Insights */}
            <Card className="card-stat">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-gold" size={20} />
                  Your Investment Strategy
                </CardTitle>
                <CardDescription>AI-generated allocation recommendation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border" style={{ background: 'color-mix(in oklab, var(--money-in) 8%, var(--card))', borderColor: 'color-mix(in oklab, var(--money-in) 30%, transparent)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="text-money-in" size={20} />
                      <span className="text-sm">Conservative (40%)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Low-risk bonds and savings for stability
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ background: 'color-mix(in oklab, var(--info) 8%, var(--card))', borderColor: 'color-mix(in oklab, var(--info) 30%, transparent)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets style={{ color: 'var(--info)' }} size={20} />
                      <span className="text-sm">Moderate (40%)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Balanced index funds and ETFs for growth
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ background: 'color-mix(in oklab, var(--gold) 8%, var(--card))', borderColor: 'color-mix(in oklab, var(--gold) 30%, transparent)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="text-gold" size={20} />
                      <span className="text-sm">Aggressive (20%)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      High-growth stocks for maximum returns
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Tab */}
          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Overview */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="card-stat">
                  <CardHeader>
                    <CardTitle>Current Holdings</CardTitle>
                    <CardDescription>Your investment portfolio breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div>
                      {holdings.map((holding, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="list-row px-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
                              <TrendingUp size={20} style={{ color: 'var(--ink)' }} />
                            </div>
                            <div>
                              <div>{holding.name}</div>
                              <p className="text-sm text-muted-foreground">
                                {holding.shares} shares @ {formatCurrency(holding.price)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-display">{formatCurrency(holding.shares * holding.price)}</div>
                            <p className={`text-sm ${holding.change >= 0 ? 'text-money-in' : 'text-money-out'}`}>
                              {holding.change >= 0 ? '+' : ''}{holding.change}%
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="card-stat">
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie
                        data={portfolio}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {portfolio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {portfolio.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="card-stat">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Value</div>
                  <div className="text-2xl font-display">{formatCurrency(2700000)}</div>
                  <p className="text-xs text-money-in mt-1">+14.2% all time</p>
                </CardContent>
              </Card>
              <Card className="card-stat">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">Monthly Return</div>
                  <div className="text-2xl font-display text-money-in">+{formatCurrency(51000)}</div>
                  <p className="text-xs text-muted-foreground mt-1">+1.9% this month</p>
                </CardContent>
              </Card>
              <Card className="card-stat">
                <CardContent className="pt-6">
                  <div className="text-sm text-muted-foreground mb-1">Total Invested</div>
                  <div className="text-2xl font-display">{formatCurrency(2360000)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Over 18 months</p>
                </CardContent>
              </Card>
            </div>

            <Card className="card-stat">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>6-month value trend</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(value) => `₹${value / 100000}L`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#1F7A5C"
                      strokeWidth={3}
                      dot={{ fill: '#1F7A5C', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
