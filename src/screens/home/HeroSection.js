// src/components/home/HeroSection.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

// 🔥 Firebase Imports
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const { width } = Dimensions.get('window');

const shadowStyle = Platform.select({
  ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12 },
  android: { elevation: 6 },
  web: { boxShadow: '0px 6px 12px rgba(30, 41, 59, 0.15)' }
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
    color: '#2563EB',
    image: null
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
    }, 4000);

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
        <TouchableOpacity 
          style={[styles.heroCard, { backgroundColor: item.color || '#2563EB' }, shadowStyle]}
          onPress={() => navigation.navigate('DeviceSelection')}
          activeOpacity={0.95}
        >
          {/* Glass Overlay Gradient for Premium Look */}
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(0,0,0,0.3)']}
            style={StyleSheet.absoluteFillObject}
          />
          
          <View style={styles.heroLeft}>
            {/* Split Title into 3 Lines */}
            <View style={{ marginBottom: 8 }}>
              {!!item.titleLine1 && <Text style={styles.heroTitle}>{item.titleLine1}</Text>}
              {!!item.titleLine2 && <Text style={styles.heroTitle}>{item.titleLine2}</Text>}
              {!!item.titleLine3 && <Text style={styles.heroTitle}>{item.titleLine3}</Text>}
            </View>

            <View style={styles.heroFeatures}>
               {item.feature1 ? <Text style={styles.heroFeatureText}><MaterialIcons name="verified" size={14} color="#FDE047"/> {item.feature1}</Text> : null}
               {item.feature2 ? <Text style={styles.heroFeatureText}><MaterialIcons name="verified" size={14} color="#FDE047"/> {item.feature2}</Text> : null}
               {item.feature3 ? <Text style={styles.heroFeatureText}><MaterialIcons name="verified" size={14} color="#FDE047"/> {item.feature3}</Text> : null}
            </View>
            
            {item.btnText ? (
              <View style={styles.heroBtn}>
                 <Text style={styles.heroBtnText}>{item.btnText}</Text>
                 <MaterialIcons name="arrow-forward" size={16} color="#0F172A"/>
              </View>
            ) : null}
          </View>

          {/* Right Side Image */}
          <View style={styles.heroRight}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.rightSideImage} resizeMode="contain" />
            ) : null}
          </View>

        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View>
      {/* 🚀 BANNER SECTION */}
      <View style={styles.bannerContainer}>
        {loading ? (
          <View style={[styles.heroCard, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E2E8F0' }]}>
            <ActivityIndicator size="large" color="#3B82F6" />
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
          {n: 'Top Offers', i: 'local-offer', g: ['#10B981', '#059669'], route: 'ProductsTab'}, 
          {n: 'Book Repair', i: 'build', g: ['#3B82F6', '#2563EB'], route: 'DeviceSelection'},
          {n: 'Accessories', i: 'smartphone', g: ['#8B5CF6', '#7C3AED'], route: 'ProductsTab'},
          {n: 'Support', i: 'support-agent', g: ['#EC4899', '#DB2777'], route: 'Support'},
        ].map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={styles.actionItem}
            onPress={() => item.route ? navigation.navigate(item.route) : null}
            activeOpacity={0.8}
          >
            <LinearGradient 
              colors={item.g} 
              start={{x: 0, y: 0}} end={{x: 1, y: 1}}
              style={[styles.actionIconCircle, shadowStyle]}
            >
              <MaterialIcons name={item.i} size={26} color="#FFF" />
            </LinearGradient>
            <Text style={styles.actionLabel}>{item.n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 240, 
    marginTop: 5,
    alignItems: 'center'
  },
  heroCard: { 
    width: width - 40, 
    height: 200,       
    borderRadius: 24, 
    padding: 22, 
    flexDirection: 'row', 
    overflow: 'hidden' 
  },
  
  heroLeft: { flex: 1.4, zIndex: 2, justifyContent: 'center' },
  heroTitle: { color: colors.white, fontSize: 18, fontWeight: '900', lineHeight: 24, letterSpacing: 0.5 },
  heroFeatures: { flexDirection: 'row', marginTop: 12, marginBottom: 16, flexWrap: 'wrap', gap: 8 },
  heroFeatureText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  heroBtn: { 
    backgroundColor: '#FFF', 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 12, 
    alignSelf: 'flex-start', 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4
  },
  heroBtnText: { fontWeight: '900', fontSize: 13, color: '#0F172A', marginRight: 6 },
  
  heroRight: { flex: 1, justifyContent: 'center', alignItems: 'flex-end', position: 'relative' },
  rightSideImage: { width: 150, height: 180, position: 'absolute', right: -25, bottom: -15, zIndex: 1 },

  fullCoverImage: { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  sliderDots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.4)', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#3B82F6', width: 20, borderRadius: 4 },

  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 15 },
  actionItem: { alignItems: 'center', width: width / 5.5 },
  actionIconCircle: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 11, fontWeight: '800', textAlign: 'center', color: '#334155', letterSpacing: -0.3 },
});