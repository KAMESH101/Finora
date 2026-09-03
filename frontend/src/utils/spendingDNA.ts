// Spending DNA Profile Analyzer for Finora
import { getWallet, getSpendingByCategory } from './walletManager';

export interface SpendingDNAProfile {
  title: string;
  description: string;
  traits: string[];
  score: number;
  badge: string;
  color: string;
  icon: string;
  insights: string[];
  lastUpdated: string;
}

// Analyze spending patterns and generate DNA profile
export const analyzeSpendingDNA = (): SpendingDNAProfile => {
  const wallet = getWallet();
  const categorySpending = getSpendingByCategory(7); // Last 7 days
  
  const totalSpending = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
  const transactionCount = wallet.transactions.filter(t => t.type === 'debit').length;
  
  // Analyze patterns
  const weekendSpending = analyzeWeekendSpending(wallet.transactions);
  const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
  const avgTransactionSize = transactionCount > 0 ? totalSpending / transactionCount : 0;
  const moodPattern = analyzeMoodPattern(wallet.transactions);
  
  // Determine profile
  let profile: SpendingDNAProfile;
  
  if (weekendSpending > 0.5) {
    profile = {
      title: '🎉 Weekend Warrior',
      description: 'You come alive on weekends! Your wallet knows Friday means fun.',
      traits: ['Weekend Spender', 'Social Butterfly', 'YOLO Mindset'],
      score: 85,
      badge: '🎊',
      color: '#F59E0B',
      icon: 'PartyPopper',
      insights: [
        'Over 50% of your spending happens on weekends',
        'Peak spending hours: Friday 6 PM - Sunday 10 PM',
        'Consider setting weekend spending limits'
      ],
      lastUpdated: new Date().toISOString()
    };
  } else if (avgTransactionSize < 200) {
    profile = {
      title: '🎯 Budget Ninja',
      description: 'Master of small, smart spends. You know every rupee counts!',
      traits: ['Frugal', 'Strategic', 'Thoughtful Spender'],
      score: 92,
      badge: '🥷',
      color: '#10B981',
      icon: 'Target',
      insights: [
        'Average transaction: ₹' + Math.round(avgTransactionSize),
        'You make calculated, mindful purchases',
        'Great at avoiding impulse buys'
      ],
      lastUpdated: new Date().toISOString()
    };
  } else if (topCategory && topCategory[0] === 'Food & Drinks') {
    profile = {
      title: '🍕 Foodie Explorer',
      description: 'Life is too short for bad food. Your taste buds are your compass!',
      traits: ['Food Lover', 'Experience Seeker', 'Social Eater'],
      score: 78,
      badge: '🍜',
      color: '#FB923C',
      icon: 'UtensilsCrossed',
      insights: [
        'Food is your top spending category',
        'You value dining experiences',
        'Try cooking at home 2x/week to save ₹2,000/month'
      ],
      lastUpdated: new Date().toISOString()
    };
  } else if (moodPattern === 'stressed') {
    profile = {
      title: '😤 Stress Spender',
      description: 'Shopping therapy is real! You tend to spend when emotions run high.',
      traits: ['Emotional Buyer', 'Stress Relief', 'Impulse Prone'],
      score: 65,
      badge: '🛍️',
      color: '#EF4444',
      icon: 'ShoppingBag',
      insights: [
        'Spending increases during stressful periods',
        'Consider mindfulness before purchases',
        'Try a 24-hour rule for non-essential buys'
      ],
      lastUpdated: new Date().toISOString()
    };
  } else if (totalSpending < 1000) {
    profile = {
      title: '💎 Savings Champion',
      description: 'Future you will thank present you. Master of delayed gratification!',
      traits: ['Super Saver', 'Goal-Oriented', 'Disciplined'],
      score: 95,
      badge: '👑',
      color: '#8B5CF6',
      icon: 'Crown',
      insights: [
        'Incredibly low spending this week',
        'You\'re on track to save big',
        'Keep up the amazing discipline!'
      ],
      lastUpdated: new Date().toISOString()
    };
  } else {
    profile = {
      title: '⚖️ Balanced Spender',
      description: 'The Goldilocks of finance - not too much, not too little, just right!',
      traits: ['Balanced', 'Moderate', 'Sensible'],
      score: 80,
      badge: '⭐',
      color: '#3B82F6',
      icon: 'Scale',
      insights: [
        'Your spending is well-balanced across categories',
        'You maintain a healthy financial rhythm',
        'Consider optimizing one category for extra savings'
      ],
      lastUpdated: new Date().toISOString()
    };
  }
  
  return profile;
};

// Analyze weekend vs weekday spending
const analyzeWeekendSpending = (transactions: any[]): number => {
  let weekendTotal = 0;
  let weekdayTotal = 0;
  
  transactions
    .filter(t => t.type === 'debit')
    .forEach(t => {
      const date = new Date(t.date);
      const day = date.getDay();
      
      if (day === 0 || day === 6) { // Sunday or Saturday
        weekendTotal += t.amount;
      } else {
        weekdayTotal += t.amount;
      }
    });
  
  const total = weekendTotal + weekdayTotal;
  return total > 0 ? weekendTotal / total : 0;
};

// Analyze mood patterns
const analyzeMoodPattern = (transactions: any[]): string => {
  const moodCounts: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.mood)
    .forEach(t => {
      moodCounts[t.mood!] = (moodCounts[t.mood!] || 0) + 1;
    });
  
  const dominantMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  return dominantMood ? dominantMood[0] : 'neutral';
};

// Get spending DNA history (weekly updates)
export const getSpendingDNAHistory = (): SpendingDNAProfile[] => {
  const stored = localStorage.getItem('finora_dna_history');
  return stored ? JSON.parse(stored) : [];
};

// Save current DNA profile to history
export const saveSpendingDNAToHistory = (profile: SpendingDNAProfile): void => {
  const history = getSpendingDNAHistory();
  history.unshift(profile);
  
  // Keep only last 12 weeks
  if (history.length > 12) {
    history.splice(12);
  }
  
  localStorage.setItem('finora_dna_history', JSON.stringify(history));
};
