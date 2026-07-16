// src/screens/home/HomeScreen.js
import React, { useRef } from 'react';
import { 
  SafeAreaView, ScrollView, Platform, StatusBar, StyleSheet 
} from 'react-native';
import { colors } from '../../theme/colors';
import { useTabVisibility } from '../../context/TabVisibilityContext'; 

// 🚀 Fixed Import Paths (Tamara folder structure pramane)
import HomeHeader from './HomeHeader';
import HeroSection from './HeroSection';
import PromoBanners from './PromoBanners';
import HorizontalSliders from './HorizontalSliders';

export default function HomeScreen({ navigation }) {
  const { setIsTabBarVisible } = useTabVisibility(); 
  const currentY = useRef(0);

  // Scroll DOWN = Hide TabBar, Scroll UP = Show TabBar
  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const isScrollingDown = yOffset > currentY.current && yOffset > 50; 

    if (isScrollingDown) {
      setIsTabBarVisible(false);
    } else if (yOffset < currentY.current && (currentY.current - yOffset > 5)) {
      setIsTabBarVisible(true);
    }
    
    if (yOffset <= 10) {
        setIsTabBarVisible(true);
    }

    currentY.current = yOffset;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
      
      {/* 1. HEADER & SEARCH BAR */}
      <HomeHeader navigation={navigation} />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        onScroll={handleScroll} 
        scrollEventThrottle={16} 
        contentContainerStyle={styles.scrollContent} 
      >
        
        {/* 2. HERO BANNER & MAIN ACTION BUTTONS */}
        <HeroSection navigation={navigation} />

        {/* 3. DUAL PROMO BANNERS (Discounts) */}
        <PromoBanners />

        {/* 4. SLIDERS (Services, Categories, Accessories) */}
        <HorizontalSliders navigation={navigation} />

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
  scrollContent: { 
    paddingBottom: 150 
  }
});