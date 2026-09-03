import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MessageCircle, 
  Send, 
  X,
  Sparkles,
  Mic,
  DollarSign,
  TrendingUp,
  Target
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  actions?: { label: string; action: string }[];
}

const suggestedPrompts = [
  { text: "How can I save $500 this month?", icon: DollarSign },
  { text: "Show my spending trends", icon: TrendingUp },
  { text: "Help me create a budget", icon: Target },
  { text: "Investment recommendations", icon: Sparkles },
];

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi! I'm your FinAI assistant. I can help you understand your finances, create budgets, and give personalized advice. What would you like to know?",
    sender: 'ai',
    timestamp: new Date(),
  }
];

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

    // Simulate AI response
    setTimeout(() => {
      const aiResponses: { [key: string]: Message } = {
        'save': {
          id: messages.length + 2,
          text: "Based on your spending patterns, I found 3 ways to save $500:\n\n1. You have $40/month in unused subscriptions (Netflix, Spotify duplicates)\n2. Reduce dining out by 2 meals/week = $160/month\n3. Switch to a better internet plan = $25/month savings\n\nWould you like me to help you cancel subscriptions or create a dining budget?",
          sender: 'ai',
          timestamp: new Date(),
          actions: [
            { label: 'Cancel Subscriptions', action: 'cancel_subs' },
            { label: 'Create Budget', action: 'create_budget' }
          ]
        },
        'budget': {
          id: messages.length + 2,
          text: "I can help you create a personalized budget! Based on your income of $5,240/month and spending history, I recommend:\n\n• Groceries: $800\n• Transportation: $300\n• Entertainment: $200\n• Savings: $1,800\n\nShall I set this up for you?",
          sender: 'ai',
          timestamp: new Date(),
          actions: [
            { label: 'Create Budget', action: 'create_budget' },
            { label: 'Adjust Amounts', action: 'adjust' }
          ]
        },
        'investment': {
          id: messages.length + 2,
          text: "Based on your moderate risk profile and $1,800 monthly surplus, I recommend:\n\n1. Vanguard S&P 500 ETF (VOO) - 40%\n2. High-Yield Savings - 30%\n3. Tech Growth Fund (QQQ) - 20%\n4. Bonds (BND) - 10%\n\nThis balanced approach gives you growth potential while managing risk.",
          sender: 'ai',
          timestamp: new Date(),
          actions: [
            { label: 'View Details', action: 'view_investments' },
            { label: 'Adjust Strategy', action: 'adjust_strategy' }
          ]
        },
        'default': {
          id: messages.length + 2,
          text: "I understand you'd like help with that. I can assist with:\n\n• Analyzing spending patterns\n• Creating budgets\n• Setting financial goals\n• Investment recommendations\n• Finding ways to save money\n\nWhat specifically would you like to explore?",
          sender: 'ai',
          timestamp: new Date(),
        }
      };

      const lowerText = text.toLowerCase();
      let response = aiResponses.default;

      if (lowerText.includes('save') || lowerText.includes('500')) {
        response = aiResponses.save;
      } else if (lowerText.includes('budget')) {
        response = aiResponses.budget;
      } else if (lowerText.includes('invest')) {
        response = aiResponses.investment;
      }

      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center text-white"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle size={24} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={20} />
                    <div>
                      <h3 className="text-sm">FinAI Assistant</h3>
                      <p className="text-xs text-white/80">Always here to help</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-white hover:bg-white/20"
                    >
                      <Mic size={18} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-secondary/20">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        {message.sender === 'ai' && (
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={14} className="text-indigo-600" />
                            <span className="text-xs text-indigo-600">AI</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        
                        {message.actions && (
                          <div className="mt-3 space-y-2">
                            {message.actions.map((action, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="w-full text-xs bg-white"
                                onClick={() => console.log('Action:', action.action)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                          className="w-2 h-2 bg-indigo-600 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                          className="w-2 h-2 bg-indigo-600 rounded-full"
                        />
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                          className="w-2 h-2 bg-indigo-600 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Suggested Prompts */}
              {messages.length === 1 && (
                <div className="p-4 border-t bg-white">
                  <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {suggestedPrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs justify-start"
                        onClick={() => handleSuggestedPrompt(prompt.text)}
                      >
                        <prompt.icon size={14} className="mr-2" />
                        {prompt.text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage(inputValue);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Send size={18} />
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
