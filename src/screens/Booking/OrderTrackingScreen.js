// src/screens/Booking/OrderTrackingScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, ScrollView, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function OrderTrackingScreen({ navigation }) {
  // Timeline Data
  const trackSteps = [
    { id: 1, title: 'Order Placed', desc: 'Your request has been received.', date: '17 Jun, 10:00 AM', status: 'done' },
    { id: 2, title: 'Technician Assigned', desc: 'Rahul Sharma is on the way.', date: '17 Jun, 10:15 AM', status: 'done' },
    { id: 3, title: 'Repair In-Progress', desc: 'Repairing your iPhone 13 Pro.', date: 'Pending', status: 'current' },
    { id: 4, title: 'Order Completed', desc: 'Phone will be delivered soon.', date: 'Pending', status: 'next' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 FIXED: Status bar translucent property added for consistency */}
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order</Text>
        <TouchableOpacity style={styles.helpBtn}><Ionicons name="chatbubble-ellipses-outline" size={22} color="#0F172A" /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
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
                {index < trackSteps.length - 1 && <View style={styles.line} />}
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, step.status === 'current' && {color: colors.primary}]}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
                <Text style={styles.stepDate}>{step.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* TECHNICIAN INFO */}
        <View style={styles.techCard}>
          <View style={styles.techAvatar}><Ionicons name="person" size={30} color={colors.primary} /></View>
          <View style={styles.techDetails}>
            <Text style={styles.techName}>Rahul Sharma</Text>
            <Text style={styles.techRating}><Ionicons name="star" color="#F59E0B" /> 4.8 (120+ Repairs)</Text>
          </View>
          <TouchableOpacity style={styles.callButton}><Ionicons name="call" size={20} color="#FFF" /></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚀 FIXED: Added paddingTop for Android Status Bar overlap
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  helpBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  content: { padding: 20 },
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
  callButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.success, justifyContent: 'center', alignItems: 'center' }
});