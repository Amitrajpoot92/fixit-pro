// src/screens/Booking/OrderTrackingScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  StatusBar, ScrollView, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// 🚀 Firebase & App Imports
import { db } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

export default function OrderTrackingScreen({ navigation, route }) {
  // Pichli screen se orderId nikal rahe hain
  const { orderId } = route.params || {};
  
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 REAL-TIME FIREBASE LISTENER
  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'bookings'), where('orderId', '==', orderId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        // Humara order mil gaya
        const docData = snapshot.docs[0].data();
        setOrderData(docData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  // 📅 Date Formatter Helper
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Pending';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // 🔄 Dynamic Timeline Logic
  const getTimelineSteps = (currentStatus, createdAt) => {
    const statuses = ['Order Placed', 'Technician Assigned', 'Repair In-Progress', 'Completed'];
    const currentIndex = statuses.indexOf(currentStatus) !== -1 ? statuses.indexOf(currentStatus) : 0;

    return statuses.map((statusTitle, index) => {
      let state = 'next'; // default
      if (index < currentIndex) state = 'done';
      if (index === currentIndex) state = 'current';
      if (currentStatus === 'Completed') state = 'done'; // Agar complete ho gaya toh sab done

      // Descriptions for UI
      const descriptions = [
        'Your request has been received.',
        'A technician is assigned and on the way.',
        'Repair work has started.',
        'Service is completed successfully.'
      ];

      return {
        id: index + 1,
        title: statusTitle,
        desc: descriptions[index],
        date: index === 0 ? formatDate(createdAt) : (state === 'done' || state === 'current' ? 'Updated recently' : 'Pending'),
        status: state
      };
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, fontWeight: '600', color: '#64748B' }}>Fetching your order...</Text>
      </SafeAreaView>
    );
  }

  if (!orderData) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={{ marginTop: 10, fontWeight: '800', fontSize: 18 }}>Order Not Found</Text>
        <TouchableOpacity style={styles.backBtnFallback} onPress={() => navigation.navigate('MainTabs')}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Go to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Generate steps based on live status
  const trackSteps = getTimelineSteps(orderData.status, orderData.createdAt);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ORDER INFO BAR (Naya add kiya details dikhane ke liye) */}
        <View style={styles.orderInfoBox}>
          <Text style={styles.orderIdText}>Order #{orderData.orderId}</Text>
          <Text style={styles.deviceText}>{orderData.brandName} {orderData.modelName}</Text>
        </View>

        {/* MAP PLACEHOLDER */}
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={40} color="#94A3B8" />
          <Text style={styles.mapText}>Live Tracking Active</Text>
        </View>

        {/* TIMELINE SECTION */}
        <View style={styles.timelineCard}>
          <Text style={styles.sectionHeading}>Order Status</Text>
          {trackSteps.map((step, index) => (
            <View key={step.id} style={styles.stepWrapper}>
              <View style={styles.lineIndicator}>
                <View style={[styles.dot, step.status === 'done' && styles.dotDone, step.status === 'current' && styles.dotCurrent]} />
                {index < trackSteps.length - 1 && (
                  <View style={[styles.line, step.status === 'done' && { backgroundColor: colors.success }]} />
                )}
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, step.status === 'current' && {color: colors.primary}]}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
                <Text style={styles.stepDate}>{step.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* TECHNICIAN INFO (Only show if status is past Order Placed) */}
        {orderData.status !== 'Order Placed' && (
          <View style={styles.techCard}>
            <View style={styles.techAvatar}><Ionicons name="person" size={30} color={colors.primary} /></View>
            <View style={styles.techDetails}>
              <Text style={styles.techName}>Rahul Sharma</Text>
              <Text style={styles.techRating}><Ionicons name="star" color="#F59E0B" /> 4.8 (120+ Repairs)</Text>
            </View>
            <TouchableOpacity style={styles.callButton}><Ionicons name="call" size={20} color="#FFF" /></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  helpBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { padding: 20 },
  
  orderInfoBox: { backgroundColor: '#EFF6FF', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#BFDBFE' },
  orderIdText: { fontSize: 16, fontWeight: '900', color: colors.primary },
  deviceText: { fontSize: 13, color: '#3B82F6', fontWeight: '600', marginTop: 4 },

  mapPlaceholder: { height: 180, backgroundColor: '#E2E8F0', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  mapText: { marginTop: 10, color: '#64748B', fontWeight: '700' },
  timelineCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 20 },
  sectionHeading: { fontSize: 16, fontWeight: '800', marginBottom: 20 },
  stepWrapper: { flexDirection: 'row', marginBottom: 10 },
  lineIndicator: { alignItems: 'center', marginRight: 15 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#CBD5E1' },
  dotDone: { backgroundColor: colors.success },
  dotCurrent: { backgroundColor: colors.primary, borderWidth: 3, borderColor: '#BFDBFE' },
  line: { width: 2, height: 45, backgroundColor: '#E2E8F0', marginVertical: 4 },
  stepInfo: { flex: 1, paddingBottom: 15 },
  stepTitle: { fontWeight: '800', color: '#0F172A' },
  stepDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  stepDate: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginTop: 4 },
  techCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  techAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  techDetails: { flex: 1, marginLeft: 15 },
  techName: { fontSize: 16, fontWeight: '800' },
  techRating: { fontSize: 12, color: '#64748B', fontWeight: '600', marginTop: 2 },
  callButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' },
  
  backBtnFallback: { marginTop: 20, backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 }
});