import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Trophy,
  Target,
  Calendar,
  Coins,
  Flame,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { generateSavingsChallenges } from "../utils/advancedAI";
import { mockData, formatCurrency } from "../mockData";
import { toast } from "sonner@2.0.3";

export function SavingsChallenges() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<Set<string>>(new Set());
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());

  useEffect(() => {
    const generatedChallenges = generateSavingsChallenges(mockData);
    setChallenges(generatedChallenges);
    
    // Load saved progress
    const saved = localStorage.getItem('finai_challenges');
    if (saved) {
      const data = JSON.parse(saved);
      setActiveChallenges(new Set(data.active || []));
      setCompletedChallenges(new Set(data.completed || []));
    }
  }, []);

  const handleStartChallenge = (challengeId: string) => {
    const newActive = new Set(activeChallenges);
    newActive.add(challengeId);
    setActiveChallenges(newActive);
    
    // Save to localStorage
    localStorage.setItem('finai_challenges', JSON.stringify({
      active: Array.from(newActive),
      completed: Array.from(completedChallenges)
    }));
    
    toast.success("🎯 Challenge accepted! Good luck!");
  };

  const handleCompleteChallenge = (challenge: any) => {
    const newActive = new Set(activeChallenges);
    const newCompleted = new Set(completedChallenges);
    
    newActive.delete(challenge.id);
    newCompleted.add(challenge.id);
    
    setActiveChallenges(newActive);
    setCompletedChallenges(newCompleted);
    
    // Save to localStorage
    localStorage.setItem('finai_challenges', JSON.stringify({
      active: Array.from(newActive),
      completed: Array.from(newCompleted)
    }));
    
    // Show celebration
    toast.success(`🎉 Challenge completed! You earned ${challenge.reward} reward points!`, {
      duration: 5000
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-money-in';
      case 'medium': return 'bg-gold';
      case 'hard': return 'bg-money-out';
      default: return 'bg-muted';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return difficulty;
    }
  };

  return (
    <Card className="card-stat">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold" />
            <CardTitle>Savings Challenges</CardTitle>
          </div>
          <Badge variant="outline" className="text-money-in">
            <Coins className="h-3 w-3 mr-1" />
            {Array.from(completedChallenges).reduce((sum, id) => {
              const challenge = challenges.find(c => c.id === id);
              return sum + (challenge?.reward || 0);
            }, 0)} pts
          </Badge>
        </div>
        <CardDescription>
          Complete challenges to save money and earn rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Active Challenges */}
          {Array.from(activeChallenges).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-money-out" />
                <h4 className="text-sm">Active Challenges</h4>
              </div>
              {challenges
                .filter(c => activeChallenges.has(c.id))
                .map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg border-2 border-money-in"
                    style={{ background: 'color-mix(in oklab, var(--money-in) 6%, var(--card))' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{challenge.icon}</span>
                          <h4>{challenge.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {challenge.description}
                        </p>
                      </div>
                    </div>

                    {/* Progress simulation */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span>
                        <span className="text-muted-foreground">2/{challenge.duration} days</span>
                      </div>
                      <Progress value={(2 / challenge.duration) * 100} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          {formatCurrency(challenge.target)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {challenge.duration}d
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteChallenge(challenge)}
                        style={{ background: 'var(--money-in)' }}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Complete
                      </Button>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}

          {/* Available Challenges */}
          <div className="space-y-3">
            <h4 className="text-sm text-muted-foreground">
              {activeChallenges.size > 0 ? 'More Challenges' : 'Available Challenges'}
            </h4>
            {challenges
              .filter(c => !activeChallenges.has(c.id) && !completedChallenges.has(c.id))
              .slice(0, 3)
              .map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="fin-clickable p-4 rounded-lg card-stat"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{challenge.icon}</span>
                        <h4>{challenge.title}</h4>
                        <Badge
                          variant="secondary"
                          className={`${getDifficultyColor(challenge.difficulty)} text-white border-0 text-xs`}
                        >
                          {getDifficultyBadge(challenge.difficulty)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {challenge.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Save {formatCurrency(challenge.target)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {challenge.duration} days
                      </div>
                      <div className="flex items-center gap-1 text-gold">
                        <Coins className="h-3 w-3" />
                        +{challenge.reward} pts
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStartChallenge(challenge.id)}
                    >
                      Start
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}
          </div>

          {/* Completed Challenges Summary */}
          {completedChallenges.size > 0 && (
            <div className="p-4 rounded-lg border" style={{ background: 'color-mix(in oklab, var(--money-in) 8%, var(--card))', borderColor: 'color-mix(in oklab, var(--money-in) 25%, transparent)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-money-in" />
                  <div>
                    <h4>Challenges Completed</h4>
                    <p className="text-xs text-muted-foreground">
                      {completedChallenges.size} challenges · Keep up the great work!
                    </p>
                  </div>
                </div>
                <Trophy className="h-8 w-8 text-gold" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
