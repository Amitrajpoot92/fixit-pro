import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Image, Dimensions, Platform, ActivityIndicator 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const shadowStyle = Platform.select({
  ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  android: { elevation: 4 },
  web: { boxShadow: '0px 4px 8px rgba(30, 41, 59, 0.1)' }
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
    if (n.includes('display') || n.includes('screen')) return 'smartphone';
    if (n.includes('battery')) return 'battery-charging-full';
    if (n.includes('charg')) return 'electrical-services';
    if (n.includes('cable')) return 'cable';
    if (n.includes('cover') || n.includes('case')) return 'phone-android';
    if (n.includes('headphone') || n.includes('ear')) return 'headphones';
    return 'category';
  };

  if (loading) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View>
      {/* 🛠️ 1. POPULAR REPAIR SERVICES */}
      {services.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Repair Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('DeviceSelection')}>
              <Text style={styles.viewAll}>View All <MaterialIcons name="arrow-forward" size={14}/></Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {services.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.serviceCard, shadowStyle]}
                onPress={() => navigation.navigate('DeviceSelection')}
                activeOpacity={0.8}
              >
                 <View style={styles.serviceImageWrapper}>
                   {item.image ? (
                     <Image source={{ uri: item.image }} style={styles.serviceRectImage} resizeMode="cover" />
                   ) : (
                     <View style={styles.placeholderImg}><MaterialIcons name="build" size={30} color="#94A3B8" /></View>
                   )}
                 </View>
                 <View style={styles.serviceTextContainer}>
                   <Text style={styles.sName} numberOfLines={2}>{item.title}</Text>
                   <Text style={styles.sPriceLabel}>Starts at <Text style={styles.sPriceValue}>₹{item.basePrice}</Text></Text>
                 </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* 📦 2. SHOP BY CATEGORY */}
      {categories.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductsMain')}>
              <Text style={styles.viewAll}>View All <MaterialIcons name="arrow-forward" size={14}/></Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {categories.map((item, idx) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.catCircleItem}
                // Agar aap chahte ho ki category select ho jaye toh Params me bhej sakte ho future ke liye
                onPress={() => navigation.navigate('ProductsMain', { category: item.name })}
              >
                 <View style={[styles.catCircle, shadowStyle]}>
                   <MaterialIcons name={getCategoryIcon(item.name)} size={26} color={colors.primary} />
                 </View>
                 <Text style={styles.catCircleLabel} numberOfLines={1}>{item.name}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.catCircleItem} onPress={() => navigation.navigate('ProductsMain')}>
               <View style={[styles.catCircle, shadowStyle, { backgroundColor: '#F1F5F9' }]}>
                 <MaterialIcons name="arrow-forward" size={26} color={colors.link} />
               </View>
               <Text style={styles.catCircleLabel}>More</Text>
            </TouchableOpacity>
          </ScrollView>
        </>
      )}

      {/* 🔥 3. TRENDING ACCESSORIES */}
      {trending.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Accessories</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductsMain')}>
              <Text style={styles.viewAll}>View All <MaterialIcons name="arrow-forward" size={14}/></Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
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
                         <Image source={{uri: item.image}} style={styles.productImage} resizeMode="contain" />
                       ) : (
                         <Ionicons name="cart" size={24} color="#94A3B8" />
                       )}
                     </View>
                     
                     <View style={styles.productDetails}>
                       <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                       <View style={styles.priceRow}>
                         <Text style={styles.currentPrice}>₹{item.price}</Text>
                         {hasDiscount && <Text style={styles.oldPrice}>₹{item.originalPrice}</Text>}
                       </View>
                       {hasDiscount ? <Text style={styles.discountText}>{discountPercent}% OFF</Text> : null}
                     </View>
                   </View>
                   
                   <View style={styles.addButton}>
                     <MaterialIcons name="add" size={16} color={colors.white} />
                   </View>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* SECTION HEADERS */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 30, alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: '#0F172A' },
  viewAll: { fontSize: 13, fontWeight: '800', color: colors.link, flexDirection: 'row', alignItems: 'center' },
  horizontalScroll: { paddingLeft: 15, marginTop: 15, paddingBottom: 10 },
  
  /* 🛠️ REPAIR SERVICES (Rectangular Premium Card) */
  serviceCard: { backgroundColor: '#FFF', borderRadius: 16, width: 140, marginRight: 15, overflow: 'hidden', borderWidth: 1, borderColor: '#F1F5F9' },
  serviceImageWrapper: { height: 90, width: '100%', backgroundColor: '#F8FAFC' },
  serviceRectImage: { width: '100%', height: '100%' },
  placeholderImg: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F5F9' },
  serviceTextContainer: { padding: 12 },
  sName: { fontWeight: '800', fontSize: 13, color: '#0F172A', marginBottom: 4, minHeight: 35 },
  sPriceLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  sPriceValue: { fontWeight: '900', color: colors.success, fontSize: 14 },

  /* 📦 CATEGORIES */
  catCircleItem: { alignItems: 'center', marginRight: 18, width: 65 },
  catCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#DBEAFE' },
  catCircleLabel: { fontSize: 12, fontWeight: '700', color: '#475569', textAlign: 'center' },

  /* 🔥 TRENDING ACCESSORIES */
  productCard: { backgroundColor: colors.white, borderRadius: 16, width: width * 0.75, marginRight: 15, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  productContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productImageBackground: { width: 65, height: 65, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  productImage: { width: '80%', height: '80%' },
  productDetails: { flex: 1, justifyContent: 'center', paddingRight: 10 },
  productName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  currentPrice: { fontSize: 16, fontWeight: '900', color: colors.success },
  oldPrice: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through', marginBottom: 2 },
  discountText: { fontSize: 11, color: colors.success, fontWeight: '800', marginTop: 4 },
  addButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.link, justifyContent: 'center', alignItems: 'center', elevation: 3 },
});