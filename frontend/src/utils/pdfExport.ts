// PDF Export Utility for FinAI India Reports with actual PDF generation
// Maintains proper Indian currency formatting and DD-MM-YYYY date format

import { formatCurrency, formatIndianDate } from '../mockData';

export interface ReportData {
  title: string;
  subtitle?: string;
  generatedDate: Date;
  sections: ReportSection[];
  summary?: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
  };
  userInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  balances?: {
    totalBalance: number;
    savings: number;
    investments: number;
  };
}

export interface ReportSection {
  title: string;
  type: 'table' | 'chart' | 'text' | 'summary';
  data: any;
}

/**
 * Generate actual PDF report with Indian formatting using HTML and browser print API
 * This creates a comprehensive, downloadable PDF with real user data
 */
export async function generatePDFReport(data: ReportData): Promise<void> {
  return new Promise((resolve) => {
    // Create a hidden iframe for PDF generation
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      resolve();
      return;
    }

    // Generate comprehensive HTML for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${data.title}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 40px;
              color: #1a202c;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #1E3A8A;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #1E3A8A;
              font-size: 32px;
              margin-bottom: 10px;
            }
            .header .subtitle {
              color: #64748b;
              font-size: 16px;
              margin-bottom: 5px;
            }
            .header .date {
              color: #94a3b8;
              font-size: 14px;
            }
            .user-info {
              background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 30px;
            }
            .user-info h3 {
              margin-bottom: 10px;
              font-size: 18px;
            }
            .user-info p {
              margin: 5px 0;
              font-size: 14px;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
            }
            .summary-card h4 {
              color: #64748b;
              font-size: 14px;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .summary-card .value {
              color: #1E3A8A;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .summary-card .sub {
              color: #10B981;
              font-size: 14px;
            }
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #1E3A8A;
              font-size: 22px;
              margin-bottom: 20px;
              border-left: 4px solid #10B981;
              padding-left: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              background: white;
            }
            th {
              background: #1E3A8A;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 14px;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            tr:hover {
              background: #f8fafc;
            }
            .amount-positive {
              color: #10B981;
              font-weight: bold;
            }
            .amount-negative {
              color: #EF4444;
              font-weight: bold;
            }
            .insights {
              background: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 20px;
              border-radius: 4px;
              margin-top: 20px;
            }
            .insights h4 {
              color: #92400E;
              margin-bottom: 15px;
              font-size: 16px;
            }
            .insights ul {
              list-style: none;
              padding-left: 0;
            }
            .insights li {
              padding: 8px 0;
              color: #78350F;
              border-bottom: 1px solid #FDE68A;
            }
            .insights li:before {
              content: "💡 ";
              margin-right: 8px;
            }
            .footer {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #94a3b8;
              font-size: 12px;
            }
            @media print {
              body {
                padding: 20px;
              }
              .section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${data.title}</h1>
            ${data.subtitle ? `<div class="subtitle">${data.subtitle}</div>` : ''}
            <div class="date">Generated on ${formatIndianDate(data.generatedDate)}</div>
          </div>

          ${data.userInfo ? `
            <div class="user-info">
              <h3>Account Information</h3>
              <p><strong>Name:</strong> ${data.userInfo.name}</p>
              <p><strong>Email:</strong> ${data.userInfo.email}</p>
              <p><strong>Phone:</strong> ${data.userInfo.phone}</p>
            </div>
          ` : ''}

          ${data.summary ? `
            <div class="summary-cards">
              <div class="summary-card">
                <h4>Total Income</h4>
                <div class="value">${formatCurrency(data.summary.totalIncome)}</div>
                <div class="sub">Last 7 Months</div>
              </div>
              <div class="summary-card">
                <h4>Total Expenses</h4>
                <div class="value">${formatCurrency(data.summary.totalExpenses)}</div>
                <div class="sub">Last 7 Months</div>
              </div>
              <div class="summary-card">
                <h4>Net Savings</h4>
                <div class="value">${formatCurrency(data.summary.netSavings)}</div>
                <div class="sub">${data.summary.savingsRate}% Savings Rate</div>
              </div>
            </div>
          ` : ''}

          ${data.balances ? `
            <div class="summary-cards">
              <div class="summary-card">
                <h4>Total Balance</h4>
                <div class="value">${formatCurrency(data.balances.totalBalance)}</div>
                <div class="sub">Across All Accounts</div>
              </div>
              <div class="summary-card">
                <h4>Savings</h4>
                <div class="value">${formatCurrency(data.balances.savings)}</div>
                <div class="sub">Safe & Secure</div>
              </div>
              <div class="summary-card">
                <h4>Investments</h4>
                <div class="value">${formatCurrency(data.balances.investments)}</div>
                <div class="sub">Growing Assets</div>
              </div>
            </div>
          ` : ''}

          ${data.sections.map(section => {
            if (section.type === 'table') {
              const rows = Array.isArray(section.data) ? section.data : [];
              if (rows.length === 0) return '';
              
              const headers = Object.keys(rows[0]);
              
              return `
                <div class="section">
                  <h2>${section.title}</h2>
                  <table>
                    <thead>
                      <tr>
                        ${headers.map(header => `<th>${header}</th>`).join('')}
                      </tr>
                    </thead>
                    <tbody>
                      ${rows.map(row => `
                        <tr>
                          ${headers.map(header => {
                            const value = row[header];
                            let className = '';
                            if (typeof value === 'string' && value.startsWith('₹')) {
                              const numValue = parseFloat(value.replace(/[₹,]/g, ''));
                              className = numValue > 0 ? 'amount-positive' : '';
                            }
                            return `<td class="${className}">${value}</td>`;
                          }).join('')}
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `;
            }
            return '';
          }).join('')}

          <div class="insights">
            <h4>🎯 Financial Insights & Recommendations</h4>
            <ul>
              <li>You've maintained a healthy savings rate throughout the year</li>
              <li>Consider investing surplus funds in SIPs for long-term wealth creation</li>
              <li>Your spending patterns show discipline in budgeting</li>
              <li>Emergency fund is on track - keep building it consistently</li>
            </ul>
          </div>

          <div class="footer">
            <p><strong>FinAI India</strong> - Your Intelligent Financial Companion</p>
            <p>This report is confidential and intended for your personal use only.</p>
            <p>Report generated on ${formatIndianDate(new Date())} | All amounts in Indian Rupees (₹)</p>
          </div>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();

    // Wait for content to load, then trigger print
    iframe.contentWindow?.addEventListener('load', () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        
        // Clean up after a delay
        setTimeout(() => {
          document.body.removeChild(iframe);
          resolve();
        }, 1000);
      }, 500);
    });
  });
}

/**
 * Generate Excel report with Indian formatting
 */
export async function generateExcelReport(data: ReportData): Promise<void> {
  return new Promise((resolve) => {
    // Create CSV content (Excel compatible)
    let csvContent = `${data.title}\n`;
    csvContent += `Generated: ${formatIndianDate(data.generatedDate)}\n\n`;
    
    if (data.summary) {
      csvContent += `FINANCIAL SUMMARY\n`;
      csvContent += `Total Income,${formatCurrency(data.summary.totalIncome)}\n`;
      csvContent += `Total Expenses,${formatCurrency(data.summary.totalExpenses)}\n`;
      csvContent += `Net Savings,${formatCurrency(data.summary.netSavings)}\n`;
      csvContent += `Savings Rate,${data.summary.savingsRate}%\n\n`;
    }
    
    data.sections.forEach(section => {
      if (section.type === 'table' && Array.isArray(section.data) && section.data.length > 0) {
        csvContent += `\n${section.title}\n`;
        const headers = Object.keys(section.data[0]);
        csvContent += headers.join(',') + '\n';
        section.data.forEach(row => {
          csvContent += headers.map(h => `"${row[h]}"`).join(',') + '\n';
        });
      }
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `FinAI_Report_${formatIndianDate(new Date()).replace(/\//g, '-')}.csv`);
    
    setTimeout(resolve, 500);
  });
}

/**
 * Generate Word report with Indian formatting
 */
export async function generateWordReport(data: ReportData): Promise<void> {
  return new Promise((resolve) => {
    // Create HTML content for Word
    let htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${data.title}</title></head>
      <body>
        <h1>${data.title}</h1>
        <p>Generated: ${formatIndianDate(data.generatedDate)}</p>
        <hr/>
    `;
    
    if (data.summary) {
      htmlContent += `
        <h2>Financial Summary</h2>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr><td><strong>Total Income</strong></td><td>${formatCurrency(data.summary.totalIncome)}</td></tr>
          <tr><td><strong>Total Expenses</strong></td><td>${formatCurrency(data.summary.totalExpenses)}</td></tr>
          <tr><td><strong>Net Savings</strong></td><td>${formatCurrency(data.summary.netSavings)}</td></tr>
          <tr><td><strong>Savings Rate</strong></td><td>${data.summary.savingsRate}%</td></tr>
        </table>
        <br/>
      `;
    }
    
    data.sections.forEach(section => {
      if (section.type === 'table' && Array.isArray(section.data) && section.data.length > 0) {
        htmlContent += `<h2>${section.title}</h2>`;
        htmlContent += `<table border="1" cellpadding="5" cellspacing="0">`;
        const headers = Object.keys(section.data[0]);
        htmlContent += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
        section.data.forEach(row => {
          htmlContent += '<tr>' + headers.map(h => `<td>${row[h]}</td>`).join('') + '</tr>';
        });
        htmlContent += '</table><br/>';
      }
    });
    
    htmlContent += '</body></html>';

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    downloadFile(blob, `FinAI_Report_${formatIndianDate(new Date()).replace(/\//g, '-')}.doc`);
    
    setTimeout(resolve, 500);
  });
}

/**
 * Generate CSV report with Indian formatting
 */
export async function generateCSVReport(data: any[]): Promise<string> {
  if (!data || data.length === 0) {
    return 'No data available';
  }
  
  // Convert data to CSV with Indian number formatting
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'number') {
          // Format numbers in Indian style
          return `"${value.toLocaleString('en-IN')}"`;
        }
        if (value instanceof Date) {
          return `"${formatIndianDate(value)}"`;
        }
        return `"${value}"`;
      }).join(',')
    )
  ].join('\n');
  
  return csv;
}

/**
 * Download file to user's computer
 */
export function downloadFile(content: Blob | string, filename: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Create comprehensive financial report with real-time data
 */
export function createFinancialReport(mockData: any): ReportData {
  const { monthlyTrend, yearlyComparison, balances, transactions, user, bankAccounts } = mockData;
  
  const totalIncome = monthlyTrend.reduce((sum: number, month: any) => sum + month.income, 0);
  const totalExpenses = monthlyTrend.reduce((sum: number, month: any) => sum + month.expenses, 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = (netSavings / totalIncome) * 100;
  
  // Calculate total balance from bank accounts
  const totalBalance = bankAccounts.reduce((sum: any, acc: any) => sum + acc.balance, 0);

  return {
    title: 'FinAI India - Financial Report',
    subtitle: 'Comprehensive Financial Analysis & Insights',
    generatedDate: new Date(),
    userInfo: {
      name: user.name,
      email: user.email,
      phone: user.phone
    },
    summary: {
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate: Math.round(savingsRate)
    },
    balances: {
      totalBalance,
      savings: balances.savings,
      investments: balances.investments
    },
    sections: [
      {
        title: 'Monthly Trend Analysis (Last 7 Months)',
        type: 'table',
        data: monthlyTrend.map((month: any) => ({
          Month: month.month,
          Income: formatCurrency(month.income),
          Expenses: formatCurrency(month.expenses),
          Savings: formatCurrency(month.savings),
          'Savings %': `${((month.savings / month.income) * 100).toFixed(1)}%`
        }))
      },
      {
        title: 'Recent Transactions (Last 10)',
        type: 'table',
        data: transactions.slice(0, 10).map((tx: any) => {
          const txDate = new Date(2025, 9, parseInt(tx.date.split(' ')[0]));
          return {
            Date: formatIndianDate(txDate),
            Merchant: tx.merchant,
            Category: tx.category,
            Amount: formatCurrency(tx.amount),
            Mode: tx.mode
          };
        })
      },
      {
        title: 'Bank Accounts Summary',
        type: 'table',
        data: bankAccounts.map((acc: any) => ({
          'Bank Name': acc.bankName,
          'Account Type': acc.accountType.charAt(0).toUpperCase() + acc.accountType.slice(1),
          'Account Number': acc.accountNumber,
          'Balance': formatCurrency(acc.balance),
          'Status': acc.status.toUpperCase()
        }))
      },
      {
        title: 'Year-over-Year Comparison',
        type: 'table',
        data: yearlyComparison.map((item: any) => ({
          Category: item.category,
          Amount: formatCurrency(item.value),
          'YoY Change': `${item.change > 0 ? '+' : ''}${item.change}%`
        }))
      }
    ]
  };
}

/**
 * Export transaction data with offline support
 */
export function exportTransactionsOffline(transactions: any[]): void {
  const csvData = transactions.map(tx => ({
    Date: formatIndianDate(new Date(2025, 9, parseInt(tx.date.split(' ')[0]))),
    Merchant: tx.merchant,
    Category: tx.category,
    Amount: formatCurrency(tx.amount),
    Mode: tx.mode,
    Status: tx.status
  }));

  // Store in localStorage for offline access
  try {
    localStorage.setItem('finai_transactions_backup', JSON.stringify(csvData));
    console.log('Transactions saved for offline access');
  } catch (error) {
    console.error('Failed to save for offline access:', error);
  }
}

/**
 * Load offline data
 */
export function loadOfflineData(): any[] | null {
  try {
    const data = localStorage.getItem('finai_transactions_backup');
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load offline data:', error);
    return null;
  }
}
