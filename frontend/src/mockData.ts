export const mockData = {
  user: {
    name: "Neeru",
    email: "neeru@email.com",
    phone: "+91 98765 43210",
    pan: "BXXX1234L",
    city: "Mumbai",
    upiId: "neeru@paytm",
    creditScore: 782,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neeru"
  },

  balances: {
    totalBalance: 170000, // Should match Banking total (125000 + 45000 from bankAccounts)
    savings: 85000,
    expenses: 60000,
    investments: 25000
  },

  // Banking accounts data - centralized for consistency
  bankAccounts: [
    {
      id: 'acc_1',
      accountNumber: '****1234',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank',
      accountType: 'savings' as const,
      balance: 125000,
      linkedDate: '15-01-2025',
      status: 'active' as const,
      lastSynced: '28-10-2025 09:30'
    },
    {
      id: 'acc_2',
      accountNumber: '****5678',
      ifscCode: 'ICIC0005678',
      bankName: 'ICICI Bank',
      accountType: 'current' as const,
      balance: 45000,
      linkedDate: '20-02-2025',
      status: 'active' as const,
      lastSynced: '28-10-2025 09:30'
    }
  ],

  transactions: [
    { id: 1, date: "28 Oct", mode: "UPI", merchant: "Zomato", category: "Food", amount: 450, status: "success" },
    { id: 2, date: "28 Oct", mode: "Card", merchant: "Amazon", category: "Shopping", amount: 2400, status: "success" },
    { id: 3, date: "27 Oct", mode: "UPI", merchant: "Swiggy", category: "Food", amount: 380, status: "success" },
    { id: 4, date: "26 Oct", mode: "UPI", merchant: "Ola", category: "Travel", amount: 320, status: "success" },
    { id: 5, date: "25 Oct", mode: "Card", merchant: "Flipkart", category: "Shopping", amount: 3200, status: "success" },
    { id: 6, date: "24 Oct", mode: "UPI", merchant: "Netflix", category: "Subscriptions", amount: 649, status: "success" },
    { id: 7, date: "23 Oct", mode: "Card", merchant: "Big Bazaar", category: "Food", amount: 4200, status: "success" },
    { id: 8, date: "22 Oct", mode: "UPI", merchant: "Uber", category: "Travel", amount: 245, status: "success" },
    { id: 9, date: "21 Oct", mode: "Card", merchant: "SBI EMI", category: "EMI", amount: 21000, status: "success" },
    { id: 10, date: "20 Oct", mode: "UPI", merchant: "Myntra", category: "Shopping", amount: 1800, status: "success" },
    { id: 11, date: "19 Oct", mode: "UPI", merchant: "BookMyShow", category: "Entertainment", amount: 550, status: "success" },
    { id: 12, date: "18 Oct", mode: "Card", merchant: "Reliance Fresh", category: "Food", amount: 2800, status: "success" },
    { id: 13, date: "17 Oct", mode: "UPI", merchant: "Rapido", category: "Travel", amount: 80, status: "success" },
    { id: 14, date: "16 Oct", mode: "UPI", merchant: "Dunzo", category: "Food", amount: 320, status: "success" },
    { id: 15, date: "15 Oct", mode: "Card", merchant: "Amazon Prime", category: "Subscriptions", amount: 299, status: "success" }
  ],

  expenseBreakdown: [
    { name: "Food", value: 14200, fill: "#10B981" },
    { name: "EMI", value: 21000, fill: "#1E3A8A" },
    { name: "Shopping", value: 8500, fill: "#F59E0B" },
    { name: "Travel", value: 1200, fill: "#FB923C" },
    { name: "Subscriptions", value: 1200, fill: "#8b5cf6" },
    { name: "Entertainment", value: 800, fill: "#06b6d4" }
  ],

  budgets: [
    { category: "Food", allocated: 15000, spent: 14200, predicted: 15500 },
    { category: "Travel", allocated: 6000, spent: 2400, predicted: 5800 },
    { category: "Shopping", allocated: 10000, spent: 9300, predicted: 11200 },
    { category: "Entertainment", allocated: 5000, spent: 3200, predicted: 4500 },
    { category: "EMI", allocated: 21000, spent: 21000, predicted: 21000 },
    { category: "Subscriptions", allocated: 2000, spent: 1200, predicted: 1500 }
  ],

  goals: [
    { 
      id: 1,
      title: "Goa Trip", 
      target: 20000, 
      saved: 12000, 
      icon: "Palmtree",
      color: "#10B981",
      deadline: "Dec 2025"
    },
    { 
      id: 2,
      title: "Car Down Payment", 
      target: 150000, 
      saved: 60000, 
      icon: "Car",
      color: "#1E3A8A",
      deadline: "Jun 2026"
    },
    { 
      id: 3,
      title: "Home Renovation", 
      target: 75000, 
      saved: 18750, 
      icon: "Home",
      color: "#F59E0B",
      deadline: "Mar 2026"
    },
    { 
      id: 4,
      title: "Emergency Fund", 
      target: 200000, 
      saved: 85000, 
      icon: "Shield",
      color: "#8b5cf6",
      deadline: "Dec 2026"
    }
  ],

  sips: [
    { 
      id: 1,
      name: "Axis Bluechip Fund", 
      amount: 2000, 
      frequency: "Monthly",
      roi: 8.6, 
      risk: "Moderate",
      invested: 48000,
      current: 52128,
      nextDate: "5 Nov 2025"
    },
    { 
      id: 2,
      name: "Parag Parikh Flexicap", 
      amount: 1500, 
      frequency: "Monthly",
      roi: 9.2, 
      risk: "Low",
      invested: 36000,
      current: 39312,
      nextDate: "10 Nov 2025"
    },
    { 
      id: 3,
      name: "HDFC Mid Cap Opportunities", 
      amount: 1000, 
      frequency: "Monthly",
      roi: 11.4, 
      risk: "High",
      invested: 24000,
      current: 26736,
      nextDate: "15 Nov 2025"
    }
  ],

  portfolio: [
    { name: "Equity", value: 40, fill: "#1E3A8A" },
    { name: "Debt", value: 30, fill: "#10B981" },
    { name: "Gold", value: 10, fill: "#F59E0B" },
    { name: "Hybrid", value: 20, fill: "#FB923C" }
  ],

  mutualFunds: [
    {
      id: 1,
      name: "Axis Bluechip Fund",
      category: "Large Cap",
      roi: 8.6,
      risk: "Moderate",
      expenseRatio: 0.52,
      minSIP: 500,
      threeYearReturn: 12.4,
      fiveYearReturn: 14.2,
      recommended: false
    },
    {
      id: 2,
      name: "Parag Parikh Flexicap",
      category: "Flexi Cap",
      roi: 9.2,
      risk: "Low",
      expenseRatio: 0.68,
      minSIP: 1000,
      threeYearReturn: 13.8,
      fiveYearReturn: 15.6,
      recommended: true
    },
    {
      id: 3,
      name: "HDFC Mid Cap Opportunities",
      category: "Mid Cap",
      roi: 11.4,
      risk: "High",
      expenseRatio: 0.89,
      minSIP: 500,
      threeYearReturn: 16.2,
      fiveYearReturn: 18.9,
      recommended: false
    }
  ],

  creditScore: {
    score: 782,
    rating: "Good",
    factors: [
      { name: "Payment History", value: 98, status: "excellent" },
      { name: "Credit Utilization", value: 42, status: "good" },
      { name: "Credit Age", value: 3.5, status: "average", unit: "yrs" },
      { name: "Hard Inquiries", value: 2, status: "good", unit: "last 6mo" },
      { name: "Account Mix", value: 85, status: "good" }
    ],
    insights: [
      "Pay dues early to add +15 points",
      "Keep credit utilization below 30%",
      "Avoid multiple credit inquiries"
    ]
  },

  loans: [
    {
      id: 1,
      bank: "SBI",
      type: "Personal",
      rate: 9.8,
      tenure: 3,
      emi: 9600,
      amount: 300000,
      processing: 1.5,
      recommended: true
    },
    {
      id: 2,
      bank: "HDFC",
      type: "Personal",
      rate: 10.2,
      tenure: 4,
      emi: 8900,
      amount: 400000,
      processing: 2.0,
      recommended: false
    },
    {
      id: 3,
      bank: "ICICI",
      type: "Home",
      rate: 8.5,
      tenure: 20,
      emi: 25000,
      amount: 3000000,
      processing: 0.5,
      recommended: false
    },
    {
      id: 4,
      bank: "Axis Bank",
      type: "Vehicle",
      rate: 9.0,
      tenure: 5,
      emi: 15000,
      amount: 800000,
      processing: 1.0,
      recommended: false
    }
  ],

  taxData: {
    income: 1200000,
    deductions: 200000,
    taxableIncome: 1000000,
    taxPayable: 95000,
    deductionBreakdown: [
      { section: "80C", amount: 150000, description: "PPF, ELSS, Insurance" },
      { section: "80D", amount: 25000, description: "Health Insurance" },
      { section: "HRA", amount: 25000, description: "House Rent Allowance" }
    ],
    suggestions: [
      { tip: "Save ₹15,600 more via ELSS or PPF", potential: 15600 },
      { tip: "Claim NPS benefit under 80CCD(1B)", potential: 20000 },
      { tip: "Explore housing loan interest deduction", potential: 30000 }
    ]
  },

  rewards: {
    balance: 2450,
    earned: [
      { id: 1, title: "Savings Streak Bonus", points: 100, date: "28 Oct", icon: "Trophy" },
      { id: 2, title: "SIP Milestone", points: 250, date: "25 Oct", icon: "Target" },
      { id: 3, title: "On-time Bill Payment", points: 50, date: "22 Oct", icon: "CheckCircle" },
      { id: 4, title: "Budget Achievement", points: 150, date: "20 Oct", icon: "Award" }
    ],
    partners: [
      { name: "Amazon", cashback: "5%", logo: "🛍️" },
      { name: "Swiggy", cashback: "10%", logo: "🍔" },
      { name: "Paytm", cashback: "3%", logo: "💰" },
      { name: "Tata Neu", cashback: "8%", logo: "🏪" }
    ],
    leaderboard: {
      rank: 128,
      total: 5000,
      percentile: 76
    }
  },

  aiInsights: [
    { 
      id: 1,
      type: "warning",
      message: "⚠️ EMI of ₹21,000 due on 3 Nov",
      action: "Set Reminder"
    },
    { 
      id: 2,
      type: "tip",
      message: "💡 You could save ₹5,000 by cutting subscriptions",
      action: "View Details"
    },
    { 
      id: 3,
      type: "alert",
      message: "📊 You're 8% over food budget this week",
      action: "Adjust Budget"
    },
    { 
      id: 4,
      type: "success",
      message: "🎉 Great job! Savings up 15% this month",
      action: "View Report"
    }
  ],

  monthlyTrend: [
    { month: "Apr", income: 115000, expenses: 92000, savings: 23000 },
    { month: "May", income: 118000, expenses: 95000, savings: 23000 },
    { month: "Jun", income: 120000, expenses: 98000, savings: 22000 },
    { month: "Jul", income: 120000, expenses: 88000, savings: 32000 },
    { month: "Aug", income: 125000, expenses: 91000, savings: 34000 },
    { month: "Sep", income: 120000, expenses: 94000, savings: 26000 },
    { month: "Oct", income: 120000, expenses: 95000, savings: 25000 }
  ],

  yearlyComparison: [
    { category: "Salary", value: 1440000, change: 8 },
    { category: "Expenses", value: 1140000, change: -5 },
    { category: "Savings", value: 300000, change: 12 },
    { category: "Investments", value: 108000, change: 20 }
  ]
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatIndianDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatIndianDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[d.getMonth()]}`;
};
