// src/screens/profile/EditProfileScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  TextInput, 
  StatusBar, 
  Platform,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 

import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
// 🚀 Nayi config file se dono import kar liye
import { db, imageKitConfig } from '../../services/firebaseConfig';

// 🚀 Helper: React Native me Base64 encode karne ke liye
const encodeBase64 = (str) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let block = 0, charCode, i = 0, map = chars;
  str.charAt(i | 0) || (map = '=', i % 1);
  output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = str.charCodeAt(i += 3/4);
    block = block << 8 | charCode;
  }
  return output;
};

export default function EditProfileScreen({ navigation }) {
  const { user } = useAuth(); // 🧠 Get logged-in user info
  
  // States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  
  const [loading, setLoading] = useState(true); // Data fetch loading
  const [saving, setSaving] = useState(false); // Data save loading
  const [uploadingImage, setUploadingImage] = useState(false); // Image upload loading

  // 1️⃣ Fetch Initial Data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || '');
            setEmail(data.email || ''); 
            setPhone(data.mobile || '');
            setProfilePic(data.profilePic || null);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, [user]);

  // 2️⃣ Handle Image Selection 
  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Required", "Please allow gallery access to upload a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.5, 
      base64: true, // 🚀 Base64 format for ImageKit
    });

    if (!result.canceled && result.assets[0].base64) {
      uploadToImageKit(result.assets[0].base64);
    }
  };

  // 3️⃣ ImageKit Upload Logic using Central Config
  const uploadToImageKit = async (base64Image) => {
    setUploadingImage(true);
    try {
      // 🚀 Yahan hum imageKitConfig ka use kar rahe hain
      const privateKey = imageKitConfig.privateKey;
      const authHeader = 'Basic ' + encodeBase64(privateKey + ':');

      const formData = new FormData();
      formData.append('file', base64Image); 
      formData.append('fileName', `profile_${user.uid}.jpg`);
      formData.append('folder', '/FixitPro/Users'); 

      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: authHeader,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (data.url) {
        setProfilePic(data.url); // 🚀 Success!
      } else {
        Alert.alert("Upload Failed", "Could not upload image. Please try again.");
      }
    } catch (error) {
      console.error("ImageKit Upload Error:", error);
      Alert.alert("Error", "Something went wrong while uploading.");
    } finally {
      setUploadingImage(false);
    }
  };

  // 4️⃣ Save Data to Firestore
  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert("Missing Details", "Name and Phone number cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
        mobile: phone.trim(),
        profilePic: profilePic 
      });

      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={saving}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving || uploadingImage}>
          {saving ? (
             <ActivityIndicator size="small" color={colors.primary} />
          ) : (
             <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        {/* Avatar Edit Section */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleImagePick} disabled={uploadingImage}>
            <View style={styles.avatar}>
              {uploadingImage ? (
                <ActivityIndicator size="large" color="#FFF" />
              ) : profilePic ? (
                <Image source={{ uri: profilePic }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : 'U'}</Text>
              )}
            </View>
            <View style={styles.cameraBtn}>
              <MaterialIcons name="camera-alt" size={18} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput 
          style={styles.input} 
          value={name} 
          onChangeText={setName} 
        />

        <Text style={styles.label}>Email Address (Read-only)</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: '#E2E8F0', color: '#94A3B8' }]} 
          value={email} 
          editable={false} 
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput 
          style={styles.input} 
          value={phone} 
          onChangeText={setPhone} 
          keyboardType="numeric" 
          maxLength={10}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800' },
  saveText: { color: colors.primary, fontWeight: '800', fontSize: 16 },
  formContainer: { padding: 20 },
  avatarContainer: { alignSelf: 'center', marginBottom: 30, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarText: { color: '#FFF', fontSize: 40, fontWeight: 'bold' },
  avatarImage: { width: '100%', height: '100%' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, width: 35, height: 35, borderRadius: 17.5, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  label: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, fontWeight: '600' }
});