import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { motion } from "motion/react";
import { mockData, formatCurrency } from "../mockData";
import { Download, TrendingUp, TrendingDown, Calendar, FileText, ArrowUpRight, ArrowDownRight, FileDown } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner@2.0.3";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { createFinancialReport, generatePDFReport, generateExcelReport, generateWordReport, generateCSVReport, downloadFile } from "../utils/pdfExport";

export function Reports() {
  const { monthlyTrend, yearlyComparison } = mockData;
  const [activeTab, setActiveTab] = useState("monthly");
  
  // Real-time calculated values
  const [currentMonthData, setCurrentMonthData] = useState({
    income: 120000,
    expenses: 95000,
    savings: 25000
  });

  // Calculate real-time analytics
  useEffect(() => {
    const lastMonth = monthlyTrend[monthlyTrend.length - 1];
    setCurrentMonthData({
      income: lastMonth.income,
      expenses: lastMonth.expenses,
      savings: lastMonth.savings
    });
  }, [monthlyTrend]);

  const handleDownload = async (format: string) => {
    const toastId = toast.loading(`📊 Generating ${format.toUpperCase()} report with Indian formatting...`);
    
    try {
      const reportData = createFinancialReport(mockData);
      
      switch (format) {
        case 'pdf':
          await generatePDFReport(reportData);
          toast.dismiss(toastId);
          toast.success('✅ PDF report ready! Click print or save as PDF in the dialog.');
          break;
        case 'excel':
          await generateExcelReport(reportData);
          toast.dismiss(toastId);
          toast.success('✅ Excel (CSV) report downloaded successfully!');
          break;
        case 'word':
          await generateWordReport(reportData);
          toast.dismiss(toastId);
          toast.success('✅ Word document downloaded successfully!');
          break;
        case 'csv':
          const csv = await generateCSVReport(reportData.sections[0].data);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          downloadFile(blob, `Finora_Report_${new Date().toISOString().split('T')[0]}.csv`);
          toast.dismiss(toastId);
          toast.success('✅ CSV report downloaded with Indian formatting!');
          break;
      }
      
      // Also save data for offline access
      localStorage.setItem('finai_last_report', JSON.stringify({
        ...reportData,
        format,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('❌ Failed to generate report. Please try again.');
      console.error('Report generation error:', error);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Financial Reports</h1>
          <p className="text-muted-foreground">Comprehensive analysis of your finances</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleDownload('pdf')}>
              <FileDown className="w-4 h-4 mr-2" />
              Download as PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('word')}>
              <FileDown className="w-4 h-4 mr-2" />
              Download as Word
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('excel')}>
              <FileDown className="w-4 h-4 mr-2" />
              Download as Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('csv')}>
              <FileDown className="w-4 h-4 mr-2" />
              Download as CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">Annual</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6 mt-6">
          {/* Monthly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="card-stat">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-money-in" />
                    Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display text-money-in animate-counter mb-2">
                    {formatCurrency(120000)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-money-in">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>5% vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="card-stat">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingDown className="w-5 h-5 text-money-out" />
                    Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display text-money-out animate-counter mb-2">
                    {formatCurrency(95000)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-money-in">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>3% vs last month</span>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5" style={{ color: 'var(--ink)' }} />
                    Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-display animate-counter mb-2" style={{ color: 'var(--ink)' }}>
                    {formatCurrency(25000)}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-money-in">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>12% vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Monthly Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trend (Last 7 Months)</CardTitle>
                <CardDescription>Track your income, expenses, and savings</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${value / 1000}K`} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#1F7A5C" 
                      strokeWidth={3}
                      dot={{ fill: "#1F7A5C", r: 5 }}
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#C98A2C" 
                      strokeWidth={3}
                      dot={{ fill: "#C98A2C", r: 5 }}
                      name="Expenses"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="savings" 
                      stroke="#0E2A47" 
                      strokeWidth={3}
                      dot={{ fill: "#0E2A47", r: 5 }}
                      name="Savings"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Monthly Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border" style={{ background: 'color-mix(in oklab, var(--money-in) 6%, var(--card))', borderColor: 'color-mix(in oklab, var(--money-in) 25%, transparent)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-money-in" />
                  October 2025 Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-card rounded-lg">
                    <h4 className="text-sm mb-2">🎯 Best Performing Category</h4>
                    <p className="text-muted-foreground text-sm">
                      Travel expenses reduced by 60% compared to last month
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <h4 className="text-sm mb-2">⚠️ Needs Attention</h4>
                    <p className="text-muted-foreground text-sm">
                      Food expenses exceeded budget by 8% this month
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <h4 className="text-sm mb-2">💰 Savings Rate</h4>
                    <p className="text-muted-foreground text-sm">
                      You saved 20.8% of your income this month
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <h4 className="text-sm mb-2">📈 Investment Growth</h4>
                    <p className="text-muted-foreground text-sm">
                      Your portfolio grew by ₹2,450 this month
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="annual" className="space-y-6 mt-6">
          {/* Annual Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {yearlyComparison.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
              >
                <Card className="card-stat">
                  <CardHeader>
                    <CardTitle className="text-lg">{item.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl mb-2 animate-counter">
                      {formatCurrency(item.value)}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${item.change >= 0 ? 'text-money-in' : 'text-destructive'}`}>
                      {item.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>{Math.abs(item.change)}% YoY</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Annual Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Comparison</CardTitle>
                <CardDescription>Financial year 2024-25 vs 2023-24</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={yearlyComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis tickFormatter={(value) => `₹${value / 100000}L`} />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="#0E2A47" 
                      radius={[8, 8, 0, 0]}
                      name="Amount"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Annual Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Financial Year 2024-25 Summary</CardTitle>
                <CardDescription>Key highlights and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="text-4xl mb-2">📊</div>
                    <h4 className="mb-1">Total Income</h4>
                    <div className="text-2xl text-money-in">{formatCurrency(1440000)}</div>
                    <p className="text-sm text-muted-foreground mt-2">+8% growth</p>
                  </div>

                  <div className="text-center p-6 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="text-4xl mb-2">💰</div>
                    <h4 className="mb-1">Total Savings</h4>
                    <div className="text-2xl font-display" style={{ color: 'var(--ink)' }}>{formatCurrency(300000)}</div>
                    <p className="text-sm text-muted-foreground mt-2">+12% increase</p>
                  </div>

                  <div className="text-center p-6 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="text-4xl mb-2">📈</div>
                    <h4 className="mb-1">Investments</h4>
                    <div className="text-2xl text-gold">{formatCurrency(108000)}</div>
                    <p className="text-sm text-muted-foreground mt-2">+20% boost</p>
                  </div>

                  <div className="text-center p-6 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="text-4xl mb-2">🎯</div>
                    <h4 className="mb-1">Goals Achieved</h4>
                    <div className="text-2xl text-money-in">3/5</div>
                    <p className="text-sm text-muted-foreground mt-2">60% success rate</p>
                  </div>

                  <div className="text-center p-6 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="text-4xl mb-2">💳</div>
                    <h4 className="mb-1">Credit Score</h4>
                    <div className="text-2xl text-money-in">782</div>
                    <p className="text-sm text-muted-foreground mt-2">Excellent rating</p>
                  </div>

                  <div className="text-center p-6 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="text-4xl mb-2">🏆</div>
                    <h4 className="mb-1">Rewards Earned</h4>
                    <div className="text-2xl text-gold">₹2,450</div>
                    <p className="text-sm text-muted-foreground mt-2">From achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Annual Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border" style={{ background: 'color-mix(in oklab, var(--ink) 5%, var(--card))', borderColor: 'color-mix(in oklab, var(--ink) 20%, transparent)' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: 'var(--ink)' }} />
                  AI-Powered Year-End Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-card rounded-lg">
                    <h4 className="text-sm mb-2">🌟 Outstanding Achievement</h4>
                    <p className="text-muted-foreground text-sm">
                      You've maintained a consistent 20%+ savings rate throughout the year. This puts you in the top 15% of Finora users!
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <h4 className="text-sm mb-2">📊 Investment Performance</h4>
                    <p className="text-muted-foreground text-sm">
                      Your SIP investments have grown by 9.2% annually, outperforming the market average of 7.8%.
                    </p>
                  </div>
                  <div className="p-4 bg-card rounded-lg">
                    <h4 className="text-sm mb-2">💡 Recommendation for Next Year</h4>
                    <p className="text-muted-foreground text-sm">
                      Consider increasing your SIP amount by ₹2,000/month to reach your ₹5L investment goal faster.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
