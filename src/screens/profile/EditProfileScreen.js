// src/screens/profile/EditProfileScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, StatusBar, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState('Aman Developer');
  const [email, setEmail] = useState('aman@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');

  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 StatusBar ko clean aur non-translucent rakha hai */}
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {/* Avatar Edit Section */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <TouchableOpacity style={styles.cameraBtn}>
            <MaterialIcons name="camera-alt" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Email Address</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚀 FIX: Yahan Android ke liye StatusBar.currentHeight add kiya gaya hai
  container: { 
    flex: 1, 
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800' },
  saveText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  formContainer: { padding: 20 },
  avatarContainer: { alignSelf: 'center', marginBottom: 30, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 35, height: 35, borderRadius: 17.5, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, fontWeight: '600' }
});