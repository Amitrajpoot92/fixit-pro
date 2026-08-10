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
      {/* 🛠️ 1. POPULAR REPAIR SERVICES */}
      {services.length > 0 && (
        <View style={styles.sectionWrapper}>
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
                     <View style={styles.placeholderImg}><MaterialIcons name="build" size={32} color="#94A3B8" /></View>
                   )}
                   {/* Premium Badge overlay */}
                   <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} style={styles.imageOverlay} />
                   <View style={styles.ratingBadge}>
                     <MaterialIcons name="star" size={12} color="#FDE047" />
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
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 📦 2. SHOP BY CATEGORY */}
      {categories.length > 0 && (
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {categories.map((item, idx) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.catCircleItem}
                onPress={() => navigation.navigate('ProductsTab', { category: item.name })}
                activeOpacity={0.8}
              >
                 <LinearGradient 
                    colors={['#FFFFFF', '#F1F5F9']} 
                    style={[styles.catCircle, shadowStyle]}
                 >
                   <View style={styles.iconInnerBg}>
                     <FontAwesome5 name={getCategoryIcon(item.name)} size={22} color="#2563EB" />
                   </View>
                 </LinearGradient>
                 <Text style={styles.catCircleLabel} numberOfLines={2}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.catCircleItem} onPress={() => navigation.navigate('ProductsTab')} activeOpacity={0.8}>
                 <LinearGradient 
                    colors={['#FFFFFF', '#F1F5F9']} 
                    style={[styles.catCircle, shadowStyle]}
                 >
                   <View style={[styles.iconInnerBg, {backgroundColor: '#F8FAFC'}]}>
                     <MaterialIcons name="arrow-forward" size={26} color="#64748B" />
                   </View>
                 </LinearGradient>
               <Text style={styles.catCircleLabel}>View All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* 🔥 3. TRENDING ACCESSORIES */}
      {trending.length > 0 && (
        <View style={[styles.sectionWrapper, { marginBottom: 0 }]}>
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
                   <View style={styles.productContent}>
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
                   </View>
                   
                   <LinearGradient 
                     colors={['#2563EB', '#1D4ED8']} 
                     start={{x: 0, y: 0}} end={{x: 1, y: 1}}
                     style={styles.addButton}
                   >
                     <MaterialIcons name="add-shopping-cart" size={16} color="#FFF" />
                   </LinearGradient>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  sectionWrapper: {
    marginBottom: 35,
  },
  /* SECTION HEADERS */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18, alignItems: 'center' },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  viewAll: { fontSize: 12, fontWeight: '800', color: '#1D4ED8' },
  horizontalScroll: { paddingHorizontal: 20, paddingBottom: 20 },
  
  /* 🛠️ REPAIR SERVICES (Rectangular Premium Card) */
  serviceCard: { backgroundColor: '#FFF', borderRadius: 24, width: 155, marginRight: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  serviceImageWrapper: { height: 115, width: '100%', backgroundColor: '#F8FAFC', position: 'relative' },
  serviceRectImage: { width: '100%', height: '100%' },
  placeholderImg: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  imageOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 40 },
  ratingBadge: { position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.5)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 },
  ratingText: { color: '#FFF', fontSize: 10, fontWeight: '800', marginLeft: 3 },
  serviceTextContainer: { padding: 16 },
  sName: { fontWeight: '800', fontSize: 14, color: '#0F172A', marginBottom: 8, minHeight: 40, lineHeight: 18, letterSpacing: -0.2 },
  priceRowBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  sPriceLabel: { fontSize: 10, color: '#059669', fontWeight: '700' },
  sPriceValue: { fontWeight: '900', color: '#047857', fontSize: 12 },

  /* 📦 CATEGORIES (Glassmorphic Squircles) */
  catCircleItem: { alignItems: 'center', marginRight: 20, width: 75 },
  catCircle: { width: 72, height: 72, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F8FAFC' },
  iconInnerBg: { width: 44, height: 44, borderRadius: 18, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center' },
  catCircleLabel: { fontSize: 12, fontWeight: '800', color: '#334155', textAlign: 'center', lineHeight: 16 },

  /* 🔥 TRENDING ACCESSORIES (Sleek Product Card) */
  productCard: { backgroundColor: '#FFF', borderRadius: 24, width: width * 0.78, marginRight: 18, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  productContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productImageBackground: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 16, position: 'relative' },
  productImage: { width: '85%', height: '85%' },
  discountBadge: { position: 'absolute', top: -8, left: -8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 2, borderColor: '#FFF', shadowColor: '#EF4444', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4 },
  discountBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  productDetails: { flex: 1, justifyContent: 'center', paddingRight: 12 },
  productName: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 10, lineHeight: 20, letterSpacing: -0.3 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currentPrice: { fontSize: 18, fontWeight: '900', color: '#10B981', letterSpacing: -0.5 },
  oldPrice: { fontSize: 13, color: '#94A3B8', textDecorationLine: 'line-through', fontWeight: '600' },
  addButton: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 5 },
});