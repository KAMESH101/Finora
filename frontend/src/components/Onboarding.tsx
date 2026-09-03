import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Progress } from "./ui/progress";
import { 
  Building2, 
  Target, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  ArrowLeft
} from "lucide-react";

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function Onboarding({ isOpen, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bank: '',
    goal: '',
    goalAmount: '',
    riskProfile: 'moderate'
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="sr-only">
          {step === 1 && "Connect Your Bank"}
          {step === 2 && "Set Your Financial Goal"}
          {step === 3 && "Choose Your Risk Profile"}
          {step === 4 && "You're All Set!"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Complete the onboarding process to set up your FinAI account
        </DialogDescription>
        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center">
                    <Building2 className="text-indigo-600" size={32} />
                  </div>
                  <h2>Connect Your Bank</h2>
                  <p className="text-muted-foreground">
                    Securely link your bank account to get started. We use bank-level encryption.
                  </p>
                </div>

                <div className="space-y-3">
                  {['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank', 'Other'].map((bank) => (
                    <button
                      key={bank}
                      onClick={() => setFormData({ ...formData, bank })}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        formData.bank === bank
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Building2 size={24} />
                          <span>{bank}</span>
                        </div>
                        {formData.bank === bank && (
                          <CheckCircle2 className="text-indigo-600" size={20} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                    <Target className="text-emerald-600" size={32} />
                  </div>
                  <h2>Set Your Financial Goal</h2>
                  <p className="text-muted-foreground">
                    What would you like to achieve? We'll help you get there.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal">Goal Type</Label>
                    <select
                      id="goal"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full p-3 rounded-lg border border-gray-200 bg-white"
                    >
                      <option value="">Select a goal</option>
                      <option value="emergency">Emergency Fund</option>
                      <option value="vacation">Vacation</option>
                      <option value="house">Buy a House</option>
                      <option value="car">Buy a Car</option>
                      <option value="retirement">Retirement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Target Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="10,000"
                      value={formData.goalAmount}
                      onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                      className="text-lg"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={32} />
                  </div>
                  <h2>Choose Your Risk Profile</h2>
                  <p className="text-muted-foreground">
                    This helps us provide personalized investment recommendations
                  </p>
                </div>

                <RadioGroup
                  value={formData.riskProfile}
                  onValueChange={(value) => setFormData({ ...formData, riskProfile: value })}
                  className="space-y-3"
                >
                  {[
                    {
                      value: 'conservative',
                      label: 'Conservative',
                      description: 'Prioritize capital preservation with minimal risk'
                    },
                    {
                      value: 'moderate',
                      label: 'Moderate',
                      description: 'Balance growth and stability with calculated risks'
                    },
                    {
                      value: 'aggressive',
                      label: 'Aggressive',
                      description: 'Maximize returns with higher risk tolerance'
                    }
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.riskProfile === option.value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <RadioGroupItem value={option.value} className="mt-1" />
                      <div>
                        <div>{option.label}</div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center"
                  >
                    <CheckCircle2 className="text-emerald-600" size={40} />
                  </motion.div>
                  <h2>You're All Set!</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your FinAI account is ready. Let's start analyzing your finances and finding ways to save.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 space-y-3">
                  <h3>What&apos;s Next?</h3>
                  <ul className="space-y-2">
                    {[
                      'AI will analyze your spending patterns',
                      'You&apos;ll receive personalized budget recommendations',
                      'Get insights on how to reach your goals faster',
                      'Track your progress with real-time updates'
                    ].map((item, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={16} />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={step === 1}
            >
              <ArrowLeft className="mr-2" size={16} />
              Back
            </Button>
            <Button
              onClick={nextStep}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {step === totalSteps ? 'Get Started' : 'Continue'}
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
