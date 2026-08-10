import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { colors } from '../../theme/colors';

const { width } = Dimensions.get('window');

const SkeletonItem = ({ width, height, borderRadius, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export default function HomeSkeleton() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
      
      {/* HEADER SKELETON */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SkeletonItem width={40} height={40} borderRadius={20} />
          <View style={{ marginLeft: 12 }}>
            <SkeletonItem width={120} height={14} borderRadius={4} style={{ marginBottom: 6 }} />
            <SkeletonItem width={80} height={12} borderRadius={4} />
          </View>
        </View>
        <SkeletonItem width={40} height={40} borderRadius={20} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO BANNER SKELETON */}
        <SkeletonItem width={width - 40} height={180} borderRadius={20} style={styles.hero} />

        {/* PROMO BANNERS SKELETON */}
        <View style={styles.promoContainer}>
          <SkeletonItem width={(width - 55) / 2} height={100} borderRadius={16} />
          <SkeletonItem width={(width - 55) / 2} height={100} borderRadius={16} />
        </View>

        {/* HORIZONTAL SLIDER 1 SKELETON */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <SkeletonItem width={150} height={18} borderRadius={4} />
            <SkeletonItem width={50} height={14} borderRadius={4} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.sliderItem}>
                <SkeletonItem width={110} height={110} borderRadius={16} style={{ marginBottom: 8 }} />
                <SkeletonItem width={80} height={12} borderRadius={4} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* HORIZONTAL SLIDER 2 SKELETON */}
        <View style={styles.sliderSection}>
          <View style={styles.sliderHeader}>
            <SkeletonItem width={120} height={18} borderRadius={4} />
            <SkeletonItem width={50} height={14} borderRadius={4} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.sliderItem}>
                <SkeletonItem width={140} height={90} borderRadius={12} style={{ marginBottom: 8 }} />
                <SkeletonItem width={100} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                <SkeletonItem width={60} height={12} borderRadius={4} />
              </View>
            ))}
          </ScrollView>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  hero: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 25,
  },
  promoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sliderSection: {
    marginBottom: 35,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sliderItem: {
    marginLeft: 20,
  },
});
