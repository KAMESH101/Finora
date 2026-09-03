import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Repeat
} from "lucide-react";
import { 
  analyzeSpendingPatterns, 
  detectRecurringExpenses,
  predictSeasonalSpending 
} from "../utils/advancedAI";
import { mockData, formatCurrency } from "../mockData";
import { toast } from "sonner@2.0.3";

export function SpendingInsights() {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<any[]>([]);
  const [seasonalPredictions, setSeasonalPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeData();
  }, []);

  const analyzeData = () => {
    setLoading(true);
    
    setTimeout(() => {
      // Analyze spending patterns
      const detectedPatterns = analyzeSpendingPatterns(mockData.transactions);
      setPatterns(detectedPatterns);

      // Detect recurring expenses
      const recurring = detectRecurringExpenses(mockData.transactions);
      setRecurringExpenses(recurring);

      // Seasonal predictions
      const currentMonth = new Date().getMonth();
      const seasonal = predictSeasonalSpending(currentMonth);
      setSeasonalPredictions(seasonal);

      setLoading(false);
    }, 800);
  };

  const handleRefresh = () => {
    toast.loading("🔍 Re-analyzing your spending patterns...");
    analyzeData();
    setTimeout(() => {
      toast.success("✨ Analysis complete!");
    }, 1000);
  };

  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'weekend_spender': return '🎉';
      case 'weekday_spender': return '💼';
      case 'impulsive': return '⚡';
      case 'consistent': return '✅';
      case 'monthly_spike': return '📈';
      default: return '💡';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-money-in';
      case 'negative': return 'text-money-out';
      default: return 'text-gold';
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'festive': return '🪔';
      case 'tax': return '📊';
      case 'vacation': return '🏖️';
      case 'school': return '🎓';
      default: return '📅';
    }
  };

  if (loading) {
    return (
      <Card className="card-stat">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" style={{ color: 'var(--ink)' }} />
            AI Spending Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 fin-shimmer rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-stat">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" style={{ color: 'var(--ink)' }} />
            <CardTitle>AI Spending Insights</CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className="h-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Advanced behavioral analysis and predictions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="patterns" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patterns">
              Patterns
              {patterns.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {patterns.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recurring">
              Recurring
              {recurringExpenses.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {recurringExpenses.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          </TabsList>

          {/* Spending Patterns Tab */}
          <TabsContent value="patterns" className="space-y-3">
            {patterns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No significant patterns detected yet.</p>
                <p className="text-xs">Keep using the app to get insights!</p>
              </div>
            ) : (
              patterns.map((pattern, index) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border-l-4 bg-card ${
                    pattern.impact === 'positive'
                      ? 'border-money-in'
                      : pattern.impact === 'negative'
                      ? 'border-money-out'
                      : 'border-gold'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getPatternIcon(pattern.pattern)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="capitalize">
                          {pattern.pattern.replace(/_/g, ' ')}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {pattern.confidence}% confident
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {pattern.description}
                      </p>
                      <div className={`flex items-start gap-2 text-xs ${getImpactColor(pattern.impact)}`}>
                        {pattern.impact === 'positive' ? (
                          <CheckCircle2 className="h-4 w-4 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mt-0.5" />
                        )}
                        <span>{pattern.recommendation}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>

          {/* Recurring Expenses Tab */}
          <TabsContent value="recurring" className="space-y-3">
            {recurringExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Repeat className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recurring expenses detected.</p>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-lg border" style={{ background: 'var(--secondary)', borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 text-sm">
                    <Repeat className="h-4 w-4" style={{ color: 'var(--ink)' }} />
                    <span>
                      Found {recurringExpenses.length} recurring expenses totaling{' '}
                      {formatCurrency(
                        recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0)
                      )}
                      /month
                    </span>
                  </div>
                </div>

                {recurringExpenses.map((expense, index) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4>{expense.merchant}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {expense.frequency}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {expense.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <div>{formatCurrency(expense.amount)}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Next: {expense.nextExpected}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-muted-foreground p-2 bg-muted/50 rounded">
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{expense.suggestion}</span>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </TabsContent>

          {/* Seasonal Predictions Tab */}
          <TabsContent value="seasonal" className="space-y-3">
            {seasonalPredictions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No seasonal predictions available.</p>
              </div>
            ) : (
              seasonalPredictions.map((prediction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border-2 border-dashed border-gold"
                  style={{ background: 'color-mix(in oklab, var(--gold) 6%, var(--card))' }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{getSeasonIcon(prediction.season)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="capitalize">{prediction.season} Season</h4>
                        <Badge className="bg-gold text-white border-0">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{prediction.predictedIncrease}%
                        </Badge>
                      </div>

                      <div className="mb-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Expected increase in:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {prediction.categories.map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-card rounded border border-border">
                        <div className="flex items-start gap-2 text-xs">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--ink)' }} />
                          <span>{prediction.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
