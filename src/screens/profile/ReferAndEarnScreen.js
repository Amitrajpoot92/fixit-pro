// src/screens/profile/ReferAndEarnScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform, 
  StatusBar,
  ScrollView,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

// 🌟 Premium Soft Shadows
const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 },
  android: { elevation: 4, shadowColor: '#94A3B8' },
  web: { boxShadow: '0px 6px 12px rgba(148, 163, 184, 0.12)' }
});

export default function ReferAndEarnScreen({ navigation }) {
  const { user } = useAuth();

  // 🚀 Referral Code Generator
  const firstName = user?.name ? user.name.split(' ')[0].toUpperCase() : 'USER';
  const referralCode = `FIXIT${firstName}50`; 

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 🚀 MAIN WRAPPER */}
      <View style={styles.mainWrapper}>
        
        {/* 📜 SCROLLABLE CONTENT */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          
          {/* 🎁 ICON CONTAINER */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircleBg}>
              <FontAwesome5 name="gift" size={50} color={colors.primary} />
            </View>
          </View>

          {/* 📜 TEXT INFO */}
          <Text style={styles.mainHeading}>Invite Friends, Earn Rewards!</Text>
          <Text style={styles.subHeading}>
            Share your unique referral code with your friends. When they book their first service, both of you get ₹50 cashback instantly in your wallets!
          </Text>
          
          {/* 🎫 REFERRAL CODE BOX */}
          <View style={styles.codeWrapper}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode}</Text>
              <TouchableOpacity style={styles.copyBtn} activeOpacity={0.7}>
                <MaterialIcons name="content-copy" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 🚀 SHARE BUTTON */}
          <TouchableOpacity 
            style={styles.shareBtn}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="whatsapp" size={20} color="#FFF" />
            <Text style={styles.shareBtnText}>Share via WhatsApp</Text>
          </TouchableOpacity>

          {/* 📋 HOW IT WORKS STEPS */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>How does it work?</Text>
            
            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.stepNumberText, { color: '#2563EB' }]}>1</Text>
              </View>
              <Text style={styles.stepText}>Send invite link & code to your friends.</Text>
            </View>

            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.stepNumberText, { color: '#16A34A' }]}>2</Text>
              </View>
              <Text style={styles.stepText}>They register and complete their 1st booking.</Text>
            </View>

            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.stepNumberText, { color: '#D97706' }]}>3</Text>
              </View>
              <Text style={styles.stepText}>Boom! Both receive ₹50 inside the app wallet.</Text>
            </View>
          </View>

        </ScrollView>

        {/* 🔒 COMING SOON OVERLAY (Perfectly centered & covers full screen below header) */}
        <View style={styles.comingSoonOverlay}>
          <View style={[styles.comingSoonBadge, shadowStyle]}>
            <MaterialIcons name="lock-clock" size={24} color="#FFF" />
            <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
          </View>
          <Text style={styles.overlayNoticeText}>
            We are setting up the rewards engine. This feature will be live in the next update! 🎉
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#F8FAFC', zIndex: 10 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...shadowStyle },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  
  mainWrapper: { flex: 1, position: 'relative' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  
  // 🚀 ICON STYLES
  iconContainer: { marginVertical: 25, justifyContent: 'center', alignItems: 'center' },
  iconCircleBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#DBEAFE' },
  
  mainHeading: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 10 },
  subHeading: { fontSize: 14, fontWeight: '600', color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10, marginBottom: 25 },
  
  codeWrapper: { width: '100%', alignItems: 'center', marginBottom: 20 },
  codeLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' },
  codeBox: { width: '100%', flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 16, borderStyle: 'dashed', padding: 15, alignItems: 'center', justifyContent: 'space-between' },
  codeText: { fontSize: 20, fontWeight: '900', color: colors.primary, letterSpacing: 2 },
  copyBtn: { padding: 5 },

  shareBtn: { width: '100%', flexDirection: 'row', backgroundColor: colors.primary, padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 25 },
  shareBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  stepsContainer: { width: '100%', backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  stepsTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 15 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepNumberText: { fontSize: 14, fontWeight: '900' },
  stepText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#475569' },

  // 🔒 COMING SOON OVERLAY STYLES
  comingSoonOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(248, 250, 252, 0.85)', // Blur effect background
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 30, 
    zIndex: 10 // Ensured overlay stays on top of scrollview
  },
  comingSoonBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, gap: 8, marginBottom: 15 },
  comingSoonBadgeText: { color: '#FFFFFF', fontSize: 15, fontWeight: '950', letterSpacing: 1.5 },
  overlayNoticeText: { fontSize: 14, fontWeight: '800', color: '#334155', textAlign: 'center', lineHeight: 22, backgroundColor: '#FFFFFF', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', ...shadowStyle }
});