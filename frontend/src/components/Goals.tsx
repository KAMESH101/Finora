import { useState } from "react";
import { motion } from "motion/react";
import {
  Plus,
  Target,
  Calendar,
  TrendingUp,
  Sparkles,
  Edit,
  Trash2,
  PartyPopper,
  ShieldAlert,
  Plane,
  Car,
  Home
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import { formatCurrency } from "../mockData";

const goals = [
  {
    id: 1,
    title: 'Emergency Fund',
    target: 200000,
    current: 150000,
    deadline: '2025-12-31',
    autoAllocate: 10000,
    icon: ShieldAlert,
    color: '#1F7A5C',
    milestones: [50000, 100000, 150000, 200000],
  },
  {
    id: 2,
    title: 'Goa Vacation',
    target: 80000,
    current: 45000,
    deadline: '2026-06-01',
    autoAllocate: 5000,
    icon: Plane,
    color: '#2f6690',
    milestones: [20000, 40000, 60000, 80000],
  },
  {
    id: 3,
    title: 'New Car Down Payment',
    target: 300000,
    current: 85000,
    deadline: '2026-12-31',
    autoAllocate: 12000,
    icon: Car,
    color: '#0E2A47',
    milestones: [75000, 150000, 225000, 300000],
  },
  {
    id: 4,
    title: 'Home Renovation',
    target: 500000,
    current: 30000,
    deadline: '2027-03-01',
    autoAllocate: 15000,
    icon: Home,
    color: '#C98A2C',
    milestones: [125000, 250000, 375000, 500000],
  },
];

const CONFETTI_COLORS = ['#C98A2C', '#1F7A5C', '#0E2A47', '#B23A2E'];

export function Goals() {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const getPercentage = (current: number, target: number) => (current / target) * 100;
  const getDaysLeft = (deadline: string) => {
    const today = new Date('2025-10-28');
    const end = new Date(deadline);
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getEstimatedCompletion = (current: number, target: number, monthly: number) => {
    const remaining = target - current;
    const monthsNeeded = Math.ceil(remaining / monthly);
    const today = new Date('2025-10-28');
    const completion = new Date(today.setMonth(today.getMonth() + monthsNeeded));
    return completion.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-auto bg-background">
      <div className="px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1>Financial Goals</h1>
            <p className="text-muted-foreground">Track progress and achieve your dreams</p>
          </div>
          <Button
            onClick={() => setShowAddGoal(true)}
          >
            <Plus size={16} />
            Add Goal
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="card-stat">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target style={{ color: 'var(--ink)' }} size={20} />
                  <div className="text-sm text-muted-foreground">Active Goals</div>
                </div>
                <div className="text-2xl font-display">{goals.length}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-stat">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-money-in" size={20} />
                  <div className="text-sm text-muted-foreground">Total Saved</div>
                </div>
                <div className="text-2xl font-display text-money-in">
                  {formatCurrency(goals.reduce((sum, g) => sum + g.current, 0))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-stat">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Target style={{ color: 'var(--ink)' }} size={20} />
                  <div className="text-sm text-muted-foreground">Total Target</div>
                </div>
                <div className="text-2xl font-display">
                  {formatCurrency(goals.reduce((sum, g) => sum + g.target, 0))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-stat">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-gold" size={20} />
                  <div className="text-sm text-muted-foreground">Monthly Saving</div>
                </div>
                <div className="text-2xl font-display">
                  {formatCurrency(goals.reduce((sum, g) => sum + g.autoAllocate, 0))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Goals Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {goals.map((goal, index) => {
            const percentage = getPercentage(goal.current, goal.target);
            const daysLeft = getDaysLeft(goal.deadline);
            const nextMilestone = goal.milestones.find(m => m > goal.current) || goal.target;
            const milestoneProgress = ((goal.current - (goal.milestones[goal.milestones.findIndex(m => m > goal.current) - 1] || 0)) / (nextMilestone - (goal.milestones[goal.milestones.findIndex(m => m > goal.current) - 1] || 0))) * 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="card-stat overflow-hidden">
                  <CardHeader style={{ background: 'var(--secondary)' }}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center shadow-sm" style={{ color: goal.color }}>
                          <goal.icon size={22} />
                        </div>
                        <div>
                          <CardTitle className="text-base">{goal.title}</CardTitle>
                          <CardDescription>
                            {formatCurrency(goal.current)} of {formatCurrency(goal.target)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info(`✏️ Opening editor for ${goal.title}...`);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.error(`🗑️ Delete ${goal.title}? This action cannot be undone.`);
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                    {/* Main Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-display" style={{ color: goal.color }}>{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </div>

                    {/* Milestone Progress */}
                    <div className="p-3 rounded-lg" style={{ background: 'var(--secondary)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={16} style={{ color: goal.color }} />
                        <span className="text-sm">Next Milestone: {formatCurrency(nextMilestone)}</span>
                      </div>
                      <Progress value={milestoneProgress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(nextMilestone - goal.current)} to go
                      </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Deadline</div>
                        <div className="text-sm flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {daysLeft} days left
                        </p>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Auto-allocate</div>
                        <div className="text-sm">{formatCurrency(goal.autoAllocate)}/month</div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Active rule
                        </p>
                      </div>
                    </div>

                    {/* AI Insight */}
                    <div className="p-3 rounded-lg border" style={{ background: 'color-mix(in oklab, var(--money-in) 8%, var(--card))', borderColor: 'color-mix(in oklab, var(--money-in) 30%, transparent)' }}>
                      <div className="flex items-start gap-2">
                        <Sparkles className="text-money-in flex-shrink-0 mt-0.5" size={16} />
                        <div className="text-xs">
                          <p className="mb-1">AI Projection</p>
                          <p className="text-muted-foreground">
                            At current rate, you'll reach this goal by{' '}
                            <strong>{getEstimatedCompletion(goal.current, goal.target, goal.autoAllocate)}</strong>
                            {daysLeft > 0 && goal.current + (goal.autoAllocate * Math.ceil(daysLeft / 30)) < goal.target && (
                              <span className="text-gold">
                                {' '}(Behind schedule - consider increasing monthly amount)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          if (percentage >= 100) {
                            setShowCelebration(true);
                          } else {
                            toast.success(`💰 Opening fund allocation for ${goal.title}...`);
                          }
                        }}
                      >
                        Add Funds
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => toast.info(`📊 Viewing detailed report for ${goal.title}...`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Add Goal Dialog */}
        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
              <DialogDescription>
                Set up a new financial goal to track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="goalName">Goal Name</Label>
                <Input id="goalName" placeholder="e.g., Dream Vacation" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount ($)</Label>
                <Input id="targetAmount" type="number" placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Target Date</Label>
                <Input id="deadline" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly">Monthly Auto-Allocation ($)</Label>
                <Input id="monthly" type="number" placeholder="200" />
              </div>
              <Button className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Celebration Dialog */}
        <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
          <DialogContent className="max-w-md overflow-hidden">
            <DialogTitle className="sr-only">Goal Achieved</DialogTitle>
            <DialogDescription className="sr-only">
              Congratulations on reaching your financial goal
            </DialogDescription>
            {showCelebration && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div
                    key={i}
                    className="confetti"
                    style={{
                      left: `${(i * 43) % 100}%`,
                      top: '-10px',
                      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                      animationDelay: `${(i % 6) * 0.15}s`,
                      animationDuration: `${1.8 + (i % 5) * 0.3}s`,
                    }}
                  />
                ))}
              </div>
            )}
            <div className="text-center space-y-4 py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14 }}
              >
                <PartyPopper className="mx-auto text-money-in" size={64} />
              </motion.div>
              <h2 className="font-display">Congratulations!</h2>
              <p className="text-muted-foreground">
                You've reached your goal! This is a huge achievement.
              </p>
              <Button
                onClick={() => setShowCelebration(false)}
              >
                Celebrate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
