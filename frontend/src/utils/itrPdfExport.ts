// ITR Summary PDF Export for Finora
import { formatCurrency, formatIndianDate } from '../mockData';

export interface ITRData {
  assessmentYear: string;
  financialYear: string;
  income: number;
  deductions: number;
  taxableIncome: number;
  taxPayable: number;
  deductionBreakdown: Array<{
    section: string;
    amount: number;
    description: string;
  }>;
  taxBreakdown: Array<{
    range: string;
    taxableAmount: number;
    rate: number;
    tax: number;
  }>;
  userInfo: {
    name: string;
    pan: string;
    email: string;
    phone: string;
  };
}

export async function generateITRPDF(data: ITRData): Promise<void> {
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

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>ITR Summary - ${data.assessmentYear}</title>
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
              background: linear-gradient(135deg, #1E3A8A 0%, #10B981 100%);
              color: white;
              padding: 30px;
              border-radius: 8px;
            }
            .header h1 {
              font-size: 32px;
              margin-bottom: 10px;
            }
            .header .subtitle {
              font-size: 18px;
              margin-bottom: 5px;
            }
            .header .date {
              font-size: 14px;
              opacity: 0.9;
            }
            .user-section {
              background: #f8fafc;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              padding: 25px;
              margin-bottom: 30px;
            }
            .user-section h2 {
              color: #1E3A8A;
              font-size: 20px;
              margin-bottom: 15px;
              border-bottom: 2px solid #10B981;
              padding-bottom: 10px;
            }
            .user-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .user-item {
              display: flex;
              justify-content: space-between;
              padding: 10px;
              background: white;
              border-radius: 4px;
            }
            .user-item label {
              color: #64748b;
              font-weight: 600;
            }
            .user-item span {
              color: #1a202c;
              font-weight: bold;
            }
            .summary-cards {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              border: 2px solid #cbd5e1;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
            }
            .summary-card.primary {
              background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%);
              color: white;
              border-color: #1E3A8A;
            }
            .summary-card.success {
              background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
              color: white;
              border-color: #10B981;
            }
            .summary-card.warning {
              background: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
              color: white;
              border-color: #F59E0B;
            }
            .summary-card.danger {
              background: linear-gradient(135deg, #EF4444 0%, #F87171 100%);
              color: white;
              border-color: #EF4444;
            }
            .summary-card h4 {
              font-size: 12px;
              margin-bottom: 10px;
              text-transform: uppercase;
              opacity: 0.9;
            }
            .summary-card .value {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
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
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th {
              background: #1E3A8A;
              color: white;
              padding: 15px;
              text-align: left;
              font-size: 14px;
              font-weight: 600;
            }
            td {
              padding: 15px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 14px;
            }
            tr:hover {
              background: #f8fafc;
            }
            .amount-green {
              color: #10B981;
              font-weight: bold;
            }
            .amount-red {
              color: #EF4444;
              font-weight: bold;
            }
            .highlight-box {
              background: #FEF3C7;
              border-left: 4px solid #F59E0B;
              padding: 20px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .highlight-box h4 {
              color: #92400E;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .highlight-box p {
              color: #78350F;
              font-size: 14px;
              line-height: 1.8;
            }
            .info-box {
              background: #DBEAFE;
              border-left: 4px solid #3B82F6;
              padding: 20px;
              border-radius: 4px;
              margin: 20px 0;
            }
            .info-box h4 {
              color: #1E40AF;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .info-box ul {
              list-style: none;
              padding-left: 0;
            }
            .info-box li {
              padding: 8px 0;
              color: #1E3A8A;
              border-bottom: 1px solid #BFDBFE;
            }
            .info-box li:before {
              content: "✓ ";
              color: #10B981;
              font-weight: bold;
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
            .footer strong {
              color: #1E3A8A;
              font-size: 14px;
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
            <h1>🇮🇳 Income Tax Return Summary</h1>
            <div class="subtitle">Assessment Year: ${data.assessmentYear}</div>
            <div class="date">Financial Year: ${data.financialYear}</div>
            <div class="date">Generated on ${formatIndianDate(new Date())}</div>
          </div>

          <div class="user-section">
            <h2>Taxpayer Information</h2>
            <div class="user-grid">
              <div class="user-item">
                <label>Name:</label>
                <span>${data.userInfo.name}</span>
              </div>
              <div class="user-item">
                <label>PAN:</label>
                <span>${data.userInfo.pan}</span>
              </div>
              <div class="user-item">
                <label>Email:</label>
                <span>${data.userInfo.email}</span>
              </div>
              <div class="user-item">
                <label>Phone:</label>
                <span>${data.userInfo.phone}</span>
              </div>
            </div>
          </div>

          <div class="summary-cards">
            <div class="summary-card primary">
              <h4>Gross Total Income</h4>
              <div class="value">${formatCurrency(data.income)}</div>
            </div>
            <div class="summary-card success">
              <h4>Total Deductions</h4>
              <div class="value">${formatCurrency(data.deductions)}</div>
            </div>
            <div class="summary-card warning">
              <h4>Taxable Income</h4>
              <div class="value">${formatCurrency(data.taxableIncome)}</div>
            </div>
            <div class="summary-card danger">
              <h4>Tax Payable</h4>
              <div class="value">${formatCurrency(data.taxPayable)}</div>
            </div>
          </div>

          <div class="section">
            <h2>Income Details</h2>
            <table>
              <thead>
                <tr>
                  <th>Income Head</th>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Salary Income</td>
                  <td>Income from employment</td>
                  <td style="text-align: right;" class="amount-green">${formatCurrency(data.income)}</td>
                </tr>
                <tr style="background: #f8fafc;">
                  <td colspan="2"><strong>Gross Total Income</strong></td>
                  <td style="text-align: right;"><strong>${formatCurrency(data.income)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Deductions Claimed (Chapter VI-A)</h2>
            <table>
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.deductionBreakdown.map(deduction => `
                  <tr>
                    <td><strong>${deduction.section}</strong></td>
                    <td>${deduction.description}</td>
                    <td style="text-align: right;" class="amount-green">${formatCurrency(deduction.amount)}</td>
                  </tr>
                `).join('')}
                <tr style="background: #f8fafc;">
                  <td colspan="2"><strong>Total Deductions</strong></td>
                  <td style="text-align: right;"><strong class="amount-green">${formatCurrency(data.deductions)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="highlight-box">
            <h4>💡 Taxable Income Computation</h4>
            <p>
              <strong>Gross Total Income:</strong> ${formatCurrency(data.income)}<br>
              <strong>Less:</strong> Deductions under Chapter VI-A: ${formatCurrency(data.deductions)}<br>
              <strong>Equals:</strong> Taxable Income: <strong>${formatCurrency(data.taxableIncome)}</strong>
            </p>
          </div>

          <div class="section">
            <h2>Tax Computation (New Tax Regime)</h2>
            <table>
              <thead>
                <tr>
                  <th>Income Slab</th>
                  <th style="text-align: right;">Taxable Amount</th>
                  <th style="text-align: center;">Rate</th>
                  <th style="text-align: right;">Tax</th>
                </tr>
              </thead>
              <tbody>
                ${data.taxBreakdown.map(bracket => `
                  <tr>
                    <td>${bracket.range}</td>
                    <td style="text-align: right;">${formatCurrency(bracket.taxableAmount)}</td>
                    <td style="text-align: center;">${bracket.rate}%</td>
                    <td style="text-align: right;" class="amount-red">${formatCurrency(bracket.tax)}</td>
                  </tr>
                `).join('')}
                <tr style="background: #FEF2F2;">
                  <td colspan="3"><strong>Total Tax on Income</strong></td>
                  <td style="text-align: right;"><strong class="amount-red">${formatCurrency(data.taxPayable)}</strong></td>
                </tr>
                <tr>
                  <td colspan="3">Add: Health & Education Cess @ 4%</td>
                  <td style="text-align: right;">${formatCurrency(data.taxPayable * 0.04)}</td>
                </tr>
                <tr style="background: #FEE2E2;">
                  <td colspan="3"><strong>Total Tax Payable</strong></td>
                  <td style="text-align: right;"><strong class="amount-red">${formatCurrency(data.taxPayable * 1.04)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="info-box">
            <h4>📋 Important Notes</h4>
            <ul>
              <li>This is a summary report for reference purposes only</li>
              <li>Please verify all details before filing your ITR</li>
              <li>Tax computed under New Tax Regime (applicable from FY 2023-24)</li>
              <li>Health and Education Cess @ 4% is applicable on total tax</li>
              <li>TDS/Advance Tax payments not reflected in this summary</li>
              <li>For official filing, use the Income Tax Department's e-filing portal</li>
            </ul>
          </div>

          <div class="highlight-box">
            <h4>💰 Tax Saving Opportunities</h4>
            <p>
              Based on your income profile, you could potentially save more tax by:
              <br><br>
              • Maximizing deductions under Section 80C (up to ₹1,50,000)<br>
              • Claiming NPS contributions under 80CCD(1B) (additional ₹50,000)<br>
              • Health insurance premium under 80D (up to ₹25,000)<br>
              • Home loan interest under Section 24(b) (up to ₹2,00,000)<br>
              • Consider consulting a tax advisor for personalized advice
            </p>
          </div>

          <div class="footer">
            <p><strong>Finora</strong> - AI-Powered Finance & Payment Tracking</p>
            <p>This report is system-generated and for informational purposes only.</p>
            <p>For official tax filing, please visit: <strong>www.incometax.gov.in</strong></p>
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

export function calculateTaxBreakdown(taxableIncome: number): Array<{
  range: string;
  taxableAmount: number;
  rate: number;
  tax: number;
}> {
  const breakdown = [];
  
  // ₹0 - ₹3L (0%)
  if (taxableIncome > 0) {
    const amount = Math.min(taxableIncome, 300000);
    breakdown.push({
      range: '₹0 - ₹3,00,000',
      taxableAmount: amount,
      rate: 0,
      tax: 0
    });
  }
  
  // ₹3L - ₹6L (5%)
  if (taxableIncome > 300000) {
    const amount = Math.min(taxableIncome - 300000, 300000);
    breakdown.push({
      range: '₹3,00,001 - ₹6,00,000',
      taxableAmount: amount,
      rate: 5,
      tax: amount * 0.05
    });
  }
  
  // ₹6L - ₹9L (10%)
  if (taxableIncome > 600000) {
    const amount = Math.min(taxableIncome - 600000, 300000);
    breakdown.push({
      range: '₹6,00,001 - ₹9,00,000',
      taxableAmount: amount,
      rate: 10,
      tax: amount * 0.10
    });
  }
  
  // ₹9L - ₹12L (15%)
  if (taxableIncome > 900000) {
    const amount = Math.min(taxableIncome - 900000, 300000);
    breakdown.push({
      range: '₹9,00,001 - ₹12,00,000',
      taxableAmount: amount,
      rate: 15,
      tax: amount * 0.15
    });
  }
  
  // ₹12L - ₹15L (20%)
  if (taxableIncome > 1200000) {
    const amount = Math.min(taxableIncome - 1200000, 300000);
    breakdown.push({
      range: '₹12,00,001 - ₹15,00,000',
      taxableAmount: amount,
      rate: 20,
      tax: amount * 0.20
    });
  }
  
  // Above ₹15L (30%)
  if (taxableIncome > 1500000) {
    const amount = taxableIncome - 1500000;
    breakdown.push({
      range: 'Above ₹15,00,000',
      taxableAmount: amount,
      rate: 30,
      tax: amount * 0.30
    });
  }
  
  return breakdown;
}
