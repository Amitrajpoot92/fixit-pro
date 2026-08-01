import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function TermsAndPoliciesScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Policies</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Terms and Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Terms and Conditions</Text>
          <Text style={styles.sectionText}>
            Welcome to FixitPro. By using our application, you agree to comply with and be bound by the following terms and conditions of use. 
            All repair services are provided by independent technicians and not directly by FixitPro unless stated otherwise.
            We reserve the right to cancel any order if the service requested is not feasible. Pricing estimates provided are subject to change after device inspection.
          </Text>
        </View>

        {/* 2. Privacy Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Privacy Policy</Text>
          <Text style={styles.sectionText}>
            Your privacy is important to us. FixitPro collects personal information such as name, phone number, address, and email to provide efficient repair services. 
            {"\n\n"}
            **Data Collection:** We may collect device details, network state, and usage data for app analytics and personalized experiences.
            {"\n\n"}
            **Microphone & Camera Usage:** FixitPro requires microphone and camera permissions strictly for taking images/videos of the damaged products during service bookings and KYC verification. We do not use these permissions for any background recording or unauthorized data extraction.
            {"\n\n"}
            **Data Sharing:** We do not sell or share your personal data with third parties except authorized service technicians handling your repair request.
          </Text>
        </View>

        {/* 3. Refund & Cancellation Policy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Refund & Cancellation Policy</Text>
          <Text style={styles.sectionText}>
            You can cancel a service request at any time before the technician is dispatched. Cancellations after dispatch may incur a visit charge.
            {"\n\n"}
            Refunds for parts or accessories are applicable only if the returned item is unused, in original packaging, and reported within 7 days of delivery or service completion. Service charges are non-refundable once the service has been fully provided.
          </Text>
        </View>

        <View style={styles.footerSpacer} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.borderColor,
  },
  backBtn: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderColor,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 14,
    color: colors.textDark,
    lineHeight: 22,
  },
  footerSpacer: {
    height: 40,
  }
});
