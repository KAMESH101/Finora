import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Search, 
  Bell, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Sparkles,
  ArrowRight,
  MoreVertical
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockData, formatCurrency } from "../mockData";

const spendingData = [
  { month: 'Jan', amount: 2400 },
  { month: 'Feb', amount: 2100 },
  { month: 'Mar', amount: 2800 },
  { month: 'Apr', amount: 2600 },
  { month: 'May', amount: 3200 },
  { month: 'Jun', amount: 2900 },
];

const categoryData = [
  { name: 'Food', value: 1200, color: '#10b981' },
  { name: 'Transport', value: 600, color: '#06b6d4' },
  { name: 'Entertainment', value: 400, color: '#6366f1' },
  { name: 'Shopping', value: 800, color: '#f59e0b' },
  { name: 'Bills', value: 1100, color: '#8b5cf6' },
];

const recentTransactions = [
  { id: 1, merchant: 'Whole Foods', category: 'Food', amount: -85.20, date: '2025-10-27', icon: '🛒' },
  { id: 2, merchant: 'Uber', category: 'Transport', amount: -24.50, date: '2025-10-27', icon: '🚗' },
  { id: 3, merchant: 'Netflix', category: 'Entertainment', amount: -15.99, date: '2025-10-26', icon: '🎬' },
  { id: 4, merchant: 'Salary Deposit', category: 'Income', amount: 5240.00, date: '2025-10-25', icon: '💰' },
  { id: 5, merchant: 'Amazon', category: 'Shopping', amount: -67.89, date: '2025-10-25', icon: '📦' },
];

const aiInsights = [
  {
    id: 1,
    title: 'Save $480 by next month',
    description: 'You have 3 unused subscriptions totaling $40/month',
    action: 'Review Subscriptions',
    color: 'emerald'
  },
  {
    id: 2,
    title: 'Projected month-end balance',
    description: 'Based on your spending, you\'ll have $2,340 left',
    action: 'View Forecast',
    color: 'blue'
  },
  {
    id: 3,
    title: 'Investment opportunity',
    description: 'Your emergency fund is ready. Consider investing surplus.',
    action: 'Explore Options',
    color: 'purple'
  }
];

export function Dashboard() {
  // Calculate real-time balances from localStorage (synced with Banking)
  const [totalBalance, setTotalBalance] = useState(mockData.bankAccounts.reduce((sum, acc) => sum + acc.balance, 0));
  const monthlyIncome = mockData.monthlyTrend[mockData.monthlyTrend.length - 1].income;
  const monthlyExpenses = mockData.monthlyTrend[mockData.monthlyTrend.length - 1].expenses;
  const monthlyGrowth = ((monthlyIncome - monthlyExpenses) / totalBalance * 100).toFixed(1);

  // Listen for balance updates from Banking component
  useEffect(() => {
    const updateBalance = () => {
      const storedAccounts = localStorage.getItem('bankAccounts');
      if (storedAccounts) {
        const accounts = JSON.parse(storedAccounts);
        const newTotalBalance = accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0);
        setTotalBalance(newTotalBalance);
      }
    };

    // Update immediately
    updateBalance();

    // Listen for storage events (updates from Banking)
    window.addEventListener('storage', updateBalance);

    // Poll for updates every second (for same-tab updates)
    const interval = setInterval(updateBalance, 1000);

    return () => {
      window.removeEventListener('storage', updateBalance);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Plus size={16} className="mr-2" />
                <span className="hidden sm:inline">Add Transaction</span>
              </Button>
              <Avatar className="cursor-pointer">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left/Center Column - 2 cols */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-0 shadow-lg overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
                <CardHeader className="relative">
                  <CardDescription className="text-white/80">Total Balance</CardDescription>
                  <CardTitle className="text-5xl">{formatCurrency(totalBalance)}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                      <TrendingUp size={16} />
                      <span className="text-sm">+{monthlyGrowth}% this month</span>
                    </div>
                    <Button variant="ghost" className="text-white hover:bg-white/20">
                      <Plus size={16} className="mr-2" />
                      Add Goal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">Monthly Income</CardTitle>
                    <TrendingUp className="text-emerald-600" size={20} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{formatCurrency(monthlyIncome)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      +8% from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm">Monthly Expenses</CardTitle>
                    <TrendingDown className="text-orange-600" size={20} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl">{formatCurrency(monthlyExpenses)}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      -5% from last month
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Spending Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Spending Timeline</CardTitle>
                  <CardDescription>Your expenses over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={spendingData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        fill="url(#colorAmount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest spending activity</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTransactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        whileHover={{ x: 4 }}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                            {transaction.icon}
                          </div>
                          <div>
                            <div>{transaction.merchant}</div>
                            <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={transaction.amount > 0 ? 'text-emerald-600' : ''}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </div>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - AI Insights & Quick Stats */}
          <div className="space-y-6">
            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={20} />
                <h3>AI Insights</h3>
              </div>

              {aiInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                >
                  <Card className={`bg-gradient-to-br from-${insight.color}-50 to-${insight.color}-50/50 border-${insight.color}-200`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <Sparkles className={`text-${insight.color}-600`} size={20} />
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical size={16} />
                        </Button>
                      </div>
                      <CardTitle className="text-sm">{insight.title}</CardTitle>
                      <CardDescription>{insight.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" variant="outline" className="w-full">
                        {insight.action}
                        <ArrowRight size={14} className="ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Spending Categories */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>This month's breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {categoryData.map((category) => (
                      <div key={category.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span>{category.name}</span>
                        </div>
                        <span className="text-muted-foreground">${category.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Bills */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Rent', amount: 1200, date: 'Nov 1', icon: '🏠' },
                    { name: 'Internet', amount: 60, date: 'Nov 5', icon: '📡' },
                    { name: 'Gym', amount: 40, date: 'Nov 10', icon: '💪' }
                  ].map((bill, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          {bill.icon}
                        </div>
                        <div>
                          <div className="text-sm">{bill.name}</div>
                          <p className="text-xs text-muted-foreground">{bill.date}</p>
                        </div>
                      </div>
                      <div className="text-sm">${bill.amount}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
