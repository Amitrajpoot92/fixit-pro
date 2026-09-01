const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');

admin.initializeApp();

// Initialize Razorpay with credentials stored in .env
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
};

/**
 * Handles order updates (Refunds and Referral Rewards) for Product Orders
 */
exports.onProductOrderUpdated = functions.firestore
    .document('product_orders/{orderId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();
        const orderId = context.params.orderId;

        // 1. Refund Logic (DISABLED FOR MANUAL REFUND SYSTEM)
        if (newValue.status === 'Cancelled' && previousValue.status !== 'Cancelled') {
            // await processRefund(newValue, orderId, 'product_orders');
            console.log(`Order ${orderId} cancelled. Awaiting manual refund request.`);
        }

        // 2. Referral Reward Logic
        if ((newValue.status === 'Delivered' || newValue.status === 'Completed') && previousValue.status !== newValue.status) {
            await processReferralReward(newValue, orderId, 'product_orders');
        }
    });

/**
 * Handles order updates (Refunds and Referral Rewards) for Service Bookings
 */
exports.onBookingUpdated = functions.firestore
    .document('bookings/{bookingId}')
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const previousValue = change.before.data();
        const bookingId = context.params.bookingId;

        // 1. Refund Logic (DISABLED FOR MANUAL REFUND SYSTEM)
        if (newValue.status === 'Cancelled' && previousValue.status !== 'Cancelled') {
            // await processRefund(newValue, bookingId, 'bookings');
            console.log(`Booking ${bookingId} cancelled. Awaiting manual refund request.`);
        }

        // 2. Referral Reward Logic
        if (newValue.status === 'Completed' && previousValue.status !== 'Completed') {
            await processReferralReward(newValue, bookingId, 'bookings');
        }
    });

/**
 * Common Refund Logic
 */
async function processRefund(orderData, docId, collectionName) {
    try {
        // Only process if it was paid online and has a transactionId
        if (orderData.paymentMethod === 'COD' || orderData.paymentMethod === 'Cash on Delivery' || !orderData.transactionId || orderData.transactionId === 'PENDING') {
            console.log(`Order ${docId} is COD or unpaid. No refund needed.`);
            return;
        }

        // Avoid double refunds
        if (orderData.refundStatus === 'Processed') {
            console.log(`Refund already processed for ${docId}`);
            return;
        }

        // Handle Wallet Refunds
        if (orderData.paymentMethod === 'Wallet' || (orderData.transactionId && orderData.transactionId.startsWith('WAL-'))) {
            console.log(`Processing wallet refund for ${docId}`);
            
            if (orderData.userId) {
                // Refund to wallet
                await admin.firestore().collection('users').doc(orderData.userId).update({
                    walletBalance: admin.firestore.FieldValue.increment(orderData.totalAmount)
                });

                // Log wallet transaction
                await admin.firestore().collection('users').doc(orderData.userId).collection('transactions').add({
                    title: `Refund for Cancelled Order #${orderData.orderId || docId}`,
                    amount: orderData.totalAmount,
                    type: 'credit',
                    orderId: orderData.orderId || docId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            // Update order status
            await admin.firestore().collection(collectionName).doc(docId).update({
                refundStatus: 'Processed',
                refundId: `WAL-REF-${Date.now()}`,
                refundAmount: orderData.totalAmount,
                refundDate: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Wallet refund successful for ${docId}`);
            return;
        }

        const razorpay = getRazorpayInstance();
        
        // Initiate Full Refund via Razorpay API
        console.log(`Initiating refund for payment ID: ${orderData.transactionId}`);
        const refundResponse = await razorpay.payments.refund(orderData.transactionId, {
            notes: {
                order_id: docId,
                collection: collectionName,
                reason: orderData.cancelReason || 'Cancelled by User/Admin'
            }
        });

        // Update Firestore with success
        await admin.firestore().collection(collectionName).doc(docId).update({
            refundStatus: 'Processed',
            refundId: refundResponse.id,
            refundAmount: refundResponse.amount / 100, // Razorpay returns in paise
            refundDate: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`Refund successful for ${docId}: Refund ID ${refundResponse.id}`);

    } catch (error) {
        console.error(`Refund failed for ${docId}:`, error);
        
        // Mark as failed so admin can review manually
        await admin.firestore().collection(collectionName).doc(docId).update({
            refundStatus: 'Failed',
            refundError: error.message || 'Unknown error'
        });
    }
}

/**
 * Common Referral Reward Logic
 */
async function processReferralReward(orderData, docId, collectionName) {
    try {
        if (!orderData.referrerUid || orderData.referralRewarded === true) {
            return; // No referrer or already rewarded
        }

        console.log(`Processing referral reward for order ${docId}. Referrer: ${orderData.referrerUid}`);
        
        const rewardCode = `REWARD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        let rewardAmt = 30;
        try {
            const settingsSnap = await admin.firestore().collection('settings').doc('referral').get();
            if (settingsSnap.exists && settingsSnap.data().rewardDiscount) {
                rewardAmt = settingsSnap.data().rewardDiscount;
            }
        } catch (e) {
            console.error("Error fetching reward discount:", e);
        }

        // Create the coupon
        await admin.firestore().collection('coupons').add({
            code: rewardCode,
            discount: rewardAmt,
            type: 'reward',
            ownerUid: orderData.referrerUid,
            isActive: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            sourceOrderId: docId
        });

        // Mark order as rewarded
        await admin.firestore().collection(collectionName).doc(docId).update({
            referralRewarded: true
        });

        console.log(`Referral reward generated: ${rewardCode}`);
    } catch (error) {
        console.error(`Error processing referral reward for ${docId}:`, error);
    }
}
