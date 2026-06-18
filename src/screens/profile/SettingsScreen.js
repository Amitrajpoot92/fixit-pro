// src/screens/profile/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Switch, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function SettingsScreen({ navigation, route }) {
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 StatusBar added for clean UI on Android */}
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>{route.name}</Text>
        <View style={{width: 44}} />
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

        <Text style={styles.sectionHeader}>Account</Text>
        <TouchableOpacity style={styles.card}>
          <Text style={styles.dangerText}>Delete My Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚀 FIX: Added paddingTop for Android Status Bar height
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  content: { padding: 20 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#64748B', marginBottom: 10, marginLeft: 5 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 5, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingText: { flex: 1, fontSize: 15, fontWeight: '700', color: '#334155' },
  dangerText: { color: '#EF4444', fontWeight: '800', padding: 15 }
});