# FinAI NLP Engine - Developer Guide

## 🚀 Quick Start

### Installation
The NLP engine is already integrated. No additional installation needed!

### Basic Usage
```typescript
import { AIAssistant } from "./components/AIAssistant";

// In your main App component
<AIAssistant />
```

That's it! The AI Assistant will appear as a floating button. 🎉

---

## 📁 File Structure

```
/utils
  ├── nlpEngine.ts              # Core NLP engine
  ├── conversationAnalytics.ts  # Conversation tracking & insights
  ├── advancedAI.ts            # Advanced AI analysis functions
  └── aiAnalysis.ts            # AI analysis utilities

/components
  ├── AIAssistant.tsx          # Main AI chat component
  ├── AIChatNew.tsx            # Legacy chat (can be removed)
  └── ui/                      # Shadcn components

/docs
  ├── NLP_FEATURES.md          # Technical documentation
  ├── AI_ASSISTANT_GUIDE.md    # User manual
  ├── CONVERSATION_EXAMPLES.md # Example conversations
  └── NLP_DEVELOPER_GUIDE.md   # This file
```

---

## 🧠 Core Concepts

### 1. Intent Classification

Every user query is classified into one of 18 intent types:

```typescript
import { classifyIntent } from "../utils/nlpEngine";

const intent = classifyIntent("How much did I spend on food?");

console.log(intent);
// {
//   name: "spending_query",
//   confidence: 0.92,
//   entities: [
//     { type: "category", value: "food", normalized: "food", confidence: 0.9 }
//   ]
// }
```

#### Available Intents:
- `spending_query` - Expense questions
- `income_query` - Income questions
- `balance_query` - Balance questions
- `category_analysis` - Category breakdowns
- `prediction` - Forecast queries
- `optimization` - Saving tips
- `budget_status` - Budget checks
- `anomaly_detection` - Unusual transactions
- `comparison` - Comparing periods
- `goal_tracking` - Goal progress
- `investment_advice` - Investment tips
- `loan_recommendation` - Loan suggestions
- `tax_planning` - Tax saving
- `credit_score` - Credit score queries
- `merchant_analysis` - Merchant spending
- `transaction_search` - Find transactions
- `recurring_expenses` - Subscriptions
- `savings_challenge` - Gamified savings

---

### 2. Entity Extraction

Extract structured data from natural language:

```typescript
import { extractEntities } from "../utils/nlpEngine";

const entities = extractEntities("I spent ₹1.5 lakh on shopping last week");

console.log(entities);
// [
//   { type: "amount", value: "₹1.5 lakh", normalized: 150000, confidence: 0.95 },
//   { type: "category", value: "shopping", normalized: "shopping", confidence: 0.9 },
//   { type: "time_period", value: "last week", normalized: {...}, confidence: 0.92 }
// ]
```

#### Supported Entity Types:
- **Amount**: ₹1,25,000, 1.5L, 2 crore, 50K
- **Category**: food, shopping, travel, etc.
- **Time Period**: last week, this month, Q3, FY
- **Merchant**: Zomato, Amazon, Flipkart, etc.
- **Date**: DD-MM-YYYY, DD MMM YYYY
- **Action**: show, find, compare, etc.

---

### 3. Context Management

Maintain conversation state across multiple turns:

```typescript
import { ContextManager } from "../utils/nlpEngine";

const contextManager = new ContextManager();

// Turn 1
const intent1 = classifyIntent("Show food spending");
contextManager.updateContext(intent1);

// Turn 2 - "What about shopping?" will infer context
const intent2 = classifyIntent("What about shopping?");
const inferredIntent = contextManager.inferMissingEntities(intent2);
// inferredIntent will have shopping category inferred

// Get current context
const context = contextManager.getContext();
console.log(context);
// {
//   previousIntents: ["spending_query"],
//   entities: Map { "category" => {...} },
//   lastCategory: "food",
//   conversationTurn: 2
// }

// Reset when done
contextManager.reset();
```

---

### 4. Process NL Query (All-in-One)

Process a complete natural language query:

```typescript
import { processNLQuery, ContextManager } from "../utils/nlpEngine";

const contextManager = new ContextManager();

const result = processNLQuery(
  "How much did I spend on food last week?",
  contextManager
);

console.log(result);
// {
//   intent: { name: "spending_query", confidence: 0.92, entities: [...] },
//   context: { previousIntents: [...], entities: Map {...} },
//   suggestedFollowUps: [
//     "How can I reduce this spending?",
//     "Compare to last month",
//     "Show me the breakdown by merchant"
//   ],
//   requiresClarification: false
// }
```

---

## 🔧 Adding New Intent

### Step 1: Define Intent Pattern

Edit `/utils/nlpEngine.ts`:

```typescript
const intentPatterns = {
  // ... existing intents ...
  
  // Add new intent
  bill_payment: {
    patterns: [
      /(?:pay|payment).+(?:bill|utility|electricity|water)/i,
      /bill.+(?:payment|pay|due)/i,
      /(?:electricity|water|gas).+(?:bill|payment)/i
    ],
    examples: ['pay electricity bill', 'water bill payment', 'bill payment due']
  }
};
```

### Step 2: Create Intent Handler

Edit `/components/AIAssistant.tsx`:

```typescript
const generateAIResponse = (query: string): { text: string; suggestions: string[] } => {
  const nlpResult = processNLQuery(query, contextManager);
  const { intent, suggestedFollowUps } = nlpResult;

  let response = "";
  
  switch (intent.name) {
    // ... existing cases ...
    
    case 'bill_payment':
      response = handleBillPayment(intent);
      break;
      
    default:
      response = handleGeneralQuery(query, intent);
  }

  return { text: response, suggestions: suggestedFollowUps };
};

const handleBillPayment = (intent: Intent): string => {
  // Extract bill type from entities
  const billType = intent.entities.find(e => 
    ['electricity', 'water', 'gas'].includes(e.normalized)
  );
  
  return `💡 Bill Payment:\n\n` +
         `Bill Type: ${billType?.value || 'All'}\n` +
         `Due Amount: ₹2,450\n` +
         `Due Date: 05-Nov-2025\n\n` +
         `[Pay Now] button`;
};
```

### Step 3: Add Follow-up Suggestions

Edit `/utils/nlpEngine.ts`:

```typescript
export function generateFollowUps(intent: Intent, context: ConversationContext): string[] {
  const followUps: { [key: string]: string[] } = {
    // ... existing followUps ...
    
    bill_payment: [
      'Show all pending bills',
      'Set up autopay',
      'View payment history'
    ]
  };
  
  return followUps[intent.name] || defaultFollowUps;
}
```

---

## 🎨 Customizing Responses

### Add Custom Data Source

```typescript
// Create mock data in mockData.ts
export const mockData = {
  // ... existing data ...
  
  bills: [
    { type: 'Electricity', amount: 1200, dueDate: '05-Nov-2025', provider: 'BSES' },
    { type: 'Water', amount: 450, dueDate: '10-Nov-2025', provider: 'DJB' },
    { type: 'Gas', amount: 800, dueDate: '15-Nov-2025', provider: 'Indraprastha Gas' }
  ]
};

// Use in handler
const handleBillPayment = (intent: Intent): string => {
  const { bills } = mockData;
  
  let response = `💡 Pending Bills:\n\n`;
  
  bills.forEach((bill, i) => {
    response += `${i + 1}. ${bill.type} (${bill.provider})\n`;
    response += `   Amount: ₹${bill.amount}\n`;
    response += `   Due: ${bill.dueDate}\n\n`;
  });
  
  const total = bills.reduce((sum, b) => sum + b.amount, 0);
  response += `Total: ₹${total}`;
  
  return response;
};
```

---

## 📊 Conversation Analytics

### Track User Behavior

```typescript
import { ConversationTracker } from "../utils/conversationAnalytics";

// Create tracker instance
const tracker = new ConversationTracker();

// Log each query
const sendMessage = (text: string) => {
  const nlpResult = processNLQuery(text, contextManager);
  const { intent } = nlpResult;
  
  // Log query for analytics
  tracker.logQuery(intent.name, intent.confidence, intent.entities);
  
  // ... rest of message handling ...
};

// Get metrics
const metrics = tracker.getMetrics();
console.log(metrics);
// {
//   totalQueries: 15,
//   topIntents: [
//     { intent: "spending_query", count: 6 },
//     { intent: "budget_status", count: 4 }
//   ],
//   averageConfidence: 0.87,
//   sessionDuration: 420
// }
```

### Generate Insights

```typescript
import { 
  generateConversationInsights,
  inferUserPreferences 
} from "../utils/conversationAnalytics";

// Get user preferences
const preferences = inferUserPreferences(tracker);
console.log(preferences);
// {
//   favoriteCategories: ["food", "shopping"],
//   preferredAnalysisPeriod: "weekly",
//   optimizationFocus: "savings"
// }

// Get insights
const insights = generateConversationInsights(tracker, userData);
insights.forEach(insight => {
  console.log(`${insight.icon} ${insight.title}`);
  console.log(insight.description);
  if (insight.actionable) {
    console.log(`Action: ${insight.action}`);
  }
});
```

### Export Analytics Report

```typescript
import { exportConversationAnalytics } from "../utils/conversationAnalytics";

const report = exportConversationAnalytics(tracker, userData);

// Save to file
const blob = new Blob([report], { type: 'text/markdown' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'conversation-analytics.md';
a.click();
```

---

## 🔍 Testing

### Test Intent Classification

```typescript
import { classifyIntent } from "../utils/nlpEngine";

// Test queries
const testCases = [
  { query: "How much did I spend?", expected: "spending_query" },
  { query: "What's my budget?", expected: "budget_status" },
  { query: "Show unusual transactions", expected: "anomaly_detection" }
];

testCases.forEach(test => {
  const intent = classifyIntent(test.query);
  console.log(
    `✅ ${intent.name === test.expected ? 'PASS' : 'FAIL'}`,
    test.query,
    `→ ${intent.name} (${Math.round(intent.confidence * 100)}%)`
  );
});
```

### Test Entity Extraction

```typescript
import { extractEntities } from "../utils/nlpEngine";

const testQuery = "I spent ₹1.5 lakh on shopping last week";
const entities = extractEntities(testQuery);

entities.forEach(entity => {
  console.log(
    `${entity.type}: "${entity.value}" → ${entity.normalized}`,
    `(${Math.round(entity.confidence * 100)}%)`
  );
});
```

### Test Context Management

```typescript
import { ContextManager } from "../utils/nlpEngine";

const contextManager = new ContextManager();

// Simulate conversation
const queries = [
  "Show food spending",
  "What about shopping?",
  "Compare them"
];

queries.forEach((query, i) => {
  console.log(`\nTurn ${i + 1}: "${query}"`);
  
  let intent = classifyIntent(query);
  intent = contextManager.inferMissingEntities(intent);
  contextManager.updateContext(intent);
  
  console.log(`Intent: ${intent.name}`);
  console.log(`Entities:`, intent.entities);
  console.log(`Context:`, contextManager.getContext());
});
```

---

## 🎯 Best Practices

### 1. **Always Use Context Manager**
```typescript
// ✅ Good
const contextManager = new ContextManager();
const result = processNLQuery(query, contextManager);

// ❌ Bad
const intent = classifyIntent(query); // No context
```

### 2. **Handle Low Confidence**
```typescript
if (intent.confidence < 0.5) {
  // Ask for clarification
  return "I'm not sure I understood. Could you rephrase?";
}
```

### 3. **Provide Follow-ups**
```typescript
return {
  text: response,
  suggestions: suggestedFollowUps // Always include!
};
```

### 4. **Log for Analytics**
```typescript
tracker.logQuery(intent.name, intent.confidence, intent.entities);
```

### 5. **Reset Context When Needed**
```typescript
// When user explicitly starts new topic
if (query.toLowerCase().includes('new topic') || query === 'reset') {
  contextManager.reset();
}
```

---

## 🐛 Debugging

### Enable Debug Mode

Add to component state:

```typescript
const [debugMode, setDebugMode] = useState(true);

// In response generation
if (debugMode) {
  console.log('Query:', query);
  console.log('Intent:', intent);
  console.log('Entities:', intent.entities);
  console.log('Context:', contextManager.getContext());
  console.log('Confidence:', intent.confidence);
}
```

### View Intent Patterns

```typescript
import { intentPatterns } from "../utils/nlpEngine";

// List all patterns
Object.entries(intentPatterns).forEach(([name, data]) => {
  console.log(`\n${name}:`);
  console.log('Patterns:', data.patterns);
  console.log('Examples:', data.examples);
});
```

### Test Single Pattern

```typescript
const pattern = /(?:how much|what).+(?:spent|spend)/i;
const query = "How much did I spend on food?";

console.log('Match:', pattern.test(query)); // true/false
console.log('Groups:', query.match(pattern));
```

---

## 🚀 Performance Optimization

### 1. **Lazy Load Analytics**
```typescript
// Only load when needed
const loadAnalytics = async () => {
  const { ConversationTracker } = await import("../utils/conversationAnalytics");
  return new ConversationTracker();
};
```

### 2. **Debounce Voice Input**
```typescript
import { debounce } from 'lodash';

const processVoiceInput = debounce((text: string) => {
  sendMessage(text);
}, 300);
```

### 3. **Memoize Expensive Calculations**
```typescript
import { useMemo } from 'react';

const financialHealth = useMemo(() => 
  calculateFinancialHealthScore(userData),
  [userData]
);
```

---

## 📚 Integration Examples

### With Dashboard

```typescript
// In Dashboard.tsx
import { AIAssistant } from "./AIAssistant";

export function Dashboard() {
  return (
    <div>
      {/* Dashboard content */}
      <AIAssistant />
    </div>
  );
}
```

### With Custom Button

```typescript
import { useState } from 'react';
import { AIAssistant } from "./AIAssistant";

export function CustomLayout() {
  const [showAI, setShowAI] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setShowAI(true)}>
        Ask AI Assistant
      </Button>
      
      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
    </div>
  );
}
```

### With Notification Badge

```typescript
export function Header() {
  const [hasNewInsights, setHasNewInsights] = useState(true);
  
  return (
    <div className="relative">
      <AIAssistant />
      {hasNewInsights && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
      )}
    </div>
  );
}
```

---

## 🔐 Security Considerations

### 1. **Input Sanitization**
```typescript
const sanitizeInput = (text: string): string => {
  // Remove HTML tags
  return text.replace(/<[^>]*>/g, '');
};

const sendMessage = (text: string) => {
  const sanitized = sanitizeInput(text);
  // Process sanitized input
};
```

### 2. **Rate Limiting**
```typescript
import { throttle } from 'lodash';

const sendMessage = throttle((text: string) => {
  // Process message
}, 1000); // Max 1 query per second
```

### 3. **Data Privacy**
```typescript
// Don't log sensitive data
const logQuery = (intent: string, confidence: number) => {
  // ✅ Log only metadata
  analytics.track('query', { intent, confidence });
  
  // ❌ Don't log user query text
  // analytics.track('query', { text: userQuery });
};
```

---

## 📖 API Reference

### NLP Engine Functions

```typescript
// Intent Classification
classifyIntent(text: string): Intent

// Entity Extraction
extractEntities(text: string): Entity[]

// Process Complete Query
processNLQuery(query: string, contextManager: ContextManager): NLPResponse

// Helper Functions
normalizeTimePeriod(text: string): DateRange | null
parseIndianAmount(text: string): number | null
matchCategory(input: string): string | null
calculateSimilarity(text1: string, text2: string): number
analyzeSentiment(text: string): SentimentResult
detectMultipleIntents(text: string): Intent[]
generateFollowUps(intent: Intent, context: ConversationContext): string[]
requiresClarification(intent: Intent): ClarificationResult
```

### Context Manager Methods

```typescript
class ContextManager {
  updateContext(intent: Intent): void
  getContext(): ConversationContext
  inferMissingEntities(intent: Intent): Intent
  reset(): void
}
```

### Analytics Functions

```typescript
// Tracking
class ConversationTracker {
  logQuery(intent: string, confidence: number, entities: Entity[]): void
  getMetrics(): ConversationMetrics
  getQueryLog(): QueryLog[]
  reset(): void
}

// Analysis
inferUserPreferences(tracker: ConversationTracker): UserPreferences
generateConversationInsights(tracker: ConversationTracker, userData: any): ConversationInsight[]
generatePersonalizedSuggestions(tracker: ConversationTracker, userData: any): string[]
calculateConversationQuality(tracker: ConversationTracker): QualityScore
exportConversationAnalytics(tracker: ConversationTracker, userData: any): string
```

---

## 🎓 Learning Resources

### Documentation
- [NLP Features Guide](./NLP_FEATURES.md) - Technical deep dive
- [User Guide](./AI_ASSISTANT_GUIDE.md) - User manual
- [Conversation Examples](./CONVERSATION_EXAMPLES.md) - Example dialogues

### Code Examples
- `/utils/nlpEngine.ts` - NLP implementation
- `/components/AIAssistant.tsx` - UI implementation
- `/utils/conversationAnalytics.ts` - Analytics implementation

### External Resources
- [RegEx Testing](https://regex101.com/) - Test patterns
- [NLP Concepts](https://web.stanford.edu/~jurafsky/slp3/) - Stanford NLP Book
- [Intent Classification](https://rasa.com/docs/rasa/training-data-format/) - Rasa Docs

---

## 🆘 Troubleshooting

### Issue: Intent Not Detected
**Solution**: Add more patterns to `intentPatterns`

```typescript
spending_query: {
  patterns: [
    // Add variations
    /spent.+on/i,
    /expense.+for/i,
    /paid.+to/i
  ]
}
```

### Issue: Entity Not Extracted
**Solution**: Check entity patterns and add variations

```typescript
entityPatterns.category.push(
  /\b(new-category)\b/gi
);
```

### Issue: Low Confidence
**Solution**: Add more specific patterns or ask for clarification

```typescript
if (intent.confidence < 0.6) {
  return {
    text: "Did you mean: [suggestion]?",
    suggestions: ["Option A", "Option B"]
  };
}
```

### Issue: Context Not Working
**Solution**: Ensure ContextManager is persistent across turns

```typescript
// ✅ Good - Outside component
const contextManager = new ContextManager();

// ❌ Bad - Inside component
const MyComponent = () => {
  const contextManager = new ContextManager(); // Resets every render!
};
```

---

## 🎯 Quick Reference

### Common Patterns

```typescript
// 1. Process Query
const result = processNLQuery(query, contextManager);

// 2. Handle Intent
switch (result.intent.name) {
  case 'spending_query':
    return handleSpending(result.intent);
  // ...
}

// 3. Log Analytics
tracker.logQuery(intent.name, intent.confidence, intent.entities);

// 4. Generate Response
return {
  text: response,
  suggestions: result.suggestedFollowUps
};
```

### Testing Checklist

- [ ] Intent correctly classified
- [ ] Entities properly extracted
- [ ] Context maintained across turns
- [ ] Follow-ups relevant
- [ ] Low confidence handled
- [ ] Analytics logged
- [ ] Performance acceptable (<2s response)

---

**Happy Coding! 🚀**

For questions or contributions, refer to the main documentation or create an issue.

*Version 2.0.0 | Last Updated: Oct 28, 2025*
