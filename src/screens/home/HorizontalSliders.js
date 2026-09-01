import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Dimensions, Platform, ActivityIndicator 
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const shadowStyle = Platform.select({
  ios: { shadowColor: '#334155', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 16 },
  android: { elevation: 8 },
  web: { boxShadow: '0px 8px 16px rgba(51, 65, 85, 0.12)' }
});

export default function HorizontalSliders({ navigation }) {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Fetch Live Data from Firebase
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // 1. Fetch Services
        const srvSnap = await getDocs(query(collection(db, 'master_services'), limit(6)));
        const fetchedServices = srvSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(fetchedServices);

        // 2. Fetch Categories
        const catSnap = await getDocs(collection(db, 'product_categories'));
        const fetchedCats = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(fetchedCats);

        // 3. Fetch Trending Products
        const prodSnap = await getDocs(query(collection(db, 'new_products'), limit(5)));
        const fetchedProds = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrending(fetchedProds);

      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // 🧠 Helper to assign icons to categories based on name
  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('display') || n.includes('screen')) return 'mobile-alt';
    if (n.includes('battery')) return 'battery-full';
    if (n.includes('charg')) return 'bolt';
    if (n.includes('cable')) return 'plug';
    if (n.includes('cover') || n.includes('case')) return 'mobile';
    if (n.includes('headphone') || n.includes('ear')) return 'headphones-alt';
    return 'th-large';
  };

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 📦 1. SHOP BY CATEGORY */}
      {categories.length > 0 && (
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {categories.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.catPill, shadowStyle]}
                onPress={() => navigation.navigate('ProductsTab', { category: item.name })}
                activeOpacity={0.8}
              >
                <View style={styles.catPillIconBg}>
                  <FontAwesome5 name={getCategoryIcon(item.name)} size={14} color="#2563EB" />
                </View>
                <Text style={styles.catPillText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.catPill, shadowStyle, { paddingLeft: 16, paddingRight: 12 }]} 
              onPress={() => navigation.navigate('ProductsTab')} 
              activeOpacity={0.8}
            >
              <Text style={[styles.catPillText, { marginRight: 8, color: '#64748B' }]}>View All</Text>
              <View style={[styles.catPillIconBg, { backgroundColor: '#F8FAFC', marginRight: 0 }]}>
                <MaterialIcons name="arrow-forward" size={16} color="#64748B" />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* 🔥 2. TRENDING ACCESSORIES */}
      {trending.length > 0 && (
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Accessories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductsTab')} style={styles.viewAllBtn}>
              <Text style={styles.viewAll}>Shop Now</Text>
              <MaterialIcons name="chevron-right" size={16} color="#2563EB"/>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {trending.map((item) => {
              const hasDiscount = item.originalPrice && item.originalPrice > item.price;
              const discountPercent = hasDiscount ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;

              return (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.productCard, shadowStyle]}
                  onPress={() => navigation.navigate('ProductDetail', { product: item })}
                  activeOpacity={0.9}
                >
                   <View style={styles.productImageBackground}>
                     {item.image ? (
                       <Image 
                         source={{uri: item.image}} 
                         style={styles.productImage} 
                         contentFit="contain" 
                         transition={200}
                         cachePolicy="disk"
                       />
                     ) : (
                       <Ionicons name="cart" size={26} color="#94A3B8" />
                     )}
                     {hasDiscount && (
                       <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.discountBadge}>
                         <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                       </LinearGradient>
                     )}
                   </View>
                   
                   <View style={styles.productDetails}>
                     <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                     <View style={styles.priceRow}>
                       <Text style={styles.currentPrice}>₹{item.price}</Text>
                       {hasDiscount && <Text style={styles.oldPrice}>₹{item.originalPrice}</Text>}
                     </View>
                   </View>
                   
                   <LinearGradient 
                     colors={['#2563EB', '#1D4ED8']} 
                     start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                     style={styles.addButton}
                   >
                     <MaterialIcons name="add-shopping-cart" size={14} color="#FFF" />
                   </LinearGradient>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}

      {/* 🛠️ 3. POPULAR REPAIR SERVICES */}
      {services.length > 0 && (
        <View style={[styles.sectionWrapper, { marginBottom: 20 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Premium Repairs</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DeviceSelection')} style={styles.viewAllBtn}>
              <Text style={styles.viewAll}>See All</Text>
              <MaterialIcons name="chevron-right" size={16} color="#2563EB"/>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {services.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.serviceCard, shadowStyle]}
                onPress={() => navigation.navigate('DeviceSelection')}
                activeOpacity={0.9}
              >
                 <View style={styles.serviceImageWrapper}>
                   {item.image ? (
                     <Image 
                       source={{ uri: item.image }} 
                       style={styles.serviceRectImage} 
                       contentFit="cover" 
                       transition={200}
                       cachePolicy="disk"
                     />
                   ) : (
                     <View style={styles.placeholderImg}><MaterialIcons name="build" size={24} color="#94A3B8" /></View>
                   )}
                   <View style={styles.ratingBadge}>
                     <MaterialIcons name="star" size={10} color="#FDE047" />
                     <Text style={styles.ratingText}>4.9</Text>
                   </View>
                 </View>
                 
                 <View style={styles.serviceTextContainer}>
                   <Text style={styles.sName} numberOfLines={2}>{item.title}</Text>
                   <View style={styles.priceRowBadge}>
                     <Text style={styles.sPriceLabel}>Starts at </Text>
                     <Text style={styles.sPriceValue}>₹{item.basePrice}</Text>
                   </View>
                 </View>
                 
                 <View style={styles.serviceActionIcon}>
                   <MaterialIcons name="arrow-forward-ios" size={12} color="#94A3B8" />
                 </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 🌟 BLINKIT-STYLE FOOTER */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerBigText}>India's best</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
          <View style={{ paddingBottom: 6 }}>
            <Text style={styles.footerBrandText}>fixit pro</Text>
            <Text style={styles.versionText}>App Version 2.0</Text>
          </View>
          <Text style={[styles.footerBigText, { paddingRight: 10 }]}>
            repair app <Text style={{ opacity: 0.5 }}>❤️</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 5,
  },
  sectionWrapper: {
    marginBottom: 20,
  },
  /* SECTION HEADERS */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18, alignItems: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  viewAll: { fontSize: 12, fontWeight: '800', color: '#1D4ED8' },
  horizontalScroll: { paddingHorizontal: 20, paddingBottom: 20 },
  
  /* 🛠️ REPAIR SERVICES (Horizontal Card) */
  serviceCard: { backgroundColor: '#FFF', borderRadius: 16, width: width * 0.78, marginRight: 18, flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#F1F5F9' },
  serviceImageWrapper: { height: 65, width: 65, backgroundColor: '#F8FAFC', borderRadius: 12, position: 'relative', overflow: 'hidden', marginRight: 12 },
  serviceRectImage: { width: '100%', height: '100%' },
  placeholderImg: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  ratingBadge: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, paddingVertical: 2, borderRadius: 6 },
  ratingText: { color: '#FFF', fontSize: 8, fontWeight: '800', marginLeft: 2 },
  serviceTextContainer: { flex: 1, justifyContent: 'center', paddingRight: 8 },
  sName: { fontWeight: '800', fontSize: 14, color: '#0F172A', marginBottom: 4, lineHeight: 18, letterSpacing: -0.2 },
  priceRowBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  sPriceLabel: { fontSize: 9, color: '#059669', fontWeight: '700' },
  sPriceValue: { fontWeight: '900', color: '#047857', fontSize: 11 },
  serviceActionIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },

  /* 📦 CATEGORIES (Sleek Horizontal Pills) */
  catPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingVertical: 8, paddingLeft: 8, paddingRight: 16, borderRadius: 30, borderWidth: 1, borderColor: '#F1F5F9', marginRight: 12 },
  catPillIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  catPillText: { fontSize: 13, fontWeight: '800', color: '#334155', letterSpacing: -0.3 },

  /* 🔥 TRENDING ACCESSORIES (Vertical Card) */
  productCard: { backgroundColor: '#FFF', borderRadius: 20, width: 145, marginRight: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9', paddingBottom: 12 },
  productImageBackground: { width: '100%', height: 110, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  productImage: { width: '95%', height: '95%' },
  discountBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, shadowColor: '#EF4444', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4 },
  discountBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  productDetails: { paddingHorizontal: 12, paddingTop: 10 },

  /* 🌟 FOOTER */
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 10,
  },
  footerBigText: {
    fontSize: 38,
    fontWeight: '900',
    color: '#CBD5E1', 
    lineHeight: 46,
    letterSpacing: -1.5,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 35,
    marginBottom: 20,
  },
  footerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerBrandText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E2E8F0',
    letterSpacing: -0.5,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  productName: { fontSize: 13, fontWeight: '800', color: '#0F172A', marginBottom: 6, lineHeight: 18, letterSpacing: -0.2, minHeight: 36 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  currentPrice: { fontSize: 15, fontWeight: '900', color: '#10B981', letterSpacing: -0.3 },
  oldPrice: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through', fontWeight: '600' },
  addButton: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5, position: 'absolute', bottom: 12, right: 12 },
});