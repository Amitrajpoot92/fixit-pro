// src/screens/Booking/OrderSuccessScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function OrderSuccessScreen({ navigation, route }) {
  // 🚀 Pichli screen se aayi hui dynamic Order ID (fallback fallback ke sath)
  const orderId = route.params?.orderId || 'ORD-000000';

  // 🗓️ Kal ki date nikalne ka dynamic logic
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateString = tomorrow.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      <View style={styles.content}>
        {/* SUCCESS ICON */}
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={100} color={colors.success} />
        </View>
        
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.desc}>
          Your repair request <Text style={{fontWeight: '800', color: '#0F172A'}}>#{orderId}</Text> has been placed successfully. 
          Our technician will contact you shortly.
        </Text>
        
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.infoText}>Tomorrow, {dateString} | 10:00 AM</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
            {/* Note: Aage chalkar ise bhi user ke selected address se replace kar lenge */}
            <Text style={styles.infoText}>Home (Saved Address)</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        {/* 🚀 FIXED: use replace aur sath mein orderId pass kar diya */}
        <TouchableOpacity 
          style={styles.trackBtn} 
          onPress={() => navigation.replace('OrderTracking', { orderId: orderId })} 
        >
          <Text style={styles.trackBtnText}>Track My Order</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.homeBtn} 
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIcon: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 15 },
  desc: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 40 },
  infoBox: { width: '100%', backgroundColor: '#F8FAFC', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  infoText: { marginLeft: 12, fontSize: 14, fontWeight: '600', color: '#475569' },
  footer: { padding: 20 },
  trackBtn: { backgroundColor: colors.primary, padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 10 },
  trackBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  homeBtn: { padding: 15, alignItems: 'center' },
  homeBtnText: { color: colors.primary, fontWeight: '700', fontSize: 14 }
});