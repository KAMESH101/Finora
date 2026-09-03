// Advanced NLP Engine for FinAI India
// Supports intent recognition, entity extraction, context management, and conversational AI

export interface Intent {
  name: string;
  confidence: number;
  entities: Entity[];
}

export interface Entity {
  type: 'amount' | 'date' | 'category' | 'merchant' | 'time_period' | 'comparison' | 'action';
  value: string;
  normalized?: any;
  confidence: number;
}

export interface ConversationContext {
  previousIntents: string[];
  entities: Map<string, any>;
  userId?: string;
  lastCategory?: string;
  lastTimeframe?: string;
  conversationTurn: number;
}

export interface NLPResponse {
  intent: Intent;
  context: ConversationContext;
  suggestedFollowUps: string[];
  requiresClarification: boolean;
  clarificationQuestion?: string;
}

/**
 * Intent patterns for financial queries
 */
const intentPatterns = {
  spending_query: {
    patterns: [
      /(?:how much|what|show|tell).+(?:spent|spend|spending|expenses?)/i,
      /(?:spent|spend|spending).+(?:on|for|in)/i,
      /(?:total|sum|amount).+(?:spent|expenses?)/i,
      /what.*spent/i,
      /expense.*(?:on|for|in)/i
    ],
    examples: ['how much did I spend on food', 'what did I spend last week', 'show my expenses']
  },
  income_query: {
    patterns: [
      /(?:what|show|tell).+(?:income|salary|earning)/i,
      /how much.+(?:earn|earned|income)/i,
      /(?:my|total).+income/i
    ],
    examples: ['what is my income', 'show my salary', 'how much did I earn']
  },
  balance_query: {
    patterns: [
      /(?:what|how much|show).+(?:balance|left|remaining|have)/i,
      /(?:current|account|bank).+balance/i,
      /how much.+(?:left|remaining)/i
    ],
    examples: ['what is my balance', 'how much money do I have', 'show my account balance']
  },
  category_analysis: {
    patterns: [
      /(?:top|most|highest|show).+(?:categor|expense|spending)/i,
      /breakdown.+(?:categor|expense)/i,
      /(?:where|what).+(?:spending|spent)/i
    ],
    examples: ['show top categories', 'spending breakdown', 'where did I spend most']
  },
  prediction: {
    patterns: [
      /(?:predict|forecast|estimate|expect).+(?:expense|spending|budget)/i,
      /(?:next|future|upcoming).+(?:month|week|expenses?)/i,
      /what.+(?:next month|future)/i
    ],
    examples: ['predict next month expenses', 'forecast my spending', 'what will I spend next month']
  },
  optimization: {
    patterns: [
      /(?:how to|ways to|help me).+(?:save|reduce|cut|optimize)/i,
      /(?:save|reduce|cut|optimize).+(?:money|expense|spending)/i,
      /saving.+(?:tips|suggestions|ideas)/i
    ],
    examples: ['how can I save money', 'reduce my expenses', 'optimize my spending']
  },
  budget_status: {
    patterns: [
      /(?:budget|budgets?).+(?:status|how|doing|tracking)/i,
      /how.+budget/i,
      /am I.+(?:budget|track)/i
    ],
    examples: ['budget status', 'how is my budget', 'am I on track with budget']
  },
  anomaly_detection: {
    patterns: [
      /(?:unusual|strange|weird|suspicious|anomal).+(?:transaction|spending|expense)/i,
      /(?:detect|find|show).+(?:anomal|unusual)/i,
      /anything.+(?:wrong|suspicious)/i
    ],
    examples: ['show unusual transactions', 'any anomalies', 'detect suspicious spending']
  },
  comparison: {
    patterns: [
      /compare.+(?:to|with|vs|versus)/i,
      /(?:this month|last month).+(?:vs|versus|compared to)/i,
      /difference.+between/i
    ],
    examples: ['compare this month to last month', 'this week vs last week', 'difference between categories']
  },
  goal_tracking: {
    patterns: [
      /(?:goal|goals|target).+(?:status|progress|tracking|how)/i,
      /how.+(?:goal|target)/i,
      /am I.+(?:goal|target)/i
    ],
    examples: ['goal status', 'how are my goals', 'am I reaching my target']
  },
  investment_advice: {
    patterns: [
      /(?:invest|investment|sip|mutual fund).+(?:recommend|suggest|advice|should)/i,
      /where.+invest/i,
      /best.+(?:investment|sip|fund)/i
    ],
    examples: ['where should I invest', 'recommend mutual funds', 'best SIP for me']
  },
  loan_recommendation: {
    patterns: [
      /(?:loan|credit).+(?:recommend|suggest|best|suits)/i,
      /which.+loan/i,
      /best.+(?:loan|interest)/i
    ],
    examples: ['which loan suits me', 'recommend best loan', 'loan with lowest interest']
  },
  tax_planning: {
    patterns: [
      /(?:tax|80c|deduction).+(?:save|saving|plan)/i,
      /how to.+(?:save tax|reduce tax)/i,
      /tax.+(?:benefit|deduction|saving)/i
    ],
    examples: ['how to save tax', 'tax planning', '80C deductions']
  },
  credit_score: {
    patterns: [
      /(?:credit|cibil).+(?:score|rating)/i,
      /how.+(?:credit score|cibil)/i,
      /improve.+(?:credit|score)/i
    ],
    examples: ['what is my credit score', 'how to improve credit score', 'CIBIL rating']
  },
  merchant_analysis: {
    patterns: [
      /(?:merchant|store|shop|where).+(?:spent|spend|most)/i,
      /(?:top|most frequent).+(?:merchant|store)/i,
      /which.+(?:merchant|store|shop)/i
    ],
    examples: ['top merchants', 'where did I spend most', 'most frequent stores']
  },
  transaction_search: {
    patterns: [
      /(?:find|search|show|look).+transaction/i,
      /transaction.+(?:at|from|to)/i,
      /payment.+(?:to|at)/i
    ],
    examples: ['find transaction at Zomato', 'show payments to Amazon', 'search transaction']
  },
  recurring_expenses: {
    patterns: [
      /(?:recurring|regular|subscription).+(?:expense|payment|charge)/i,
      /what.+(?:recurring|regular|subscription)/i,
      /automatic.+payment/i
    ],
    examples: ['show recurring expenses', 'what are my subscriptions', 'regular payments']
  },
  savings_challenge: {
    patterns: [
      /(?:challenge|game|reward).+(?:saving|save)/i,
      /savings?.+challenge/i,
      /how to.+(?:earn|get).+reward/i
    ],
    examples: ['savings challenge', 'how to earn rewards', 'show challenges']
  }
};

/**
 * Entity extraction patterns
 */
const entityPatterns = {
  amount: [
    /₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/gi,
    /(?:rupees?|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)/gi,
    /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees?|rs\.?|k|lakh|crore)/gi
  ],
  category: [
    /(?:on|for|in|from)\s+(food|shopping|travel|entertainment|emi|subscription|bills?|healthcare|education|groceries)/gi,
    /\b(food|shopping|travel|entertainment|emi|subscription|bills?|healthcare|education|groceries)\b/gi
  ],
  timeperiod: [
    /(?:last|past|previous)\s+(week|month|year|quarter)/gi,
    /(?:this|current)\s+(week|month|year|quarter)/gi,
    /(?:yesterday|today|tomorrow)/gi,
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*/gi,
    /\b(q1|q2|q3|q4|quarter\s*\d)\b/gi,
    /(?:last|past)\s+(\d+)\s+(?:day|week|month|year)s?/gi
  ],
  merchant: [
    /(?:at|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
    /\b(zomato|swiggy|amazon|flipkart|uber|ola|netflix|hotstar|myntra|paytm|phonepe)\b/gi
  ],
  date: [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
    /(\d{1,2})\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})?/gi
  ],
  comparison: [
    /(?:compare|vs|versus|against)\s+(.+?)\s+(?:to|with|and)\s+(.+)/i,
    /(?:this|current)\s+(\w+)\s+(?:vs|versus|compared to)\s+(?:last|previous)\s+(\w+)/i
  ],
  action: [
    /(?:show|display|tell|give|find|search|list)/gi,
    /(?:help|suggest|recommend|advice)/gi,
    /(?:optimize|reduce|increase|improve)/gi
  ]
};

/**
 * Indian number format handlers
 */
function parseIndianAmount(text: string): number | null {
  // Handle formats like: ₹1,25,000, 1.5L, 2 lakh, 1 crore
  const cleaned = text.replace(/[₹,\s]/g, '');
  
  if (/k$/i.test(cleaned)) {
    return parseFloat(cleaned.replace(/k$/i, '')) * 1000;
  }
  if (/l(?:akh)?$/i.test(cleaned)) {
    return parseFloat(cleaned.replace(/l(?:akh)?$/i, '')) * 100000;
  }
  if (/cr(?:ore)?$/i.test(cleaned)) {
    return parseFloat(cleaned.replace(/cr(?:ore)?$/i, '')) * 10000000;
  }
  
  return parseFloat(cleaned) || null;
}

/**
 * Time period normalization for Indian context
 */
function normalizeTimePeriod(text: string): { start: Date; end: Date; label: string } | null {
  const now = new Date();
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('today')) {
    return {
      start: new Date(now.setHours(0, 0, 0, 0)),
      end: new Date(now.setHours(23, 59, 59, 999)),
      label: 'today'
    };
  }
  
  if (lowerText.includes('yesterday')) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return {
      start: new Date(yesterday.setHours(0, 0, 0, 0)),
      end: new Date(yesterday.setHours(23, 59, 59, 999)),
      label: 'yesterday'
    };
  }
  
  if (lowerText.match(/last\s+week/)) {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    return {
      start: weekAgo,
      end: now,
      label: 'last week'
    };
  }
  
  if (lowerText.match(/this\s+month/)) {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: monthStart,
      end: now,
      label: 'this month'
    };
  }
  
  if (lowerText.match(/last\s+month/)) {
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      start: lastMonthStart,
      end: lastMonthEnd,
      label: 'last month'
    };
  }
  
  if (lowerText.match(/this\s+year/)) {
    const yearStart = new Date(now.getFullYear(), 0, 1);
    return {
      start: yearStart,
      end: now,
      label: 'this year'
    };
  }
  
  // Financial year (Apr-Mar for India)
  if (lowerText.match(/(?:financial|fiscal)\s+year/)) {
    const fyStart = now.getMonth() >= 3 
      ? new Date(now.getFullYear(), 3, 1) 
      : new Date(now.getFullYear() - 1, 3, 1);
    return {
      start: fyStart,
      end: now,
      label: 'financial year'
    };
  }
  
  // Quarter detection
  const quarterMatch = lowerText.match(/q([1-4])/);
  if (quarterMatch) {
    const quarter = parseInt(quarterMatch[1]);
    const quarterStart = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
    const quarterEnd = new Date(now.getFullYear(), quarter * 3, 0);
    return {
      start: quarterStart,
      end: quarterEnd,
      label: `Q${quarter}`
    };
  }
  
  return null;
}

/**
 * Extract entities from text
 */
export function extractEntities(text: string): Entity[] {
  const entities: Entity[] = [];
  
  // Extract amounts
  entityPatterns.amount.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach(match => {
      const amount = parseIndianAmount(match[0]);
      if (amount) {
        entities.push({
          type: 'amount',
          value: match[0],
          normalized: amount,
          confidence: 0.95
        });
      }
    });
  });
  
  // Extract categories
  entityPatterns.category.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach(match => {
      entities.push({
        type: 'category',
        value: match[1].toLowerCase(),
        normalized: match[1].toLowerCase(),
        confidence: 0.9
      });
    });
  });
  
  // Extract time periods
  entityPatterns.timeperiod.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach(match => {
      const normalized = normalizeTimePeriod(match[0]);
      if (normalized) {
        entities.push({
          type: 'time_period',
          value: match[0],
          normalized,
          confidence: 0.92
        });
      }
    });
  });
  
  // Extract merchants
  entityPatterns.merchant.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach(match => {
      const merchant = match[1] || match[0];
      entities.push({
        type: 'merchant',
        value: merchant,
        normalized: merchant.toLowerCase(),
        confidence: 0.85
      });
    });
  });
  
  // Extract actions
  entityPatterns.action.forEach(pattern => {
    const matches = Array.from(text.matchAll(pattern));
    matches.forEach(match => {
      entities.push({
        type: 'action',
        value: match[0].toLowerCase(),
        normalized: match[0].toLowerCase(),
        confidence: 0.88
      });
    });
  });
  
  return entities;
}

/**
 * Classify intent from text
 */
export function classifyIntent(text: string): Intent {
  const lowerText = text.toLowerCase();
  let bestMatch = { name: 'general_query', confidence: 0.3 };
  
  // Check each intent pattern
  Object.entries(intentPatterns).forEach(([intentName, intentData]) => {
    let matchScore = 0;
    let matchCount = 0;
    
    intentData.patterns.forEach(pattern => {
      if (pattern.test(lowerText)) {
        matchCount++;
        matchScore += 1;
      }
    });
    
    if (matchCount > 0) {
      const confidence = Math.min(0.95, 0.6 + (matchCount * 0.15));
      if (confidence > bestMatch.confidence) {
        bestMatch = { name: intentName, confidence };
      }
    }
  });
  
  // Extract entities
  const entities = extractEntities(text);
  
  // Boost confidence if relevant entities are found
  if (entities.length > 0) {
    bestMatch.confidence = Math.min(0.98, bestMatch.confidence + 0.1);
  }
  
  return {
    name: bestMatch.name,
    confidence: bestMatch.confidence,
    entities
  };
}

/**
 * Manage conversation context
 */
export class ContextManager {
  private context: ConversationContext;
  
  constructor() {
    this.context = {
      previousIntents: [],
      entities: new Map(),
      conversationTurn: 0
    };
  }
  
  updateContext(intent: Intent): void {
    this.context.conversationTurn++;
    this.context.previousIntents.push(intent.name);
    
    // Keep only last 5 intents
    if (this.context.previousIntents.length > 5) {
      this.context.previousIntents.shift();
    }
    
    // Store entities in context
    intent.entities.forEach(entity => {
      if (entity.type === 'category') {
        this.context.lastCategory = entity.normalized as string;
      }
      if (entity.type === 'time_period') {
        this.context.lastTimeframe = entity.value;
      }
      this.context.entities.set(entity.type, entity);
    });
  }
  
  getContext(): ConversationContext {
    return { ...this.context };
  }
  
  inferMissingEntities(currentIntent: Intent): Intent {
    // If current query lacks entities but previous context has them, use them
    if (currentIntent.entities.length === 0 && this.context.conversationTurn > 0) {
      const inferredEntities: Entity[] = [];
      
      // Reuse last category if relevant
      if (this.context.lastCategory && 
          (currentIntent.name === 'spending_query' || currentIntent.name === 'optimization')) {
        inferredEntities.push({
          type: 'category',
          value: this.context.lastCategory,
          normalized: this.context.lastCategory,
          confidence: 0.7
        });
      }
      
      currentIntent.entities.push(...inferredEntities);
    }
    
    return currentIntent;
  }
  
  reset(): void {
    this.context = {
      previousIntents: [],
      entities: new Map(),
      conversationTurn: 0
    };
  }
}

/**
 * Generate follow-up suggestions based on intent
 */
export function generateFollowUps(intent: Intent, context: ConversationContext): string[] {
  const followUps: { [key: string]: string[] } = {
    spending_query: [
      'How can I reduce this spending?',
      'Compare to last month',
      'Show me the breakdown by merchant'
    ],
    category_analysis: [
      'What can I optimize?',
      'Show me trends over time',
      'Predict next month\'s spending'
    ],
    prediction: [
      'How can I stay within budget?',
      'Show me optimization tips',
      'What are my spending patterns?'
    ],
    optimization: [
      'Show me savings challenges',
      'What are my recurring expenses?',
      'Find unusual transactions'
    ],
    budget_status: [
      'Which category is over budget?',
      'How to optimize my budget?',
      'Show spending trends'
    ],
    goal_tracking: [
      'How can I achieve goals faster?',
      'Suggest savings strategies',
      'Show my investment performance'
    ],
    investment_advice: [
      'Compare different funds',
      'What\'s my expected return?',
      'Show tax-saving investments'
    ],
    tax_planning: [
      'Show 80C options',
      'Calculate tax savings',
      'Recommend ELSS funds'
    ]
  };
  
  return followUps[intent.name] || [
    'What else can I help with?',
    'Show my dashboard',
    'Analyze my spending'
  ];
}

/**
 * Check if query needs clarification
 */
export function requiresClarification(intent: Intent): { needed: boolean; question?: string } {
  // If confidence is low, ask for clarification
  if (intent.confidence < 0.5) {
    return {
      needed: true,
      question: 'I\'m not sure I understood that correctly. Could you rephrase your question?'
    };
  }
  
  // If certain intents lack required entities
  if (intent.name === 'spending_query') {
    const hasTimeOrCategory = intent.entities.some(e => 
      e.type === 'time_period' || e.type === 'category'
    );
    
    if (!hasTimeOrCategory) {
      return {
        needed: true,
        question: 'Would you like to see spending for a specific category or time period? (e.g., "food last week" or "this month")'
      };
    }
  }
  
  if (intent.name === 'comparison') {
    const hasComparison = intent.entities.some(e => e.type === 'comparison');
    if (!hasComparison) {
      return {
        needed: true,
        question: 'What would you like to compare? (e.g., "this month vs last month" or "food vs shopping")'
      };
    }
  }
  
  return { needed: false };
}

/**
 * Semantic similarity for fuzzy matching
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const similarity = (2 * commonWords.length) / (words1.length + words2.length);
  
  return similarity;
}

/**
 * Smart category matching with fuzzy logic
 */
export function matchCategory(input: string): string | null {
  const categories = [
    { name: 'food', aliases: ['food', 'dining', 'restaurant', 'groceries', 'meals', 'eating'] },
    { name: 'shopping', aliases: ['shopping', 'clothes', 'electronics', 'purchase', 'buy'] },
    { name: 'travel', aliases: ['travel', 'transport', 'cab', 'taxi', 'uber', 'ola', 'commute'] },
    { name: 'entertainment', aliases: ['entertainment', 'movies', 'games', 'fun', 'leisure'] },
    { name: 'emi', aliases: ['emi', 'loan', 'installment', 'payment'] },
    { name: 'subscriptions', aliases: ['subscription', 'netflix', 'spotify', 'prime', 'membership'] },
    { name: 'bills', aliases: ['bills', 'utilities', 'electricity', 'water', 'internet'] },
    { name: 'healthcare', aliases: ['health', 'medical', 'doctor', 'medicine', 'hospital'] },
    { name: 'education', aliases: ['education', 'school', 'course', 'learning', 'books'] }
  ];
  
  const lowerInput = input.toLowerCase();
  
  for (const category of categories) {
    for (const alias of category.aliases) {
      if (lowerInput.includes(alias) || calculateSimilarity(lowerInput, alias) > 0.7) {
        return category.name;
      }
    }
  }
  
  return null;
}

/**
 * Process natural language query
 */
export function processNLQuery(
  query: string,
  contextManager: ContextManager
): NLPResponse {
  // Classify intent
  let intent = classifyIntent(query);
  
  // Infer missing entities from context
  intent = contextManager.inferMissingEntities(intent);
  
  // Update context
  contextManager.updateContext(intent);
  
  // Get current context
  const context = contextManager.getContext();
  
  // Generate follow-up suggestions
  const suggestedFollowUps = generateFollowUps(intent, context);
  
  // Check if clarification is needed
  const clarification = requiresClarification(intent);
  
  return {
    intent,
    context,
    suggestedFollowUps,
    requiresClarification: clarification.needed,
    clarificationQuestion: clarification.question
  };
}

/**
 * Multi-intent detection (handles complex queries)
 */
export function detectMultipleIntents(text: string): Intent[] {
  const intents: Intent[] = [];
  
  // Split by common separators
  const parts = text.split(/\s+(?:and|then|also|plus)\s+/i);
  
  if (parts.length > 1) {
    parts.forEach(part => {
      const intent = classifyIntent(part.trim());
      if (intent.confidence > 0.5) {
        intents.push(intent);
      }
    });
  } else {
    intents.push(classifyIntent(text));
  }
  
  return intents;
}

/**
 * Sentiment analysis for financial queries
 */
export function analyzeSentiment(text: string): {
  sentiment: 'positive' | 'neutral' | 'negative' | 'concerned';
  score: number;
} {
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'satisfied', 'awesome', 'love', 'best'];
  const negativeWords = ['bad', 'poor', 'terrible', 'unhappy', 'disappointed', 'worst', 'hate'];
  const concernWords = ['worried', 'concern', 'problem', 'issue', 'help', 'struggling', 'difficult'];
  
  const lowerText = text.toLowerCase();
  
  let positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  let negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  let concernCount = concernWords.filter(word => lowerText.includes(word)).length;
  
  if (concernCount > 0) {
    return { sentiment: 'concerned', score: concernCount / (positiveCount + negativeCount + concernCount + 1) };
  }
  
  if (positiveCount > negativeCount) {
    return { sentiment: 'positive', score: positiveCount / (positiveCount + negativeCount + 1) };
  }
  
  if (negativeCount > positiveCount) {
    return { sentiment: 'negative', score: negativeCount / (positiveCount + negativeCount + 1) };
  }
  
  return { sentiment: 'neutral', score: 0.5 };
}
