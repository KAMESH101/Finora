import { motion } from "motion/react";
import {
  Shield,
  Sparkles,
  TrendingUp,
  Target,
  PieChart,
  Lock,
  ArrowRight,
  Check
} from "lucide-react";
import { Button } from "./ui/button";

interface LandingProps {
  onGetStarted: () => void;
}

export function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--ink)' }}>
              <span className="text-white font-display">₹</span>
            </div>
            <span className="font-display text-lg" style={{ color: 'var(--ink)' }}>Finora</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Features</a>
            <a href="#security" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Security</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Pricing</a>
            <Button variant="ghost" onClick={onGetStarted}>Sign In</Button>
            <Button onClick={onGetStarted}>
              Get Started
            </Button>
          </div>

          <Button onClick={onGetStarted} className="md:hidden">
            Start
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center mb-4 px-4 py-2 rounded-full text-sm"
                style={{ background: 'var(--secondary)', color: 'var(--ink)' }}
              >
                <Sparkles className="inline mr-2" size={16} />
                AI-powered financial intelligence, built for India
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl mb-6 leading-[1.05]" style={{ color: 'var(--ink)' }}>
                Know your money.<br />
                <span className="text-money-in">Grow your future.</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Link UPI and bank accounts, get AI-driven budgets and investment ideas, and see exactly where every rupee goes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="group"
                >
                  Get Started Free
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onGetStarted}
                >
                  Watch Demo
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="text-money-in" size={18} />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <Check className="text-money-in" size={18} />
                  Bank-level security
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--money-out)' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--gold)' }}></div>
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--money-in)' }}></div>
                </div>

                {/* Mock Dashboard Preview */}
                <div className="space-y-4">
                  <motion.div
                    className="card-hero rounded-xl p-6"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="relative text-sm opacity-80 mb-2">Total Balance</div>
                    <div className="relative balance-figure text-3xl mb-4">₹2,45,824.40</div>
                    <div className="relative flex gap-2 text-sm">
                      <span className="px-3 py-1 bg-white/15 rounded-full">+12.5% this month</span>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div
                      className="card-stat rounded-xl p-4"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    >
                      <TrendingUp className="text-money-in mb-2" size={22} />
                      <div className="text-sm text-muted-foreground">Income</div>
                      <div className="text-xl font-display">₹52,400</div>
                    </motion.div>

                    <motion.div
                      className="card-stat rounded-xl p-4"
                      animate={{ y: [0, -3, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                    >
                      <PieChart className="text-money-out mb-2" size={22} />
                      <div className="text-sm text-muted-foreground">Expenses</div>
                      <div className="text-xl font-display">₹31,240</div>
                    </motion.div>
                  </div>

                  <motion.div
                    className="rounded-xl p-4 border"
                    style={{ background: 'color-mix(in oklab, var(--gold) 10%, var(--card))', borderColor: 'color-mix(in oklab, var(--gold) 35%, transparent)' }}
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="text-gold flex-shrink-0" size={20} />
                      <div>
                        <div className="text-sm mb-1">AI Insight</div>
                        <p className="text-sm text-muted-foreground">
                          You can save ₹4,800 next month by trimming unused subscriptions
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -right-6 bg-card rounded-xl p-4 shadow-xl border border-border"
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Target style={{ color: 'var(--ink)' }} size={32} />
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -left-6 bg-card rounded-xl p-4 shadow-xl border border-border"
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Shield className="text-money-in" size={32} />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-t border-b border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Lock size={18} className="text-money-in" />
              <span>Bank-level encryption</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Shield size={18} style={{ color: 'var(--ink)' }} />
              <span>RBI-aligned data practices</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Check size={18} className="text-gold" />
              <span>1,00,000+ users trust us</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl mb-4" style={{ color: 'var(--ink)' }}>
              Everything you need to master your finances
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI-driven features that work together to give you complete financial clarity
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Smart Categorization",
                description: "AI automatically categorizes transactions and learns your spending patterns",
              },
              {
                icon: TrendingUp,
                title: "Budget Predictions",
                description: "Get accurate forecasts of month-end spending and personalized saving tips",
              },
              {
                icon: Target,
                title: "Goal Tracking",
                description: "Set financial goals and let AI help you achieve them faster",
              },
              {
                icon: PieChart,
                title: "Investment Advice",
                description: "Receive personalized mutual fund and SIP recommendations based on your profile",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Bank-level security with end-to-end encryption for all your data",
              },
              {
                icon: Lock,
                title: "Real-time Insights",
                description: "Get instant notifications and insights about your spending habits",
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className="fin-clickable card-stat rounded-2xl p-6"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--secondary)' }}>
                  <feature.icon style={{ color: 'var(--ink)' }} size={22} />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--ink)' }}>
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl text-white mb-6">
              Ready to take control of your finances?
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already saving smarter and investing better with Finora
            </p>
            <Button
              size="lg"
              onClick={onGetStarted}
              className="!bg-white !text-[color:var(--ink)]"
              style={{ background: '#fff', color: 'var(--ink)' }}
            >
              Get Started Free
              <ArrowRight size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[color:var(--foreground)] text-white py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#0a1420' }}>
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--money-in)' }}>
                  <span className="font-display">₹</span>
                </div>
                <span className="font-display">Finora</span>
              </div>
              <p className="text-white/50 text-sm">
                AI-powered personal finance, built for India
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/40">
            © 2025 Finora. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
