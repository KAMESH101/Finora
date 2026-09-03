import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageCircle, Send, X, Sparkles, TrendingUp, PiggyBank, Download, 
  Mic, StopCircle, Brain, Zap, RefreshCw, ChevronDown, AlertCircle
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner@2.0.3";
import {
  processNLQuery,
  ContextManager,
  analyzeSentiment,
  detectMultipleIntents,
  matchCategory,
  type Intent
} from "../utils/nlpEngine";
import { mockData } from "../mockData";
import {
  analyzeSpendingPatterns,
  detectRecurringExpenses,
  calculateFinancialHealthScore,
  generateSavingsChallenges,
  analyzeMerchantLoyalty
} from "../utils/advancedAI";
import {
  detectAnomalies,
  generateBudgetAlerts,
  generateRecommendations,
  forecastExpenses
} from "../utils/aiAnalysis";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  intent?: string;
  confidence?: number;
  entities?: any[];
  suggestions?: string[];
}

const contextManager = new ContextManager();

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { icon: TrendingUp, text: "Show my spending trends", query: "analyze my spending patterns" },
    { icon: PiggyBank, text: "How can I save more?", query: "how can I optimize my spending and save money" },
    { icon: Zap, text: "Budget status", query: "what is my budget status" },
    { icon: Brain, text: "Financial health score", query: "calculate my financial health score" },
  ];

  const suggestedPrompts = [
    "How much did I spend on food last week?",
    "What's my average monthly income?",
    "Show me my top 3 expense categories",
    "Predict my next month expenses",
    "Find unusual transactions",
    "Which merchants do I spend most at?",
    "How can I optimize my subscriptions?",
    "Show me recurring expenses",
    "What's my financial health score?",
    "Recommend best investment options"
  ];

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 1,
        text: `Namaste! 🙏 I'm your Finora Assistant, powered by advanced NLP.\n\n✨ I can understand natural language queries like:\n\n💰 "How much did I spend on food last week?"\n📊 "Compare this month vs last month"\n🎯 "Show unusual transactions"\n📈 "What's my financial health score?"\n💡 "How can I save ₹10,000/month?"\n\nI learn from our conversation and provide personalized insights. What would you like to know?`,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: [
          "Analyze my spending",
          "Show budget status",
          "Financial health score"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Generate AI response based on NLP intent
  const generateAIResponse = (query: string): { text: string; suggestions: string[] } => {
    // Process with NLP engine
    const nlpResult = processNLQuery(query, contextManager);
    const { intent, suggestedFollowUps, requiresClarification, clarificationQuestion } = nlpResult;

    // If clarification needed
    if (requiresClarification && clarificationQuestion) {
      return {
        text: `🤔 ${clarificationQuestion}`,
        suggestions: ["This month", "Last week", "Food category", "All categories"]
      };
    }

    // Generate response based on intent
    let response = "";
    
    switch (intent.name) {
      case 'spending_query':
        response = handleSpendingQuery(intent, query);
        break;
      case 'income_query':
        response = handleIncomeQuery();
        break;
      case 'balance_query':
        response = handleBalanceQuery();
        break;
      case 'category_analysis':
        response = handleCategoryAnalysis();
        break;
      case 'prediction':
        response = handlePrediction();
        break;
      case 'optimization':
        response = handleOptimization();
        break;
      case 'budget_status':
        response = handleBudgetStatus();
        break;
      case 'anomaly_detection':
        response = handleAnomalyDetection();
        break;
      case 'goal_tracking':
        response = handleGoalTracking();
        break;
      case 'investment_advice':
        response = handleInvestmentAdvice();
        break;
      case 'tax_planning':
        response = handleTaxPlanning();
        break;
      case 'credit_score':
        response = handleCreditScore();
        break;
      case 'merchant_analysis':
        response = handleMerchantAnalysis();
        break;
      case 'recurring_expenses':
        response = handleRecurringExpenses();
        break;
      case 'savings_challenge':
        response = handleSavingsChallenge();
        break;
      default:
        response = handleGeneralQuery(query, intent);
    }

    // Add confidence indicator if low
    if (intent.confidence < 0.7) {
      response = `💭 (Confidence: ${Math.round(intent.confidence * 100)}%)\n\n` + response;
    }

    return {
      text: response,
      suggestions: suggestedFollowUps
    };
  };

  // Intent handlers
  const handleSpendingQuery = (intent: Intent, query: string): string => {
    const lowerQuery = query.toLowerCase();
    const categoryEntity = intent.entities.find(e => e.type === 'category');
    const timePeriodEntity = intent.entities.find(e => e.type === 'time_period');

    let response = "📊 Spending Analysis:\n\n";

    // Filter transactions based on entities
    let filteredTx = [...mockData.transactions];
    
    if (timePeriodEntity) {
      response += `📅 Period: ${timePeriodEntity.value}\n`;
    }

    if (categoryEntity) {
      const category = categoryEntity.normalized;
      filteredTx = filteredTx.filter(tx => 
        tx.category.toLowerCase().includes(category)
      );
      
      const total = filteredTx.reduce((sum, tx) => sum + tx.amount, 0);
      const budget = mockData.budgets.find(b => 
        b.category.toLowerCase() === category
      );

      response += `💰 ${categoryEntity.value.toUpperCase()}: ₹${total.toLocaleString('en-IN')}\n`;
      response += `📝 Transactions: ${filteredTx.length}\n`;
      
      if (budget) {
        const percentage = (total / budget.allocated) * 100;
        response += `📊 Budget: ₹${budget.allocated.toLocaleString('en-IN')} (${Math.round(percentage)}% used)\n`;
        
        if (percentage > 100) {
          response += `⚠️ ALERT: Over budget by ₹${(total - budget.allocated).toLocaleString('en-IN')}!\n`;
        } else if (percentage > 90) {
          response += `⚡ WARNING: Only ₹${(budget.allocated - total).toLocaleString('en-IN')} remaining!\n`;
        }
      }

      // Top merchants in category
      const merchantTotals = new Map<string, number>();
      filteredTx.forEach(tx => {
        merchantTotals.set(tx.merchant, (merchantTotals.get(tx.merchant) || 0) + tx.amount);
      });
      
      response += `\n🏪 Top Merchants:\n`;
      Array.from(merchantTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([merchant, amount], i) => {
          response += `${i + 1}. ${merchant}: ₹${amount.toLocaleString('en-IN')}\n`;
        });
    } else {
      // Overall spending
      const total = filteredTx.reduce((sum, tx) => sum + tx.amount, 0);
      response += `💰 Total: ₹${total.toLocaleString('en-IN')}\n`;
      response += `📝 Transactions: ${filteredTx.length}\n`;
      response += `📊 Average: ₹${Math.round(total / filteredTx.length).toLocaleString('en-IN')}\n\n`;
      
      // Category breakdown
      const categoryTotals = new Map<string, number>();
      filteredTx.forEach(tx => {
        categoryTotals.set(tx.category, (categoryTotals.get(tx.category) || 0) + tx.amount);
      });
      
      response += `📈 Top Categories:\n`;
      Array.from(categoryTotals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([cat, amount], i) => {
          const percentage = (amount / total) * 100;
          response += `${i + 1}. ${cat}: ₹${amount.toLocaleString('en-IN')} (${Math.round(percentage)}%)\n`;
        });
    }

    return response;
  };

  const handleIncomeQuery = (): string => {
    return `💰 Income Analysis:\n\n• Average Monthly: ₹1,20,000\n• Last 3 months: ₹3,65,000\n• YTD (2025): ₹8,40,000\n• Growth: +8% YoY\n\n📊 Sources:\n• Salary: ₹1,10,000 (92%)\n• Freelance: ₹8,000 (6%)\n• Other: ₹2,000 (2%)\n\n🎯 Projected Annual: ₹14.4L\n✅ Tax Bracket: 30%\n💡 Consider tax-saving investments!`;
  };

  const handleBalanceQuery = (): string => {
    return `💳 Account Balances:\n\n• Total: ₹${mockData.balances.totalBalance.toLocaleString('en-IN')}\n• Savings: ₹${mockData.balances.savings.toLocaleString('en-IN')} (57%)\n• Checking: ₹${mockData.balances.expenses.toLocaleString('en-IN')} (34%)\n• Investments: ₹${mockData.balances.investments.toLocaleString('en-IN')} (9%)\n\n📈 This Month:\n• Income: +₹1,20,000\n• Expenses: -₹95,000\n• Net Savings: +₹25,000 (21%)\n\n✅ Healthy savings rate!\n💡 Consider increasing SIP by ₹2,000`;
  };

  const handleCategoryAnalysis = (): string => {
    const sorted = [...mockData.expenseBreakdown].sort((a, b) => b.value - a.value);
    const total = sorted.reduce((sum, cat) => sum + cat.value, 0);
    
    let response = `🏆 Category Analysis (This Month):\n\n`;
    
    sorted.forEach((cat, i) => {
      const percentage = (cat.value / total) * 100;
      const budget = mockData.budgets.find(b => b.category === cat.name);
      
      response += `${i + 1}. ${cat.name}: ₹${cat.value.toLocaleString('en-IN')} (${Math.round(percentage)}%)\n`;
      
      if (budget) {
        const budgetPct = (cat.value / budget.allocated) * 100;
        if (budgetPct > 100) {
          response += `   ⚠️ Over budget by ${Math.round(budgetPct - 100)}%\n`;
        } else if (budgetPct > 90) {
          response += `   ⚡ ${Math.round(budgetPct)}% of budget used\n`;
        } else {
          response += `   ✅ ${Math.round(budgetPct)}% of budget used\n`;
        }
      }
    });
    
    response += `\n💡 Focus on top 3 categories to optimize spending!`;
    
    return response;
  };

  const handlePrediction = (): string => {
    return `🔮 November Expense Forecast:\n\n📊 AI Prediction (87% confidence):\n• Total: ₹1,12,000 (+8% from Oct)\n• Food: ₹15,500 (+9%)\n• Shopping: ₹11,200 (+21%) ⚠️\n• EMI: ₹21,000 (fixed)\n• Travel: ₹5,800 (+142%)\n• Entertainment: ₹4,500 (+41%)\n• Subscriptions: ₹1,500 (+25%)\n\n🎯 Insights:\n⚠️ Shopping trending +21% - Review wishlist\n📈 Travel spike likely (holiday season)\n💡 Festival expenses expected\n\n💰 Potential Savings: ₹5,000\nWith optimization:\n• Cancel unused subscriptions: -₹800\n• Reduce food delivery: -₹2,000\n• Plan shopping better: -₹2,200`;
  };

  const handleOptimization = (): string => {
    const patterns = analyzeSpendingPatterns(mockData.transactions);
    const recurring = detectRecurringExpenses(mockData.transactions);
    
    let response = `✂️ Cost Optimization Opportunities:\n\n💰 Total Potential Savings: ₹7,200/month\n\n`;
    
    response += `🔄 Subscriptions (₹2,400/mo):\n`;
    recurring.slice(0, 3).forEach(rec => {
      response += `• ${rec.merchant}: ₹${rec.amount} - ${rec.suggestion}\n`;
    });
    
    response += `\n🍽️ Food Delivery (₹3,000/mo):\n`;
    response += `• Cook at home 3 days/week\n`;
    response += `• Use meal prep on weekends\n`;
    response += `• Order during cashback offers\n`;
    
    response += `\n🚗 Transportation (₹1,800/mo):\n`;
    response += `• Use metro/bus 2x per week\n`;
    response += `• Carpool with colleagues\n`;
    response += `• Walk for short distances\n`;
    
    if (patterns.length > 0) {
      response += `\n📊 Spending Patterns Detected:\n`;
      patterns.slice(0, 2).forEach(pattern => {
        response += `• ${pattern.description}\n`;
        response += `  💡 ${pattern.recommendation}\n`;
      });
    }
    
    response += `\n🎯 Annual Impact: ₹86,400 saved!`;
    
    return response;
  };

  const handleBudgetStatus = (): string => {
    const alerts = generateBudgetAlerts(mockData.budgets);
    
    let response = `📊 Budget Status Overview:\n\n`;
    
    const onTrack = mockData.budgets.filter(b => (b.spent / b.allocated) <= 0.75);
    const attention = mockData.budgets.filter(b => {
      const pct = b.spent / b.allocated;
      return pct > 0.75 && pct < 1.0;
    });
    const over = mockData.budgets.filter(b => (b.spent / b.allocated) >= 1.0);
    
    if (onTrack.length > 0) {
      response += `✅ On Track (${onTrack.length}):\n`;
      onTrack.forEach(b => {
        const pct = Math.round((b.spent / b.allocated) * 100);
        response += `• ${b.category}: ${pct}% used (₹${b.allocated - b.spent} left)\n`;
      });
    }
    
    if (attention.length > 0) {
      response += `\n⚠️ Needs Attention (${attention.length}):\n`;
      attention.forEach(b => {
        const pct = Math.round((b.spent / b.allocated) * 100);
        response += `• ${b.category}: ${pct}% used (₹${b.allocated - b.spent} left)\n`;
      });
    }
    
    if (over.length > 0) {
      response += `\n🚨 Over Budget (${over.length}):\n`;
      over.forEach(b => {
        const pct = Math.round((b.spent / b.allocated) * 100);
        response += `• ${b.category}: ${pct}% (₹${b.spent - b.allocated} over)\n`;
      });
    }
    
    const totalSpent = mockData.budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalAllocated = mockData.budgets.reduce((sum, b) => sum + b.allocated, 0);
    const overallPct = Math.round((totalSpent / totalAllocated) * 100);
    
    response += `\n📈 Overall: ${overallPct}% of total budget used`;
    
    return response;
  };

  const handleAnomalyDetection = (): string => {
    const anomalies = detectAnomalies(mockData.transactions);
    
    let response = `🔍 Anomaly Detection Results:\n\n`;
    
    if (anomalies.length === 0) {
      response += `✅ No unusual transactions detected!\nAll spending looks normal.`;
      return response;
    }
    
    anomalies.forEach((anomaly, i) => {
      const severityEmoji = anomaly.severity === 'high' ? '🚨' : anomaly.severity === 'medium' ? '⚠️' : '💡';
      response += `${severityEmoji} ${anomaly.title}\n`;
      response += `${anomaly.description}\n`;
      response += `💡 ${anomaly.recommendation}\n`;
      if (anomaly.potentialSavings) {
        response += `💰 Potential savings: ₹${Math.round(anomaly.potentialSavings).toLocaleString('en-IN')}\n`;
      }
      if (i < anomalies.length - 1) response += `\n`;
    });
    
    return response;
  };

  const handleGoalTracking = (): string => {
    let response = `🎯 Financial Goals Progress:\n\n`;
    
    mockData.goals.forEach((goal, i) => {
      const percentage = Math.round((goal.saved / goal.target) * 100);
      const remaining = goal.target - goal.saved;
      
      response += `${i + 1}. ${goal.title}\n`;
      response += `   Progress: ${percentage}% (₹${goal.saved.toLocaleString('en-IN')} / ₹${goal.target.toLocaleString('en-IN')})\n`;
      response += `   Remaining: ₹${remaining.toLocaleString('en-IN')}\n`;
      response += `   Deadline: ${goal.deadline}\n`;
      
      // Calculate monthly requirement
      const monthsRemaining = 6; // simplified
      const monthlyRequired = Math.round(remaining / monthsRemaining);
      response += `   💡 Need: ₹${monthlyRequired.toLocaleString('en-IN')}/month\n\n`;
    });
    
    response += `🎯 Overall: Making good progress!\nConsider auto-transferring to goal funds.`;
    
    return response;
  };

  const handleInvestmentAdvice = (): string => {
    return `📈 Investment Recommendations:\n\n🏆 Your Current Portfolio:\n• Axis Bluechip: ₹2,000 (ROI: 8.6%)\n• Parag Parikh: ₹1,500 (ROI: 9.2%)\n• HDFC Mid Cap: ₹1,000 (ROI: 11.4%)\n• Total SIP: ₹4,500/month\n\n💡 Personalized Suggestions:\n\n1. 🎯 Increase SIP by ₹2,000\n   Add ELSS for tax benefit\n   Target: ₹6,500/month\n   \n2. 🏅 Diversify with Gold ETF\n   Allocate 10% to gold\n   Amount: ₹650/month\n   \n3. 💎 Consider Index Funds\n   Nifty 50 index fund\n   Lower expense ratio\n\n📊 Projected Wealth (10 years):\n• Current pace: ₹14.2L\n• With changes: ₹22.5L (+58%)\n\n🎯 Recommendation: Increase total SIP to ₹7,000/month for optimal wealth creation!`;
  };

  const handleTaxPlanning = (): string => {
    return `💰 Tax Planning & Savings:\n\n📋 Section 80C (₹1.5L limit):\n• ELSS mutual funds ✅ (tax + returns)\n• PPF (guaranteed 7.1% returns)\n• Life insurance premium\n• Current usage: ₹1.2L\n• Available: ₹30,000\n\n💊 Section 80D (₹25K limit):\n• Health insurance for family\n• Parents' health insurance (+₹25K)\n• Current usage: ₹15,000\n• Available: ₹35,000\n\n🏦 Section 80CCD(1B) (₹50K):\n• NPS contributions (extra deduction)\n• Current usage: ₹0\n• Available: ₹50,000\n\n💡 Section 24 (Home Loan):\n• Interest deduction: ₹2L limit\n\n🎯 Total Potential Tax Savings:\n• Current: ₹42,000\n• Maximum possible: ₹78,000\n• Additional savings: ₹36,000\n\n💡 Action Items:\n1. Invest ₹30K more in ELSS\n2. Increase health insurance\n3. Start NPS with ₹4,167/month\n\n📅 Time left: 5 months till March 31`;
  };

  const handleCreditScore = (): string => {
    return `💳 Credit Score Analysis:\n\n🎯 Current Score: ${mockData.user.creditScore} (Good)\n\n✅ Strengths:\n• Payment history: 98% on-time\n• Credit utilization: 42%\n• Credit mix: Good variety\n• No recent inquiries\n\n⚠️ Areas to Improve:\n• Credit age: 3.5 years (build longer history)\n• Utilization spike in Oct (reduce to <30%)\n• Only 3 active accounts (ideal: 4-5)\n\n💡 Tips to Reach 800+:\n\n1. 🎯 Pay before due date\n   Set auto-pay for all bills\n   \n2. 📊 Reduce utilization to 30%\n   Current: ₹42K / ₹1L limit\n   Target: ₹30K / ₹1L limit\n   \n3. 🔄 Increase credit limit\n   Request limit increase\n   Reduces utilization automatically\n   \n4. 📈 Add one more credit line\n   Consider retail card\n   \n5. ⏱️ Avoid multiple inquiries\n   Space out loan applications\n\n⏱️ Expected Timeline:\n• 800 score: 6 months\n• 850 score: 12-18 months\n\n🎁 Benefits of 800+ Score:\n• Lower interest rates (save ₹50K/year)\n• Pre-approved offers\n• Better credit cards\n• Faster loan approvals`;
  };

  const handleMerchantAnalysis = (): string => {
    const loyalty = analyzeMerchantLoyalty(mockData.transactions);
    
    let response = `🏪 Merchant Spending Analysis:\n\n📊 Top Merchants:\n`;
    
    loyalty.topMerchants.forEach((merchant, i) => {
      response += `\n${i + 1}. ${merchant.merchant}\n`;
      response += `   Spent: ₹${merchant.spent.toLocaleString('en-IN')}\n`;
      response += `   Frequency: ${merchant.frequency} transactions\n`;
      response += `   Category: ${merchant.category}\n`;
      response += `   💡 ${merchant.suggestion}\n`;
    });
    
    response += `\n🎯 Loyalty Opportunities:\n`;
    loyalty.loyaltyOpportunities.slice(0, 3).forEach((opp, i) => {
      response += `${i + 1}. ${opp}\n`;
    });
    
    return response;
  };

  const handleRecurringExpenses = (): string => {
    const recurring = detectRecurringExpenses(mockData.transactions);
    
    let response = `🔄 Recurring Expenses Detected:\n\n`;
    
    if (recurring.length === 0) {
      response += `✅ No significant recurring expenses found.`;
      return response;
    }
    
    const totalRecurring = recurring.reduce((sum, r) => sum + r.amount, 0);
    response += `💰 Total Monthly: ₹${totalRecurring.toLocaleString('en-IN')}\n\n`;
    
    recurring.forEach((rec, i) => {
      response += `${i + 1}. ${rec.merchant}\n`;
      response += `   Amount: ₹${rec.amount.toLocaleString('en-IN')}\n`;
      response += `   Frequency: ${rec.frequency}\n`;
      response += `   Next expected: ${rec.nextExpected}\n`;
      response += `   Confidence: ${rec.confidence}%\n`;
      response += `   💡 ${rec.suggestion}\n\n`;
    });
    
    response += `🎯 Action: Review and optimize these recurring expenses to save ₹${Math.round(totalRecurring * 0.3).toLocaleString('en-IN')}/month!`;
    
    return response;
  };

  const handleSavingsChallenge = (): string => {
    const challenges = generateSavingsChallenges({
      transactions: mockData.transactions,
      budgets: mockData.budgets
    });
    
    let response = `🎮 Savings Challenges for You:\n\n`;
    
    challenges.slice(0, 4).forEach((challenge, i) => {
      const difficulty = challenge.difficulty === 'easy' ? '🟢' : challenge.difficulty === 'medium' ? '🟡' : '🔴';
      
      response += `${challenge.icon} ${challenge.title} ${difficulty}\n`;
      response += `${challenge.description}\n`;
      response += `Target savings: ₹${challenge.target.toLocaleString('en-IN')}\n`;
      response += `Duration: ${challenge.duration} days\n`;
      response += `Reward: ₹${challenge.reward} cashback\n\n`;
    });
    
    const totalSavings = challenges.slice(0, 4).reduce((sum, c) => sum + c.target, 0);
    const totalRewards = challenges.slice(0, 4).reduce((sum, c) => sum + c.reward, 0);
    
    response += `🎯 Complete all 4:\n`;
    response += `💰 Total Savings: ₹${totalSavings.toLocaleString('en-IN')}\n`;
    response += `🏆 Total Rewards: ₹${totalRewards.toLocaleString('en-IN')}\n`;
    response += `\nStart a challenge to earn rewards!`;
    
    return response;
  };

  const handleGeneralQuery = (query: string, intent: Intent): string => {
    // Analyze sentiment
    const sentiment = analyzeSentiment(query);
    
    if (sentiment.sentiment === 'concerned') {
      return `I understand you're concerned. Let me help! 😊\n\nI can assist you with:\n\n📊 Budget Planning & Analysis\n💰 Expense Tracking & Optimization\n📈 Investment Recommendations\n🎯 Goal Setting & Tracking\n💳 Credit Score Improvement\n🏆 Rewards & Challenges\n\n💡 Try asking specific questions like:\n• "Show my budget status"\n• "How can I save money?"\n• "What's my financial health score?"\n• "Predict next month expenses"\n\nWhat would you like to know?`;
    }
    
    return `I understand you're asking about: "${query}"\n\n🧠 Detected intent: ${intent.name.replace(/_/g, ' ')}\n📊 Confidence: ${Math.round(intent.confidence * 100)}%\n\n💡 I can help you with:\n\n📊 Spending Analysis & Tracking\n💰 Budget Management\n📈 Investment Planning\n🎯 Goal Tracking\n💳 Credit Score Tips\n🏦 Tax Planning\n🔍 Transaction Search\n🎮 Savings Challenges\n\n🔍 Try asking:\n• "How much did I spend on food?"\n• "What's my budget status?"\n• "Show unusual transactions"\n• "Recommend best investments"\n• "How to save tax?"`;
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowQuickActions(false);

    // Analyze with NLP
    setTimeout(() => {
      const { text: aiText, suggestions } = generateAIResponse(text);
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiText,
        sender: 'ai',
        timestamp: new Date(),
        suggestions: suggestions
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      toast.info("🎤 Voice input stopped");
    } else {
      setIsListening(true);
      toast.success("🎤 Listening... Speak your query");
      
      // Simulate voice input (in real app, use Web Speech API)
      setTimeout(() => {
        setIsListening(false);
        setInputValue("How much did I spend on food this month?");
        toast.info("📝 Query captured!");
      }, 3000);
    }
  };

  const handleExport = () => {
    const chatContent = messages.map(m => 
      `[${m.timestamp.toLocaleTimeString()}] ${m.sender.toUpperCase()}: ${m.text}`
    ).join('\n\n');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Finora-Chat-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    
    toast.success("💾 Chat exported successfully!");
  };

  const resetConversation = () => {
    contextManager.reset();
    setMessages([]);
    setShowQuickActions(true);
    toast.success("🔄 Conversation reset!");
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="relative">
              <Button
                onClick={() => setIsOpen(true)}
                className="w-16 h-16 rounded-full shadow-xl"
                size="icon"
                style={{ background: 'var(--ink)' }}
              >
                <img src="/finora-mark.png" alt="Finora" className="w-8 h-8 object-contain" />
              </Button>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse" style={{ background: 'var(--money-in)' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[450px] h-[700px] flex flex-col"
          >
            <Card className="flex flex-col h-full shadow-2xl border-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 text-white" style={{ background: 'var(--ink)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                    <img src="/finora-mark.png" alt="Finora" className="w-6 h-6 object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-display">Finora Assistant</h3>
                      <Badge variant="secondary" className="text-xs bg-white/15 text-white border-0">
                        NLP
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/70">
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--money-in)' }} />
                      <span>Powered by advanced AI</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetConversation}
                    className="!text-white hover:!bg-white/15"
                    title="Reset conversation"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExport}
                    className="!text-white hover:!bg-white/15"
                    title="Export chat"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="!text-white hover:!bg-white/15"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              {showQuickActions && messages.length === 0 && (
                <div className="p-4 border-b border-border" style={{ background: 'var(--secondary)' }}>
                  <p className="text-xs text-muted-foreground mb-2">Quick actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickAction(action.query)}
                        className="text-xs h-auto py-2 btn-ripple justify-start"
                      >
                        <action.icon className="w-3 h-3 mr-1" />
                        {action.text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[85%]">
                      <div
                        className="p-3 rounded-xl"
                        style={message.sender === 'user'
                          ? { background: 'var(--ink)', color: '#fff' }
                          : { background: 'var(--card)', border: '1px solid var(--border)' }}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Suggestions */}
                      {message.sender === 'ai' && message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              onClick={() => sendMessage(suggestion)}
                              className="text-xs h-auto py-1 px-2"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="card-stat p-3 rounded-xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--money-in)', animationDelay: '0s' }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--money-in)', animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--money-in)', animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts */}
              {messages.length <= 1 && (
                <div className="p-3 border-t border-border bg-card max-h-40 overflow-y-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs mb-2 flex items-center justify-between"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                  >
                    Suggested questions
                    <ChevronDown className={`w-3 h-3 transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
                  </Button>
                  <div className="grid grid-cols-1 gap-1">
                    {suggestedPrompts.slice(0, 6).map((prompt, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => sendMessage(prompt)}
                        className="text-xs h-auto py-1.5 text-left justify-start"
                      >
                        <Sparkles className="w-3 h-3 mr-1 flex-shrink-0 text-gold" />
                        <span className="truncate">{prompt}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Button
                    onClick={handleVoiceInput}
                    variant={isListening ? 'destructive' : 'default'}
                    size="icon"
                    title="Voice input"
                    style={!isListening ? { background: 'var(--money-in)' } : undefined}
                  >
                    {isListening ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                  <Input
                    placeholder="Ask me anything about your finances..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                    className="flex-1"
                    disabled={isListening}
                  />
                  <Button
                    onClick={() => sendMessage(inputValue)}
                    size="icon"
                    disabled={isListening}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Powered by advanced NLP — context-aware responses
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
