import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, Send, X, Sparkles, TrendingUp, PiggyBank, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { toast } from "sonner@2.0.3";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const suggestedPrompts = [
  "How much did I spend on food last week?",
  "What's my average monthly income?",
  "Show me my top 3 expense categories",
  "Predict my next month expenses",
  "How can I optimize my spending?",
  "Which loan suits me best?"
];

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Namaste! 🙏 I'm your FinAI Assistant with Natural Language Query support!\n\nAsk me questions like:\n• \"How much did I spend on food last week?\"\n• \"What's my average income?\"\n• \"Show me top 3 expense categories\"\n• \"Predict my next month expenses\"\n• \"How can I optimize my spending?\"\n\nI can also help with budgets, investments, loans, taxes, and more!",
    sender: 'ai',
    timestamp: new Date(),
  }
];

export function AIChatNew() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getAIResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();

    // Natural Language Queries - Specific spending questions
    if (lowerText.includes('how much') && lowerText.includes('spend')) {
      // Time-based queries
      if (lowerText.includes('last week')) {
        return "📊 Last Week's Spending (21-27 Oct):\n\n• Total: ₹12,194\n• Food: ₹4,520 (4 transactions)\n• Shopping: ₹3,200 (2 transactions)\n• Travel: ₹645 (3 transactions)\n• Entertainment: ₹550 (1 transaction)\n• Subscriptions: ₹948 (2 transactions)\n• EMI: ₹21,000 (1 transaction)\n\n💡 Tip: Food spending was 15% higher than average.";
      }
      
      if (lowerText.includes('this month') || lowerText.includes('october')) {
        return "📊 October Spending Summary:\n\n• Total: ₹47,144\n• Food: ₹14,200 (30% of budget)\n• EMI: ₹21,000 (100% of budget)\n• Shopping: ₹8,500 (85% of budget)\n• Travel: ₹1,200 (20% of budget)\n• Subscriptions: ₹1,200 (60% of budget)\n• Entertainment: ₹800 (40% of budget)\n\n⚠️ You're 8% over food budget!";
      }

      // Category-specific queries
      if (lowerText.includes('food')) {
        return "🍽️ Food Spending Analysis:\n\n• Last Week: ₹4,520\n• This Month: ₹14,200\n• Average/transaction: ₹945\n• Top merchant: Zomato (₹2,800)\n\n📈 Breakdown:\n• Restaurants: ₹5,600\n• Food delivery: ₹4,400\n• Groceries: ₹4,200\n\n💡 Save ₹2,000/month by cooking at home 3 days/week!";
      }

      if (lowerText.includes('shopping')) {
        return "🛍️ Shopping Spending Analysis:\n\n• This Month: ₹8,500\n• Budget: ₹10,000 (85% used)\n• Remaining: ₹1,500\n\n🏪 Top Stores:\n• Amazon: ₹3,600\n• Flipkart: ₹3,200\n• Myntra: ₹1,800\n\n💡 Predicted end-of-month: ₹11,200 (12% over budget!)";
      }

      if (lowerText.includes('travel') || lowerText.includes('transport')) {
        return "🚗 Travel Spending Analysis:\n\n• This Month: ₹1,200\n• Budget: ₹6,000 (20% used)\n• Average ride: ₹240\n\n🚕 Breakdown:\n• Ola: ₹565 (3 rides)\n• Uber: ₹245 (1 ride)\n• Rapido: ₹380 (4 rides)\n\n✅ Great! You're under budget. Keep it up!";
      }
    }

    // "What's my" queries
    if (lowerText.includes('what') && lowerText.includes('my')) {
      if (lowerText.includes('income') || lowerText.includes('salary')) {
        return "💰 Income Analysis:\n\n• Average Monthly: ₹1,20,000\n• Last 3 months: ₹3,65,000\n• YTD (2025): ₹8,40,000\n• Growth: +8% YoY\n\n📊 Sources:\n• Salary: ₹1,10,000\n• Freelance: ₹8,000\n• Other: ₹2,000\n\n🎯 On track for ₹14.4L annual income!";
      }

      if (lowerText.includes('average')) {
        return "📊 Your Spending Averages:\n\n• Monthly Expenses: ₹95,000\n• Daily Spending: ₹3,167\n• Per Transaction: ₹1,255\n• Transactions/Month: 76\n\n📈 Category Averages:\n• Food: ₹14,200/month\n• Shopping: ₹9,300/month\n• Travel: ₹2,400/month\n• Entertainment: ₹3,200/month\n\n💡 You spend 15% of income on food.";
      }

      if (lowerText.includes('balance') || lowerText.includes('left')) {
        return "💳 Current Balances:\n\n• Total: ₹3,25,600\n• Savings: ₹1,85,000 (57%)\n• Checking: ₹1,10,000 (34%)\n• Investments: ₹30,600 (9%)\n\n📈 Month-over-Month:\n• Income: +₹1,20,000\n• Expenses: -₹95,000\n• Net Savings: +₹25,000\n\n✅ Healthy savings rate of 21%!";
      }
    }

    // "Show me" queries
    if (lowerText.includes('show') || lowerText.includes('top')) {
      if (lowerText.includes('categories') || lowerText.includes('category')) {
        return "🏆 Top 3 Expense Categories (This Month):\n\n1. 💰 EMI: ₹21,000 (44.5%)\n   Fixed monthly payment\n\n2. 🍽️ Food: ₹14,200 (30.1%)\n   ⚠️ 8% over budget\n\n3. 🛍️ Shopping: ₹8,500 (18.0%)\n   85% of budget used\n\nTotal: ₹43,700 (92.6% of expenses)\n\n💡 Focus on Food & Shopping to optimize spending!";
      }

      if (lowerText.includes('merchants') || lowerText.includes('where')) {
        return "🏪 Top Merchants (This Month):\n\n1. SBI EMI - ₹21,000 (EMI)\n2. Big Bazaar - ₹4,200 (Food)\n3. Flipkart - ₹3,200 (Shopping)\n4. Zomato - ₹2,800 (Food)\n5. Amazon - ₹2,400 (Shopping)\n\n📍 Most frequent: Food delivery (12 orders)\n\n💡 Consider meal prep to reduce delivery costs!";
      }
    }

    // Prediction and forecast queries
    if (lowerText.includes('predict') || lowerText.includes('forecast') || lowerText.includes('next month')) {
      return "🔮 November Expense Forecast:\n\n📊 AI Prediction (85% confidence):\n• Total: ₹1,12,000\n• Food: ₹15,500 (+3%)\n• EMI: ₹21,000 (fixed)\n• Shopping: ₹11,200 (+12%)\n• Travel: ₹5,800\n• Subscriptions: ₹1,500\n• Entertainment: ₹4,500\n• Others: ₹52,500\n\n⚠️ Alert: Shopping trending +12%\n💡 Tip: Save ₹5,000 by reducing shopping & subscriptions!";
    }

    // Anomaly detection queries
    if (lowerText.includes('unusual') || lowerText.includes('anomaly') || lowerText.includes('strange')) {
      return "🔍 Expense Anomalies Detected:\n\n⚠️ High Priority:\n1. Big Bazaar - ₹4,200 (Food)\n   180% higher than your avg grocery bill\n\n2. Flipkart - ₹3,200 (Shopping)\n   2x your typical online purchase\n\n💡 Medium Priority:\n3. Multiple Zomato orders (6 this week)\n   Consider meal planning\n\n✅ Action: Review these transactions and set category limits.";
    }

    // Optimization queries
    if (lowerText.includes('optimize') || lowerText.includes('reduce') || lowerText.includes('cut')) {
      return "✂️ Cost Optimization Opportunities:\n\n💰 Total Potential Savings: ₹7,200/month\n\n1. 🔄 Subscriptions (₹2,400)\n   • Cancel Netflix: ₹649\n   • Cancel Amazon Prime: ₹299\n   • Keep only 2 active services\n\n2. 🍽️ Food Delivery (₹3,000)\n   • Cook at home 3 days/week\n   • Use meal prep on weekends\n\n3. 🚗 Transportation (₹1,800)\n   • Use metro/bus 2x per week\n   • Carpool with colleagues\n\n🎯 Annual Savings: ₹86,400!";
    }

    // Budget-related queries
    if (lowerText.includes('budget') && lowerText.includes('status')) {
      return "📊 Budget Status Overview:\n\n✅ On Track (3 categories):\n• Travel: 20% used (₹1,200/₹6,000)\n• Subscriptions: 60% (₹1,200/₹2,000)\n• Entertainment: 64% (₹3,200/₹5,000)\n\n⚠️ Attention Needed (2 categories):\n• Shopping: 93% (₹9,300/₹10,000)\n• Food: 95% (₹14,200/₹15,000)\n\n🚨 Over Budget (1 category):\n• EMI: 100% (₹21,000/₹21,000)\n\n💡 Overall: 88% of total budget used.";
    }

    // Standard queries
    if (lowerText.includes('loan') || lowerText.includes('suits me')) {
      return "Based on your credit score (782) and income, here are my recommendations:\n\n🏆 Best Option: SBI Personal Loan\n• Interest: 9.8% p.a.\n• EMI: ₹9,600/month\n• Processing: 1.5%\n• Savings: ₹1,200/month vs others\n\n✅ Why SBI?\n• Lowest rate for your credit profile\n• No hidden charges\n• Quick approval (48 hours)\n\nWould you like me to help with the application?";
    }

    if (lowerText.includes('compare') || lowerText.includes('fund') || lowerText.includes('axis') || lowerText.includes('hdfc')) {
      return "Here's a comparison of Axis vs HDFC mutual funds:\n\n📈 Axis Bluechip Fund\n• ROI: 8.6% p.a.\n• Risk: Moderate\n• 3Y Return: 12.4%\n• Expense Ratio: 0.52%\n\n📈 HDFC Mid Cap Opportunities\n• ROI: 11.4% p.a.\n• Risk: High\n• 3Y Return: 16.2%\n• Expense Ratio: 0.89%\n\n💡 Recommendation: For steady growth with lower risk, choose Axis. For aggressive growth, go with HDFC Mid Cap.";
    }

    if (lowerText.includes('save') || lowerText.includes('saving')) {
      return "Here's how to save ₹10,000 monthly:\n\n💰 Cut Expenses (₹5,000):\n• Unused subscriptions: ₹1,200\n• Reduce food orders: ₹2,000\n• Switch to cheaper transport: ₹1,800\n\n📈 Optimize Investments (₹5,000):\n• Start ELSS SIP for tax saving\n• Move savings to high-interest FD\n• Use reward points wisely\n\n🎯 Total Savings: ₹10,000/month\n= ₹1,20,000/year + tax benefits!";
    }

    if (lowerText.includes('tax') || lowerText.includes('80c') || lowerText.includes('save tax')) {
      return "Smart tax saving strategies for you:\n\n💡 Section 80C (₹1.5L limit):\n• ELSS mutual funds (tax + returns)\n• PPF (guaranteed returns)\n• Life insurance premium\n\n💡 Section 80D (₹25K limit):\n• Health insurance for family\n\n💡 Section 80CCD(1B) (₹50K):\n• NPS contributions\n\n🎯 Potential Tax Savings: ₹65,600\n\nCurrently using: ₹2L. You can save ₹15,600 more!";
    }

    if (lowerText.includes('credit') || lowerText.includes('score')) {
      return "Your credit score analysis:\n\n💳 Current Score: 782 (Good)\n\n✅ Strengths:\n• Payment history: 98%\n• Low utilization: 42%\n\n⚠️ Can Improve:\n• Credit age: 3.5 years\n• Credit mix\n\n💡 Tips to reach 800+:\n1. Pay all bills before due date\n2. Keep utilization below 30%\n3. Avoid multiple loan inquiries\n4. Maintain 3+ credit accounts\n\n⏱️ Expected: 820 in 6 months!";
    }

    if (lowerText.includes('sip') || lowerText.includes('invest')) {
      return "Your investment portfolio looks good! Here's my analysis:\n\n📊 Current SIPs:\n• Axis Bluechip: ₹2,000 (ROI: 8.6%)\n• Parag Parikh: ₹1,500 (ROI: 9.2%)\n• HDFC Mid Cap: ₹1,000 (ROI: 11.4%)\n\n💡 Recommendations:\n1. Increase total SIP by ₹2,000\n2. Add ELSS fund for tax benefit\n3. Consider gold ETF (10% allocation)\n\n🎯 Projected wealth in 10 years:\nCurrent pace: ₹14.2L\nWith changes: ₹22.5L (+58%)";
    }

    if (lowerText.includes('goal') || lowerText.includes('goa') || lowerText.includes('car')) {
      return "Let's review your financial goals:\n\n🏝️ Goa Trip (₹20K target)\n• Saved: ₹12,000 (60%)\n• Remaining: ₹8,000\n• By Dec: Need ₹4,000/month\n\n🚗 Car Down Payment (₹1.5L)\n• Saved: ₹60,000 (40%)\n• Remaining: ₹90,000\n• By Jun 2026: Need ₹11,250/month\n\n💡 Strategy:\n1. Auto-transfer ₹4K to Goa fund\n2. Start SIP of ₹11K for car\n3. Use rewards to boost savings\n\nYou're on track! 🎯";
    }

    if (lowerText.includes('reward') || lowerText.includes('points')) {
      return "Your rewards program status:\n\n🏆 Current Balance: ₹2,450\n\n🎯 How to Earn More:\n• Complete SIP milestone: +₹250\n• Achieve savings goal: +₹100\n• Pay bills on time: +₹50 each\n• Refer friends: +₹500\n\n🎁 Redeem Options:\n• Amazon: 5% cashback\n• Swiggy: 10% cashback\n• Paytm: 3% cashback\n\n💡 Tip: Invest ₹1,000 more this month to unlock 2X cashback!";
    }

    return "I understand you're asking about: \"" + userText + "\"\n\nI can help you with:\n\n📊 Budget Planning & Expense Tracking\n💰 Loan Comparisons & Credit Score\n📈 Investment & SIP Recommendations\n💳 Tax Planning & Savings\n🎯 Goal Setting & Achievement\n🏆 Rewards & Cashback\n\n🔍 Try asking:\n• \"How much did I spend on food last week?\"\n• \"What's my average monthly income?\"\n• \"Show me my top three expense categories\"\n• \"Predict my next month expenses\"\n• \"How can I optimize my spending?\"";
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        text: getAIResponse(text),
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleExport = () => {
    toast.success("💾 Chat summary saved successfully!");
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
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full saffron-gradient hover:opacity-90 shadow-lg"
              size="icon"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
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
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] flex flex-col"
          >
            <Card className="flex flex-col h-full shadow-2xl border-2 border-[#1E3A8A]/20">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#1E3A8A] to-[#10B981] text-white rounded-t-lg">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm">FinAI Assistant</h3>
                    <div className="flex items-center gap-1 text-xs text-white/80">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleExport}
                    className="text-white hover:bg-white/20"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-accent/10">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-white border border-border'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-border p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-[#10B981] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Suggested Prompts */}
              {messages.length <= 1 && (
                <div className="p-4 border-t bg-white max-h-48 overflow-y-auto">
                  <p className="text-xs text-muted-foreground mb-2">💡 Try these questions:</p>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromptClick(prompt)}
                        className="text-xs h-auto py-2 btn-ripple text-left justify-start"
                      >
                        {prompt}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputValue)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => sendMessage(inputValue)}
                    className="bg-[#10B981] hover:bg-[#059669] btn-ripple"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
