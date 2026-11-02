import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

export const downloadInvoice = async (orderData, type = 'service') => {
  try {
    const isService = type === 'service';
    const orderId = orderData.orderId || orderData.id || Math.floor(Math.random() * 100000).toString();
    
    // Formatting date
    let orderDateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    if (orderData.createdAt) {
      if (orderData.createdAt.toDate) {
        orderDateStr = new Date(orderData.createdAt.toDate()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      } else {
        orderDateStr = new Date(orderData.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    } else if (orderData.month && orderData.day) {
      orderDateStr = `${orderData.month} ${orderData.day}`;
    }

    // Customer Details
    const customerName = orderData.userName || orderData.customerName || orderData.deliveryAddress?.name || 'Valued Customer';
    const customerPhone = orderData.userPhone || orderData.customerPhone || orderData.deliveryAddress?.phone || '';
    
    let addressStr = '';
    const addrObj = orderData.deliveryAddress || orderData.serviceAddress;
    if (addrObj) {
      if (typeof addrObj === 'string') {
        addressStr = addrObj;
      } else {
        const parts = [
          addrObj.houseNo || addrObj.flat,
          addrObj.street || addrObj.area,
          addrObj.landmark,
          addrObj.city,
          addrObj.pincode ? `${addrObj.city ? '-' : ''} ${addrObj.pincode}` : ''
        ].filter(Boolean);
        addressStr = parts.join(', ');
      }
    }

    // Itemized Calculations
    let itemsHtml = '';
    let itemsSubtotal = 0;
    let deliveryCharge = 0;
    const discountAmount = Number(orderData.discountAmount || 0);

    if (isService) {
      const servicesList = Array.isArray(orderData.services) && orderData.services.length > 0 
        ? orderData.services 
        : null;

      if (servicesList) {
        itemsHtml = servicesList.map(s => {
          const sTitle = s.serviceTitle || s.name || s.title || orderData.service || 'Service Repair';
          const sPrice = Number(s.price || s.cost || 0);
          itemsSubtotal += sPrice;
          return `
            <tr>
              <td>${sTitle}</td>
              <td style="text-align: center;">1</td>
              <td style="text-align: right;">₹${sPrice}</td>
              <td style="text-align: right;">₹${sPrice}</td>
            </tr>
          `;
        }).join('');
      } else {
        const serviceName = orderData.service || 'Service Repair';
        const category = orderData.category || '';
        let rawAmount = Number(orderData.totalAmount || orderData.price?.toString().replace(/[^0-9.]/g, '') || 0);
        
        // If pickup mode was selected and amount already has 99 included
        if ((orderData.serviceMode === 'pickup' || orderData.pickupFee) && rawAmount > 99) {
          const fee = orderData.pickupFee ? Number(orderData.pickupFee) : 99;
          itemsSubtotal = rawAmount - fee;
        } else {
          itemsSubtotal = rawAmount;
        }

        itemsHtml = `
          <tr>
            <td>${serviceName} ${category ? `(${category})` : ''}</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right;">₹${itemsSubtotal}</td>
            <td style="text-align: right;">₹${itemsSubtotal}</td>
          </tr>
        `;
      }

      // Determine visiting / pickup charge for service
      if (orderData.deliveryFee !== undefined && orderData.deliveryFee !== null) {
        deliveryCharge = Number(orderData.deliveryFee);
      } else if (orderData.deliveryCharge !== undefined && orderData.deliveryCharge !== null) {
        deliveryCharge = Number(orderData.deliveryCharge);
      } else if (orderData.pickupFee !== undefined && orderData.pickupFee !== null) {
        deliveryCharge = Number(orderData.pickupFee);
      } else if (orderData.serviceMode === 'pickup') {
        deliveryCharge = 99;
      } else {
        deliveryCharge = 0;
      }
    } else {
      // Product orders
      const products = orderData.productDetails || [];
      if (products.length > 0) {
        itemsHtml = products.map(p => {
          const pName = p.name || 'Product';
          const pQty = Number(p.quantity || 1);
          const pPrice = Number(p.price || 0);
          const pAmount = pPrice * pQty;
          itemsSubtotal += pAmount;
          return `
            <tr>
              <td>${pName}</td>
              <td style="text-align: center;">${pQty}</td>
              <td style="text-align: right;">₹${pPrice}</td>
              <td style="text-align: right;">₹${pAmount}</td>
            </tr>
          `;
        }).join('');
      } else {
        const rawAmount = Number(orderData.totalAmount || orderData.price?.toString().replace(/[^0-9.]/g, '') || 0);
        itemsSubtotal = rawAmount;
        itemsHtml = `
          <tr>
            <td>Product Item</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right;">₹${itemsSubtotal}</td>
            <td style="text-align: right;">₹${itemsSubtotal}</td>
          </tr>
        `;
      }

      // Determine delivery charge for products (standard app delivery is ₹50)
      if (orderData.deliveryFee !== undefined && orderData.deliveryFee !== null) {
        deliveryCharge = Number(orderData.deliveryFee);
      } else if (orderData.deliveryCharge !== undefined && orderData.deliveryCharge !== null) {
        deliveryCharge = Number(orderData.deliveryCharge);
      } else if (orderData.shippingFee !== undefined && orderData.shippingFee !== null) {
        deliveryCharge = Number(orderData.shippingFee);
      } else {
        const rawTotal = Number(orderData.totalAmount || 0);
        if (rawTotal > 0 && rawTotal > itemsSubtotal - discountAmount) {
          deliveryCharge = rawTotal - (itemsSubtotal - discountAmount);
        } else {
          deliveryCharge = 50;
        }
      }
    }

    // Final Total Calculation: ensures deliveryCharge is added and shown in final price
    const calculatedTotal = Math.max(0, itemsSubtotal + deliveryCharge - discountAmount);
    const storedTotal = Number(orderData.totalAmount || orderData.price?.toString().replace(/[^0-9.]/g, '') || 0);
    const finalTotal = storedTotal >= calculatedTotal ? storedTotal : calculatedTotal;

    // Harmonize subtotal if stored total was higher
    if (storedTotal > calculatedTotal && deliveryCharge === 0) {
      deliveryCharge = storedTotal - calculatedTotal;
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
                  width: 320px; 
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
                              <strong>${customerName}</strong><br>
                              ${customerPhone ? `<span>Phone: <strong>${customerPhone}</strong></span><br>` : ''}
                              ${addressStr ? `<span style="color: #64748b; font-size: 12px; display: inline-block; margin-top: 2px;">${addressStr}</span><br>` : ''}
                              Payment Mode: <strong>${orderData.paymentMode || (orderData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online')}</strong><br>
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
                              <th style="text-align: center; width: 60px;">Qty</th>
                              <th style="text-align: right; width: 100px;">Price</th>
                              <th style="text-align: right; width: 110px;">Amount</th>
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
                              <span>₹${itemsSubtotal}</span>
                          </div>
                          ${deliveryCharge > 0 ? `
                          <div class="total-row">
                              <span>${isService ? 'Visiting / Pickup Fee:' : 'Delivery Charge:'}</span>
                              <span style="font-weight: 700; color: #1e40af;">₹${deliveryCharge}</span>
                          </div>
                          ` : (!isService ? `
                          <div class="total-row">
                              <span>Delivery Charge:</span>
                              <span style="font-weight: 700; color: #16a34a;">FREE</span>
                          </div>
                          ` : '')}
                          ${discountAmount > 0 ? `
                          <div class="total-row">
                              <span>Discount:</span>
                              <span style="font-weight: 700; color: #16a34a;">-₹${discountAmount}</span>
                          </div>
                          ` : ''}
                          <div class="total-row">
                              <span>Taxes & Fees:</span>
                              <span>Inclusive</span>
                          </div>
                          <div class="total-row final">
                              <span>Total Amount:</span>
                              <span>₹${finalTotal}</span>
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
