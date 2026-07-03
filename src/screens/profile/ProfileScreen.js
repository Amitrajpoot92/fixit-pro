// src/screens/profile/ProfileScreen.js
import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Platform, 
  StatusBar,
  Image // 🚀 Image import kiya profile pic dikhane ke liye
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth'; 

import { colors } from '../../theme/colors';
import { useTabVisibility } from '../../context/TabVisibilityContext';
import { useAuth } from '../../context/AuthContext'; 
import { auth } from '../../services/firebaseConfig'; 

export default function ProfileScreen() {
  const { user } = useAuth(); // 🧠 Get current user state (ab isme profilePic bhi hai)
  const { setIsTabBarVisible } = useTabVisibility(); 
  const navigation = useNavigation();
  const currentY = useRef(0);

  // 🚀 Scroll handler for Tab Bar hiding
  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset > currentY.current && yOffset > 50) setIsTabBarVisible(false);
    else if (yOffset < currentY.current && (currentY.current - yOffset > 5)) setIsTabBarVisible(true); 
    if (yOffset <= 10) setIsTabBarVisible(true);
    currentY.current = yOffset;
  };

  // 🚀 Firebase Logout Function
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
      alert("Failed to logout. Please try again.");
    }
  };

  // 🔄 Updated Menu Items
  const menuItems = [
    { icon: 'location-on', title: 'Manage Addresses', color: colors.link, bg: colors.tintBlue, route: 'Address' },
    // 🎁 Refer & Earn laga diya Payment ki jagah
    { icon: 'card-giftcard', title: 'Refer & Earn', color: colors.success, bg: colors.tintGreen, route: 'ReferEarn' },
    { icon: 'account-balance-wallet', title: 'My Wallet', color: '#0284C7', bg: '#E0F2FE', route: 'Wallet' }, 
    { icon: 'local-offer', title: 'Offers & Promos', color: colors.iconOrange, bg: colors.tintOrange, route: 'Offers' },
    { icon: 'support-agent', title: 'Help & Support', color: colors.iconPurple, bg: colors.tintPurple, route: 'Support' },
    { icon: 'settings', title: 'Settings', color: colors.textDark, bg: colors.inputBg, route: 'Settings' },
  ];

  // 🔴 CONDITIONAL RENDER: GUEST VIEW (Logged Out)
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.guestContainer}>
          <View style={styles.guestIconBox}>
            <MaterialIcons name="lock-person" size={60} color={colors.primary} />
          </View>
          <Text style={styles.guestTitle}>Login to view your Profile</Text>
          <Text style={styles.guestSubtitle}>Manage your bookings, addresses, wallet, and offers securely.</Text>
          
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Login Securely</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerBtnText}>Create an Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 🟢 CONDITIONAL RENDER: LOGGED IN VIEW (Real Data)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16} 
        contentContainerStyle={{paddingBottom: 150, paddingHorizontal: 15}}
      >
        <View style={styles.userCard}>
          <View style={styles.avatarPlaceholder}>
            {/* 🧠 Dynamic Profile Picture Logic */}
            {user?.profilePic ? (
              <Image source={{ uri: user.profilePic }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            {/* 🧠 Dynamic User Data */}
            <Text style={styles.userName}>{user?.name || 'FixitPro User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'No email provided'}</Text>
            {user?.mobile && <Text style={styles.userPhone}>+91 {user.mobile}</Text>}
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('EditProfile')}>
            <MaterialIcons name="edit" size={20} color={colors.link} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={[styles.menuItem, idx === menuItems.length - 1 && { borderBottomWidth: 0 }]}
              onPress={() => navigation.navigate(item.route)}
            >
              <View style={[styles.menuIconBox, { backgroundColor: item.bg }]}>
                <MaterialIcons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <MaterialIcons name="keyboard-arrow-right" size={24} color={colors.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: '900', color: colors.textDark },
  
  // 🟢 LOGGED IN STYLES
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 20, borderRadius: 20, borderWidth: 1, borderColor: colors.borderColor, marginBottom: 30 },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: 15, overflow: 'hidden' }, // 🚀 overflow: hidden added
  avatarImage: { width: '100%', height: '100%' }, // 🚀 Image ko pura circle lene ke liye
  avatarText: { color: colors.white, fontSize: 24, fontWeight: 'bold' },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: '800', color: colors.textDark, marginBottom: 2 },
  userEmail: { fontSize: 12, color: colors.textLight, fontWeight: '500', marginBottom: 2 },
  userPhone: { fontSize: 12, color: colors.textLight, fontWeight: '500' },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.tintBlue, justifyContent: 'center', alignItems: 'center' },
  menuContainer: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.borderColor, paddingVertical: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: colors.inputBg },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.textDark },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, backgroundColor: '#FEE2E2', paddingVertical: 15, borderRadius: 16, marginHorizontal: 0 },
  logoutText: { fontSize: 15, fontWeight: '800', color: '#EF4444', marginLeft: 10 },

  // 🔴 GUEST VIEW STYLES
  guestContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30, paddingBottom: 50 },
  guestIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  guestTitle: { fontSize: 22, fontWeight: '900', color: colors.textDark, marginBottom: 10, textAlign: 'center' },
  guestSubtitle: { fontSize: 14, color: colors.textLight, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  loginBtn: { backgroundColor: colors.accent, width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginBottom: 15 },
  loginBtnText: { color: colors.primary, fontSize: 16, fontWeight: 'bold' },
  registerBtn: { backgroundColor: colors.background, width: '100%', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor },
  registerBtnText: { color: colors.textDark, fontSize: 16, fontWeight: 'bold' }
});