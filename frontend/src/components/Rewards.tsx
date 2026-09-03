import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { motion } from "motion/react";
import { mockData, formatCurrency } from "../mockData";
import { Trophy, Target, CheckCircle, Award, Gift, TrendingUp, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner@2.0.3";

export function Rewards() {
  const { rewards } = mockData;
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  const icons = {
    Trophy,
    Target,
    CheckCircle,
    Award
  };

  const handleRedeem = (partner: any) => {
    setSelectedReward(partner);
    setShowRedeemModal(true);
  };

  const handleConfirmRedeem = () => {
    toast.success("🎉 Voucher redeemed successfully! Check your email.");
    setShowRedeemModal(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Rewards & Cashback</h1>
          <p className="text-muted-foreground">Earn rewards for good financial habits</p>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
          className="text-right"
        >
          <div className="text-sm text-muted-foreground">Your Balance</div>
          <div className="text-3xl text-money-in">₹{rewards.balance}</div>
        </motion.div>
      </div>

      {/* Leaderboard Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0" style={{ background: 'linear-gradient(135deg, var(--gold) 0%, #a8721f 100%)' }}>
          <CardContent className="flex items-center justify-between p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <div className="text-2xl mb-1">Rank #{rewards.leaderboard.rank}</div>
                <p className="text-white/90">
                  🔥 You saved more than {rewards.leaderboard.percentile}% of users this month!
                </p>
              </div>
            </div>
            <Button variant="secondary" size="lg">
              View Leaderboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              Recent Rewards Earned
            </CardTitle>
            <CardDescription>Keep up the great work!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rewards.earned.map((reward, index) => {
                const IconComponent = icons[reward.icon as keyof typeof icons] || Award;
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="p-4 border rounded-lg hover-lift bg-gradient-to-br from-card to-accent/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-full bg-money-in/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-money-in" />
                      </div>
                      <Badge className="bg-money-in hover:opacity-90">
                        +{reward.points} pts
                      </Badge>
                    </div>
                    <h4 className="text-sm mb-1">{reward.title}</h4>
                    <p className="text-xs text-muted-foreground">{reward.date}</p>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How to Earn */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--ink)' }} />
              How to Earn Rewards
            </CardTitle>
            <CardDescription>Complete these actions to earn points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center p-6 border rounded-lg hover:border-money-in transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-money-in/10 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-money-in" />
                </div>
                <h4 className="mb-2">Achieve Savings Goals</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Earn +₹100 for each goal milestone reached
                </p>
                <div className="text-2xl text-money-in">+₹100</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center p-6 border rounded-lg hover:border-money-in transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in oklab, var(--ink) 10%, transparent)' }}>
                  <Award className="w-8 h-8" style={{ color: 'var(--ink)' }} />
                </div>
                <h4 className="mb-2">Complete SIP Milestones</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Earn +₹250 for consistent SIP investments
                </p>
                <div className="text-2xl font-display" style={{ color: 'var(--ink)' }}>+₹250</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-center p-6 border rounded-lg hover:border-money-in transition-colors"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gold/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-gold" />
                </div>
                <h4 className="mb-2">Pay Bills On Time</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Earn +₹50 for every on-time payment
                </p>
                <div className="text-2xl text-gold">+₹50</div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cashback Partners */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold" />
              Cashback Partners
            </CardTitle>
            <CardDescription>Redeem your rewards with our partners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rewards.partners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                >
                  <Card className="hover-lift cursor-pointer" onClick={() => handleRedeem(partner)}>
                    <CardContent className="p-6 text-center">
                      <div className="text-6xl mb-4">{partner.logo}</div>
                      <h4 className="mb-2">{partner.name}</h4>
                      <Badge className="bg-money-in hover:opacity-90 mb-4">
                        {partner.cashback} Cashback
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full btn-ripple"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRedeem(partner);
                        }}
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Redeem Now
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
      >
        <Card className="border" style={{ background: 'color-mix(in oklab, var(--money-in) 6%, var(--card))', borderColor: 'color-mix(in oklab, var(--money-in) 25%, transparent)' }}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-full bg-money-in/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-money-in" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1">💡 AI Reward Tip</h3>
              <p className="text-sm text-muted-foreground">
                Invest ₹1,000 more this month to unlock 2X cashback on all partner redemptions!
              </p>
            </div>
            <Button style={{ background: 'var(--money-in)' }}>
              Start SIP
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Redeem Modal */}
      <Dialog open={showRedeemModal} onOpenChange={setShowRedeemModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
            <DialogDescription>
              Confirm your reward redemption
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="text-6xl mb-4">{selectedReward.logo}</div>
                <h3 className="mb-2">{selectedReward.name}</h3>
                <Badge className="bg-money-in text-white border-0">{selectedReward.cashback} Cashback</Badge>
              </div>

              <div className="space-y-3 p-4 bg-accent/50 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reward Points Used</span>
                  <span>500 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Voucher Value</span>
                  <span>₹500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Balance</span>
                  <span className="text-money-in">₹{rewards.balance - 500}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowRedeemModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" style={{ background: 'var(--money-in)' }} onClick={handleConfirmRedeem}>
                  Confirm Redemption
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
