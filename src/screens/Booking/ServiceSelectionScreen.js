// src/screens/Booking/ServiceSelectionScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Platform, StatusBar, ScrollView, ActivityIndicator, FlatList, Dimensions 
} from 'react-native';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// 🚀 Database Import
import { db } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

const { height } = Dimensions.get('window');

export default function ServiceSelectionScreen({ navigation, route }) {
  const selectedModelId = route.params?.modelId; 
  const selectedModelName = route.params?.modelName || 'Your Device';
  const selectedBrandName = route.params?.brandName || 'Device';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🛒 Cart system for selected services with chosen technicians
  const [cart, setCart] = useState([]); 

  // 🏪 Vendor Popup States
  const [showVendorPopup, setShowVendorPopup] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  // 🚀 1. Fetch Master Services for the Model
  useEffect(() => {
    if (!selectedModelId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'master_services'), where('modelId', '==', selectedModelId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedServices = [];
      snapshot.forEach((doc) => {
        fetchedServices.push({ id: doc.id, ...doc.data() });
      });
      setServices(fetchedServices);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching services: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedModelId]);

  // 🚀 2. Fetch Technicians & Prices when a Service is clicked
  const handleServiceClick = (service) => {
    setActiveService(service);
    setShowVendorPopup(true);
    setLoadingVendors(true);

    // Query: 'technician_rates' me se is unique masterServiceId ke rates nikalo
    const q = query(
      collection(db, 'technician_rates'), 
      where('masterServiceId', '==', service.id),
      where('inStock', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedVendors = [];
      snapshot.forEach((doc) => {
        fetchedVendors.push({ id: doc.id, ...doc.data() });
      });
      setVendors(fetchedVendors);
      setLoadingVendors(false);
    }, (error) => {
      console.error("Error fetching vendor rates: ", error);
      setLoadingVendors(false);
    });

    return () => unsubscribe;
  };

  // ➕ Add Vendor Service to Cart
  const selectVendorForService = (vendor) => {
    // Check if this service is already in cart
    const existingIndex = cart.findIndex(item => item.serviceId === activeService.id);
    
    const cartItem = {
      serviceId: activeService.id,
      serviceTitle: activeService.title,
      vendorId: vendor.technicianId,
      vendorName: vendor.technicianName || 'Expert Technician',
      price: Number(vendor.offeringPrice)
    };

    if (existingIndex > -1) {
      // Replace existing choice
      const newCart = [...cart];
      newCart[existingIndex] = cartItem;
      setCart(newCart);
    } else {
      // Add new
      setCart([...cart, cartItem]);
    }
    setShowVendorPopup(false);
  };

  // ❌ Remove from Cart
  const removeServiceFromCart = (serviceId) => {
    setCart(cart.filter(item => item.serviceId !== serviceId));
  };

  // 💰 Calculate Total
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // 🚀 Go to Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigation.navigate('Checkout', {
      brandName: selectedBrandName,
      modelName: selectedModelName,
      selectedServices: cart, // Ab cart me service ke sath vendor details bhi ja rhi hain!
      totalAmount: total
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Services</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.deviceName}>{selectedBrandName} {selectedModelName}</Text>
        <Text style={styles.subHeader}>Select issues to compare vendor prices:</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.grid}>
            {services.map((item) => {
              const cartItem = cart.find(c => c.serviceId === item.id);
              const isSelected = !!cartItem;
              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.serviceCard, isSelected && styles.activeCard]}
                  onPress={() => handleServiceClick(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.bg || '#EFF6FF' }]}>
                    <MaterialIcons name={item.icon || 'build'} size={28} color={item.color || '#2563EB'} />
                  </View>
                  <Text style={styles.serviceName}>{item.title}</Text>
                  
                  {isSelected ? (
                    <Text style={styles.priceTextSelected}>Selected: ₹{cartItem.price}</Text>
                  ) : (
                    <Text style={styles.compareLinkText}>Compare Prices ➔</Text>
                  )}

                  {isSelected && (
                    <TouchableOpacity style={styles.removeBadge} onPress={() => removeServiceFromCart(item.id)}>
                      <Ionicons name="close-circle" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 🏪 VENDOR COMPARISON POPUP (BOTTOM SHEET STYLE) */}
      {showVendorPopup && (
        <View style={styles.popupOverlay}>
          <View style={styles.popupContent}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Compare Vendors ({activeService?.title})</Text>
              <TouchableOpacity onPress={() => setShowVendorPopup(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {loadingVendors ? (
              <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 40 }} />
            ) : vendors.length === 0 ? (
              <View style={styles.emptyVendors}>
                <Text style={styles.emptyVendorText}>No technicians available for this service right now.</Text>
              </View>
            ) : (
              <FlatList 
                data={vendors}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => (
                  <View style={styles.vendorCard}>
                    <View style={styles.vendorLeft}>
                      <Text style={styles.vendorName}>{item.technicianName || 'FixitPro Expert'}</Text>
                      <View style={styles.ratingRow}>
                        <FontAwesome name="star" size={14} color="#F59E0B" />
                        <Text style={styles.vendorRating}>{item.rating || '4.7'} ({item.repairsCount || '50'}+ Repairs)</Text>
                      </View>
                    </View>
                    <View style={styles.vendorRight}>
                      <Text style={styles.vendorPrice}>₹{item.offeringPrice}</Text>
                      <TouchableOpacity style={styles.selectVendorBtn} onPress={() => selectVendorForService(item)}>
                        <Text style={styles.selectVendorText}>Choose</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </View>
      )}

      {/* BOTTOM ACTION BAR */}
      {cart.length > 0 && !showVendorPopup && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
            <Text style={styles.btnText}>Checkout</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  deviceName: { fontSize: 13, fontWeight: '700', color: '#2563EB', backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  subHeader: { fontSize: 15, fontWeight: '700', color: '#475569', marginBottom: 20 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: { width: '48%', backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', borderWidth: 2, borderColor: '#F1F5F9', position: 'relative' },
  activeCard: { borderColor: '#2563EB', backgroundColor: '#F0F7FF' },
  iconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  serviceName: { fontSize: 13, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 8, minHeight: 35 },
  compareLinkText: { fontSize: 13, fontWeight: '700', color: '#2563EB' },
  priceTextSelected: { fontSize: 14, fontWeight: '900', color: '#059669' },
  removeBadge: { position: 'absolute', top: 8, right: 8 },
  
  /* POPUP STYLES */
  popupOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'flex-end', zIndex: 10 },
  popupContent: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: height * 0.6 },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  popupTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  emptyVendors: { padding: 40, alignItems: 'center' },
  emptyVendorText: { color: '#64748B', fontWeight: '600', textAlign: 'center' },
  
  vendorCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  vendorLeft: { flex: 1 },
  vendorName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 5 },
  vendorRating: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  vendorRight: { alignItems: 'flex-end', gap: 6 },
  vendorPrice: { fontSize: 18, fontWeight: '900', color: '#059669' },
  selectVendorBtn: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  selectVendorText: { color: '#FFF', fontWeight: '800', fontSize: 12 },

  /* BOTTOM BAR */
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  totalLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  totalAmount: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  checkoutBtn: { flexDirection: 'row', backgroundColor: '#2563EB', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '800', marginRight: 5, fontSize: 15 }
});