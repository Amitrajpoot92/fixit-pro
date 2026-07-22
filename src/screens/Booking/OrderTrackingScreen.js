// src/screens/Booking/OrderTrackingScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  StatusBar, ScrollView, Platform, ActivityIndicator, Linking, Modal, TextInput, Alert 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { db } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

export default function OrderTrackingScreen({ navigation, route }) {
  // 🚀 Determine Type: Service or Product
  const { orderId, type = 'Service' } = route.params || {};
  
  const [order, setOrder] = useState(null);
  const [orderDocId, setOrderDocId] = useState(null); 
  const [loading, setLoading] = useState(true);
  
  const [techProfile, setTechProfile] = useState(null);

  // 🚀 Cancellation States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [cancelNote, setCancelNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const cancelFaqs = [
    'Changed my mind', 
    'Got a better price elsewhere', 
    'Taking too long', 
    'Booked by mistake', 
    'Other'
  ];

  // 🚀 Fetch Logic based on Type
  useEffect(() => {
    if (!orderId) return;

    if (type === 'Product') {
      const docRef = doc(db, 'product_orders', orderId);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setOrder(docSnap.data());
          setOrderDocId(docSnap.id);
        }
        setLoading(false);
      });
      return () => unsubscribe();
      
    } else {
      const q = query(collection(db, 'bookings'), where('orderId', '==', orderId));
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const orderData = docSnap.data();
          setOrder(orderData);
          setOrderDocId(docSnap.id);

          if (orderData.technicianId && orderData.technicianStatus !== 'Pending') {
            try {
              const techRef = doc(db, 'technicians', orderData.technicianId);
              const techSnap = await getDoc(techRef);
              if (techSnap.exists()) setTechProfile(techSnap.data());
            } catch (error) {
              console.error("Error fetching tech profile:", error);
            }
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [orderId, type]);

  // 🚀 Cancel Logic for Both Types
  const handleCancelOrder = async () => {
    if (!cancelNote.trim()) {
      Alert.alert("Note Required", "Please provide a short note/reason for cancellation.");
      return;
    }

    setCancelling(true);
    try {
      const collectionName = type === 'Product' ? 'product_orders' : 'bookings';
      await updateDoc(doc(db, collectionName, orderDocId), {
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // 🚀 Dynamic Steps based on Type
  const serviceSteps = [
    { id: 'Order Placed', title: 'Order Placed', icon: 'receipt-long' },
    { id: 'Technician Assigned', title: 'Technician Assigned', icon: 'person-pin' },
    { id: 'Repair In-Progress', title: 'Repair In-Progress', icon: 'build' },
    { id: 'Completed', title: 'Completed', icon: 'check-circle' }
  ];

  const productSteps = [
    { id: 'Pending', title: 'Order Placed', icon: 'receipt-long' },
    { id: 'Shipped', title: 'Shipped', icon: 'local-shipping' },
    { id: 'Delivered', title: 'Delivered', icon: 'check-circle' }
  ];

  const steps = type === 'Product' ? productSteps : serviceSteps;
  const isCancelled = order?.status === 'Cancelled';
  const currentStatusIndex = isCancelled ? -1 : steps.findIndex(s => s.id.toLowerCase() === order?.status?.toLowerCase());

  // Contact Handlers
  const handleCall = () => { if (techProfile?.mobileNo) Linking.openURL(`tel:${techProfile.mobileNo}`); };
  const handleEmail = () => { if (techProfile?.email) Linking.openURL(`mailto:${techProfile.email}`); };

  // Helper variables for UI
  const displayId = type === 'Product' ? `#ORD-${orderDocId?.substring(0,6).toUpperCase()}` : order?.orderId;
  const displayTitle = type === 'Product' ? order?.productDetails?.name : `${order?.brandName} ${order?.modelName}`;

  // Helper for Address Display
  const getAddressString = () => {
    if (!order?.serviceAddress) return 'Address not provided';
    const { flat, area, landmark, type: addressType } = order.serviceAddress;
    return `${addressType ? addressType + ' - ' : ''}${flat ? flat + ', ' : ''}${area || ''} ${landmark ? '(' + landmark + ')' : ''}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track {type === 'Product' ? 'Order' : 'Service'}</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* Order Info Header */}
        <View style={styles.orderHeader}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.orderIdText}>{displayId}</Text>
            <Text style={styles.deviceText} numberOfLines={2}>{displayTitle}</Text>
            
            {/* 🚀 DYNAMIC PAYMENT BADGE IN TRACKING SCREEN */}
            {!isCancelled && (
              <View style={[
                styles.trackingPaymentBadge, 
                order?.paymentMode === 'Online' ? styles.trackingBadgePaid : styles.trackingBadgeCod
              ]}>
                <MaterialIcons 
                  name={order?.paymentMode === 'Online' ? "verified" : "payments"} 
                  size={14} 
                  color={order?.paymentMode === 'Online' ? "#15803D" : "#B45309"} 
                />
                <Text style={[
                  styles.trackingPaymentText, 
                  order?.paymentMode === 'Online' ? styles.trackingTextPaid : styles.trackingTextCod
                ]}>
                  {order?.paymentMode === 'Online' ? 'PRE-PAID ORDER' : 'CASH ON DELIVERY'}
                </Text>
              </View>
            )}

          </View>
          <View style={[styles.statusBadge, isCancelled && styles.statusBadgeCancelled]}>
            <Text style={[styles.statusText, isCancelled && styles.statusTextCancelled]}>
              {order?.status}
            </Text>
          </View>
        </View>

        {isCancelled && (
          <View style={styles.cancelledBanner}>
            <Ionicons name="warning" size={24} color="#EF4444" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.cancelledTitle}>
                Cancelled by {order?.cancelledBy === 'User' ? 'You' : (type === 'Product' ? 'Admin' : 'Technician')}
              </Text>
              <Text style={styles.cancelledReason}>
                Reason: {order?.cancelReason || 'No reason provided.'}
              </Text>
            </View>
          </View>
        )}

        {/* Live Timeline */}
        {!isCancelled && (
          <View style={styles.timelineContainer}>
            {steps.map((step, index) => {
              const isActive = index <= currentStatusIndex;
              const isLast = index === steps.length - 1;

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

        {/* 🚀 NEW: ORDER SUMMARY DETAILS CARD */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Details</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryIconBox}><Ionicons name="wallet-outline" size={18} color="#64748B" /></View>
            <View style={{flex: 1}}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>₹{order?.totalAmount || '0'}</Text>
            </View>
          </View>

          {type === 'Service' && (
            <>
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryIconBox}><Ionicons name="calendar-outline" size={18} color="#64748B" /></View>
                <View style={{flex: 1}}>
                  <Text style={styles.summaryLabel}>Schedule</Text>
                  <Text style={styles.summaryValue}>{order?.scheduleDate} | {order?.scheduleTime}</Text>
                </View>
              </View>

              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <View style={styles.summaryIconBox}><Ionicons name="location-outline" size={18} color="#64748B" /></View>
                <View style={{flex: 1}}>
                  <Text style={styles.summaryLabel}>Service Address</Text>
                  <Text style={styles.summaryValue}>{getAddressString()}</Text>
                </View>
              </View>
            </>
          )}

          {/* Show Transaction ID if Online */}
          {order?.paymentMode === 'Online' && order?.transactionId && (
            <>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <View style={styles.summaryIconBox}><Ionicons name="shield-checkmark-outline" size={18} color="#64748B" /></View>
                <View style={{flex: 1}}>
                  <Text style={styles.summaryLabel}>Transaction ID</Text>
                  <Text style={styles.summaryValue}>{order?.transactionId}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Tech Details only for Services */}
        {type === 'Service' && techProfile && !isCancelled && (
          <View style={styles.shopCard}>
            <View style={styles.shopHeader}>
              <View style={styles.shopAvatar}>
                <MaterialIcons name="storefront" size={28} color={colors.primary} />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.shopName}>{techProfile.shopName || 'Expert Service Center'}</Text>
                <Text style={styles.shopOwner}>by {techProfile.ownerName || order?.technicianName || 'Partner Technician'}</Text>
              </View>
            </View>

            <View style={styles.shopDetailsBox}>
              <View style={styles.detailRow}>
                <Ionicons name="location" size={16} color="#64748B" />
                <Text style={styles.detailText}>{techProfile.shopAddress || 'Address not provided'}</Text>
              </View>
              {techProfile.email && (
                <View style={styles.detailRow}>
                  <Ionicons name="mail" size={16} color="#64748B" />
                  <Text style={styles.detailText}>{techProfile.email}</Text>
                </View>
              )}
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtnCall} onPress={handleCall}>
                <Ionicons name="call" size={18} color="#FFF" />
                <Text style={styles.actionBtnTextCall}>Call Shop</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtnEmail} onPress={handleEmail}>
                <Ionicons name="mail-outline" size={18} color={colors.primary} />
                <Text style={styles.actionBtnTextEmail}>Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Cancel Button */}
      {!isCancelled && order?.status !== 'Completed' && order?.status !== 'Delivered' && (
        <View style={styles.bottomCancelBar}>
          <TouchableOpacity style={styles.cancelOrderBtn} onPress={() => setShowCancelModal(true)}>
            <Text style={styles.cancelOrderText}>Cancel {type === 'Product' ? 'Order' : 'Service'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Cancellation Modal */}
      <Modal visible={showCancelModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancel {type === 'Product' ? 'Order' : 'Booking'}</Text>
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

            <Text style={styles.modalSubtitle}>Additional Notes (Mandatory):</Text>
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
  
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  orderIdText: { fontSize: 14, fontWeight: '800', color: '#64748B', marginBottom: 4 },
  deviceText: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  statusBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '800', color: '#2563EB', textTransform: 'uppercase' },

  // 🚀 New Badge Styles
  trackingPaymentBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginTop: 8, gap: 4 },
  trackingBadgePaid: { backgroundColor: '#DCFCE7' },
  trackingTextPaid: { color: '#15803D', fontWeight: '800', fontSize: 11 },
  trackingBadgeCod: { backgroundColor: '#FEF3C7' },
  trackingTextCod: { color: '#B45309', fontWeight: '800', fontSize: 11 },
  
  statusBadgeCancelled: { backgroundColor: '#FEE2E2' },
  statusTextCancelled: { color: '#EF4444' },
  cancelledBanner: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#FECACA', marginBottom: 20, alignItems: 'center' },
  cancelledTitle: { fontSize: 14, fontWeight: '900', color: '#991B1B' },
  cancelledReason: { fontSize: 13, color: '#DC2626', marginTop: 4, fontWeight: '500' },

  timelineContainer: { backgroundColor: '#FFF', padding: 25, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  iconActive: { backgroundColor: '#2563EB' },
  iconInactive: { backgroundColor: '#F1F5F9' },
  stepTitle: { marginLeft: 15, fontSize: 14, fontWeight: '800', color: '#94A3B8' },
  textActive: { color: '#0F172A' },
  connector: { position: 'absolute', left: 19, top: 35, width: 2, height: 35, backgroundColor: '#F1F5F9', zIndex: 1 },
  connActive: { backgroundColor: '#2563EB' },

  // 🚀 Order Summary Styles
  summaryCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  summaryTitle: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginBottom: 15 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 5 },
  summaryIconBox: { width: 30, alignItems: 'center', marginRight: 5, paddingTop: 2 },
  summaryLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  summaryValue: { fontSize: 14, color: '#0F172A', fontWeight: '700' },
  summaryDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  
  shopCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  shopHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  shopAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  shopName: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  shopOwner: { fontSize: 13, color: '#64748B', fontWeight: '600', marginTop: 2 },
  shopDetailsBox: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, marginBottom: 20 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  detailText: { fontSize: 13, color: '#475569', fontWeight: '500', flex: 1, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtnCall: { flex: 1, flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 6 },
  actionBtnTextCall: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },
  actionBtnEmail: { flex: 1, flexDirection: 'row', backgroundColor: '#EFF6FF', paddingVertical: 12, borderRadius: 14, justifyContent: 'center', alignItems: 'center', gap: 6 },
  actionBtnTextEmail: { color: colors.primary, fontSize: 14, fontWeight: 'bold' },

  bottomCancelBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  cancelOrderBtn: { backgroundColor: '#FEF2F2', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
  cancelOrderText: { color: '#EF4444', fontSize: 16, fontWeight: '800' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  modalSubtitle: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 10 },
  reasonContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  reasonPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  reasonPillActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  reasonText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  reasonTextActive: { color: '#2563EB' },
  notesInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, fontSize: 14, textAlignVertical: 'top', height: 100, marginBottom: 20 },
  confirmCancelBtn: { backgroundColor: '#EF4444', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  confirmCancelText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});