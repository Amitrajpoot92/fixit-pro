// src/screens/Booking/CheckoutScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Platform, StatusBar, ScrollView, Alert, Modal 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext'; 

// 🚀 Firebase Imports
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

export default function CheckoutScreen({ navigation, route }) {
  const { user } = useAuth(); 
  
  // 🚀 DATA FROM PREVIOUS SCREEN
  const brandName = route.params?.brandName || 'Unknown Brand';
  const modelName = route.params?.modelName || 'Unknown Model';
  const selectedServices = route.params?.selectedServices || [];
  const initialServicesTotal = route.params?.totalAmount || 0;
  
  // 🚀 AUTOMATIC LOGIC: Technician data coming dynamically from selection step
  const selectedTechId = route.params?.selectedTechId; 
  const selectedTechName = route.params?.selectedTechName;

  const [mode, setMode] = useState('home'); 
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:00 AM - 12:00 PM');
  
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  
  const visitFee = 199;   
  const pickupFee = 99;   
  const selfFee = 0;      

  // Fetch Real Addresses from Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, 'users', user.uid, 'addresses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const addrs = [];
      snapshot.forEach(doc => addrs.push({ id: doc.id, ...doc.data() }));
      setSavedAddresses(addrs);
      
      if (addrs.length > 0) {
        if (!selectedAddress) {
          setSelectedAddress(addrs[0]);
        } else {
          const exists = addrs.find(a => a.id === selectedAddress.id);
          if (!exists) setSelectedAddress(addrs[0]);
          else setSelectedAddress(exists); 
        }
      } else {
        setSelectedAddress(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const getFee = () => {
    if (mode === 'home') return visitFee;
    if (mode === 'pickup') return pickupFee;
    return selfFee; 
  };

  const totalPayable = initialServicesTotal + getFee();

  const handleProceedToPayment = () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please login to your account to complete this booking.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login Now", onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    // Safety Validation: Agar data miss ho jaye pichli screen se
    if (!selectedTechId) {
      Alert.alert("Error", "Technician information is missing. Please re-select a technician.");
      return;
    }

    if ((mode === 'home' || mode === 'pickup') && (!selectedDate || !selectedTime)) {
      Alert.alert("Missing Info", "Please select a date and time slot.");
      return;
    }

    if ((mode === 'home' || mode === 'pickup') && !selectedAddress) {
      Alert.alert("Address Required", "Please add a service address to proceed.");
      return;
    }

    // 🚀 DYNAMIC DATA FORWARDING TO PAYMENT SCREEN
    navigation.navigate('PaymentSelection', {
      brandName,
      modelName,
      selectedServices,
      totalAmount: totalPayable,
      serviceMode: mode,               
      scheduleDate: mode === 'self' ? null : selectedDate, 
      scheduleTime: mode === 'self' ? null : selectedTime,
      serviceAddress: mode === 'self' ? null : selectedAddress,
      selectedTechId,    // Forwarding dynamic ID
      selectedTechName   // Forwarding dynamic Name
    });
  };

  const dates = ['Today', 'Tomorrow', 'Day After'];
  const timeSlots = ['10:00 AM - 12:00 PM', '01:00 PM - 03:00 PM', '04:00 PM - 06:00 PM'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.deviceBox}>
            <Text style={styles.deviceTitle}>{brandName} {modelName}</Text>
            <Text style={{ fontSize: 12, color: '#1E40AF', fontWeight: '700', marginTop: 4 }}>
              Selected Pro: {selectedTechName || 'Loading...'}
            </Text>
            {selectedServices.map((srv, index) => (
                <Text key={index} style={styles.deviceSubtitle}>
                    • {srv.serviceTitle}
                </Text>
            ))}
        </View>

        <Text style={styles.sectionTitle}>Select Service Mode</Text>
        <View style={styles.modeContainer}>
          <TouchableOpacity style={[styles.modeBtn, mode === 'home' && styles.activeMode]} onPress={() => setMode('home')}>
            <MaterialIcons name="home-repair-service" size={24} color={mode === 'home' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'home' && styles.activeText]}>Home Visit</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeBtn, mode === 'pickup' && styles.activeMode]} onPress={() => setMode('pickup')}>
            <MaterialIcons name="local-shipping" size={24} color={mode === 'pickup' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'pickup' && styles.activeText]}>Pickup & Drop</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.modeBtn, mode === 'self' && styles.activeMode]} onPress={() => setMode('self')}>
            <MaterialIcons name="store" size={24} color={mode === 'self' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'self' && styles.activeText]}>Self Drop</Text>
          </TouchableOpacity>
        </View>

        {(mode === 'home' || mode === 'pickup') && (
          <View style={styles.scheduleBox}>
            <Text style={styles.addressTitle}>Select Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 15, marginTop: 10}}>
              {dates.map((d, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.slotBtn, selectedDate === d && styles.activeSlotBtn]}
                  onPress={() => setSelectedDate(d)}
                >
                  <Text style={[styles.slotText, selectedDate === d && styles.activeText]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.addressTitle}>Select Time Slot</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
              {timeSlots.map((t, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.slotBtn, selectedTime === t && styles.activeSlotBtn]}
                  onPress={() => setSelectedTime(t)}
                >
                  <Text style={[styles.slotText, selectedTime === t && styles.activeText]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {(mode === 'home' || mode === 'pickup') && (
            <View style={styles.addressBox}>
                <View style={styles.addressHeader}>
                    <Text style={styles.addressTitle}>Service Address</Text>
                    <TouchableOpacity onPress={() => savedAddresses.length > 0 ? setAddressModalVisible(true) : navigation.navigate('Address')}>
                      <Text style={styles.changeLink}>{selectedAddress ? 'Change' : 'Add New'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.addressBody}>
                    <Ionicons name="location" size={24} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      {selectedAddress && <Text style={styles.addressTypeBadge}>{selectedAddress.type}</Text>}
                      <Text style={styles.addressText} numberOfLines={2}>
                          {!user ? 'Please login to select address' : 
                           selectedAddress ? `${selectedAddress.flat}, ${selectedAddress.area}, ${selectedAddress.city} - ${selectedAddress.pincode}` : 
                           'No address found. Please add an address.'}
                      </Text>
                    </View>
                </View>
            </View>
        )}

        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
           <View style={styles.billRow}>
               <Text style={styles.billLabel}>Repair Charges</Text>
               <Text style={styles.billValue}>₹{initialServicesTotal}</Text>
           </View>
           <View style={styles.billRow}>
             <Text style={styles.billLabel}>{mode === 'home' ? 'Home Visit Fee' : mode === 'pickup' ? 'Pickup & Drop Fee' : 'Self Drop'}</Text>
             <Text style={[styles.billValue, {fontWeight: '800'}]}>{getFee() === 0 ? 'FREE' : `₹${getFee()}`}</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.billRow}>
               <Text style={styles.totalText}>Total Payable</Text>
               <Text style={styles.totalText}>₹{totalPayable}</Text>
           </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.payBtn} onPress={handleProceedToPayment}>
          <Text style={styles.btnText}>Proceed to Payment</Text>
          <MaterialIcons name="chevron-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ADDRESS SELECTOR MODAL */}
      <Modal visible={addressModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {savedAddresses.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.addressSelectCard, selectedAddress?.id === item.id && styles.activeAddressCard]}
                  onPress={() => { setSelectedAddress(item); setAddressModalVisible(false); }}
                >
                  <View style={styles.addressSelectRow}>
                    <MaterialIcons name={item.type === 'Home' ? 'home' : item.type === 'Office' ? 'work' : 'place'} size={20} color={selectedAddress?.id === item.id ? colors.primary : '#64748B'} />
                    <Text style={[styles.addressSelectType, selectedAddress?.id === item.id && { color: colors.primary }]}>{item.type}</Text>
                    {selectedAddress?.id === item.id && <Ionicons name="checkmark-circle" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />}
                  </View>
                  <Text style={styles.addressSelectText}>{item.flat}, {item.area}, {item.city} - {item.pincode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.manageAddressBtn} onPress={() => { setAddressModalVisible(false); navigation.navigate('Address'); }}>
              <MaterialIcons name="edit-location" size={20} color="#FFF" />
              <Text style={styles.manageAddressBtnText}>Manage / Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  deviceBox: { backgroundColor: '#EFF6FF', padding: 15, borderRadius: 16, marginBottom: 25, borderWidth: 1, borderColor: '#BFDBFE' },
  deviceTitle: { fontSize: 16, fontWeight: '900', color: colors.primary, marginBottom: 5 },
  deviceSubtitle: { fontSize: 13, color: '#3B82F6', fontWeight: '600', marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#475569', marginBottom: 15 },
  modeContainer: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  modeBtn: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  activeMode: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeText: { fontSize: 11, fontWeight: '800', marginTop: 8, color: '#64748B', textAlign: 'center' },
  activeText: { color: '#FFF' },
  scheduleBox: { backgroundColor: '#FFF', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
  slotBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#CBD5E1', marginRight: 10, backgroundColor: '#F8FAFC' },
  activeSlotBtn: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  addressBox: { backgroundColor: '#FFF', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  addressTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  changeLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  addressBody: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addressText: { fontSize: 13, color: '#64748B', lineHeight: 20 },
  addressTypeBadge: { fontSize: 11, fontWeight: '800', color: colors.primary, backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  billValue: { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  totalText: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  bottomBar: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  payBtn: { flexDirection: 'row', backgroundColor: '#2563EB', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 5 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  addressSelectCard: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 12 },
  activeAddressCard: { borderColor: colors.primary, backgroundColor: '#EFF6FF' },
  addressSelectRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  addressSelectType: { fontSize: 14, fontWeight: '800', marginLeft: 8, color: '#0F172A' },
  addressSelectText: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  manageAddressBtn: { flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 15, gap: 8 },
  manageAddressBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' }
});