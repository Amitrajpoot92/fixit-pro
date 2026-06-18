// src/screens/profile/AddressScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function AddressScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 StatusBar ko clean look dene ke liye explicitly set kar diya */}
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Addresses</Text>
        <TouchableOpacity>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{padding: 20}}>
        <View style={styles.addressCard}>
          <View style={styles.row}>
            <MaterialIcons name="home" size={24} color={colors.primary} />
            <Text style={styles.addType}>Home</Text>
          </View>
          <Text style={styles.addressText}>Flat 402, Sai Residency, Sector 45, Gurgaon, Haryana - 122003</Text>
          <TouchableOpacity style={styles.editLink}>
            <Text style={{color: colors.primary, fontWeight: '700'}}>Edit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚀 FIX: Yahan Android ke liye StatusBar.currentHeight add kar diya hai
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  addressCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  addType: { fontSize: 14, fontWeight: '800', marginLeft: 10, color: '#0F172A' },
  addressText: { color: '#64748B', lineHeight: 20 },
  editLink: { marginTop: 15 }
});