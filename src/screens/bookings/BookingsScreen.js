// src/screens/bookings/BookingsScreen.js
import React, { useRef, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Platform, StatusBar, ActivityIndicator 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useTabVisibility } from '../../context/TabVisibilityContext';
import { useNavigation } from '@react-navigation/native';

// 🚀 Firebase Imports
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../services/firebaseConfig'; 

const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15 },
  android: { elevation: 6, shadowColor: '#94A3B8' },
  web: { boxShadow: '0px 8px 15px rgba(148, 163, 184, 0.15)' }
});

const pillShadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 3 },
  web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
});

const getDisplayDate = (scheduleDateStr, createdAt) => {
  let date = createdAt ? new Date(createdAt.toDate()) : new Date();
  if (scheduleDateStr === 'Tomorrow') date.setDate(date.getDate() + 1);
  else if (scheduleDateStr === 'Day After') date.setDate(date.getDate() + 2);

  return {
    month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
    day: date.getDate().toString().padStart(2, '0')
  };
};

export default function BookingsScreen() {
  const { setIsTabBarVisible } = useTabVisibility(); 
  const navigation = useNavigation();
  const currentY = useRef(0);
  
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Fetch Live Bookings from Firestore
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBookings = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const mode = data.serviceMode || 'home';
        
        // 🚀 SIRF "HOME VISIT" WALE ORDERS YAHAN DIKHENGE
        if (mode === 'home') {
          const dateObj = getDisplayDate(data.scheduleDate, data.createdAt);
          
          fetchedBookings.push({
            id: doc.id,
            orderId: data.orderId,
            service: data.services ? data.services.map(s => s.serviceTitle).join(', ') : 'Service',
            category: `${data.brandName} ${data.modelName}`,
            month: dateObj.month,
            day: dateObj.day,
            time: data.scheduleTime || 'Anytime',
            dbStatus: data.status ? data.status.toLowerCase() : 'order placed',
            price: data.totalAmount ? `₹${data.totalAmount}` : 'Pending',
            proName: data.technicianName || 'Unassigned',
            proRating: data.technicianRating || null,
            bg: '#D1FAE5',
            color: '#10B981'
          });
        }
      });
      
      setBookings(fetchedBookings);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const isScrollingDown = yOffset > currentY.current && yOffset > 50; 
    if (isScrollingDown) setIsTabBarVisible(false);
    else if (yOffset < currentY.current && (currentY.current - yOffset > 5)) setIsTabBarVisible(true); 
    if (yOffset <= 10) setIsTabBarVisible(true);
    currentY.current = yOffset;
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === 'Upcoming') return ['order placed', 'technician assigned', 'repair in-progress'].includes(b.dbStatus);
    if (activeTab === 'Past') return b.dbStatus === 'completed';
    if (activeTab === 'Cancelled') return b.dbStatus === 'cancelled';
    return false;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home Services</Text>
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

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#10B981" />
        </View>
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          onScroll={handleScroll}
          scrollEventThrottle={16} 
          contentContainerStyle={{paddingBottom: 150, paddingHorizontal: 20}} 
        >
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}><MaterialIcons name="event-busy" size={40} color="#94A3B8" /></View>
              <Text style={styles.emptyStateTitle}>No {activeTab.toLowerCase()} home visits</Text>
              <TouchableOpacity style={styles.bookNowBtn} onPress={() => navigation.navigate('DeviceSelection')}>
                <Text style={styles.btnPrimaryText}>Book Home Service</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredBookings.map((booking) => (
              <View key={booking.id} style={[styles.bookingCard, shadowStyle]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.dateBox, { backgroundColor: booking.bg }]}>
                    <Text style={[styles.dateMonth, { color: booking.color }]}>{booking.month}</Text>
                    <Text style={[styles.dateDay, { color: booking.color }]}>{booking.day}</Text>
                  </View>
                  <View style={styles.bookingInfo}>
                    <View style={styles.categoryRow}>
                      <Text style={styles.categoryText}>{booking.category}</Text>
                      {/* Price on Header for quick view */}
                      <Text style={styles.priceText}>{booking.price}</Text>
                    </View>
                    <Text style={styles.serviceName} numberOfLines={1}>{booking.service}</Text>
                    <View style={styles.timeRow}>
                      <MaterialIcons name="schedule" size={14} color="#64748B" />
                      <Text style={styles.timeText}>{booking.time}</Text>
                    </View>
                  </View>
                </View>

                {/* 🚀 PREMIUM TECHNICIAN BANNER */}
                <View style={styles.proBanner}>
                  {booking.proName !== 'Unassigned' ? (
                    <>
                      <View style={styles.proAvatar}><Text style={styles.proAvatarText}>{booking.proName.charAt(0)}</Text></View>
                      <View style={styles.proDetails}>
                        <Text style={styles.proName}>{booking.proName}</Text>
                        <Text style={styles.proRating}>{booking.proRating ? `${booking.proRating} Rating` : 'Pro Tech'}</Text>
                      </View>
                      <View style={styles.proActions}>
                        <TouchableOpacity style={styles.iconCircle}><MaterialIcons name="call" size={16} color={colors.success} /></TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <View style={styles.unassignedRow}>
                      <MaterialIcons name="hourglass-empty" size={18} color="#F59E0B" />
                      <Text style={styles.unassignedText}>Assigning technician...</Text>
                    </View>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.btnSoft]} 
                    onPress={() => navigation.getParent().navigate('Support')}
                  >
                    <Text style={styles.btnSoftText}>Support</Text>
                  </TouchableOpacity>
                  
                  {activeTab === 'Upcoming' && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.btnPrimary]} 
                      onPress={() => navigation.navigate('OrderTracking', { orderId: booking.orderId })}
                    >
                      <Text style={styles.btnPrimaryText}>Track Order</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryText: { fontSize: 11, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', flex: 1 },
  priceText: { fontSize: 16, fontWeight: '900', color: '#059669' },
  
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
  btnPrimary: { backgroundColor: '#10B981' }, // Home Visit Theme Color
  btnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyStateTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  bookNowBtn: { marginTop: 20, backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }
});