# Finora - AI-Powered Finance & Payment Tracking

## 🎯 Overview
Finora is a comprehensive AI-powered finance and payment tracking web application built with React.js. It features a virtual wallet system, QR scanning, AI-powered insights, coupon marketplace, and predictive analytics - all without real bank API integration.

## ✨ Core Features

### 1. 💰 Virtual Wallet System
- **Initial Balance**: ₹10,000 demo wallet
- **Top-Up Feature**: Add demo money to wallet anytime
- **Real-time Balance**: Live balance updates across all transactions
- **Persistent Storage**: All data stored in localStorage

**How to Use:**
1. Navigate to "Finora Wallet" from the sidebar
2. Click "Top Up" button on the balance card
3. Select amount (₹1000, ₹2000, ₹5000, or ₹10000)
4. Click "Add" to instantly credit your wallet

### 2. 📱 Scan & Pay (QR Code Scanner)
- **QR Code Detection**: Simulated QR scanning for merchants
- **Mock Merchants**: Pre-loaded demo merchants (Chennai Cafe, Mumbai Mart, etc.)
- **Payment Confirmation**: Real-time payment with wallet balance deduction
- **Location Tracking**: Auto-captures transaction location

**How to Use:**
1. Click "Scan & Pay" button on Wallet Dashboard
2. Click "Start Scanning" or select a demo merchant
3. Enter payment amount
4. Confirm payment - balance updates instantly!

### 3. 📸 AI Bill Lens (OCR Scanner)
- **Image Upload**: Upload or capture bill photos
- **AI OCR**: Automatically extracts merchant, amount, and items
- **Auto-Categorization**: Smart category assignment
- **One-Click Logging**: Instantly log extracted transactions

**How to Use:**
1. Click "Scan Bill" from Wallet Dashboard
2. Upload an image or click "Take Photo"
3. AI processes the bill (simulated 2.5s processing)
4. Review extracted details
5. Click "Log Transaction" to add to wallet

### 4. 🧬 Spending DNA Profile
- **Weekly Analysis**: AI analyzes your spending patterns every week
- **Personality Types**: 
  - 🎉 Weekend Warrior - Over 50% weekend spending
  - 🎯 Budget Ninja - Small, smart purchases under ₹200
  - 🍕 Foodie Explorer - Food is top category
  - 😤 Stress Spender - Emotional buying patterns
  - 💎 Savings Champion - Minimal spending, max saving
  - ⚖️ Balanced Spender - Well-distributed spending
- **Health Score**: Financial health rating (0-100)
- **AI Insights**: Personalized recommendations

**How to View:**
- Automatically displayed on Wallet Dashboard
- Updates weekly based on transaction history
- Click "View History" to see past profiles

### 5. 🗺️ GeoSmart Spending Map
- **Visual Heatmap**: See where you spend money geographically
- **Location Markers**: Bubble size = spending amount
- **Top Locations**: List of highest-spending areas
- **Transaction Count**: Number of transactions per location

**How to Use:**
1. Click "Spending Map" from Quick Actions
2. View interactive map with spending hotspots
3. Hover over markers for details
4. See top 5 spending locations below map

### 6. 🎁 Coupon Exchange Marketplace
- **Buy & Sell**: Trade unused coupons with other users
- **AI Auto-Sell**: Automatic listing after 5 days
- **Dynamic Pricing**: AI adjusts prices based on:
  - Days until expiry (< 7 days = 30% off)
  - Popularity score
  - Time listed
- **Finora Credits**: Virtual currency for marketplace
- **Categories**: Shopping, Food, Travel, Entertainment

**How to Use:**
1. Click "Coupon Exchange" from Quick Actions
2. Browse marketplace or view AI recommendations
3. Click "Buy" to purchase with credits (starts with 500 credits)
4. List your coupons: Click "List New Coupon"
5. Enable "AI Auto-Sell" for automatic price optimization

### 7. 👥 SmartSplit AI (Bill Sharing)
- **Group Bills**: Add multiple people to split
- **Item-by-Item**: Track who paid for what
- **AI Fair Split**: Intelligent split calculation
- **Settlement Tracking**: See who owes whom

**How to Use:**
1. Click "Split Bill" from Wallet Dashboard
2. Add people to the group
3. Add expenses with payer information
4. Click "Calculate Fair Split with AI"
5. Review AI suggestions
6. Mark as settled to log transaction

### 8. 🎯 What If? Purchase Simulator
- **Future Prediction**: See impact before you buy
- **7-Day Projection**: Chart showing balance trajectory
- **Risk Assessment**: 
  - 🟢 Safe (>80% balance remaining)
  - 🟡 Caution (50-80%)
  - 🟠 Warning (20-50%)
  - 🔴 Critical (<20%)
- **AI Recommendations**: Personalized advice based on impact
- **Quick Scenarios**: Pre-set amounts (₹500, ₹1000, ₹2500, ₹5000)

**How to Use:**
1. Click "What If?" from Quick Actions
2. Enter purchase amount or use slider
3. Select category
4. View impact analysis and 7-day projection
5. Review AI recommendations
6. Try quick scenario buttons

### 9. 📊 Smart Insights Dashboard
- **Category Breakdown**: Pie chart of spending by category
- **Daily Trend**: Area chart of last 7 days
- **Quick Stats**: Total spent, earned, transaction count
- **Recent Transactions**: Last 5 wallet activities

### 10. 🏆 Gamified Features
- **Spending DNA Badges**: Earn personality badges
- **Financial Health Score**: 0-100 rating
- **Streak Tracking**: Maintain good spending habits
- **Rewards Integration**: Links to existing rewards system

## 🎨 Design Features
- **Futuristic UI**: Glassmorphism effects with neon gradients
- **Motion Animations**: Smooth transitions using Motion/React
- **Gradient Cards**: Blue-to-purple color scheme
- **Responsive**: Mobile-first design
- **Dark Mode**: Full theme support

## 🔧 Technical Implementation

### Technologies Used
- **React.js** - UI framework
- **Motion/React** - Animations
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **localStorage** - Data persistence
- **Lucide React** - Icons

### Key Utils
1. **walletManager.ts**
   - Wallet CRUD operations
   - Auto-categorization engine
   - Transaction management
   - Location tracking

2. **spendingDNA.ts**
   - Pattern analysis algorithms
   - Profile generation logic
   - Mood tracking
   - Weekend vs weekday analysis

3. **couponEngine.ts**
   - Marketplace logic
   - AI auto-sell engine
   - Price adjustment algorithms
   - Recommendation system

### Data Flow
```
User Action → Component → Util Function → localStorage → Event Dispatch → UI Update
```

## 📱 Demo Workflow

### First-Time User Journey
1. **Login** → See Finora branding and auth
2. **Wallet Dashboard** → ₹10,000 initial balance
3. **Top Up** → Add ₹5,000 more
4. **Scan & Pay** → Buy from "Chennai Cafe" for ₹450
5. **View Spending DNA** → Assigned initial profile
6. **Bill Scanner** → Upload a bill, auto-extract & log
7. **Coupon Marketplace** → Browse and buy coupons
8. **SmartSplit** → Create a group bill split
9. **What If?** → Simulate ₹5,000 purchase
10. **Geo Map** → See spending locations

## 🎯 Key Differentiators

### vs Traditional Finance Apps
- ✅ **No Bank Integration Required**: Pure frontend demo
- ✅ **AI-First Design**: Every feature has AI assistance
- ✅ **Gamification**: Fun, engaging UX
- ✅ **Predictive Analytics**: What-if scenarios
- ✅ **Marketplace**: Unique coupon exchange
- ✅ **Location Intelligence**: Geo-based insights

### AI Features
1. **Auto-Categorization**: Merchants → Categories
2. **Spending DNA**: Behavior profiling
3. **Auto-Sell Engine**: Dynamic coupon pricing
4. **Fair Split**: Optimal bill distribution
5. **Predictive Simulator**: Future balance forecasting
6. **Smart Insights**: Context-aware recommendations

## 🚀 Future Enhancements

### Planned Features (from requirements)
1. **Voice Pay** - "Pay ₹200 to Vetri Café"
2. **Gesture Pay** - Shake or tap to confirm
3. **Emotion Insights** - Mood-based spending analysis (already partially implemented)
4. **Advanced OCR** - Real Tesseract.js integration
5. **Real Maps** - Google Maps / Leaflet integration
6. **Social Features** - Friend requests, split history
7. **Notifications** - Spending alerts, bill reminders
8. **Export** - PDF reports, CSV downloads

## 📊 Mock Data

### Sample Transactions
- Pre-loaded demo merchants
- Mock QR codes
- Sample bill images
- Location coordinates for major Indian cities

### Coupon Samples
- Amazon ₹500 off
- Swiggy 40% off
- Flipkart ₹300 cashback

## 🔐 Privacy & Security
- **No PII Collection**: All data stays in browser
- **localStorage Only**: No backend/database
- **Demo Mode**: Clear "this is a demo" messaging
- **Reset Anytime**: Clear localStorage to reset

## 📝 Notes for Developers

### localStorage Keys
- `finora_wallet` - Wallet data
- `finora_coupons` - Marketplace coupons
- `finora_credits` - User credits
- `finora_dna_history` - Spending DNA profiles

### Event Listeners
- `walletUpdate` - Fired on any wallet change
- `couponsUpdate` - Marketplace updates
- `creditsUpdate` - Credit balance changes

### Component Props
Most modal components accept:
```tsx
interface ModalProps {
  onClose: () => void;
}
```

### Adding New Features
1. Create component in `/components`
2. Add util functions in `/utils`
3. Import in `App.tsx`
4. Add navigation trigger
5. Test with mock data

## 🎉 Summary
Finora transforms traditional finance tracking into an engaging, AI-powered experience. With features like Spending DNA profiling, predictive What-If scenarios, and a unique coupon marketplace, it makes financial management fun and insightful. All features work seamlessly with mock data, perfect for demos and prototypes!
