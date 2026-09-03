# Finora - Login Credentials Guide

## 🔐 How to Login

Finora uses **mobile number + password** authentication for a realistic Indian fintech experience.

---

## 📱 Available Test Users

All users share the same password for easy testing:

**Password:** `password123`

### User Accounts

| Mobile Number | Name | Avatar | UPI ID | Initial Balance |
|--------------|------|--------|--------|----------------|
| **9876543210** | Rahul Sharma | 👨 | rahul.sharma@okaxis | ₹1,25,000 |
| **9876543211** | Priya Patel | 👩 | priya.patel@paytm | ₹98,000 |
| **9876543212** | Amit Kumar | 👨‍💼 | amit.kumar@ybl | ₹1,56,000 |
| **9876543213** | Sneha Singh | 👩‍💼 | sneha.singh@okicici | ₹87,000 |
| **9876543214** | Vikram Reddy | 🧑 | vikram.reddy@paytm | ₹2,10,000 |
| **9876543215** | Anjali Desai | 👩‍🦰 | anjali.desai@okaxis | ₹1,45,000 |
| **9876543216** | Rajesh Gupta | 👨‍🦳 | rajesh.gupta@ybl | ₹1,89,000 |
| **9876543217** | Kavya Nair | 👩‍🎓 | kavya.nair@paytm | ₹72,000 |

---

## 🚀 Quick Start

### Example Login:
```
Mobile Number: 9876543210
Password: password123
```

### Testing P2P Payments:
1. Login as **Rahul Sharma** (9876543210)
2. Go to **Banking & Payments** section
3. Click on **Make Payment**
4. You'll see quick-send buttons for other users
5. Select any user (e.g., Priya Patel 👩)
6. Enter amount and complete payment

---

## ✨ Features to Test After Login

### 1. **Finora Wallet** 💳
- View wallet balance
- Quick pay with QR code
- Transaction history
- Virtual card details

### 2. **P2P Payments** 💸
- Send money to other Finora users
- Auto-fill UPI IDs by selecting users
- Real-time balance updates
- Transaction confirmations

### 3. **SIP Investments** 📈
- Browse mutual funds
- Start a SIP with password authentication
- Compare up to 3 funds
- View projected returns

### 4. **AI Assistant** 🤖
- Get personalized financial insights
- Ask about budgets, expenses, goals
- Natural language processing
- Smart recommendations

### 5. **Dashboard** 📊
- Real-time financial overview
- Spending DNA analysis
- Budget forecasts with AI
- Monthly trend analysis

---

## 🔄 Logout

- Click the **Logout** button in the sidebar
- Confirm logout
- All session data will be cleared
- You can login with a different user account

---

## 💡 Tips

1. **Multiple Users:** You can test P2P payments by logging in with different users in different browser tabs or incognito windows

2. **Data Persistence:** User data is stored in localStorage and persists across sessions until you logout

3. **Password Reset:** For this demo, all passwords are `password123` - no reset functionality needed

4. **Mobile Format:** Enter exactly 10 digits without country code or special characters

---

## 🛡️ Security Note

This is a **demo application** with mock data. In production:
- Passwords would be hashed and salted
- Sessions would use secure tokens
- 2FA would be implemented
- All data would be encrypted
- API calls would be authenticated

---

## 🐛 Troubleshooting

**Can't login?**
- Check that you entered exactly 10 digits
- Ensure password is `password123`
- Clear browser cache if needed

**Balance not updating?**
- Logout and login again
- Check browser console for errors
- Ensure localStorage is enabled

**P2P payment not working?**
- Make sure you're sending to a different user
- Check sufficient balance
- Verify UPI ID is correct

---

**Need help?** Check the other documentation files or contact support.

Made with ❤️ in India
