// AI Analysis Utilities for FinAI India

export interface Anomaly {
  id: string;
  type: 'unusual_spending' | 'duplicate' | 'high_frequency' | 'unusual_category' | 'budget_breach';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  amount?: number;
  category?: string;
  date?: string;
  recommendation: string;
  potentialSavings?: number;
}

export interface BudgetAlert {
  id: string;
  category: string;
  spent: number;
  budget: number;
  percentage: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action: string;
}

export interface AIRecommendation {
  id: string;
  type: 'savings' | 'investment' | 'optimization' | 'goal' | 'tax';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  potentialBenefit: number;
  action: string;
  icon: string;
}

export interface FinancialForecast {
  category: string;
  currentMonth: number;
  predictedNextMonth: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  recommendation: string;
}

/**
 * Detect expense anomalies using statistical analysis
 */
export function detectAnomalies(transactions: any[]): Anomaly[] {
  const anomalies: Anomaly[] = [];
  
  // Calculate average spending per category
  const categorySpending = new Map<string, number[]>();
  transactions.forEach(tx => {
    if (!categorySpending.has(tx.category)) {
      categorySpending.set(tx.category, []);
    }
    categorySpending.get(tx.category)!.push(tx.amount);
  });

  // Detect high-value unusual transactions (>2x average)
  categorySpending.forEach((amounts, category) => {
    const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const max = Math.max(...amounts);
    
    if (max > avg * 2) {
      anomalies.push({
        id: `anomaly-high-${category}-${Date.now()}`,
        type: 'unusual_spending',
        severity: 'high',
        title: `Unusual ${category} Expense`,
        description: `You spent ₹${max} on ${category}, which is ${Math.round((max / avg - 1) * 100)}% more than your average.`,
        amount: max,
        category,
        recommendation: `Review this transaction to ensure it's accurate. Consider setting a budget limit for ${category}.`,
        potentialSavings: max - avg
      });
    }
  });

  // Detect potential duplicate transactions
  const recentTx = transactions.slice(0, 5);
  for (let i = 0; i < recentTx.length; i++) {
    for (let j = i + 1; j < recentTx.length; j++) {
      if (
        recentTx[i].merchant === recentTx[j].merchant &&
        recentTx[i].amount === recentTx[j].amount &&
        recentTx[i].category === recentTx[j].category
      ) {
        anomalies.push({
          id: `anomaly-dup-${i}-${j}`,
          type: 'duplicate',
          severity: 'medium',
          title: 'Potential Duplicate Transaction',
          description: `₹${recentTx[i].amount} at ${recentTx[i].merchant} appears twice recently.`,
          amount: recentTx[i].amount,
          category: recentTx[i].category,
          recommendation: 'Check your bank statement to confirm if this is a duplicate charge and request a refund if needed.'
        });
        break;
      }
    }
  }

  // Detect high frequency in specific category
  const categoryFrequency = new Map<string, number>();
  transactions.slice(0, 10).forEach(tx => {
    categoryFrequency.set(tx.category, (categoryFrequency.get(tx.category) || 0) + 1);
  });

  categoryFrequency.forEach((count, category) => {
    if (count >= 4) {
      const totalSpent = transactions
        .filter(tx => tx.category === category)
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      anomalies.push({
        id: `anomaly-freq-${category}`,
        type: 'high_frequency',
        severity: 'medium',
        title: `High ${category} Transaction Frequency`,
        description: `You made ${count} ${category} transactions recently, totaling ₹${totalSpent}.`,
        amount: totalSpent,
        category,
        recommendation: `Consider bulk purchases or subscription services to potentially save money and reduce transaction frequency.`,
        potentialSavings: totalSpent * 0.15
      });
    }
  });

  return anomalies.slice(0, 3); // Return top 3 anomalies
}

/**
 * Generate budget alerts based on spending patterns
 */
export function generateBudgetAlerts(budgets: any[]): BudgetAlert[] {
  const alerts: BudgetAlert[] = [];

  budgets.forEach(budget => {
    const percentage = (budget.spent / budget.allocated) * 100;
    
    if (percentage >= 100) {
      alerts.push({
        id: `alert-critical-${budget.category}`,
        category: budget.category,
        spent: budget.spent,
        budget: budget.allocated,
        percentage,
        severity: 'critical',
        message: `🚨 ${budget.category} budget exceeded by ${Math.round(percentage - 100)}%!`,
        action: 'Adjust Budget'
      });
    } else if (percentage >= 90) {
      alerts.push({
        id: `alert-warning-${budget.category}`,
        category: budget.category,
        spent: budget.spent,
        budget: budget.allocated,
        percentage,
        severity: 'warning',
        message: `⚠️ ${budget.category} budget at ${Math.round(percentage)}% (₹${budget.allocated - budget.spent} left)`,
        action: 'Review Spending'
      });
    } else if (percentage >= 75) {
      alerts.push({
        id: `alert-info-${budget.category}`,
        category: budget.category,
        spent: budget.spent,
        budget: budget.allocated,
        percentage,
        severity: 'info',
        message: `💡 ${budget.category}: ${Math.round(percentage)}% used, stay on track!`,
        action: 'View Details'
      });
    }
  });

  return alerts;
}

/**
 * Generate personalized AI recommendations
 */
export function generateRecommendations(userData: any): AIRecommendation[] {
  const recommendations: AIRecommendation[] = [];
  const { budgets, transactions, balances, sips, creditScore, taxData } = userData;

  // Recommendation 1: Subscription optimization
  const subscriptionSpent = transactions
    .filter((tx: any) => tx.category === 'Subscriptions')
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  
  if (subscriptionSpent > 1000) {
    recommendations.push({
      id: 'rec-subs',
      type: 'savings',
      priority: 'high',
      title: 'Optimize Subscriptions',
      description: `You're spending ₹${subscriptionSpent} on subscriptions. Review and cancel unused services.`,
      potentialBenefit: subscriptionSpent * 0.4,
      action: 'Review Subscriptions',
      icon: '🔄'
    });
  }

  // Recommendation 2: Emergency fund
  if (balances.savings < balances.expenses * 3) {
    recommendations.push({
      id: 'rec-emergency',
      type: 'savings',
      priority: 'high',
      title: 'Build Emergency Fund',
      description: `Your emergency fund should cover 6 months of expenses (₹${balances.expenses * 6}). Currently at ₹${balances.savings}.`,
      potentialBenefit: balances.expenses * 6 - balances.savings,
      action: 'Start Saving',
      icon: '🛡️'
    });
  }

  // Recommendation 3: Increase SIP
  const totalSIP = sips.reduce((sum: number, sip: any) => sum + sip.amount, 0);
  if (totalSIP < balances.savings * 0.2) {
    recommendations.push({
      id: 'rec-sip',
      type: 'investment',
      priority: 'medium',
      title: 'Increase SIP Contributions',
      description: `Boost your SIP by ₹2,000/month to build wealth faster. Potential corpus in 10 years: ₹22.5L`,
      potentialBenefit: 800000,
      action: 'Increase SIP',
      icon: '📈'
    });
  }

  // Recommendation 4: Tax savings
  const taxSavingPotential = 150000 - (taxData.deductions || 0);
  if (taxSavingPotential > 0) {
    recommendations.push({
      id: 'rec-tax',
      type: 'tax',
      priority: 'high',
      title: 'Maximize Tax Savings',
      description: `You can save ₹${Math.round(taxSavingPotential * 0.3)} in taxes by investing ₹${taxSavingPotential} in 80C instruments.`,
      potentialBenefit: taxSavingPotential * 0.3,
      action: 'View Tax Plan',
      icon: '💰'
    });
  }

  // Recommendation 5: Credit score improvement
  if (creditScore.score < 800) {
    recommendations.push({
      id: 'rec-credit',
      type: 'optimization',
      priority: 'medium',
      title: 'Improve Credit Score',
      description: `Get better loan rates by improving your score from ${creditScore.score} to 800+. Pay bills early and reduce utilization.`,
      potentialBenefit: 50000,
      action: 'View Tips',
      icon: '⭐'
    });
  }

  return recommendations.slice(0, 5);
}

/**
 * Forecast future expenses using trend analysis
 */
export function forecastExpenses(monthlyData: any[]): FinancialForecast[] {
  const forecasts: FinancialForecast[] = [];
  
  // Calculate trends for major categories
  const categories = ['Food', 'Shopping', 'Travel', 'Entertainment'];
  
  categories.forEach(category => {
    const lastMonth = monthlyData[monthlyData.length - 1];
    const avgGrowth = 0.03; // 3% average growth
    const predicted = Math.round(lastMonth.expenses * (1 + avgGrowth));
    
    forecasts.push({
      category,
      currentMonth: lastMonth.expenses,
      predictedNextMonth: predicted,
      confidence: 85,
      trend: predicted > lastMonth.expenses ? 'increasing' : 'stable',
      recommendation: predicted > lastMonth.expenses 
        ? `${category} expenses trending up. Consider reviewing spending.`
        : `${category} spending is stable. Good job!`
    });
  });

  return forecasts;
}

/**
 * Analyze spending pattern for NLQ
 */
export function analyzeSpendingPattern(
  transactions: any[],
  query: string
): string {
  const lowerQuery = query.toLowerCase();
  
  // Parse time period
  let filteredTx = transactions;
  if (lowerQuery.includes('last week')) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    filteredTx = transactions.filter(tx => new Date(tx.date) >= weekAgo);
  } else if (lowerQuery.includes('this month')) {
    const monthStart = new Date();
    monthStart.setDate(1);
    filteredTx = transactions.filter(tx => new Date(tx.date) >= monthStart);
  }

  // Parse category
  const categories = ['food', 'shopping', 'travel', 'entertainment', 'subscriptions', 'emi'];
  const matchedCategory = categories.find(cat => lowerQuery.includes(cat));
  
  if (matchedCategory) {
    const categoryTx = filteredTx.filter(tx => 
      tx.category.toLowerCase() === matchedCategory
    );
    const total = categoryTx.reduce((sum, tx) => sum + tx.amount, 0);
    const count = categoryTx.length;
    
    return `You spent ₹${total.toLocaleString('en-IN')} on ${matchedCategory} (${count} transaction${count !== 1 ? 's' : ''}).`;
  }

  // Total spending query
  if (lowerQuery.includes('total') || lowerQuery.includes('how much')) {
    const total = filteredTx.reduce((sum, tx) => sum + tx.amount, 0);
    return `Your total spending was ₹${total.toLocaleString('en-IN')} across ${filteredTx.length} transactions.`;
  }

  // Average query
  if (lowerQuery.includes('average')) {
    const avg = filteredTx.reduce((sum, tx) => sum + tx.amount, 0) / filteredTx.length;
    return `Your average transaction amount was ₹${Math.round(avg).toLocaleString('en-IN')}.`;
  }

  // Top categories query
  if (lowerQuery.includes('top') || lowerQuery.includes('most')) {
    const categoryTotals = new Map<string, number>();
    filteredTx.forEach(tx => {
      categoryTotals.set(tx.category, (categoryTotals.get(tx.category) || 0) + tx.amount);
    });
    
    const sorted = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    return `Your top spending categories:\n1. ${sorted[0][0]}: ₹${sorted[0][1].toLocaleString('en-IN')}\n2. ${sorted[1][0]}: ₹${sorted[1][1].toLocaleString('en-IN')}\n3. ${sorted[2][0]}: ₹${sorted[2][1].toLocaleString('en-IN')}`;
  }

  return "I couldn't find specific data for that query. Try asking about your spending by category or time period.";
}

/**
 * Format date to Indian format (DD-MM-YYYY)
 */
export function formatIndianDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

/**
 * Format date to Indian short format (DD MMM)
 */
export function formatIndianDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]}`;
}

/**
 * Cost optimization analyzer
 */
export function analyzeCostOptimization(userData: any): {
  totalPotentialSavings: number;
  optimizations: Array<{
    category: string;
    current: number;
    optimized: number;
    savings: number;
    method: string;
  }>;
} {
  const { transactions, budgets } = userData;
  const optimizations: any[] = [];
  
  // Food delivery optimization
  const foodDelivery = transactions
    .filter((tx: any) => ['Zomato', 'Swiggy', 'Dunzo'].includes(tx.merchant))
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  
  if (foodDelivery > 2000) {
    optimizations.push({
      category: 'Food Delivery',
      current: foodDelivery,
      optimized: foodDelivery * 0.6,
      savings: foodDelivery * 0.4,
      method: 'Cook at home 3 days/week'
    });
  }

  // Subscription optimization
  const subscriptions = transactions
    .filter((tx: any) => tx.category === 'Subscriptions')
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  
  if (subscriptions > 1000) {
    optimizations.push({
      category: 'Subscriptions',
      current: subscriptions,
      optimized: subscriptions * 0.5,
      savings: subscriptions * 0.5,
      method: 'Cancel 2-3 unused services'
    });
  }

  // Transport optimization
  const transport = transactions
    .filter((tx: any) => tx.category === 'Travel')
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  
  if (transport > 3000) {
    optimizations.push({
      category: 'Transportation',
      current: transport,
      optimized: transport * 0.7,
      savings: transport * 0.3,
      method: 'Use public transport or carpool'
    });
  }

  const totalPotentialSavings = optimizations.reduce((sum, opt) => sum + opt.savings, 0);

  return { totalPotentialSavings, optimizations };
}
