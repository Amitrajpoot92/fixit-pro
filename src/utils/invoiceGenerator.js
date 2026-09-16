import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export const downloadInvoice = async (orderData, type = 'service') => {
  try {
    const isService = type === 'service';
    const orderId = orderData.orderId || orderData.id || Math.floor(Math.random() * 100000).toString();
    
    // Formatting date
    let orderDateStr = new Date().toLocaleDateString();
    if (orderData.createdAt) {
      if (orderData.createdAt.toDate) {
         orderDateStr = new Date(orderData.createdAt.toDate()).toLocaleDateString();
      } else {
         orderDateStr = new Date(orderData.createdAt).toLocaleDateString();
      }
    } else if (orderData.month && orderData.day) {
      orderDateStr = `${orderData.month} ${orderData.day}`;
    }

    // Generating Items HTML
    let itemsHtml = '';
    let totalAmount = orderData.totalAmount || orderData.price?.replace('₹', '') || 0;

    if (isService) {
      const serviceName = orderData.service || 'Service Repair';
      const category = orderData.category || '';
      itemsHtml = `
        <tr>
          <td>${serviceName} ${category ? `(${category})` : ''}</td>
          <td>1</td>
          <td>₹${totalAmount}</td>
          <td>₹${totalAmount}</td>
        </tr>
      `;
    } else {
      const products = orderData.productDetails || [];
      if (products.length > 0) {
        itemsHtml = products.map(p => `
          <tr>
            <td>${p.name || 'Product'}</td>
            <td>${p.quantity || 1}</td>
            <td>₹${p.price || 0}</td>
            <td>₹${(p.price || 0) * (p.quantity || 1)}</td>
          </tr>
        `).join('');
      } else {
        itemsHtml = `
          <tr>
            <td>Product Item</td>
            <td>1</td>
            <td>₹${totalAmount}</td>
            <td>₹${totalAmount}</td>
          </tr>
        `;
      }
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
              
              body { 
                  font-family: 'Inter', sans-serif; 
                  color: #1e293b; 
                  line-height: 1.5; 
                  padding: 10px; 
                  margin: 0; 
                  background-color: #f8fafc;
              }
              .invoice-box { 
                  max-width: 800px; 
                  margin: auto; 
                  background-color: #ffffff; 
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                  position: relative;
              }
              
              /* Decorative Header Banner */
              .header-banner {
                  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                  padding: 25px 40px;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  color: #ffffff;
              }
              .brand-title { 
                  font-size: 32px; 
                  font-weight: 800; 
                  margin: 0; 
                  letter-spacing: -1px; 
                  display: flex;
                  align-items: center;
                  gap: 10px;
              }
              .brand-title span { color: #60a5fa; }
              .invoice-title { 
                  font-size: 34px; 
                  margin: 0; 
                  font-weight: 800; 
                  letter-spacing: 3px; 
                  opacity: 0.9;
                  text-transform: uppercase;
              }
              
              /* Content Body */
              .content-body {
                  padding: 30px 40px;
                  position: relative;
                  z-index: 1;
              }
              
              /* Watermark */
              .watermark {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) rotate(-30deg);
                  font-size: 130px;
                  color: rgba(226, 232, 240, 0.3);
                  font-weight: 900;
                  z-index: -1;
                  white-space: nowrap;
                  user-select: none;
              }

              /* Info Grid */
              .info-grid {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 25px;
                  gap: 20px;
              }
              .info-block {
                  flex: 1;
              }
              .info-block h3 {
                  font-size: 11px;
                  text-transform: uppercase;
                  color: #64748b;
                  font-weight: 700;
                  letter-spacing: 1px;
                  margin-bottom: 8px;
                  border-bottom: 2px solid #e2e8f0;
                  padding-bottom: 6px;
              }
              .info-text { 
                  font-size: 13px; 
                  color: #334155; 
                  margin: 4px 0; 
                  line-height: 1.5; 
              }
              .info-text strong { color: #0f172a; font-weight: 600; }
              
              /* Main Table */
              table { 
                  width: 100%; 
                  text-align: left; 
                  border-collapse: separate; 
                  border-spacing: 0;
                  margin-bottom: 25px; 
              }
              table th { 
                  padding: 12px 14px; 
                  background-color: #f1f5f9; 
                  color: #475569; 
                  font-weight: 700; 
                  font-size: 11px; 
                  text-transform: uppercase; 
                  letter-spacing: 1px;
              }
              table th:first-child { border-top-left-radius: 6px; border-bottom-left-radius: 6px; }
              table th:last-child { border-top-right-radius: 6px; border-bottom-right-radius: 6px; }
              table td { 
                  padding: 14px; 
                  border-bottom: 1px solid #f1f5f9; 
                  color: #1e293b; 
                  font-size: 13px;
                  font-weight: 500;
              }
              table tr:last-child td { border-bottom: none; }
              
              /* Summary Box */
              .summary-section { 
                  display: flex; 
                  justify-content: flex-end; 
                  margin-bottom: 25px; 
              }
              .total-box { 
                  width: 300px; 
                  background: linear-gradient(to right bottom, #ffffff, #f8fafc); 
                  padding: 20px; 
                  border-radius: 10px; 
                  border: 1px solid #e2e8f0; 
                  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
              }
              .total-row { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 10px; 
                  font-size: 13px; 
                  color: #475569; 
                  font-weight: 500;
              }
              .total-row.final { 
                  font-weight: 800; 
                  font-size: 20px; 
                  color: #1e40af; 
                  border-top: 2px dashed #cbd5e1; 
                  padding-top: 12px; 
                  margin-top: 5px; 
              }
              
              /* Terms & Signature */
              .terms-sig-row { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-top: 20px; 
                  background-color: #f8fafc;
                  padding: 20px;
                  border-radius: 10px;
              }
              .terms-box { width: 60%; }
              .terms-box h4 { 
                  margin: 0 0 10px 0; 
                  font-size: 11px; 
                  color: #475569; 
                  text-transform: uppercase; 
                  letter-spacing: 1px;
                  font-weight: 700;
              }
              .terms-box ul { 
                  padding-left: 15px; 
                  margin: 0; 
                  font-size: 10px; 
                  color: #64748b; 
                  line-height: 1.6; 
              }
              
              .sig-box { 
                  width: 35%; 
                  text-align: right; 
                  display: flex; 
                  flex-direction: column; 
                  justify-content: flex-end; 
              }
              .sig-line { 
                  border-bottom: 2px solid #cbd5e1; 
                  width: 100%; 
                  margin-bottom: 6px; 
                  height: 30px; 
              }
              .sig-text { font-size: 12px; color: #1e293b; font-weight: 700; }
              
              /* Footer */
              .footer { 
                  text-align: center; 
                  margin-top: 20px; 
                  font-size: 11px; 
                  color: #94a3b8; 
              }
              
              @media print {
                  body { padding: 0 !important; background-color: #ffffff !important; }
                  .invoice-box { box-shadow: none !important; border: none !important; border-radius: 0 !important; max-width: 100% !important; margin: 0 !important; }
              }
          </style>
      </head>
      <body>
          <div class="invoice-box">
              <div class="header-banner">
                  <div>
                      <h1 class="brand-title">Fixit<span>Pro</span></h1>
                      <div style="margin-top: 10px; font-size: 13px; opacity: 0.9;">
                          <strong>SHARMA ENTERPRISES</strong><br>
                          GSTIN: 10LVMPS0872E1ZE<br>
                          support@fixitpro.in<br>
                      </div>
                  </div>
                  <div style="text-align: right;">
                      <h1 class="invoice-title">INVOICE</h1>
                      <div style="margin-top: 15px; font-size: 14px;">
                          INV-${orderId?.substring(0, 6)?.toUpperCase()}<br>
                          <span style="opacity: 0.8; font-size: 12px;">${orderDateStr}</span>
                      </div>
                  </div>
              </div>

              <div class="content-body">
                  <div class="watermark">FIXITPRO</div>
                  
                  <div class="info-grid">
                      <div class="info-block">
                          <h3>Billed To</h3>
                          <p class="info-text">
                              <strong>Valued Customer</strong><br>
                              Payment Mode: <strong>${orderData.paymentMode || 'Online'}</strong><br>
                          </p>
                      </div>
                      <div class="info-block">
                          <h3>Order Details</h3>
                          <p class="info-text">
                              Order ID: <strong>${orderId}</strong><br>
                              Category: <strong>${isService ? 'Service & Repair' : 'Product Order'}</strong><br>
                              Status: <strong style="color: #059669;">${orderData.status || (isService ? 'Completed' : 'Delivered')}</strong><br>
                          </p>
                      </div>
                  </div>

                  <table>
                      <thead>
                          <tr>
                              <th>Description</th>
                              <th style="text-align: center;">Qty</th>
                              <th style="text-align: right;">Price</th>
                              <th style="text-align: right;">Amount</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${itemsHtml}
                      </tbody>
                  </table>

                  <div class="summary-section">
                      <div class="total-box">
                          <div class="total-row">
                              <span>Subtotal:</span>
                              <span>₹${totalAmount}</span>
                          </div>
                          <div class="total-row">
                              <span>Taxes & Fees:</span>
                              <span>Inclusive</span>
                          </div>
                          <div class="total-row final">
                              <span>Total Amount:</span>
                              <span>₹${totalAmount}</span>
                          </div>
                      </div>
                  </div>
                  
                  <div class="terms-sig-row">
                      <div class="terms-box">
                          <h4>Terms & Conditions</h4>
                          <ul>
                              <li>Goods/Services once provided will not be taken back or refunded.</li>
                              <li>Any warranty provided is subject to the respective manufacturer's guidelines.</li>
                              <li>In case of any disputes, they are subject to local jurisdiction.</li>
                              <li>This is a computer-generated document and does not require a physical signature.</li>
                          </ul>
                      </div>
                      <div class="sig-box">
                          <div class="sig-line"></div>
                          <span class="sig-text">Authorized Signatory</span>
                          <span style="font-size: 10px; color: #64748b; margin-top: 3px;">For SHARMA ENTERPRISES</span>
                      </div>
                  </div>

                  <div class="footer">
                      <p><strong>Thank you for choosing FixitPro!</strong> We truly appreciate your business and look forward to serving you again.</p>
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    const { base64 } = await Print.printToFileAsync({ html: htmlContent, base64: true });
    
    if (Platform.OS === 'web') {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      window.open(uri);
    } else {
      const safeOrderId = orderId.replace(/[^a-zA-Z0-9]/g, '');
      const fileUri = `${FileSystem.cacheDirectory}Invoice_${safeOrderId}.pdf`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      await Sharing.shareAsync(fileUri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
        dialogTitle: 'Download Invoice',
      });
    }
  } catch (error) {
    console.error('Error generating invoice:', error);
    alert('Failed to generate invoice.');
  }
};
