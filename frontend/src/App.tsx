import { useState } from "react";
import { Auth } from "./components/Auth";
import { Navigation } from "./components/Navigation";
import { WalletDashboard } from "./components/WalletDashboard";
import { DashboardEnhanced } from "./components/DashboardEnhanced";
import { BankingPayments } from "./components/BankingPayments";
import { Transactions } from "./components/Transactions";
import { Budgets } from "./components/Budgets";
import { Goals } from "./components/Goals";
import { Investments } from "./components/Investments";
import { CreditScore } from "./components/CreditScore";
import { Loans } from "./components/Loans";
import { MutualFunds } from "./components/MutualFunds";
import { TaxPlanner } from "./components/TaxPlanner";
import { Rewards } from "./components/Rewards";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";
import { AIAssistant } from "./components/AIAssistant";
import { QRScanner } from "./components/QRScanner";
import { BillScanner } from "./components/BillScanner";
import { CouponMarketplace } from "./components/CouponMarketplace";
import { SmartSplit } from "./components/SmartSplit";
import { WhatIfSimulatorEnhanced } from "./components/WhatIfSimulatorEnhanced";
import { GeoSpendingMap } from "./components/GeoSpendingMap";
import { VoicePaymentAssistant } from "./components/VoicePaymentAssistant";
import { Toaster } from "./components/ui/sonner";
import { syncWalletFromServer } from "./utils/walletManager";
import { CreditAlertProvider } from "./contexts/CreditAlertContext";
import { CreditLimitAlertModal } from "./components/CreditLimitAlertModal";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('wallet');
  const [theme, setTheme] = useState('light');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showBillScanner, setShowBillScanner] = useState(false);
  const [showCouponMarketplace, setShowCouponMarketplace] = useState(false);
  const [showSmartSplit, setShowSmartSplit] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showGeoMap, setShowGeoMap] = useState(false);
  const [showVoicePay, setShowVoicePay] = useState(false);

  const handleAuthSuccess = () => {
    localStorage.removeItem('finora_wallet'); // avoid showing a previous account's cached balance
    setIsAuthenticated(true);
    syncWalletFromServer().catch(() => {
      // Non-fatal: components fall back to the last-cached wallet state
    });
  };

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    // Reset state
    setIsAuthenticated(false);
    setCurrentView('wallet');
  };

  const handleNavigate = (view: string) => {
    // Handle hash navigation
    if (view === '#wallet') {
      setCurrentView('wallet');
      window.location.hash = 'wallet';
      return;
    }
    
    // Handle special modals
    if (view === 'scan-pay') {
      setShowQRScanner(true);
    } else if (view === 'bill-scanner') {
      setShowBillScanner(true);
    } else if (view === 'coupon-marketplace') {
      setShowCouponMarketplace(true);
    } else if (view === 'split-bill') {
      setShowSmartSplit(true);
    } else if (view === 'what-if') {
      setShowWhatIf(true);
    } else if (view === 'voice-pay') {
      setShowVoicePay(true);
    } else if (view === 'geo-map' || view === 'geomap') {
      setCurrentView('geomap');
    } else {
      setCurrentView(view);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Auth page view
  if (!isAuthenticated) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Main app view
  return (
    <CreditAlertProvider>
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation 
        currentView={currentView} 
        onViewChange={setCurrentView}
        theme={theme}
        onThemeChange={handleThemeChange}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <main className="flex-1">
          {currentView === 'wallet' && <WalletDashboard onNavigate={handleNavigate} />}
          {currentView === 'geomap' && <GeoSpendingMap onClose={() => setCurrentView('wallet')} />}
          {currentView === 'dashboard' && <DashboardEnhanced />}
          {currentView === 'banking' && <BankingPayments />}
          {currentView === 'transactions' && <Transactions />}
          {currentView === 'budgets' && <Budgets />}
          {currentView === 'goals' && <Goals />}
          {currentView === 'investments' && <Investments />}
          {currentView === 'credit' && <CreditScore />}
          {currentView === 'loans' && <Loans />}
          {currentView === 'mutualfunds' && <MutualFunds />}
          {currentView === 'tax' && <TaxPlanner />}
          {currentView === 'rewards' && <Rewards />}
          {currentView === 'reports' && <Reports />}
          {currentView === 'settings' && <Settings theme={theme} onThemeChange={handleThemeChange} />}
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card py-4 px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>© Finora 2025</span>
              <span className="hidden sm:inline">•</span>
              <span>AI-Powered Finance</span>
            </div>
            <div className="flex items-center gap-4">
              <button className="hover:text-foreground transition-colors">Privacy Policy</button>
              <span>•</span>
              <button className="hover:text-foreground transition-colors">Terms of Service</button>
            </div>
          </div>
        </footer>
      </div>

      {/* AI Chat Assistant - Enhanced NLP Version */}
      <AIAssistant />

      {/* Modals */}
      {showQRScanner && <QRScanner onClose={() => setShowQRScanner(false)} />}
      {showBillScanner && <BillScanner onClose={() => setShowBillScanner(false)} />}
      {showCouponMarketplace && <CouponMarketplace onClose={() => setShowCouponMarketplace(false)} />}
      {showSmartSplit && <SmartSplit onClose={() => setShowSmartSplit(false)} />}
      {showWhatIf && <WhatIfSimulatorEnhanced onClose={() => setShowWhatIf(false)} />}
      {showVoicePay && <VoicePaymentAssistant onClose={() => setShowVoicePay(false)} />}

      {/* Credit limit / utilization alerts */}
      <CreditLimitAlertModal />

      {/* Toast Notifications */}
      <Toaster />
    </div>
    </CreditAlertProvider>
  );
}
