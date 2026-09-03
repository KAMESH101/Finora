import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Sparkles,
  Trophy,
  Brain,
  TrendingUp,
  Award,
  Target,
  Zap,
  CheckCircle2,
  ArrowRight,
  X
} from "lucide-react";

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  highlight: string;
  color: string;
}

export function FeatureShowcase() {
  const [showShowcase, setShowShowcase] = useState(true);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features: Feature[] = [
    {
      id: 'health-score',
      title: 'Financial Health Score',
      description: 'Get a comprehensive A+ to D grade based on 5 key financial factors',
      icon: <Award className="h-8 w-8" />,
      benefits: [
        'Overall wellness score out of 100',
        '5-factor breakdown (Savings, Spending, Investments, Debt, Emergency)',
        'Personalized improvement suggestions',
        'Monthly tracking and progress'
      ],
      highlight: 'Know exactly where you stand financially!',
      color: '#10B981'
    },
    {
      id: 'spending-patterns',
      title: 'Spending Pattern Analysis',
      description: 'AI detects your behavioral spending habits and trends',
      icon: <Brain className="h-8 w-8" />,
      benefits: [
        'Weekend vs weekday spending analysis',
        'Impulsive buying detection',
        'Merchant loyalty insights',
        'Category-wise trend analysis'
      ],
      highlight: 'Understand your spending psychology!',
      color: '#1E3A8A'
    },
    {
      id: 'recurring',
      title: 'Recurring Expense Detection',
      description: 'Automatically identify subscriptions and recurring payments',
      icon: <Target className="h-8 w-8" />,
      benefits: [
        'Auto-detect monthly subscriptions',
        'Predict next payment dates',
        'Optimization suggestions',
        'Cancellation reminders for unused services'
      ],
      highlight: 'Never miss a subscription renewal!',
      color: '#F59E0B'
    },
    {
      id: 'seasonal',
      title: 'Seasonal Predictions',
      description: 'Indian festival & season-based spending forecasts',
      icon: <TrendingUp className="h-8 w-8" />,
      benefits: [
        'Diwali, Holi, Christmas predictions',
        'Tax season planning',
        'Summer vacation budgeting',
        'School admission season alerts'
      ],
      highlight: 'Plan ahead for festive expenses!',
      color: '#FB923C'
    },
    {
      id: 'challenges',
      title: 'Savings Challenges',
      description: 'Gamified savings goals with rewards and achievements',
      icon: <Trophy className="h-8 w-8" />,
      benefits: [
        '6+ challenges (Cook at Home, No-Spend Weekend, etc.)',
        'Progress tracking with visual indicators',
        'Reward points system',
        'Difficulty levels: Easy, Medium, Hard'
      ],
      highlight: 'Make saving money fun and rewarding!',
      color: '#8b5cf6'
    },
    {
      id: 'optimization',
      title: 'Cost Optimization',
      description: 'AI finds specific ways to cut costs and save money',
      icon: <Zap className="h-8 w-8" />,
      benefits: [
        'Category-specific savings tips',
        'Subscription consolidation advice',
        'Transport alternatives',
        'Food delivery optimization'
      ],
      highlight: 'Save ₹5,000+ per month on average!',
      color: '#06b6d4'
    }
  ];

  if (!showShowcase) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={() => setShowShowcase(false)}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        >
          <div className="sticky top-0 bg-gradient-to-r from-[#1E3A8A] to-[#10B981] p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-white">🎉 New AI Features Unlocked!</h2>
                <p className="text-white/80 text-sm">Explore 6 powerful enhancements to FinAI India</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowShowcase(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Feature Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card 
                        className="hover-lift cursor-pointer border-2 hover:border-primary transition-all"
                        onClick={() => setSelectedFeature(feature.id)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div 
                              className="p-3 rounded-lg"
                              style={{ backgroundColor: feature.color + '20', color: feature.color }}
                            >
                              {feature.icon}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              New
                            </Badge>
                          </div>
                          <CardTitle className="text-base mt-3">{feature.title}</CardTitle>
                          <CardDescription className="text-xs">
                            {feature.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span 
                              className="text-xs"
                              style={{ color: feature.color }}
                            >
                              {feature.highlight}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-[#10B981]/10 to-[#1E3A8A]/10 border border-[#10B981]/20">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-[#10B981] mt-0.5" />
                    <div>
                      <h4 className="mb-1">All Features Included</h4>
                      <p className="text-sm text-muted-foreground">
                        These AI-powered features are now active in your dashboard. Explore each one by clicking the cards above, or navigate to the Dashboard to see them in action!
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                {selectedFeature ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {features.filter(f => f.id === selectedFeature).map(feature => (
                      <Card key={feature.id} className="border-2" style={{ borderColor: feature.color + '40' }}>
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <div 
                              className="p-4 rounded-lg"
                              style={{ backgroundColor: feature.color + '20', color: feature.color }}
                            >
                              {feature.icon}
                            </div>
                            <div className="flex-1">
                              <CardTitle>{feature.title}</CardTitle>
                              <CardDescription className="mt-1">
                                {feature.description}
                              </CardDescription>
                              <div className="mt-3 p-3 rounded-lg bg-muted/50">
                                <p className="text-sm" style={{ color: feature.color }}>
                                  💡 {feature.highlight}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <h4 className="mb-3">Key Benefits:</h4>
                          <div className="space-y-2">
                            {feature.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: feature.color }} />
                                <span className="text-sm">{benefit}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex gap-2">
                            <Button
                              onClick={() => setShowShowcase(false)}
                              className="flex-1"
                              style={{ backgroundColor: feature.color }}
                            >
                              Try it Now
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedFeature(null)}
                            >
                              Back
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a feature from the Overview tab to see details</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => setShowShowcase(false)}
                className="flex-1 bg-gradient-to-r from-[#1E3A8A] to-[#10B981] hover:from-[#1e40af] hover:to-[#059669]"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Explore Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.setItem('finai_showcase_seen', 'true');
                  setShowShowcase(false);
                }}
              >
                Don't Show Again
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
