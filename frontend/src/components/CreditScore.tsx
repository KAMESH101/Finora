import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { motion } from "motion/react";
import { mockData, formatCurrency } from "../mockData";
import { TrendingUp, AlertCircle, CheckCircle, ArrowUp, Info, CreditCard as CreditCardIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";
import { getCreditSummary, checkCharge, chargeCard, CreditSummary } from "../utils/creditCardAPI";
import { useCreditAlert } from "../contexts/CreditAlertContext";

export function CreditScore() {
  const { creditScore, loans } = mockData;
  const { showBlocked, showWarning } = useCreditAlert();
  const [cardSummary, setCardSummary] = useState<CreditSummary | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState("");
  const [isCharging, setIsCharging] = useState(false);

  const loadCardSummary = () => {
    getCreditSummary().then(setCardSummary).catch(() => setCardSummary(null));
  };

  useEffect(() => {
    loadCardSummary();
  }, []);

  const runPurchase = async () => {
    const amount = parseFloat(purchaseAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid purchase amount");
      return;
    }

    setIsCharging(true);
    try {
      const check = await checkCharge(amount);

      if (!check.allowed) {
        showBlocked({
          title: "Credit Limit Reached",
          message:
            "Credit card limit reached. This transaction cannot be completed because it exceeds your available credit limit.",
          creditLimit: check.credit_limit,
          currentBalance: check.current_balance,
          availableCredit: check.available_credit,
          utilizationPct: check.utilization_after_pct,
          thresholdPct: check.threshold_pct,
        });
        return;
      }

      if (check.warning) {
        showWarning({
          title: "Approaching Credit Limit",
          message: `This purchase will bring your credit utilization to ${check.utilization_after_pct.toFixed(
            0
          )}%, above your ${check.threshold_pct.toFixed(0)}% safety threshold.`,
          creditLimit: check.credit_limit,
          currentBalance: check.current_balance,
          availableCredit: check.available_credit,
          utilizationPct: check.utilization_after_pct,
          thresholdPct: check.threshold_pct,
          onProceed: async () => {
            const result = await chargeCard(amount, "Simulated Purchase");
            setCardSummary(result);
            toast.success("Purchase completed", { description: formatCurrency(amount) });
          },
        });
        return;
      }

      const result = await chargeCard(amount, "Simulated Purchase");
      setCardSummary(result);
      toast.success("Purchase completed", { description: formatCurrency(amount) });
      setPurchaseAmount("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    } finally {
      setIsCharging(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return "#1F7A5C";
    if (score >= 650) return "#C98A2C";
    return "#B23A2E";
  };

  const getStatusIcon = (status: string) => {
    if (status === "excellent") return <CheckCircle className="w-4 h-4 text-money-in" />;
    if (status === "good") return <CheckCircle className="w-4 h-4 text-money-in" />;
    if (status === "average") return <AlertCircle className="w-4 h-4 text-gold" />;
    return <AlertCircle className="w-4 h-4 text-destructive" />;
  };

  // Create score gauge data
  const gaugeData = [
    { name: "Score", value: creditScore.score, fill: getScoreColor(creditScore.score) },
    { name: "Remaining", value: 900 - creditScore.score, fill: "#e2e8f0" }
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1>Credit Score & Loans</h1>
        <p className="text-muted-foreground">Monitor your credit health and explore loan options</p>
      </div>

      {/* Credit Card summary + limit alert demo (live backend data) */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="card-stat">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5" />
              Your Finora Credit Card
            </CardTitle>
            <CardDescription>
              {cardSummary ? cardSummary.card_number_masked : "Loading card details..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {cardSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Credit Limit</div>
                  <div className="font-display">{formatCurrency(cardSummary.credit_limit)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Current Balance</div>
                  <div className="font-display">{formatCurrency(cardSummary.current_balance)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Available Credit</div>
                  <div className="font-display" style={{ color: 'var(--money-in)' }}>
                    {formatCurrency(cardSummary.available_credit)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Utilization</div>
                  <div className="font-display">{cardSummary.utilization_pct.toFixed(0)}%</div>
                </div>
                <div className="col-span-2 md:col-span-4">
                  <Progress value={Math.min(cardSummary.utilization_pct, 100)} className="h-2" />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex-1">
                <label className="text-sm text-muted-foreground mb-1 block" htmlFor="simulate-purchase-amount">
                  Simulate a card purchase
                </label>
                <Input
                  id="simulate-purchase-amount"
                  type="number"
                  min="0"
                  placeholder="Enter amount (₹)"
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                />
              </div>
              <Button onClick={runPurchase} disabled={isCharging} loading={isCharging}>
                Simulate Purchase
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Score Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="card-stat">
            <CardHeader>
              <CardTitle>Your Credit Score</CardTitle>
              <CardDescription>Updated Oct 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="flex justify-center">
                  <ResponsiveContainer width={250} height={250}>
                    <PieChart>
                      <Pie
                        data={gaugeData}
                        cx="50%"
                        cy="50%"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        {gaugeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center top-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.5 }}
                  >
                    <div className="text-5xl" style={{ color: getScoreColor(creditScore.score) }}>
                      {creditScore.score}
                    </div>
                    <div className="text-center text-muted-foreground mt-1">{creditScore.rating}</div>
                  </motion.div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="text-sm text-center text-muted-foreground">
                  Score Range: 300 - 900
                </div>
                <div className="flex justify-around text-sm">
                  <div className="text-center">
                    <div className="text-destructive">300-549</div>
                    <div className="text-muted-foreground">Poor</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gold">550-649</div>
                    <div className="text-muted-foreground">Fair</div>
                  </div>
                  <div className="text-center">
                    <div className="text-money-in">650-749</div>
                    <div className="text-muted-foreground">Good</div>
                  </div>
                  <div className="text-center">
                    <div className="text-money-in">750+</div>
                    <div className="text-muted-foreground">Excellent</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Credit Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="card-stat">
            <CardHeader>
              <CardTitle>Credit Score Factors</CardTitle>
              <CardDescription>What's affecting your score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {creditScore.factors.map((factor, index) => (
                <motion.div
                  key={factor.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(factor.status)}
                      <span className="text-sm">{factor.name}</span>
                    </div>
                    <span className="text-sm">
                      {factor.value}{factor.unit || "%"}
                    </span>
                  </div>
                  {!factor.unit && (
                    <Progress value={factor.value} className="h-2" />
                  )}
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border" style={{ background: 'color-mix(in oklab, var(--money-in) 6%, var(--card))', borderColor: 'color-mix(in oklab, var(--money-in) 25%, transparent)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-money-in" />
              AI Tips to Improve Your Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {creditScore.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start gap-2 p-3 bg-card rounded-lg"
                >
                  <Info className="w-4 h-4 text-money-in mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{insight}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loan Comparison */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2>Available Loan Options</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Personal</Button>
            <Button variant="outline" size="sm">Home</Button>
            <Button variant="outline" size="sm">Vehicle</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {loans.map((loan, index) => (
            <motion.div
              key={loan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card className={`card-stat ${loan.recommended ? "border-2 border-money-in" : ""}`}>
                {loan.recommended && (
                  <div className="bg-money-in text-white text-xs px-3 py-1 rounded-t-lg text-center">
                    🏆 Recommended by Finora
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{loan.bank}</CardTitle>
                  <CardDescription>{loan.type} Loan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Interest Rate</span>
                      <span>{loan.rate}% p.a.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tenure</span>
                      <span>{loan.tenure} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">EMI</span>
                      <span style={{ color: 'var(--ink)' }}>{formatCurrency(loan.emi)}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Amount</span>
                      <span>{formatCurrency(loan.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Processing Fee</span>
                      <span>{loan.processing}%</span>
                    </div>
                  </div>
                  <Button className="w-full" size="sm">
                    Apply Now
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Loan Advice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border" style={{ background: 'color-mix(in oklab, var(--gold) 8%, var(--card))', borderColor: 'color-mix(in oklab, var(--gold) 30%, transparent)' }}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'color-mix(in oklab, var(--gold) 18%, transparent)' }}>
              <ArrowUp className="w-6 h-6 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">💡 AI Recommendation</h3>
              <p className="text-sm text-muted-foreground">
                SBI Personal Loan saves you ₹1,200/month compared to other options. Your credit score qualifies you for the best rates!
              </p>
            </div>
            <Button variant="outline">
              Learn More
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
