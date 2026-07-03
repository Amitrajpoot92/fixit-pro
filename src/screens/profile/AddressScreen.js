// src/screens/profile/AddressScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Platform, 
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebaseConfig';

export default function AddressScreen({ navigation }) {
  const { user } = useAuth();
  
  // 🟢 States for fetching and displaying data
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🟢 States for Modal (Add/Edit Form)
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAddressId, setCurrentAddressId] = useState(null);
  
  // 🟢 Form Field States
  const [type, setType] = useState('Home'); // Home, Office, Other
  const [flat, setFlat] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [saving, setSaving] = useState(false);

  // 🚀 1. Real-time Fetch Addresses from Firestore Subcollection
  useEffect(() => {
    if (!user?.uid) return;

    // Path: users -> {uid} -> addresses
    const q = query(collection(db, 'users', user.uid, 'addresses'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const addressData = [];
      snapshot.forEach((doc) => {
        addressData.push({ id: doc.id, ...doc.data() });
      });
      setAddresses(addressData);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [user]);

  // 🚀 2. Open Modal for Add
  const handleAddAddress = () => {
    setIsEditing(false);
    setCurrentAddressId(null);
    setType('Home');
    setFlat('');
    setArea('');
    setCity('');
    setPincode('');
    setModalVisible(true);
  };

  // 🚀 3. Open Modal for Edit
  const handleEditAddress = (item) => {
    setIsEditing(true);
    setCurrentAddressId(item.id);
    setType(item.type);
    setFlat(item.flat);
    setArea(item.area);
    setCity(item.city);
    setPincode(item.pincode);
    setModalVisible(true);
  };

  // 🚀 4. Save (Add or Update) Address to Firestore
  const handleSave = async () => {
    if (!flat.trim() || !area.trim() || !city.trim() || !pincode.trim()) {
      Alert.alert('Incomplete Details', 'Please fill all the address fields.');
      return;
    }

    setSaving(true);
    try {
      const addressPayload = {
        type,
        flat: flat.trim(),
        area: area.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        updatedAt: new Date().toISOString()
      };

      if (isEditing) {
        // Update existing address
        const addressRef = doc(db, 'users', user.uid, 'addresses', currentAddressId);
        await updateDoc(addressRef, addressPayload);
      } else {
        // Add new address
        const addressesRef = collection(db, 'users', user.uid, 'addresses');
        await addDoc(addressesRef, { ...addressPayload, createdAt: new Date().toISOString() });
      }
      
      setModalVisible(false);
    } catch (error) {
      console.error("Error saving address: ", error);
      Alert.alert('Error', 'Could not save the address.');
    } finally {
      setSaving(false);
    }
  };

  // 🚀 5. Delete Address
  const handleDelete = (id) => {
    Alert.alert("Delete Address", "Are you sure you want to remove this address?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'users', user.uid, 'addresses', id));
          } catch (error) {
            Alert.alert("Error", "Could not delete address.");
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Addresses</Text>
        <TouchableOpacity onPress={handleAddAddress}>
          <MaterialIcons name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Address List */}
      {loading ? (
        <View style={styles.centerView}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : addresses.length === 0 ? (
        <View style={styles.centerView}>
          <MaterialIcons name="location-off" size={60} color="#CBD5E1" />
          <Text style={styles.emptyText}>No addresses saved yet.</Text>
          <Text style={styles.emptySubText}>Add a new address to proceed with bookings easily.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{padding: 20}}>
          {addresses.map((item) => (
            <View key={item.id} style={styles.addressCard}>
              <View style={styles.row}>
                <MaterialIcons 
                  name={item.type === 'Home' ? 'home' : item.type === 'Office' ? 'work' : 'place'} 
                  size={24} 
                  color={colors.primary} 
                />
                <Text style={styles.addType}>{item.type}</Text>
              </View>
              <Text style={styles.addressText}>
                {item.flat}, {item.area}, {item.city} - {item.pincode}
              </Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.editLink} onPress={() => handleEditAddress(item)}>
                  <Text style={{color: colors.primary, fontWeight: '700'}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteLink} onPress={() => handleDelete(item.id)}>
                  <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add / Edit Address Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Address' : 'Add New Address'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Address Type</Text>
              <View style={styles.typeContainer}>
                {['Home', 'Office', 'Other'].map((t) => (
                  <TouchableOpacity 
                    key={t} 
                    style={[styles.typeBtn, type === t && styles.typeBtnActive]}
                    onPress={() => setType(t)}
                  >
                    <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Flat / House No. / Building</Text>
              <TextInput style={styles.input} value={flat} onChangeText={setFlat} placeholder="e.g. Flat 402, Sai Residency" />

              <Text style={styles.label}>Area / Street / Sector</Text>
              <TextInput style={styles.input} value={area} onChangeText={setArea} placeholder="e.g. Sector 45, Gurgaon" />

              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flex: 1, marginRight: 10}}>
                  <Text style={styles.label}>City</Text>
                  <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="e.g. New Delhi" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.label}>Pincode</Text>
                  <TextInput style={styles.input} value={pincode} onChangeText={setPincode} keyboardType="numeric" maxLength={6} placeholder="e.g. 110001" />
                </View>
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Save Address</Text>}
              </TouchableOpacity>
            </ScrollView>

          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  centerView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginTop: 15 },
  emptySubText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 5 },
  
  addressCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addType: { fontSize: 15, fontWeight: '800', marginLeft: 10, color: '#0F172A' },
  addressText: { color: '#64748B', lineHeight: 22, fontSize: 14 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 15 },
  editLink: { paddingRight: 20 },
  deleteLink: { padding: 5 },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  
  typeContainer: { flexDirection: 'row', marginBottom: 15 },
  typeBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginRight: 10 },
  typeBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  typeTextActive: { color: '#FFF' },
  
  label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, fontWeight: '600', marginBottom: 5 },
  
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 30, marginBottom: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});