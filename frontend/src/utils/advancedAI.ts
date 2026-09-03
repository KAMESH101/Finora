// Advanced AI Analysis for FinAI India
// Enhanced features: Spending patterns, recurring expenses, seasonal predictions, financial health score

export interface SpendingPattern {
  id: string;
  pattern: 'weekend_spender' | 'weekday_spender' | 'monthly_spike' | 'consistent' | 'impulsive';
  description: string;
  confidence: number;
  recommendation: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export interface RecurringExpense {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextExpected: string;
  confidence: number;
  suggestion: string;
}

export interface SeasonalPrediction {
  season: 'festive' | 'tax' | 'vacation' | 'school' | 'normal';
  month: string;
  predictedIncrease: number;
  categories: string[];
  recommendation: string;
}

export interface FinancialHealthScore {
  overall: number;
  breakdown: {
    savings: { score: number; status: string; message: string };
    spending: { score: number; status: string; message: string };
    investments: { score: number; status: string; message: string };
    debt: { score: number; status: string; message: string };
    emergency: { score: number; status: string; message: string };
  };
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  improvements: string[];
}

export interface SavingsChallenge {
  id: string;
  title: string;
  description: string;
  target: number;
  duration: number; // days
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  reward: number;
  icon: string;
}

/**
 * Analyze spending patterns to identify behavioral trends
 */
export function analyzeSpendingPatterns(transactions: any[]): SpendingPattern[] {
  const patterns: SpendingPattern[] = [];
  
  // Analyze day-of-week spending
  const weekendSpending = transactions
    .filter(tx => {
      const date = new Date(tx.date);
      const day = date.getDay();
      return day === 0 || day === 6; // Saturday or Sunday
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const weekdaySpending = transactions
    .filter(tx => {
      const date = new Date(tx.date);
      const day = date.getDay();
      return day >= 1 && day <= 5;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const avgWeekendTransaction = weekendSpending / Math.max(transactions.filter(tx => {
    const day = new Date(tx.date).getDay();
    return day === 0 || day === 6;
  }).length, 1);
  
  const avgWeekdayTransaction = weekdaySpending / Math.max(transactions.filter(tx => {
    const day = new Date(tx.date).getDay();
    return day >= 1 && day <= 5;
  }).length, 1);
  
  if (avgWeekendTransaction > avgWeekdayTransaction * 1.5) {
    patterns.push({
      id: 'pattern-weekend',
      pattern: 'weekend_spender',
      description: `You spend ${Math.round((avgWeekendTransaction / avgWeekdayTransaction - 1) * 100)}% more on weekends compared to weekdays.`,
      confidence: 85,
      recommendation: 'Plan weekend activities within a budget. Try free or low-cost entertainment options.',
      impact: 'negative'
    });
  }
  
  // Analyze transaction frequency
  const categoryFrequency = new Map<string, number>();
  transactions.forEach(tx => {
    categoryFrequency.set(tx.category, (categoryFrequency.get(tx.category) || 0) + 1);
  });
  
  // Check for impulsive spending (many small transactions in same category)
  categoryFrequency.forEach((count, category) => {
    const categoryTx = transactions.filter(tx => tx.category === category);
    const avgAmount = categoryTx.reduce((sum, tx) => sum + tx.amount, 0) / count;
    
    if (count > 10 && avgAmount < 500 && category !== 'Travel') {
      patterns.push({
        id: `pattern-impulsive-${category}`,
        pattern: 'impulsive',
        description: `${count} small ${category} transactions (avg ₹${Math.round(avgAmount)}) detected, suggesting impulsive buying.`,
        confidence: 75,
        recommendation: `Try batching ${category} purchases. Make a list before shopping and stick to it.`,
        impact: 'negative'
      });
    }
  });
  
  // Check for consistent spending
  const monthlyVariance = calculateVariance(transactions);
  if (monthlyVariance < 15) {
    patterns.push({
      id: 'pattern-consistent',
      pattern: 'consistent',
      description: 'Your spending is very consistent month-to-month (variance < 15%).',
      confidence: 90,
      recommendation: 'Great job maintaining consistent spending habits! This makes budgeting easier.',
      impact: 'positive'
    });
  }
  
  return patterns;
}

/**
 * Detect recurring expenses automatically
 */
export function detectRecurringExpenses(transactions: any[]): RecurringExpense[] {
  const recurring: RecurringExpense[] = [];
  const merchantMap = new Map<string, any[]>();
  
  // Group transactions by merchant
  transactions.forEach(tx => {
    if (!merchantMap.has(tx.merchant)) {
      merchantMap.set(tx.merchant, []);
    }
    merchantMap.get(tx.merchant)!.push(tx);
  });
  
  // Analyze each merchant for recurring patterns
  merchantMap.forEach((txs, merchant) => {
    if (txs.length < 2) return;
    
    // Check if amounts are similar (within 10% variance)
    const amounts = txs.map(tx => tx.amount);
    const avgAmount = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
    const variance = calculateVariance(txs);
    
    if (variance < 20) {
      // Determine frequency
      let frequency: RecurringExpense['frequency'] = 'monthly';
      let confidence = 80;
      
      if (txs.length >= 4) {
        confidence = 90;
        frequency = 'monthly';
      } else if (txs.length >= 2 && txs.length < 4) {
        confidence = 70;
        frequency = 'monthly';
      }
      
      // Check if it's a subscription
      const subscriptionKeywords = ['netflix', 'prime', 'spotify', 'gym', 'insurance'];
      const isSubscription = subscriptionKeywords.some(keyword => 
        merchant.toLowerCase().includes(keyword)
      );
      
      if (isSubscription || variance < 5) {
        recurring.push({
          id: `recurring-${merchant.toLowerCase().replace(/\s+/g, '-')}`,
          merchant,
          category: txs[0].category,
          amount: Math.round(avgAmount),
          frequency,
          nextExpected: getNextExpectedDate(txs),
          confidence,
          suggestion: isSubscription 
            ? `Consider if you're using this ${merchant} subscription regularly. Cancel if not needed.`
            : `This regular payment to ${merchant} could be automated for convenience.`
        });
      }
    }
  });
  
  return recurring.slice(0, 8); // Return top 8 recurring expenses
}

/**
 * Predict seasonal spending trends (Indian context)
 */
export function predictSeasonalSpending(currentMonth: number): SeasonalPrediction[] {
  const predictions: SeasonalPrediction[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Festive season (Oct-Nov: Diwali, Dec: Christmas/New Year)
  if (currentMonth >= 9 && currentMonth <= 11) {
    predictions.push({
      season: 'festive',
      month: months[currentMonth],
      predictedIncrease: currentMonth === 10 ? 35 : 25, // Diwali month highest
      categories: ['Shopping', 'Food', 'Travel', 'Entertainment'],
      recommendation: 'Festive season ahead! Set aside 30-40% extra budget for Diwali shopping, gifts, and celebrations. Start a festive fund early.'
    });
  }
  
  // Tax season (Jan-Mar: Financial year-end planning)
  if (currentMonth >= 0 && currentMonth <= 2) {
    predictions.push({
      season: 'tax',
      month: months[currentMonth],
      predictedIncrease: 15,
      categories: ['Investments', 'Insurance'],
      recommendation: 'Tax-saving season! Maximize 80C deductions before March 31. Consider ELSS, PPF, or NPS investments.'
    });
  }
  
  // Summer vacation (Apr-Jun)
  if (currentMonth >= 3 && currentMonth <= 5) {
    predictions.push({
      season: 'vacation',
      month: months[currentMonth],
      predictedIncrease: 20,
      categories: ['Travel', 'Entertainment', 'Food'],
      recommendation: 'Summer vacation period. Plan travel early to get better deals. Budget for increased electricity bills due to AC usage.'
    });
  }
  
  // School season (Jun-Jul: Admissions, fees)
  if (currentMonth >= 5 && currentMonth <= 6) {
    predictions.push({
      season: 'school',
      month: months[currentMonth],
      predictedIncrease: 25,
      categories: ['Education', 'Shopping'],
      recommendation: 'School admission season. Budget for school fees, books, uniforms, and supplies. Look for early-bird discounts.'
    });
  }
  
  return predictions;
}

/**
 * Calculate comprehensive financial health score
 */
export function calculateFinancialHealthScore(userData: any): FinancialHealthScore {
  const { balances, budgets, sips, creditScore, transactions } = userData;
  
  // 1. Savings Score (0-100)
  const monthlySavings = balances.savings / 12; // Approximate monthly savings
  const monthlyExpenses = balances.expenses;
  const savingsRate = (monthlySavings / (monthlySavings + monthlyExpenses)) * 100;
  const savingsScore = Math.min(100, savingsRate * 2.5); // 40% savings rate = 100 score
  
  // 2. Spending Score (0-100) - based on budget adherence
  let totalBudgetUsage = 0;
  budgets.forEach(budget => {
    const usage = (budget.spent / budget.allocated) * 100;
    totalBudgetUsage += usage;
  });
  const avgBudgetUsage = totalBudgetUsage / budgets.length;
  const spendingScore = avgBudgetUsage > 100 
    ? Math.max(0, 100 - (avgBudgetUsage - 100)) 
    : 100 - Math.abs(avgBudgetUsage - 80); // Optimal is 80% usage
  
  // 3. Investment Score (0-100)
  const totalInvestment = sips.reduce((sum: number, sip: any) => sum + sip.current, 0);
  const investmentRate = (totalInvestment / balances.savings) * 100;
  const investmentScore = Math.min(100, investmentRate * 2); // 50% invested = 100 score
  
  // 4. Debt Score (0-100) - based on EMI to income ratio
  const emiExpenses = transactions
    .filter((tx: any) => tx.category === 'EMI')
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  const monthlyIncome = 120000; // From mock data
  const emiRatio = (emiExpenses / monthlyIncome) * 100;
  const debtScore = Math.max(0, 100 - emiRatio * 2); // Lower EMI ratio = better score
  
  // 5. Emergency Fund Score (0-100)
  const emergencyFundTarget = monthlyExpenses * 6; // 6 months of expenses
  const emergencyScore = Math.min(100, (balances.savings / emergencyFundTarget) * 100);
  
  // Overall score (weighted average)
  const overall = Math.round(
    savingsScore * 0.25 +
    spendingScore * 0.25 +
    investmentScore * 0.20 +
    debtScore * 0.15 +
    emergencyScore * 0.15
  );
  
  // Determine grade
  let grade: FinancialHealthScore['grade'];
  if (overall >= 90) grade = 'A+';
  else if (overall >= 80) grade = 'A';
  else if (overall >= 75) grade = 'B+';
  else if (overall >= 70) grade = 'B';
  else if (overall >= 65) grade = 'C+';
  else if (overall >= 60) grade = 'C';
  else grade = 'D';
  
  // Generate improvement suggestions
  const improvements: string[] = [];
  if (savingsScore < 70) improvements.push('Increase your savings rate to at least 30% of income');
  if (spendingScore < 70) improvements.push('Better align spending with budgets - aim for 80% budget utilization');
  if (investmentScore < 70) improvements.push('Invest at least 30% of savings in SIPs/mutual funds for wealth building');
  if (debtScore < 70) improvements.push('Reduce EMI burden to less than 40% of monthly income');
  if (emergencyScore < 70) improvements.push('Build emergency fund to cover 6 months of expenses');
  
  return {
    overall,
    breakdown: {
      savings: {
        score: Math.round(savingsScore),
        status: savingsScore >= 70 ? 'good' : savingsScore >= 50 ? 'average' : 'poor',
        message: `Savings rate: ${Math.round(savingsRate)}% of income`
      },
      spending: {
        score: Math.round(spendingScore),
        status: spendingScore >= 70 ? 'good' : spendingScore >= 50 ? 'average' : 'poor',
        message: `Average budget usage: ${Math.round(avgBudgetUsage)}%`
      },
      investments: {
        score: Math.round(investmentScore),
        status: investmentScore >= 70 ? 'good' : investmentScore >= 50 ? 'average' : 'poor',
        message: `${Math.round(investmentRate)}% of savings invested`
      },
      debt: {
        score: Math.round(debtScore),
        status: debtScore >= 70 ? 'good' : debtScore >= 50 ? 'average' : 'poor',
        message: `EMI is ${Math.round(emiRatio)}% of monthly income`
      },
      emergency: {
        score: Math.round(emergencyScore),
        status: emergencyScore >= 70 ? 'good' : emergencyScore >= 50 ? 'average' : 'poor',
        message: `${Math.round((balances.savings / emergencyFundTarget) * 6)} months of emergency fund`
      }
    },
    grade,
    improvements
  };
}

/**
 * Generate personalized savings challenges
 */
export function generateSavingsChallenges(userData: any): SavingsChallenge[] {
  const { transactions, budgets } = userData;
  const challenges: SavingsChallenge[] = [];
  
  // Food delivery challenge
  const foodDelivery = transactions
    .filter((tx: any) => ['Zomato', 'Swiggy', 'Dunzo'].includes(tx.merchant))
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  
  if (foodDelivery > 2000) {
    challenges.push({
      id: 'challenge-cook-week',
      title: 'Cook at Home Week',
      description: 'Cook at home for 5 consecutive days',
      target: foodDelivery * 0.5,
      duration: 7,
      difficulty: 'medium',
      category: 'Food',
      reward: 250,
      icon: '🍳'
    });
  }
  
  // No-spend challenge
  challenges.push({
    id: 'challenge-no-spend',
    title: 'Weekend No-Spend Challenge',
    description: 'Go one weekend without any non-essential purchases',
    target: 3000,
    duration: 2,
    difficulty: 'hard',
    category: 'Shopping',
    reward: 500,
    icon: '🎯'
  });
  
  // Public transport challenge
  const transportSpending = transactions
    .filter((tx: any) => tx.category === 'Travel')
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);
  
  if (transportSpending > 1500) {
    challenges.push({
      id: 'challenge-public-transport',
      title: 'Public Transport Hero',
      description: 'Use metro/bus instead of cab for work commute (5 days)',
      target: transportSpending * 0.6,
      duration: 5,
      difficulty: 'easy',
      category: 'Travel',
      reward: 200,
      icon: '🚇'
    });
  }
  
  // Subscription audit challenge
  challenges.push({
    id: 'challenge-sub-audit',
    title: 'Subscription Detox',
    description: 'Cancel at least 2 unused subscriptions',
    target: 1000,
    duration: 1,
    difficulty: 'easy',
    category: 'Subscriptions',
    reward: 150,
    icon: '✂️'
  });
  
  // Coffee/tea challenge
  challenges.push({
    id: 'challenge-coffee',
    title: 'Home Brew Challenge',
    description: 'Skip café coffee for a week, brew at home',
    target: 700,
    duration: 7,
    difficulty: 'medium',
    category: 'Food',
    reward: 100,
    icon: '☕'
  });
  
  // Save-the-change challenge
  challenges.push({
    id: 'challenge-roundup',
    title: 'Round-Up Savings',
    description: 'Round up every purchase to nearest ₹100 and save the difference',
    target: 2000,
    duration: 30,
    difficulty: 'easy',
    category: 'Savings',
    reward: 300,
    icon: '🪙'
  });
  
  return challenges;
}

/**
 * Analyze merchant loyalty and suggest optimizations
 */
export function analyzeMerchantLoyalty(transactions: any[]): {
  topMerchants: Array<{
    merchant: string;
    spent: number;
    frequency: number;
    category: string;
    suggestion: string;
  }>;
  loyaltyOpportunities: string[];
} {
  const merchantMap = new Map<string, { total: number; count: number; category: string }>();
  
  transactions.forEach(tx => {
    if (!merchantMap.has(tx.merchant)) {
      merchantMap.set(tx.merchant, { total: 0, count: 0, category: tx.category });
    }
    const data = merchantMap.get(tx.merchant)!;
    data.total += tx.amount;
    data.count += 1;
  });
  
  const topMerchants = Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({
      merchant,
      spent: data.total,
      frequency: data.count,
      category: data.category,
      suggestion: generateLoyaltySuggestion(merchant, data.total, data.count, data.category)
    }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);
  
  const loyaltyOpportunities = [
    'Consider credit cards with higher rewards for your top spending categories',
    'Look for merchant-specific loyalty programs to earn cashback',
    'Use UPI apps offering cashback for frequent merchants',
    'Consolidate spending to fewer merchants to maximize loyalty benefits'
  ];
  
  return { topMerchants, loyaltyOpportunities };
}

// Helper functions

function calculateVariance(transactions: any[]): number {
  if (transactions.length < 2) return 0;
  
  const amounts = transactions.map(tx => tx.amount);
  const avg = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length;
  const variance = amounts.reduce((sum, amt) => sum + Math.pow(amt - avg, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  
  return (stdDev / avg) * 100; // Coefficient of variation as percentage
}

function getNextExpectedDate(transactions: any[]): string {
  // Simple prediction: assume monthly recurrence
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  // Use the day from the last transaction
  if (transactions.length > 0) {
    const lastTx = transactions[transactions.length - 1];
    const lastDate = new Date(lastTx.date);
    nextMonth.setDate(lastDate.getDate());
  }
  
  return nextMonth.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function generateLoyaltySuggestion(merchant: string, total: number, frequency: number, category: string): string {
  if (frequency >= 5 && total > 5000) {
    return `High frequency at ${merchant}. Check if they have a loyalty program or co-branded credit card.`;
  } else if (total > 10000) {
    return `You've spent ₹${total.toLocaleString('en-IN')} at ${merchant}. Consider negotiating bulk discounts.`;
  } else {
    return `Regular customer at ${merchant}. Look for seasonal offers and cashback deals.`;
  }
}

/**
 * Smart categorization suggestions for uncategorized transactions
 */
export function suggestCategories(transaction: any, historicalData: any[]): string[] {
  const suggestions: string[] = [];
  
  // Check if merchant exists in historical data
  const sameMerchant = historicalData.filter(tx => tx.merchant === transaction.merchant);
  if (sameMerchant.length > 0) {
    const categoryFreq = new Map<string, number>();
    sameMerchant.forEach(tx => {
      categoryFreq.set(tx.category, (categoryFreq.get(tx.category) || 0) + 1);
    });
    
    const mostFrequent = Array.from(categoryFreq.entries())
      .sort((a, b) => b[1] - a[1])[0];
    suggestions.push(mostFrequent[0]);
  }
  
  // Keyword-based suggestions
  const keywords = {
    'Food': ['restaurant', 'cafe', 'swiggy', 'zomato', 'food', 'pizza', 'burger'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'mall', 'store'],
    'Travel': ['uber', 'ola', 'rapido', 'irctc', 'airline'],
    'Entertainment': ['movie', 'bookmyshow', 'netflix', 'hotstar', 'spotify'],
    'Bills': ['electricity', 'water', 'gas', 'internet', 'mobile']
  };
  
  const merchantLower = transaction.merchant.toLowerCase();
  Object.entries(keywords).forEach(([category, words]) => {
    if (words.some(word => merchantLower.includes(word))) {
      if (!suggestions.includes(category)) {
        suggestions.push(category);
      }
    }
  });
  
  return suggestions.slice(0, 3);
}
