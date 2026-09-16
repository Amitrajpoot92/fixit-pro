import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
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
              body { font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; padding: 40px; margin: 0; }
              .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 16px; background-color: #fff; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #2563EB; padding-bottom: 20px; }
              .brand-title { font-size: 32px; font-weight: bold; color: #2563EB; margin: 0; }
              .invoice-title { font-size: 28px; color: #64748B; margin: 0; text-align: right; }
              .company-details { margin-top: 10px; font-size: 14px; color: #475569; }
              .details-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .billing-info h3, .order-info h3 { margin-top: 0; margin-bottom: 10px; color: #0F172A; font-size: 16px; border-bottom: 1px solid #E2E8F0; padding-bottom: 5px; }
              .info-text { font-size: 14px; color: #475569; margin: 5px 0; }
              table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; margin-bottom: 30px; }
              table th { padding: 12px; background: #F8FAFC; border-bottom: 2px solid #CBD5E1; color: #0F172A; font-weight: 600; }
              table td { padding: 12px; border-bottom: 1px solid #E2E8F0; color: #334155; }
              .total-section { display: flex; justify-content: flex-end; margin-top: 20px; }
              .total-box { width: 300px; background: #F8FAFC; padding: 20px; border-radius: 8px; }
              .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; }
              .total-row.final { font-weight: bold; font-size: 18px; color: #0F172A; border-top: 2px solid #CBD5E1; padding-top: 10px; margin-top: 10px; }
              .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0; padding-top: 20px; }
          </style>
      </head>
      <body>
          <div class="invoice-box">
              <div class="header">
                  <div>
                      <h1 class="brand-title">FixitPro</h1>
                      <div class="company-details">
                          <strong>SHARMA ENTERPRISES</strong><br>
                          Legal Name: SHIVAM SHARMA<br>
                          GSTIN: 10LVMPS0872E1ZE<br>
                      </div>
                  </div>
                  <div>
                      <h1 class="invoice-title">INVOICE</h1>
                      <div class="info-text" style="text-align: right;">
                          <strong>Date:</strong> ${orderDateStr}<br>
                          <strong>Invoice #:</strong> INV-${orderId?.substring(0, 6)?.toUpperCase()}
                      </div>
                  </div>
              </div>

              <div class="details-section">
                  <div class="billing-info">
                      <h3>Billed To</h3>
                      <p class="info-text">
                          <strong>Customer</strong><br>
                          Payment Mode: ${orderData.paymentMode || 'Online'}<br>
                      </p>
                  </div>
                  <div class="order-info">
                      <h3>Order Details</h3>
                      <p class="info-text">
                          <strong>Order ID:</strong> ${orderId}<br>
                          <strong>Order Type:</strong> ${isService ? 'Service Booking' : 'Product Order'}<br>
                      </p>
                  </div>
              </div>

              <table>
                  <thead>
                      <tr>
                          <th>Description</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Amount</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${itemsHtml}
                  </tbody>
              </table>

              <div class="total-section">
                  <div class="total-box">
                      <div class="total-row">
                          <span>Subtotal:</span>
                          <span>₹${totalAmount}</span>
                      </div>
                      <div class="total-row final">
                          <span>Total Amount:</span>
                          <span>₹${totalAmount}</span>
                      </div>
                  </div>
              </div>

              <div class="footer">
                  <p>Thank you for choosing FixitPro! We appreciate your business.</p>
                  <p>This is a computer-generated invoice and does not require a physical signature.</p>
              </div>
          </div>
      </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    
    if (Platform.OS === 'web') {
      window.open(uri);
    } else {
      // 🚀 Move file to document directory on Android to fix sharing permissions
      let finalUri = uri;
      
      if (Platform.OS === 'android') {
        const newUri = FileSystem.documentDirectory + `Invoice_${orderId}.pdf`;
        await FileSystem.copyAsync({
          from: uri,
          to: newUri
        });
        finalUri = newUri;
      }
      
      await Sharing.shareAsync(finalUri, {
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
