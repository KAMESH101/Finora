import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { motion } from "motion/react";
import { Eye, EyeOff, Mail, Phone, Lock, User, CreditCard, CheckCircle, Home, Car, Plane, GraduationCap, PiggyBank, LineChart } from "lucide-react";
import { toast } from "sonner";
import { displayProfileFor } from "../mockUsers";
import { loginUser, signupUser } from "../utils/authAPI";

interface AuthProps {
  onAuthSuccess: () => void;
}

const MOBILE_PATTERN = /^\d{10}$/;

const GOALS = [
  { label: "Buy a Home", icon: Home },
  { label: "Buy a Car", icon: Car },
  { label: "Dream Vacation", icon: Plane },
  { label: "Education", icon: GraduationCap },
  { label: "Emergency Fund", icon: PiggyBank },
  { label: "Wealth Building", icon: LineChart },
];

export function Auth({ onAuthSuccess }: AuthProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const mobile = (formData.get('mobile') as string || '').trim();
    const password = (formData.get('password') as string || '');

    if (!mobile || !password) {
      toast.error('Please enter mobile number and password');
      return;
    }

    if (!MOBILE_PATTERN.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number (no +91, spaces, or dashes)');
      return;
    }

    setIsLoading(true);
    try {
      const { access_token, refresh_token, user } = await loginUser(mobile, password);
      const { avatar, upiId } = displayProfileFor(user.name, user.mobile);

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('userMobile', user.mobile);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userUPI', upiId);
      localStorage.setItem('userAvatar', avatar);

      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      onAuthSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid mobile number or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = (formData.get('name') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const mobile = (formData.get('mobile') as string || '').trim();
    const password = (formData.get('password') as string || '');

    if (!MOBILE_PATTERN.test(mobile)) {
      toast.error('Please enter a valid 10-digit mobile number (no +91, spaces, or dashes)');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await signupUser({ name, email, mobile, password });
      const { access_token, refresh_token, user } = await loginUser(mobile, password);
      const { avatar, upiId } = displayProfileFor(user.name, user.mobile);

      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('refreshToken', refresh_token);
      localStorage.setItem('userMobile', user.mobile);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userUPI', upiId);
      localStorage.setItem('userAvatar', avatar);

      toast.success('Account created! Let\'s set things up.');
      setShowOnboarding(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      toast.success("Welcome to Finora!");
      setTimeout(() => {
        onAuthSuccess();
      }, 400);
    }
  };

  const handleForgotPassword = () => {
    toast.info("Password reset via OTP isn't available yet. Coming soon!");
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full max-w-2xl"
        >
          <Card className="border border-border shadow-xl">
            <CardHeader>
              <div className="flex items-center gap-2 mb-1">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className="h-1.5 flex-1 rounded-full transition-colors duration-300"
                    style={{ background: step <= onboardingStep ? 'var(--money-in)' : 'var(--muted)' }}
                  />
                ))}
              </div>
              <CardTitle className="font-display">Set up your account — Step {onboardingStep} of 3</CardTitle>
              <CardDescription>Let's personalize your Finora experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {onboardingStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="text-center py-8">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'color-mix(in oklab, var(--money-in) 14%, transparent)' }}
                    >
                      {isLinking ? (
                        <span className="fin-btn-spinner text-money-in" style={{ width: '1.75rem', height: '1.75rem' }} />
                      ) : (
                        <CheckCircle className="w-8 h-8 text-money-in" />
                      )}
                    </div>
                    <h3 className="mb-2">Link your bank account</h3>
                    <p className="text-muted-foreground mb-6">Securely connect your bank for automatic sync</p>
                    <Button
                      loading={isLinking}
                      onClick={() => {
                        setIsLinking(true);
                        setTimeout(() => {
                          setIsLinking(false);
                          toast.success("Bank linked successfully!");
                          handleOnboardingNext();
                        }, 1600);
                      }}
                    >
                      {isLinking ? "Linking..." : "Connect Bank Account"}
                    </Button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="mb-4">Select your financial goals</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {GOALS.map((goal) => (
                      <button
                        key={goal.label}
                        type="button"
                        className="fin-clickable card-stat h-20 rounded-xl flex flex-col items-center justify-center gap-1.5 text-sm"
                      >
                        <goal.icon className="w-5 h-5 text-money-in" />
                        {goal.label}
                      </button>
                    ))}
                  </div>
                  <Button className="w-full mt-6" onClick={handleOnboardingNext}>
                    Continue
                  </Button>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <h3 className="mb-4">Customize your dashboard</h3>
                  <div className="space-y-2">
                    {["Show total balance", "Display AI insights", "Enable spending alerts", "Show investment portfolio", "Track credit score"].map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-secondary transition-colors">
                        <Checkbox defaultChecked id={option} />
                        <label htmlFor={option} className="cursor-pointer flex-1 text-sm">
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full mt-6" onClick={handleOnboardingNext}>
                    Complete Setup
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <img
            src="/finora-logo.png"
            alt="Finora"
            className="h-20 w-auto mx-auto mb-3 object-contain"
          />
          <p className="text-muted-foreground text-sm">AI-powered finance & payment tracking</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card className="border border-border shadow-md">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Login to your Finora account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-mobile">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-mobile"
                        name="mobile"
                        type="tel"
                        inputMode="numeric"
                        placeholder="9876543210"
                        className="pl-10"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="link"
                    className="text-sm p-0 h-auto"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </Button>

                  <Button type="submit" className="w-full" loading={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button type="button" variant="outline" onClick={() => toast.info("UPI login coming soon!")}>
                      <CreditCard className="w-4 h-4" />
                      UPI ID
                    </Button>
                    <Button type="button" variant="outline" onClick={() => toast.info("Google login coming soon!")}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card className="border border-border shadow-md">
              <CardHeader>
                <CardTitle>Create account</CardTitle>
                <CardDescription>Join thousands of Indians managing finances smartly</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        name="name"
                        type="text"
                        placeholder="Neeru Sharma"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        name="email"
                        type="email"
                        placeholder="neeru@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-phone"
                        name="mobile"
                        type="tel"
                        inputMode="numeric"
                        placeholder="9876543210"
                        className="pl-10"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-pan">PAN Card</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-pan"
                        type="text"
                        placeholder="ABCDE1234F"
                        className="pl-10 uppercase"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password (min. 6 characters)"
                        className="pl-10 pr-10"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" required />
                    <label htmlFor="terms" className="text-sm">
                      I agree to RBI-compliant{" "}
                      <button type="button" className="underline" style={{ color: 'var(--ink)' }}>
                        Terms & Conditions
                      </button>
                    </label>
                  </div>

                  <Button type="submit" className="w-full" loading={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
