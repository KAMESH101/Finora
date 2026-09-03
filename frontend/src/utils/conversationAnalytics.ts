// Conversation Analytics for FinAI Assistant
// Tracks user behavior, preferences, and provides personalized insights

export interface ConversationMetrics {
  totalQueries: number;
  topIntents: { intent: string; count: number }[];
  topCategories: { category: string; count: number }[];
  averageConfidence: number;
  clarificationRate: number;
  preferredTimeframes: string[];
  sessionDuration: number;
  lastActiveTime: Date;
}

export interface UserPreferences {
  favoriteCategories: string[];
  preferredAnalysisPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly';
  optimizationFocus: 'savings' | 'investment' | 'budget' | 'debt';
  notificationPreference: 'high' | 'medium' | 'low';
  languagePreference: 'en' | 'hi' | 'ta' | 'te';
}

export interface ConversationInsight {
  id: string;
  type: 'pattern' | 'concern' | 'opportunity' | 'achievement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  action?: string;
  icon: string;
}

/**
 * Track conversation metrics
 */
export class ConversationTracker {
  private metrics: ConversationMetrics;
  private queryLog: Array<{ intent: string; confidence: number; timestamp: Date }>;
  private startTime: Date;

  constructor() {
    this.startTime = new Date();
    this.metrics = {
      totalQueries: 0,
      topIntents: [],
      topCategories: [],
      averageConfidence: 0,
      clarificationRate: 0,
      preferredTimeframes: [],
      sessionDuration: 0,
      lastActiveTime: new Date()
    };
    this.queryLog = [];
  }

  /**
   * Log a query
   */
  logQuery(intent: string, confidence: number, entities: any[]): void {
    this.queryLog.push({
      intent,
      confidence,
      timestamp: new Date()
    });

    this.metrics.totalQueries++;
    this.metrics.lastActiveTime = new Date();

    // Update session duration
    const duration = (new Date().getTime() - this.startTime.getTime()) / 1000;
    this.metrics.sessionDuration = Math.round(duration);

    // Track categories from entities
    entities.forEach(entity => {
      if (entity.type === 'category') {
        const categoryExists = this.metrics.topCategories.find(c => c.category === entity.normalized);
        if (categoryExists) {
          categoryExists.count++;
        } else {
          this.metrics.topCategories.push({ category: entity.normalized, count: 1 });
        }
      }

      if (entity.type === 'time_period') {
        if (!this.metrics.preferredTimeframes.includes(entity.value)) {
          this.metrics.preferredTimeframes.push(entity.value);
        }
      }
    });

    // Update top intents
    const intentExists = this.metrics.topIntents.find(i => i.intent === intent);
    if (intentExists) {
      intentExists.count++;
    } else {
      this.metrics.topIntents.push({ intent, count: 1 });
    }

    // Sort top intents
    this.metrics.topIntents.sort((a, b) => b.count - a.count);
    this.metrics.topCategories.sort((a, b) => b.count - a.count);

    // Calculate average confidence
    const totalConfidence = this.queryLog.reduce((sum, q) => sum + q.confidence, 0);
    this.metrics.averageConfidence = totalConfidence / this.queryLog.length;

    // Calculate clarification rate
    const lowConfidenceQueries = this.queryLog.filter(q => q.confidence < 0.5).length;
    this.metrics.clarificationRate = (lowConfidenceQueries / this.queryLog.length) * 100;
  }

  /**
   * Get current metrics
   */
  getMetrics(): ConversationMetrics {
    return { ...this.metrics };
  }

  /**
   * Get query log
   */
  getQueryLog(): Array<{ intent: string; confidence: number; timestamp: Date }> {
    return [...this.queryLog];
  }

  /**
   * Reset tracker
   */
  reset(): void {
    this.startTime = new Date();
    this.metrics = {
      totalQueries: 0,
      topIntents: [],
      topCategories: [],
      averageConfidence: 0,
      clarificationRate: 0,
      preferredTimeframes: [],
      sessionDuration: 0,
      lastActiveTime: new Date()
    };
    this.queryLog = [];
  }
}

/**
 * Infer user preferences from conversation history
 */
export function inferUserPreferences(tracker: ConversationTracker): UserPreferences {
  const metrics = tracker.getMetrics();
  
  // Determine favorite categories
  const favoriteCategories = metrics.topCategories
    .slice(0, 3)
    .map(c => c.category);

  // Determine preferred analysis period
  let preferredAnalysisPeriod: UserPreferences['preferredAnalysisPeriod'] = 'monthly';
  
  const timeframeKeywords = {
    daily: ['today', 'yesterday', 'day'],
    weekly: ['week', 'last week', 'this week'],
    monthly: ['month', 'last month', 'this month'],
    yearly: ['year', 'annual', 'yearly']
  };

  let maxCount = 0;
  Object.entries(timeframeKeywords).forEach(([period, keywords]) => {
    const count = metrics.preferredTimeframes.filter(tf =>
      keywords.some(kw => tf.toLowerCase().includes(kw))
    ).length;

    if (count > maxCount) {
      maxCount = count;
      preferredAnalysisPeriod = period as UserPreferences['preferredAnalysisPeriod'];
    }
  });

  // Determine optimization focus
  let optimizationFocus: UserPreferences['optimizationFocus'] = 'savings';
  
  const focusIntents = {
    savings: ['optimization', 'savings_challenge'],
    investment: ['investment_advice', 'goal_tracking'],
    budget: ['budget_status', 'spending_query'],
    debt: ['loan_recommendation', 'credit_score']
  };

  let maxFocusCount = 0;
  Object.entries(focusIntents).forEach(([focus, intents]) => {
    const count = metrics.topIntents
      .filter(ti => intents.includes(ti.intent))
      .reduce((sum, ti) => sum + ti.count, 0);

    if (count > maxFocusCount) {
      maxFocusCount = count;
      optimizationFocus = focus as UserPreferences['optimizationFocus'];
    }
  });

  return {
    favoriteCategories,
    preferredAnalysisPeriod,
    optimizationFocus,
    notificationPreference: 'medium',
    languagePreference: 'en'
  };
}

/**
 * Generate conversation insights
 */
export function generateConversationInsights(
  tracker: ConversationTracker,
  userData: any
): ConversationInsight[] {
  const insights: ConversationInsight[] = [];
  const metrics = tracker.getMetrics();
  const preferences = inferUserPreferences(tracker);

  // Insight 1: High clarification rate
  if (metrics.clarificationRate > 20) {
    insights.push({
      id: 'insight-clarification',
      type: 'pattern',
      title: 'Query Clarity',
      description: `${Math.round(metrics.clarificationRate)}% of your queries needed clarification. Try being more specific with categories and time periods.`,
      priority: 'medium',
      actionable: true,
      action: 'Use more specific queries like "food spending last week"',
      icon: '💡'
    });
  }

  // Insight 2: Favorite category tracking
  if (preferences.favoriteCategories.length > 0) {
    const topCategory = preferences.favoriteCategories[0];
    insights.push({
      id: 'insight-favorite-category',
      type: 'pattern',
      title: 'Category Focus',
      description: `You frequently ask about ${topCategory} expenses. This shows you're actively monitoring this category.`,
      priority: 'low',
      actionable: true,
      action: `Set up budget alerts for ${topCategory}`,
      icon: '📊'
    });
  }

  // Insight 3: Optimization mindset
  const optimizationQueries = metrics.topIntents
    .filter(ti => ['optimization', 'savings_challenge', 'recurring_expenses'].includes(ti.intent))
    .reduce((sum, ti) => sum + ti.count, 0);

  if (optimizationQueries > 2) {
    insights.push({
      id: 'insight-optimization',
      type: 'achievement',
      title: 'Cost-Conscious Behavior',
      description: `You've asked ${optimizationQueries} queries about saving and optimization. This shows great financial discipline!`,
      priority: 'high',
      actionable: true,
      action: 'Start a savings challenge to maximize your efforts',
      icon: '🎯'
    });
  }

  // Insight 4: Budget monitoring
  const budgetQueries = metrics.topIntents
    .filter(ti => ['budget_status', 'spending_query'].includes(ti.intent))
    .reduce((sum, ti) => sum + ti.count, 0);

  if (budgetQueries > 3) {
    insights.push({
      id: 'insight-budget-monitor',
      type: 'achievement',
      title: 'Active Budget Monitoring',
      description: 'You regularly check your budget status. This habit helps maintain financial control.',
      priority: 'medium',
      actionable: true,
      action: 'Enable automated budget alerts for proactive management',
      icon: '✅'
    });
  }

  // Insight 5: Investment interest
  const investmentQueries = metrics.topIntents
    .filter(ti => ['investment_advice', 'goal_tracking'].includes(ti.intent))
    .reduce((sum, ti) => sum + ti.count, 0);

  if (investmentQueries > 1) {
    insights.push({
      id: 'insight-investment',
      type: 'opportunity',
      title: 'Investment Awareness',
      description: 'You\'re exploring investment options. Consider increasing your SIP by ₹2,000/month for better wealth creation.',
      priority: 'high',
      actionable: true,
      action: 'Review investment recommendations in Investments tab',
      icon: '📈'
    });
  }

  // Insight 6: Tax planning concern
  const taxQueries = metrics.topIntents
    .filter(ti => ti.intent === 'tax_planning')
    .reduce((sum, ti) => sum + ti.count, 0);

  if (taxQueries > 0) {
    const monthsToMarch = 5; // Assuming current date is Oct 28
    insights.push({
      id: 'insight-tax',
      type: 'concern',
      title: 'Tax Planning Opportunity',
      description: `${monthsToMarch} months left for FY 2025-26. You can save ₹36,000 more in taxes by maximizing deductions.`,
      priority: 'high',
      actionable: true,
      action: 'View Tax Planner for detailed breakdown',
      icon: '💰'
    });
  }

  // Insight 7: Anomaly awareness
  const anomalyQueries = metrics.topIntents
    .filter(ti => ti.intent === 'anomaly_detection')
    .reduce((sum, ti) => sum + ti.count, 0);

  if (anomalyQueries > 0) {
    insights.push({
      id: 'insight-anomaly',
      type: 'achievement',
      title: 'Fraud Vigilance',
      description: 'You\'re proactively checking for unusual transactions. This helps catch errors and fraud early.',
      priority: 'medium',
      actionable: false,
      icon: '🔍'
    });
  }

  // Insight 8: Session engagement
  if (metrics.totalQueries > 5 && metrics.sessionDuration > 300) {
    insights.push({
      id: 'insight-engagement',
      type: 'achievement',
      title: 'Deep Financial Analysis',
      description: `You've spent ${Math.round(metrics.sessionDuration / 60)} minutes analyzing your finances. Great engagement!`,
      priority: 'low',
      actionable: true,
      action: 'Export chat to review insights later',
      icon: '⭐'
    });
  }

  // Insight 9: Credit score interest
  const creditQueries = metrics.topIntents
    .filter(ti => ti.intent === 'credit_score')
    .reduce((sum, ti) => sum + ti.count, 0);

  if (creditQueries > 0 && userData.user?.creditScore < 800) {
    insights.push({
      id: 'insight-credit',
      type: 'opportunity',
      title: 'Credit Score Improvement',
      description: `Your current score is ${userData.user.creditScore}. Reaching 800+ can save you ₹50,000/year on loans.`,
      priority: 'high',
      actionable: true,
      action: 'Follow credit improvement tips in Credit Score section',
      icon: '⭐'
    });
  }

  // Insight 10: Recurring expense awareness
  const recurringQueries = metrics.topIntents
    .filter(ti => ti.intent === 'recurring_expenses')
    .reduce((sum, ti) => sum + ti.count, 0);

  if (recurringQueries > 0) {
    insights.push({
      id: 'insight-recurring',
      type: 'opportunity',
      title: 'Subscription Optimization',
      description: 'You\'re tracking recurring expenses. Cancel unused subscriptions to save ₹2,400/month.',
      priority: 'high',
      actionable: true,
      action: 'Review and cancel unused subscriptions',
      icon: '🔄'
    });
  }

  return insights.slice(0, 5); // Return top 5 insights
}

/**
 * Generate personalized query suggestions based on history
 */
export function generatePersonalizedSuggestions(
  tracker: ConversationTracker,
  userData: any
): string[] {
  const metrics = tracker.getMetrics();
  const preferences = inferUserPreferences(tracker);
  const suggestions: string[] = [];

  // Suggest based on favorite categories
  if (preferences.favoriteCategories.length > 0) {
    const topCategory = preferences.favoriteCategories[0];
    suggestions.push(`Compare ${topCategory} spending: this month vs last month`);
    suggestions.push(`Show ${topCategory} optimization tips`);
  }

  // Suggest based on preferred timeframe
  suggestions.push(`Analyze spending patterns for ${preferences.preferredAnalysisPeriod}`);

  // Suggest based on optimization focus
  if (preferences.optimizationFocus === 'savings') {
    suggestions.push('Show me new savings challenges');
    suggestions.push('How can I save an extra ₹5,000 this month?');
  } else if (preferences.optimizationFocus === 'investment') {
    suggestions.push('Recommend best mutual funds for me');
    suggestions.push('Calculate my investment growth projection');
  } else if (preferences.optimizationFocus === 'budget') {
    suggestions.push('Which budgets need adjustment?');
    suggestions.push('Predict budget performance for next month');
  }

  // Suggest unexplored features
  const exploredIntents = metrics.topIntents.map(ti => ti.intent);
  
  if (!exploredIntents.includes('anomaly_detection')) {
    suggestions.push('Find any unusual transactions');
  }
  
  if (!exploredIntents.includes('merchant_analysis')) {
    suggestions.push('Show my top spending merchants');
  }
  
  if (!exploredIntents.includes('goal_tracking')) {
    suggestions.push('How are my financial goals progressing?');
  }

  if (!exploredIntents.includes('tax_planning')) {
    suggestions.push('How much tax can I save this year?');
  }

  // Time-based suggestions
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 9 && currentMonth <= 11) {
    suggestions.push('Predict my Diwali festival expenses');
  }
  
  if (currentMonth >= 0 && currentMonth <= 2) {
    suggestions.push('Show tax-saving investment options before March 31');
  }

  return suggestions.slice(0, 6);
}

/**
 * Calculate conversation quality score
 */
export function calculateConversationQuality(tracker: ConversationTracker): {
  score: number;
  grade: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  feedback: string[];
} {
  const metrics = tracker.getMetrics();
  let score = 100;
  const feedback: string[] = [];

  // Deduct points for high clarification rate
  if (metrics.clarificationRate > 30) {
    score -= 20;
    feedback.push('❌ High clarification rate - try being more specific');
  } else if (metrics.clarificationRate > 15) {
    score -= 10;
    feedback.push('⚠️ Some queries need clarification - add more details');
  } else {
    feedback.push('✅ Clear and specific queries');
  }

  // Add points for good confidence
  if (metrics.averageConfidence > 0.85) {
    feedback.push('✅ High query understanding');
  } else if (metrics.averageConfidence < 0.6) {
    score -= 15;
    feedback.push('❌ Low query understanding - rephrase questions');
  }

  // Add points for engagement
  if (metrics.totalQueries > 10) {
    feedback.push('✅ Highly engaged conversation');
  } else if (metrics.totalQueries > 5) {
    feedback.push('✅ Good engagement level');
  }

  // Deduct for short sessions
  if (metrics.totalQueries < 3 && metrics.sessionDuration < 60) {
    score -= 10;
    feedback.push('⚠️ Short session - explore more features');
  }

  // Determine grade
  let grade: 'Excellent' | 'Good' | 'Average' | 'Needs Improvement';
  if (score >= 90) grade = 'Excellent';
  else if (score >= 75) grade = 'Good';
  else if (score >= 60) grade = 'Average';
  else grade = 'Needs Improvement';

  return { score: Math.max(0, score), grade, feedback };
}

/**
 * Export conversation analytics
 */
export function exportConversationAnalytics(
  tracker: ConversationTracker,
  userData: any
): string {
  const metrics = tracker.getMetrics();
  const preferences = inferUserPreferences(tracker);
  const insights = generateConversationInsights(tracker, userData);
  const quality = calculateConversationQuality(tracker);

  let report = '# FinAI Conversation Analytics Report\n\n';
  report += `**Generated**: ${new Date().toLocaleString('en-IN')}\n\n`;

  report += '## Session Metrics\n\n';
  report += `- **Total Queries**: ${metrics.totalQueries}\n`;
  report += `- **Session Duration**: ${Math.round(metrics.sessionDuration / 60)} minutes\n`;
  report += `- **Average Confidence**: ${Math.round(metrics.averageConfidence * 100)}%\n`;
  report += `- **Clarification Rate**: ${Math.round(metrics.clarificationRate)}%\n\n`;

  report += '## Top Intents\n\n';
  metrics.topIntents.slice(0, 5).forEach((intent, i) => {
    report += `${i + 1}. ${intent.intent.replace(/_/g, ' ')}: ${intent.count} queries\n`;
  });
  report += '\n';

  if (metrics.topCategories.length > 0) {
    report += '## Most Queried Categories\n\n';
    metrics.topCategories.slice(0, 5).forEach((cat, i) => {
      report += `${i + 1}. ${cat.category}: ${cat.count} times\n`;
    });
    report += '\n';
  }

  report += '## Your Preferences\n\n';
  report += `- **Favorite Categories**: ${preferences.favoriteCategories.join(', ') || 'None detected'}\n`;
  report += `- **Preferred Period**: ${preferences.preferredAnalysisPeriod}\n`;
  report += `- **Focus Area**: ${preferences.optimizationFocus}\n\n`;

  report += '## Conversation Quality\n\n';
  report += `- **Score**: ${quality.score}/100\n`;
  report += `- **Grade**: ${quality.grade}\n\n`;
  report += '**Feedback**:\n';
  quality.feedback.forEach(f => {
    report += `- ${f}\n`;
  });
  report += '\n';

  if (insights.length > 0) {
    report += '## Key Insights\n\n';
    insights.forEach((insight, i) => {
      report += `### ${i + 1}. ${insight.icon} ${insight.title}\n`;
      report += `${insight.description}\n`;
      if (insight.actionable && insight.action) {
        report += `**Action**: ${insight.action}\n`;
      }
      report += '\n';
    });
  }

  report += '---\n\n';
  report += '*Powered by FinAI Advanced NLP Engine*\n';

  return report;
}
