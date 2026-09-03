import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";
import { mockData, formatCurrency } from "../mockData";
import { 
  Wallet, 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  RefreshCw,
  LayoutGrid,
  BarChart3
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { toast } from "sonner@2.0.3";

// Import new AI components
import { FinancialHealthScore } from "./FinancialHealthScore";
import { SavingsChallenges } from "./SavingsChallenges";
import { SpendingInsights } from "./SpendingInsights";

// Import existing AI utilities
import { detectAnomalies, generateBudgetAlerts, generateRecommendations, analyzeCostOptimization } from "../utils/aiAnalysis";

export function DashboardEnhanced() {
  const { user, balances, transactions, expenseBreakdown, budgets, monthlyTrend } = mockData;
  
  // State for AI analysis (memoized for performance)
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Memoize AI analysis to prevent unnecessary recalculations
  const anomalies = useMemo(() => detectAnomalies(transactions), [transactions]);
  const budgetAlerts = useMemo(() => generateBudgetAlerts(budgets), [budgets]);
  const recommendations = useMemo(() => generateRecommendations(mockData), []);
  const costOptimization = useMemo(() => analyzeCostOptimization(mockData), []);

  // Show notifications on mount
  useEffect(() => {
    // Show critical alerts
    if (budgetAlerts.some(alert => alert.severity === 'critical')) {
      toast.error("🚨 Budget Alert: You've exceeded your budget in one or more categories!");
    } else if (budgetAlerts.some(alert => alert.severity === 'warning')) {
      toast.warning("⚠️ Budget Warning: You're nearing your budget limits!");
    }

    // Show anomaly notifications
    if (anomalies.length > 0) {
      const highSeverity = anomalies.filter(a => a.severity === 'high');
      if (highSeverity.length > 0) {
        toast.warning(`🔍 ${highSeverity.length} unusual transaction${highSeverity.length > 1 ? 's' : ''} detected!`);
      }
    }
  }, []); // Only run once on mount

  const handleRefreshAll = () => {
    setRefreshing(true);
    toast.loading("🔄 Refreshing all insights...");
    
    setTimeout(() => {
      setRefreshing(false);
      toast.success("✨ All insights refreshed!");
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="font-display" style={{ color: 'var(--ink)' }}>Namaste {user.name} 👋</h1>
            <p className="text-muted-foreground">Here's your complete financial overview</p>
          </div>
          <Button
            onClick={handleRefreshAll}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-stat">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Total Balance</CardTitle>
                <Wallet className="h-4 w-4" style={{ color: 'var(--ink)' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display animate-counter" style={{ color: 'var(--ink)' }}>
                  {formatCurrency(balances.totalBalance)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all accounts
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-stat">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Savings</CardTitle>
                <PiggyBank className="h-4 w-4 text-money-in" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display text-money-in animate-counter">
                  {formatCurrency(balances.savings)}
                </div>
                <div className="flex items-center text-xs text-money-in mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+12% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-stat">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-money-out" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display text-money-out animate-counter">
                  {formatCurrency(balances.expenses)}
                </div>
                <div className="flex items-center text-xs text-money-in mt-1">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  <span>-3% from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="card-stat">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">Investments</CardTitle>
                <BarChart3 className="h-4 w-4" style={{ color: 'var(--chart-5)' }} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-display animate-counter" style={{ color: 'var(--chart-5)' }}>
                  {formatCurrency(balances.investments)}
                </div>
                <div className="flex items-center text-xs text-money-in mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+8.5% returns</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="challenges" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Challenges
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Expense Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Expense Breakdown</CardTitle>
                    <CardDescription>October 2025</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {expenseBreakdown.map((category) => (
                        <div key={category.name} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.fill }} />
                            <span>{category.name}</span>
                          </div>
                          <span>{formatCurrency(category.value)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Trend */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Trend</CardTitle>
                    <CardDescription>Income vs Expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="income"
                          stroke="#1F7A5C"
                          strokeWidth={2}
                          dot={{ fill: '#1F7A5C', r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="expenses"
                          stroke="#B23A2E"
                          strokeWidth={2}
                          dot={{ fill: '#B23A2E', r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="savings"
                          stroke="#0E2A47"
                          strokeWidth={2}
                          dot={{ fill: '#0E2A47', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Financial Health Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <FinancialHealthScore />
            </motion.div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <SpendingInsights />

            {/* Quick AI Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Budget Alerts Summary */}
              {budgetAlerts.length > 0 && (
                <Card className="card-stat">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gold" />
                      Budget Alerts
                    </CardTitle>
                    <CardDescription>{budgetAlerts.length} active</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {budgetAlerts.slice(0, 3).map((alert, index) => (
                        <div key={alert.id} className="text-xs p-2 rounded" style={{ background: 'var(--secondary)' }}>
                          <p className="truncate">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Anomalies Summary */}
              {anomalies.length > 0 && (
                <Card className="card-stat">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-money-out" />
                      Anomalies Detected
                    </CardTitle>
                    <CardDescription>{anomalies.length} found</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {anomalies.map((anomaly, index) => (
                        <div key={anomaly.id} className="text-xs p-2 rounded" style={{ background: 'var(--secondary)' }}>
                          <p className="truncate">{anomaly.title}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cost Optimization Summary */}
              {costOptimization && (
                <Card className="card-stat">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-money-in" />
                      Savings Potential
                    </CardTitle>
                    <CardDescription>
                      {formatCurrency(Math.round(costOptimization.totalPotentialSavings))}/month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {costOptimization.optimizations.slice(0, 3).map((opt: any, index: number) => (
                        <div key={index} className="text-xs p-2 rounded" style={{ background: 'var(--secondary)' }}>
                          <p className="truncate">{opt.method}</p>
                          <p className="text-money-in">{formatCurrency(Math.round(opt.savings))}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <SavingsChallenges />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
