import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { motion } from "motion/react";
import { mockData, formatCurrency } from "../mockData";
import { Search, RefreshCw, TrendingUp, TrendingDown, Wallet, PiggyBank, TrendingDownIcon, AlertCircle, AlertTriangle, Sparkles, Bell } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner@2.0.3";
import { detectAnomalies, generateBudgetAlerts, generateRecommendations, analyzeCostOptimization } from "../utils/aiAnalysis";

export function DashboardNew() {
  const { user, balances, transactions, expenseBreakdown, aiInsights, budgets } = mockData;
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [costOptimization, setCostOptimization] = useState<any>(null);

  // Run AI analysis on mount and when data changes
  useEffect(() => {
    // Detect anomalies
    const detectedAnomalies = detectAnomalies(transactions);
    setAnomalies(detectedAnomalies);

    // Generate budget alerts
    const alerts = generateBudgetAlerts(budgets);
    setBudgetAlerts(alerts);

    // Generate personalized recommendations
    const recs = generateRecommendations(mockData);
    setRecommendations(recs);

    // Analyze cost optimization
    const optimization = analyzeCostOptimization(mockData);
    setCostOptimization(optimization);

    // Show real-time notifications for critical alerts
    if (alerts.some(alert => alert.severity === 'critical')) {
      toast.error("🚨 Budget Alert: You've exceeded your budget in one or more categories!");
    } else if (alerts.some(alert => alert.severity === 'warning')) {
      toast.warning("⚠️ Budget Warning: You're nearing your budget limits!");
    }

    // Show anomaly notifications
    if (detectedAnomalies.length > 0) {
      const highSeverity = detectedAnomalies.filter(a => a.severity === 'high');
      if (highSeverity.length > 0) {
        toast.warning(`🔍 ${highSeverity.length} unusual transaction${highSeverity.length > 1 ? 's' : ''} detected!`);
      }
    }
  }, [transactions, budgets]);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleRefreshInsights = () => {
    setRefreshing(true);
    setTimeout(() => {
      // Re-run all analyses
      setAnomalies(detectAnomalies(transactions));
      setBudgetAlerts(generateBudgetAlerts(budgets));
      setRecommendations(generateRecommendations(mockData));
      setCostOptimization(analyzeCostOptimization(mockData));
      
      setRefreshing(false);
      toast.success("✨ AI insights refreshed with latest data!");
    }, 1500);
  };

  const handleInsightAction = (action: string) => {
    switch(action) {
      case "Set Reminder":
        toast.success("📅 Reminder set for EMI payment on 3 Nov");
        break;
      case "View Details":
        toast.info("💡 Showing subscription analysis...");
        break;
      case "Adjust Budget":
        toast.info("📊 Opening budget adjustment panel...");
        break;
      case "View Report":
        toast.success("📈 Opening detailed savings report...");
        break;
      case "Review Spending":
        toast.info("📊 Opening spending review...");
        break;
      default:
        toast.info("Action triggered!");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1>Namaste {user.name} 👋</h1>
        <p className="text-muted-foreground">Here's your October 2025 snapshot</p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover-lift border-[#1E3A8A]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-[#1E3A8A]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-[#1E3A8A] animate-counter">
                {formatCurrency(balances.totalBalance)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
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
          <Card className="hover-lift border-[#10B981]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Savings</CardTitle>
              <PiggyBank className="h-4 w-4 text-[#10B981]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-[#10B981] animate-counter">
                {formatCurrency(balances.savings)}
              </div>
              <div className="flex items-center text-xs text-[#10B981] mt-2">
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
          <Card className="hover-lift border-[#F59E0B]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Expenses</CardTitle>
              <TrendingDownIcon className="h-4 w-4 text-[#F59E0B]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-[#F59E0B] animate-counter">
                {formatCurrency(balances.expenses)}
              </div>
              <div className="flex items-center text-xs text-[#10B981] mt-2">
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
          <Card className="hover-lift border-[#FB923C]/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-[#FB923C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-[#FB923C] animate-counter">
                {formatCurrency(balances.investments)}
              </div>
              <div className="flex items-center text-xs text-[#10B981] mt-2">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>+8.5% returns</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Breakdown Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
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

        {/* AI Smart Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#10B981]" />
                  AI Smart Insights
                </CardTitle>
                <CardDescription>Personalized financial recommendations</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshInsights}
                disabled={refreshing}
                className="btn-ripple"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiInsights.map((insight, index) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    insight.type === 'warning' ? 'text-[#F59E0B]' :
                    insight.type === 'tip' ? 'text-[#10B981]' :
                    insight.type === 'alert' ? 'text-[#FB923C]' :
                    'text-[#1E3A8A]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{insight.message}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="btn-ripple flex-shrink-0"
                    onClick={() => handleInsightAction(insight.action)}
                  >
                    {insight.action}
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Budget Alerts & Anomaly Detection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="border-[#F59E0B]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#F59E0B]" />
                  Budget Alerts
                </CardTitle>
                <CardDescription>Real-time spending notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {budgetAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className={`flex items-start gap-3 p-3 border rounded-lg ${
                      alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                      alert.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      alert.severity === 'critical' ? 'text-red-600' :
                      alert.severity === 'warning' ? 'text-orange-600' :
                      'text-blue-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm mb-1">{alert.message}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {alert.category}
                        </Badge>
                        <span>{Math.round(alert.percentage)}% used</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex-shrink-0"
                      onClick={() => handleInsightAction(alert.action)}
                    >
                      {alert.action}
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Anomaly Detection */}
        {anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Card className="border-[#FB923C]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#FB923C]" />
                  Anomaly Detection
                </CardTitle>
                <CardDescription>Unusual spending patterns identified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {anomalies.map((anomaly, index) => (
                  <motion.div
                    key={anomaly.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    className={`p-3 border rounded-lg ${
                      anomaly.severity === 'high' ? 'bg-red-50 border-red-200' :
                      anomaly.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Badge variant={anomaly.severity === 'high' ? 'destructive' : 'outline'} className="text-xs">
                        {anomaly.type.replace('_', ' ')}
                      </Badge>
                      {anomaly.amount && (
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(anomaly.amount)}
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-sm mb-1">{anomaly.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{anomaly.description}</p>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-[#10B981]" />
                      <p className="text-xs text-[#10B981]">{anomaly.recommendation}</p>
                    </div>
                    {anomaly.potentialSavings && anomaly.potentialSavings > 0 && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                        💰 Potential savings: {formatCurrency(Math.round(anomaly.potentialSavings))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* AI Recommendations & Cost Optimization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommendations */}
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
                  Personalized Recommendations
                </CardTitle>
                <CardDescription>Based on your financial behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recommendations.slice(0, 3).map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{rec.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm">{rec.title}</h4>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'outline'} className="text-xs">
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#10B981]">
                            💰 Benefit: {formatCurrency(Math.round(rec.potentialBenefit))}
                          </span>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            {rec.action}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Cost Optimization */}
        {costOptimization && costOptimization.optimizations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <Card className="border-[#10B981]/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-[#10B981]" />
                  Cost Optimization
                </CardTitle>
                <CardDescription>
                  Save {formatCurrency(Math.round(costOptimization.totalPotentialSavings))}/month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {costOptimization.optimizations.map((opt: any, index: number) => (
                  <motion.div
                    key={`opt-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                    className="p-3 border rounded-lg bg-green-50 border-green-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm">{opt.category}</h4>
                      <Badge className="bg-[#10B981] text-xs">
                        Save {formatCurrency(Math.round(opt.savings))}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                      <span>Current: {formatCurrency(opt.current)}</span>
                      <span>→</span>
                      <span className="text-[#10B981]">Optimized: {formatCurrency(opt.optimized)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-[#10B981]" />
                      <p className="text-xs text-[#10B981]">{opt.method}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Transactions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activity</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="EMI">EMI</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Travel">Travel</SelectItem>
                    <SelectItem value="Subscriptions">Subscriptions</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-accent/50">
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.mode}</Badge>
                    </TableCell>
                    <TableCell>{transaction.merchant}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-[#F59E0B]">
                      -{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-sm text-[#10B981]">
                        ✅
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
