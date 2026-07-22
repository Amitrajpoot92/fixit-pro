// src/screens/accessories/ProductOrderTrackingScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  StatusBar, ScrollView, Platform, ActivityIndicator, Modal, TextInput, Alert, Image
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore'; 
import { db } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

export default function ProductOrderTrackingScreen({ navigation, route }) {
  const { orderId } = route.params || {};
  
  const [order, setOrder] = useState(null);
  const [orderDocId, setOrderDocId] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Cancellation States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const cancelFaqs = [
    'Changed my mind', 
    'Ordered by mistake', 
    'Found a better price', 
    'Expected delivery is too late', 
    'Other'
  ];

  // 🚀 SMART DUAL-FETCH LOGIC (LIVE REAL-TIME SYNC)
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let unsubscribe = null;

    const setupLiveListener = async () => {
      try {
        // Step 1: Pehle check karo ki kya ye custom "ORD-P..." ID hai
        const q = query(collection(db, 'product_orders'), where('orderId', '==', orderId));
        const snap = await getDocs(q);
        
        if (!snap.empty) {
          // Custom ID mil gayi! Live listener lagao
          unsubscribe = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              setOrder(snapshot.docs[0].data());
              setOrderDocId(snapshot.docs[0].id);
            }
            setLoading(false);
          });
        } else {
          // Step 2: Agar Custom ID nahi hai, toh matlab ye Document ID hogi
          const docRef = doc(db, 'product_orders', orderId);
          unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setOrder(docSnap.data());
              setOrderDocId(docSnap.id);
            }
            setLoading(false);
          });
        }
      } catch (error) {
        console.error("Error setting up tracking listener:", error);
        setLoading(false);
      }
    };

    setupLiveListener();

    return () => {
      if (unsubscribe) {
        unsubscribe(); 
      }
    };
  }, [orderId]);

  // 🚀 Cancel Logic (User Side)
  const handleCancelOrder = async () => {
    if (!cancelNote.trim()) {
      Alert.alert("Note Required", "Please provide a short reason for cancellation.");
      return;
    }

    setCancelling(true);
    try {
      await updateDoc(doc(db, 'product_orders', orderDocId), {
        status: 'Cancelled',
        cancelledBy: 'User',
        cancelReason: `${cancelReason} - ${cancelNote}`
      });
      setShowCancelModal(false);
      Alert.alert("Order Cancelled", "Your order has been cancelled successfully.");
    } catch (error) {
      Alert.alert("Error", "Could not cancel order. Try again.");
    }
    setCancelling(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.link} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={60} color="#94A3B8" />
        <Text style={{fontSize: 16, color: '#64748B', marginTop: 10, fontWeight: 'bold'}}>Order details not found!</Text>
        <TouchableOpacity style={{marginTop: 20, padding: 10}} onPress={() => navigation.goBack()}>
            <Text style={{color: colors.link, fontWeight: '900', fontSize: 16}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🚀 Admin Color Mirroring Logic
  const getDynamicStatusStyle = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered') return { bg: '#DCFCE7', text: '#15803D' }; // Emerald
    if (s === 'processing') return { bg: '#DBEAFE', text: '#1D4ED8' }; // Blue
    if (s === 'shipped') return { bg: '#F3E8FF', text: '#7E22CE' }; // Purple
    if (s === 'cancelled') return { bg: '#FEE2E2', text: '#EF4444' }; // Red
    return { bg: '#FFEDD5', text: '#C2410C' }; // Pending (Orange)
  };

  const statusStyle = getDynamicStatusStyle(order.status);

  // 🚀 E-Commerce Timeline Steps matched with Admin Dropdown
  const productSteps = [
    { id: 'Pending', title: 'Order Confirmed', icon: 'receipt-long' },
    { id: 'Processing', title: 'Processing', icon: 'inventory_2' },
    { id: 'Shipped', title: 'Shipped', icon: 'local-shipping' },
    { id: 'Delivered', title: 'Delivered', icon: 'check-circle' }
  ];

  const isCancelled = order.status === 'Cancelled';
  
  // Mapping current status to timeline index
  let currentStatusIndex = -1;
  if (!isCancelled) {
    const statusLower = order.status?.toLowerCase();
    if (statusLower === 'pending') currentStatusIndex = 0;
    else if (statusLower === 'processing') currentStatusIndex = 1;
    else if (statusLower === 'shipped') currentStatusIndex = 2;
    else if (statusLower === 'delivered') currentStatusIndex = 3;
    else currentStatusIndex = 0; // Fallback
  }

  // Calculations
  const itemsArray = order.productDetails || [];
  const itemsSubtotal = itemsArray.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const calculatedDeliveryFee = Number(order.totalAmount) - itemsSubtotal;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* 📋 ORDER ID & DYNAMIC STATUS HEADER */}
        <View style={styles.orderHeader}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.orderIdText}>{order.orderId}</Text>
            <Text style={styles.deviceText} numberOfLines={1}>
                {itemsArray.length} {itemsArray.length > 1 ? 'Items' : 'Item'} Ordered
            </Text>
            
            {/* 🚀 PAYMENT BADGE */}
            {!isCancelled && (
              <View style={[
                styles.trackingPaymentBadge, 
                order.paymentMode === 'Online' ? styles.trackingBadgePaid : styles.trackingBadgeCod
              ]}>
                <MaterialIcons 
                  name={order.paymentMode === 'Online' ? "verified" : "payments"} 
                  size={14} 
                  color={order.paymentMode === 'Online' ? "#15803D" : "#B45309"} 
                />
                <Text style={[
                  styles.trackingPaymentText, 
                  order.paymentMode === 'Online' ? styles.trackingTextPaid : styles.trackingTextCod
                ]}>
                  {order.paymentMode === 'Online' ? 'PRE-PAID ORDER' : 'CASH ON DELIVERY'}
                </Text>
              </View>
            )}
          </View>
          
          {/* ⚡ DYNAMIC ADMIN-LINKED BADGE COLOR */}
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusText, { color: statusStyle.text }]}>
              {order.status}
            </Text>
          </View>
        </View>

        {/* ❌ CANCELLED BANNER */}
        {isCancelled && (
          <View style={styles.cancelledBanner}>
            <Ionicons name="warning" size={24} color="#EF4444" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cancelledTitle}>
                Cancelled by {order.cancelledBy === 'User' ? 'You' : 'Admin'}
              </Text>
              <Text style={styles.cancelledReason}>
                Reason: {order.cancelReason || 'Order was cancelled.'}
              </Text>
            </View>
          </View>
        )}

        {/* 🚚 LIVE TIMELINE */}
        {!isCancelled && (
          <View style={styles.timelineContainer}>
            {productSteps.map((step, index) => {
              const isActive = index <= currentStatusIndex;
              const isLast = index === productSteps.length - 1;

              return (
                <View key={step.id} style={styles.step}>
                  <View style={[styles.iconBox, isActive ? styles.iconActive : styles.iconInactive]}>
                    <MaterialIcons name={step.icon} size={20} color={isActive ? '#FFF' : '#94A3B8'} />
                  </View>
                  <Text style={[styles.stepTitle, isActive && styles.textActive]}>{step.title}</Text>
                  
                  {!isLast && (
                    <View style={[styles.connector, isActive && currentStatusIndex > index && styles.connActive]} />
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* 🛍️ ORDERED ITEMS LIST */}
        <Text style={styles.sectionTitle}>Items in your order</Text>
        <View style={styles.itemsCard}>
          {itemsArray.map((item, idx) => (
            <View key={idx} style={[styles.productRow, idx === itemsArray.length - 1 && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <View style={styles.productImgBox}>
                <Image source={{ uri: item.image }} style={styles.productImg} resizeMode="contain" />
              </View>
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>
                <View style={styles.priceQtyRow}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  <Text style={styles.productQty}>Qty: {item.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 📍 DELIVERY ADDRESS */}
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.addressCard}>
          <Ionicons name="location" size={24} color={colors.link} style={styles.addressIcon} />
          <View style={{ flex: 1 }}>
            {order.deliveryAddress?.type && <Text style={styles.addressTypeBadge}>{order.deliveryAddress.type}</Text>}
            <Text style={styles.addressText} numberOfLines={3}>
              {order.deliveryAddress ? `${order.deliveryAddress.flat}, ${order.deliveryAddress.area}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}` : 'Address not provided'}
            </Text>
          </View>
        </View>

        {/* 🧾 ORDER SUMMARY (BILLING) */}
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items Total</Text>
            <Text style={styles.summaryValue}>₹{itemsSubtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>₹{calculatedDeliveryFee > 0 ? calculatedDeliveryFee : 'FREE'}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Grand Total</Text>
            <Text style={styles.summaryTotalValue}>₹{order.totalAmount}</Text>
          </View>
          
          {/* Online Transaction ID */}
          {order.paymentMode === 'Online' && order.transactionId && (
            <View style={styles.txnBox}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <Text style={styles.txnText}>TXN ID: {order.transactionId}</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* 🔴 CANCEL BUTTON (Visible only if not Shipped/Delivered/Cancelled) */}
      {!isCancelled && (currentStatusIndex < 2) && (
        <View style={styles.bottomCancelBar}>
          <TouchableOpacity style={styles.cancelOrderBtn} onPress={() => setShowCancelModal(true)}>
            <Text style={styles.cancelOrderText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ⚠️ CANCELLATION MODAL */}
      <Modal visible={showCancelModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel Order</Text>
              <TouchableOpacity onPress={() => setShowCancelModal(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>Please let us know why you are cancelling:</Text>
            <View style={styles.reasonContainer}>
              {cancelFaqs.map((faq, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.reasonPill, cancelReason === faq && styles.reasonPillActive]}
                  onPress={() => setCancelReason(faq)}
                >
                  <Text style={[styles.reasonText, cancelReason === faq && styles.reasonTextActive]}>{faq}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSubtitle}>Additional Notes (Required):</Text>
            <TextInput 
              style={styles.notesInput}
              placeholder="Please type your reason here..."
              multiline={true}
              numberOfLines={3}
              value={cancelNote}
              onChangeText={setCancelNote}
            />

            <TouchableOpacity 
              style={[styles.confirmCancelBtn, cancelling && {opacity: 0.7}]} 
              onPress={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.confirmCancelText}>Confirm Cancellation</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12, marginTop: 10 },
  
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  orderIdText: { fontSize: 14, fontWeight: '800', color: '#64748B', marginBottom: 4 },
  deviceText: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  
  // ⚡ DYNAMIC STATUS BADGE UI
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },

  trackingPaymentBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8, gap: 4 },
  trackingBadgePaid: { backgroundColor: '#DCFCE7' },
  trackingTextPaid: { color: '#15803D', fontWeight: '800', fontSize: 11 },
  trackingBadgeCod: { backgroundColor: '#FEF3C7' },
  trackingTextCod: { color: '#B45309', fontWeight: '800', fontSize: 11 },
  
  cancelledBanner: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#FECACA', marginBottom: 20, alignItems: 'center' },
  cancelledTitle: { fontSize: 14, fontWeight: '900', color: '#991B1B' },
  cancelledReason: { fontSize: 13, color: '#DC2626', marginTop: 4, fontWeight: '500' },

  timelineContainer: { backgroundColor: '#FFF', padding: 25, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  iconActive: { backgroundColor: colors.link },
  iconInactive: { backgroundColor: '#F1F5F9' },
  stepTitle: { marginLeft: 15, fontSize: 14, fontWeight: '800', color: '#94A3B8' },
  textActive: { color: '#0F172A' },
  connector: { position: 'absolute', left: 19, top: 35, width: 2, height: 35, backgroundColor: '#F1F5F9', zIndex: 1 },
  connActive: { backgroundColor: colors.link },

  itemsCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  productImgBox: { width: 60, height: 60, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 5, marginRight: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  productImg: { width: '100%', height: '100%' },
  productDetails: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  productCategory: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  productQty: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  addressCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', marginBottom: 20 },
  addressIcon: { marginRight: 15 },
  addressTypeBadge: { fontSize: 10, fontWeight: '800', color: colors.link, backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  addressText: { fontSize: 13, color: '#475569', lineHeight: 20, fontWeight: '500' },

  summaryCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  summaryValue: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  summaryTotalLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  summaryTotalValue: { fontSize: 18, fontWeight: '900', color: colors.link },
  txnBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 15, gap: 4 },
  txnText: { fontSize: 10, fontWeight: '800', color: '#10B981' },

  bottomCancelBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: Platform.OS === 'ios' ? 35 : 20 },
  cancelOrderBtn: { backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  cancelOrderText: { color: '#EF4444', fontSize: 16, fontWeight: '800' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  modalSubtitle: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 10 },
  reasonContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  reasonPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  reasonPillActive: { backgroundColor: '#EFF6FF', borderColor: colors.link },
  reasonText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  reasonTextActive: { color: colors.link },
  notesInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, fontSize: 14, textAlignVertical: 'top', height: 100, marginBottom: 20 },
  confirmCancelBtn: { backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  confirmCancelText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});