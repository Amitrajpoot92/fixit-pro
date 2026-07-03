// src/screens/profile/SettingsScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Switch, 
  Platform, 
  StatusBar,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../services/firebaseConfig';

export default function SettingsScreen({ navigation, route }) {
  const { user } = useAuth(); // 🧠 Get current user
  
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🚀 1. Reset Password Logic
  const handleResetPassword = async () => {
    if (!user?.email) {
      Alert.alert("Error", "No email linked to this account.");
      return;
    }

    Alert.alert(
      "Reset Password",
      `Send a password reset link to ${user.email}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Send Link", 
          onPress: async () => {
            setLoading(true);
            try {
              await sendPasswordResetEmail(auth, user.email);
              Alert.alert("Success! 🎉", "Password reset link sent. Please check your inbox (and spam folder).");
            } catch (error) {
              console.error("Reset Password Error:", error);
              Alert.alert("Error", "Could not send reset link. Try again.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // 🚀 2. Delete Account Logic
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account ⚠️",
      "Are you sure? This will permanently delete your profile, addresses, and history. This action CANNOT be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete My Account", 
          style: "destructive", 
          onPress: confirmDelete 
        }
      ]
    );
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      // Step A: Delete User Data from Firestore
      await deleteDoc(doc(db, 'users', user.uid));
      
      // Step B: Delete User from Firebase Auth
      await deleteUser(auth.currentUser);
      
      // Jaise hi Auth se delete hoga, AuthContext automatically user ko Guest View pe bhej dega!
      Alert.alert("Account Deleted", "We are sad to see you go. Your account has been permanently removed.");
      
    } catch (error) {
      console.error("Delete Account Error:", error);
      // 🔥 Firebase Security feature: If login is too old, it prevents deletion.
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert(
          "Security Check", 
          "For your security, please logout, log back in, and then try deleting your account again."
        );
      } else {
        Alert.alert("Error", "Something went wrong while deleting your account.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={loading}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>{route.name || 'Settings'}</Text>
        <View style={{width: 44}}>
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      {/* SETTINGS CONTENT */}
      <View style={styles.content}>
        
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.card}>
          {/* Notification Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.iconBox}><Ionicons name="notifications" size={20} color={colors.primary} /></View>
            <Text style={styles.settingText}>Push Notifications</Text>
            <Switch value={isPushEnabled} onValueChange={setIsPushEnabled} trackColor={{true: colors.primary}} />
          </View>

          {/* Dark Mode Toggle */}
          <View style={[styles.settingRow, {borderBottomWidth: 0}]}>
            <View style={styles.iconBox}><Ionicons name="moon" size={20} color={colors.iconPurple} /></View>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} trackColor={{true: colors.primary}} />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Account Security</Text>
        <View style={styles.card}>
          
          {/* 🚀 Change Password Button */}
          <TouchableOpacity style={styles.settingRow} onPress={handleResetPassword} disabled={loading}>
            <View style={[styles.iconBox, {backgroundColor: '#FEF08A'}]}>
              <MaterialIcons name="lock-reset" size={22} color="#CA8A04" />
            </View>
            <Text style={styles.settingText}>Reset Password</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#94A3B8" />
          </TouchableOpacity>

          {/* 🚀 Delete Account Button */}
          <TouchableOpacity style={[styles.settingRow, {borderBottomWidth: 0}]} onPress={handleDeleteAccount} disabled={loading}>
            <View style={[styles.iconBox, {backgroundColor: '#FEE2E2'}]}>
              <Ionicons name="warning" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.settingText, {color: '#EF4444'}]}>Delete My Account</Text>
          </TouchableOpacity>
          
        </View>
      </View>
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
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  content: { padding: 20 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 10, marginLeft: 5, marginTop: 10 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 5, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#334155' },
});