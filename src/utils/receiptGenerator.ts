import RNPrint from 'react-native-print';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Platform, Alert } from 'react-native';

/**
 * Generates a professional PDF receipt and saves it to the Downloads folder (Android)
 * or opens the Share sheet (iOS).
 */
export const generateReceipt = async (feeDetails: any) => {
    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}.00`;

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fee Receipt - ${feeDetails.period}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            body {
                font-family: 'Inter', sans-serif;
                margin: 0;
                padding: 40px;
                color: #1F2937;
                background-color: #fff;
            }

            .container {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #E5E7EB;
                padding: 40px;
                border-radius: 12px;
                position: relative;
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 40px;
                border-bottom: 2px solid #F3F4F6;
                padding-bottom: 20px;
            }

            .school-info h1 {
                margin: 0;
                font-size: 24px;
                color: #4F46E5;
                font-weight: 700;
            }

            .school-info p {
                margin: 4px 0;
                font-size: 14px;
                color: #6B7280;
            }

            .receipt-label {
                text-align: right;
            }

            .receipt-label h2 {
                margin: 0;
                font-size: 32px;
                color: #E5E7EB;
                text-transform: uppercase;
                letter-spacing: 2px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 40px;
                background-color: #F9FAFB;
                padding: 20px;
                border-radius: 8px;
            }

            .info-item label {
                display: block;
                font-size: 11px;
                text-transform: uppercase;
                color: #9CA3AF;
                margin-bottom: 4px;
                font-weight: 600;
            }

            .info-item span {
                font-size: 15px;
                font-weight: 600;
                color: #374151;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 40px;
            }

            th {
                text-align: left;
                padding: 12px;
                background-color: #4F46E5;
                color: white;
                font-size: 12px;
                text-transform: uppercase;
            }

            td {
                padding: 12px;
                border-bottom: 1px solid #F3F4F6;
                font-size: 14px;
            }

            .summary {
                margin-left: auto;
                width: 300px;
            }

            .summary-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 14px;
            }

            .summary-row.total {
                border-top: 2px solid #F3F4F6;
                margin-top: 8px;
                padding-top: 12px;
                font-size: 18px;
                font-weight: 700;
                color: #4F46E5;
            }

            .footer {
                margin-top: 60px;
                text-align: center;
                font-size: 12px;
                color: #9CA3AF;
                border-top: 1px solid #F3F4F6;
                padding-top: 20px;
            }

            .paid-stamp {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-15deg);
                border: 4px solid #10B981;
                color: #10B981;
                padding: 10px 20px;
                font-size: 40px;
                font-weight: 800;
                text-transform: uppercase;
                border-radius: 8px;
                opacity: 0.2;
                pointer-events: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="paid-stamp">Fully Paid</div>
            
            <div class="header">
                <div class="school-info">
                    <h1>XPERTANCE PRE-PRIMARY</h1>
                    <p>Sector-V, Salt Lake City, Kolkata - 700091</p>
                    <p>Contact: +91 98765 43210 | info@xpertance.com</p>
                </div>
                <div class="receipt-label">
                    <h2>Receipt</h2>
                    <p style="font-size: 12px; margin: 4px 0; color: #6B7280;">#${feeDetails.id.substring(0, 8).toUpperCase()}</p>
                </div>
            </div>

            <div class="info-grid">
                <div class="info-item">
                    <label>Student Name</label>
                    <span>${feeDetails.studentName}</span>
                </div>
                <div class="info-item">
                    <label>Date</label>
                    <span>${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="info-item">
                    <label>Class / Section</label>
                    <span>${feeDetails.class}</span>
                </div>
                <div class="info-item">
                    <label>Fee Period</label>
                    <span>${feeDetails.period}</span>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th style="border-radius: 8px 0 0 8px;">Description</th>
                        <th style="text-align: right; border-radius: 0 8px 8px 0;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${feeDetails.items.map((item: any) => `
                        <tr>
                            <td>${item.name}</td>
                            <td style="text-align: right; font-weight: 600;">${formatCurrency(item.amount)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="summary">
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>${formatCurrency(feeDetails.totalAmount)}</span>
                </div>
                ${feeDetails.fine > 0 ? `
                <div class="summary-row" style="color: #EF4444;">
                    <span>Late Fine</span>
                    <span>+ ${formatCurrency(feeDetails.fine)}</span>
                </div>
                ` : ''}
                <div class="summary-row" style="color: #10B981;">
                    <span>Amount Paid</span>
                    <span>- ${formatCurrency(feeDetails.amountPaid)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total Payable</span>
                    <span>${formatCurrency(feeDetails.totalAmount + feeDetails.fine - feeDetails.amountPaid)}</span>
                </div>
            </div>

            <div class="footer">
                <p>This is a computer generated receipt and does not require a physical signature.</p>
                <p>&copy; ${new Date().getFullYear()} Xpertance Pre-Primary School ERP. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;

    try {
        const safePeriod = feeDetails.period.replace(/[^a-z0-9]/gi, '_');
        const fileName = `Fee_Receipt_${safePeriod}`;

        // Opens native print dialog which includes "Save as PDF" functionality
        await RNPrint.print({ 
            html,
            jobName: fileName
        });
    } catch (error) {
        console.error('Print Error:', error);
        Alert.alert('Error', 'Failed to generate the receipt. Please try again.');
    }
};

