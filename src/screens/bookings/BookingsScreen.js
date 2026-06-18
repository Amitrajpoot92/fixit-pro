// src/screens/bookings/BookingsScreen.js
import React, { useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Platform, StatusBar 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useTabVisibility } from '../../context/TabVisibilityContext';
import { useNavigation } from '@react-navigation/native';

const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15 },
  android: { elevation: 6, shadowColor: '#94A3B8' },
});

const pillShadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 3 },
});

const bookingData = [
  { id: '#BK-1001', service: 'Screen Replacement', category: 'Apple iPhone 13 Pro', month: 'JUN', day: '18', time: '10:00 AM - 11:30 AM', status: 'Upcoming', proName: 'Rahul Sharma', proRating: '4.8', bg: '#EFF6FF', color: '#2563EB' },
  { id: '#BK-1002', service: 'Battery Replacement', category: 'Samsung Galaxy S22', month: 'JUN', day: '20', time: '02:00 PM - 03:00 PM', status: 'Upcoming', proName: 'Unassigned', proRating: null, bg: '#F5F3FF', color: '#7C3AED' },
  { id: '#BK-0985', service: 'Speaker Repair', category: 'OnePlus 9R', month: 'JUN', day: '02', time: '04:00 PM - 05:30 PM', status: 'Past', proName: 'Amit Kumar', proRating: '4.9', bg: '#ECFDF5', color: '#059669' },
];

export default function BookingsScreen() {
  const { setIsTabBarVisible } = useTabVisibility(); 
  const navigation = useNavigation();
  const currentY = useRef(0);
  const [activeTab, setActiveTab] = useState('Upcoming');

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const isScrollingDown = yOffset > currentY.current && yOffset > 50; 
    if (isScrollingDown) setIsTabBarVisible(false);
    else if (yOffset < currentY.current && (currentY.current - yOffset > 5)) setIsTabBarVisible(true); 
    currentY.current = yOffset;
  };

  const filteredBookings = bookingData.filter(b => b.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.searchBtn}><Ionicons name="search" size={20} color="#0F172A" /></TouchableOpacity>
      </View>

      <View style={styles.tabWrapper}>
        {['Upcoming', 'Past', 'Cancelled'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.pillButton, activeTab === tab && styles.pillActive, activeTab === tab && pillShadow]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.pillText, activeTab === tab && styles.pillTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        onScroll={handleScroll}
        scrollEventThrottle={16} 
        contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 20}} 
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}><MaterialIcons name="event-busy" size={40} color="#94A3B8" /></View>
            <Text style={styles.emptyStateTitle}>No {activeTab.toLowerCase()} bookings</Text>
            <TouchableOpacity style={styles.bookNowBtn} onPress={() => navigation.navigate('DeviceSelection')}>
              <Text style={styles.btnPrimaryText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredBookings.map((booking, idx) => (
            <View key={idx} style={[styles.bookingCard, shadowStyle]}>
              <View style={styles.cardHeader}>
                <View style={[styles.dateBox, { backgroundColor: booking.bg }]}>
                  <Text style={[styles.dateMonth, { color: booking.color }]}>{booking.month}</Text>
                  <Text style={[styles.dateDay, { color: booking.color }]}>{booking.day}</Text>
                </View>
                <View style={styles.bookingInfo}>
                  <Text style={styles.categoryText}>{booking.category}</Text>
                  <Text style={styles.serviceName}>{booking.service}</Text>
                  <View style={styles.timeRow}><MaterialIcons name="schedule" size={14} color="#64748B" /><Text style={styles.timeText}>{booking.time}</Text></View>
                </View>
              </View>

              <View style={styles.proBanner}>
                {booking.proName !== 'Unassigned' ? (
                  <>
                    <View style={styles.proAvatar}><Text style={styles.proAvatarText}>{booking.proName.charAt(0)}</Text></View>
                    <View style={styles.proDetails}><Text style={styles.proName}>{booking.proName}</Text><Text style={styles.proRating}>{booking.proRating} Rating</Text></View>
                    <View style={styles.proActions}><TouchableOpacity style={styles.iconCircle}><MaterialIcons name="call" size={16} color={colors.success} /></TouchableOpacity></View>
                  </>
                ) : (
                  <View style={styles.unassignedRow}><MaterialIcons name="hourglass-empty" size={18} color="#F59E0B" /><Text style={styles.unassignedText}>Assigning technician...</Text></View>
                )}
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity style={[styles.actionBtn, styles.btnSoft]}><Text style={styles.btnSoftText}>Reschedule</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.btnPrimary]}><Text style={styles.btnPrimaryText}>View Details</Text></TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  tabWrapper: { flexDirection: 'row', backgroundColor: '#F1F5F9', marginHorizontal: 20, borderRadius: 14, padding: 4, marginBottom: 20 },
  pillButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  pillActive: { backgroundColor: '#FFF' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  pillTextActive: { color: '#0F172A', fontWeight: '800' },
  bookingCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dateBox: { width: 65, height: 65, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  dateMonth: { fontSize: 11, fontWeight: '800', marginBottom: 2 },
  dateDay: { fontSize: 22, fontWeight: '900' },
  bookingInfo: { flex: 1 },
  categoryText: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase' },
  serviceName: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginVertical: 4 },
  timeRow: { flexDirection: 'row', alignItems: 'center' },
  timeText: { fontSize: 12, color: '#475569', fontWeight: '700', marginLeft: 4 },
  proBanner: { backgroundColor: '#F8FAFC', borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  proAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  proAvatarText: { fontSize: 16, fontWeight: '800', color: '#475569' },
  proDetails: { flex: 1 },
  proName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  proRating: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  proActions: { flexDirection: 'row' },
  iconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  unassignedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1 },
  unassignedText: { fontSize: 12, color: '#F59E0B', fontWeight: '600', marginLeft: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 15, marginTop: 15 },
  actionBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  btnSoft: { backgroundColor: '#F1F5F9' },
  btnSoftText: { color: '#334155', fontSize: 13, fontWeight: '800' },
  btnPrimary: { backgroundColor: '#2563EB' },
  btnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyStateTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  bookNowBtn: { marginTop: 20, backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }
});