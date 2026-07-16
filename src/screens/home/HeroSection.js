// src/components/home/HeroSection.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// 🔥 Firebase Imports
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const { width } = Dimensions.get('window');

const shadowStyle = Platform.select({
  ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  android: { elevation: 5 },
  web: { boxShadow: '0px 4px 10px rgba(30, 41, 59, 0.1)' }
});

// Default Fallback Banner in case DB is empty
const DEFAULT_BANNERS = [
  {
    id: 'backup1',
    isVisible: true,
    isFullImage: false,
    titleLine1: 'Professional Repair', 
    titleLine2: 'Trusted Service', 
    titleLine3: 'At Your Doorstep',
    feature1: 'Pickup', feature2: 'Repair', feature3: 'Delivered',
    btnText: 'Book Repair Now',
    color: colors.primaryDark,
    image: null // 👈 Default Image completely removed
  }
];

export default function HeroSection({ navigation }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // 🚀 Fetch Real-time Banners
  useEffect(() => {
    const docRef = doc(db, 'app_settings', 'home_banners');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().banners) {
        // 🟢 FILTER: Sirf VISIBLE (ON) banners hi array me rahenge
        const activeBanners = docSnap.data().banners.filter(b => b.isVisible === true);
        setBanners(activeBanners.length > 0 ? activeBanners : DEFAULT_BANNERS);
      } else {
        setBanners(DEFAULT_BANNERS);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚀 Auto Scroll Logic
  useEffect(() => {
    if (banners.length <= 1) return; 

    const timer = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [banners.length]);

  const onMomentumScrollEnd = (event) => {
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(newIndex);
  };

  // 🚀 Individual Banner Component
  const renderBanner = ({ item }) => {
    
    // 🔴 1. IF FULL IMAGE BANNER SELECTED
    if (item.isFullImage) {
      return (
        <View style={{ width: width, alignItems: 'center' }}>
          <TouchableOpacity 
            style={[styles.heroCard, { backgroundColor: item.color || '#000', padding: 0 }, shadowStyle]}
            onPress={() => navigation.navigate('DeviceSelection')}
            activeOpacity={0.9}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.fullCoverImage} resizeMode="cover" />
            ) : null}
          </TouchableOpacity>
        </View>
      );
    }

    // 🟢 2. IF TEXT + IMAGE BANNER SELECTED
    return (
      <View style={{ width: width, alignItems: 'center' }}>
        <View style={[styles.heroCard, { backgroundColor: item.color || colors.primaryDark }, shadowStyle]}>
          
          <View style={styles.heroLeft}>
            {/* Split Title into 3 Lines */}
            <View style={{ marginBottom: 5 }}>
              {!!item.titleLine1 && <Text style={styles.heroTitle}>{item.titleLine1}</Text>}
              {!!item.titleLine2 && <Text style={styles.heroTitle}>{item.titleLine2}</Text>}
              {!!item.titleLine3 && <Text style={styles.heroTitle}>{item.titleLine3}</Text>}
            </View>

            <View style={styles.heroFeatures}>
               {item.feature1 ? <Text style={styles.heroFeatureText}><MaterialIcons name="verified" size={12} color={colors.accent}/> {item.feature1}</Text> : null}
               {item.feature2 ? <Text style={styles.heroFeatureText}><MaterialIcons name="verified" size={12} color={colors.accent}/> {item.feature2}</Text> : null}
               {item.feature3 ? <Text style={styles.heroFeatureText}><MaterialIcons name="verified" size={12} color={colors.accent}/> {item.feature3}</Text> : null}
            </View>
            
            {item.btnText ? (
              <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('DeviceSelection')}>
                 <Text style={styles.heroBtnText}>{item.btnText}</Text>
                 <MaterialIcons name="arrow-forward" size={16} color={colors.black}/>
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Right Side Image (ONLY renders if uploaded, no default image) */}
          <View style={styles.heroRight}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.rightSideImage} resizeMode="contain" />
            ) : null}
          </View>

        </View>
      </View>
    );
  };

  return (
    <View>
      {/* 🚀 BANNER SECTION */}
      <View style={styles.bannerContainer}>
        {loading ? (
          <View style={[styles.heroCard, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primaryDark }]}>
            <ActivityIndicator size="large" color="#FFF" />
          </View>
        ) : banners.length === 1 ? (
          // NO SCROLLING IF ONLY 1 BANNER
          renderBanner({ item: banners[0] })
        ) : (
          // CAROUSEL IF MULTIPLE BANNERS
          <>
            <FlatList
              ref={flatListRef}
              data={banners}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              renderItem={renderBanner}
              keyExtractor={(_, index) => index.toString()}
              onMomentumScrollEnd={onMomentumScrollEnd}
              getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
            />
            {/* Dots */}
            <View style={styles.sliderDots}>
              {banners.map((_, index) => (
                <View key={index} style={[styles.dot, currentIndex === index && styles.activeDot]} />
              ))}
            </View>
          </>
        )}
      </View>

      {/* ACTION GRID (Icons) */}
      <View style={styles.actionGrid}>
        {[
          {n: 'Book Repair', i: 'build', c: colors.tintBlue, ic: colors.iconBlue, route: 'DeviceSelection'}, 
          {n: 'Pickup & Drop', i: 'moped', c: colors.tintGreen, ic: colors.success, route: 'PickupDropInfo'},
          {n: 'Home Service', i: 'home', c: colors.tintOrange, ic: colors.iconOrange, route: 'HomeServiceInfo'},
          {n: 'Accessories', i: 'smartphone', c: colors.tintPurple, ic: colors.iconPurple, route: 'ProductsMain'},
          {n: 'Support', i: 'support-agent', c: colors.tintPink, ic: colors.iconPink, route: 'Support'},
        ].map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.actionItem}
            onPress={() => item.route ? navigation.navigate(item.route) : null} 
          >
            <View style={[styles.actionIconCircle, {backgroundColor: item.c}, shadowStyle]}>
              <MaterialIcons name={item.i} size={28} color={item.ic} />
            </View>
            <Text style={styles.actionLabel}>{item.n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 230, 
    marginTop: 10,
    alignItems: 'center'
  },
  heroCard: { 
    width: width - 30, 
    height: 200,       
    borderRadius: 20, 
    padding: 20, 
    flexDirection: 'row', 
    overflow: 'hidden' 
  },
  
  heroLeft: { flex: 1.3, zIndex: 2, justifyContent: 'center' },
  heroTitle: { color: colors.white, fontSize: 16, fontWeight: '800', lineHeight: 22 },
  heroFeatures: { flexDirection: 'row', marginTop: 8, marginBottom: 12, flexWrap: 'wrap' },
  heroFeatureText: { color: colors.white, fontSize: 10, marginRight: 10, fontWeight: '600', marginBottom: 5 },
  heroBtn: { 
    backgroundColor: colors.accent, 
    paddingVertical: 10, 
    paddingHorizontal: 14, 
    borderRadius: 8, 
    alignSelf: 'flex-start', 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  heroBtnText: { fontWeight: '800', fontSize: 12, color: colors.black, marginRight: 6 },
  
  heroRight: { flex: 1, justifyContent: 'center', alignItems: 'flex-end', position: 'relative' },
  rightSideImage: { width: 140, height: 160, position: 'absolute', right: -20, bottom: -10, zIndex: 1 },

  fullCoverImage: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  sliderDots: { position: 'absolute', bottom: 5, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(148, 163, 184, 0.4)', marginHorizontal: 3 },
  activeDot: { backgroundColor: colors.primary, width: 16 },

  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 10 },
  actionItem: { alignItems: 'center', width: width / 5.5 },
  actionIconCircle: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center', color: colors.textDark },
});