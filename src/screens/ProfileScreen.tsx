import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { StackNavigationProp } from '@react-navigation/stack';
import { DefaultAvatar } from '../components/DefaultAvatar';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const ProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert(
        t('common.error'),
        t('profile.logoutError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    {
      title: t('profile.changePassword'),
      icon: 'lock-closed-outline',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      title: t('profile.settings'),
      icon: 'settings-outline',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      title: t('profile.logout'),
      icon: 'log-out-outline',
      onPress: handleLogout,
      color: theme.colors.error,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <View style={styles.profileInfo}>
          <DefaultAvatar size={80} />
          <View style={styles.userInfo}>
            <Text style={[styles.name, { color: theme.colors.text }]}>
              {user?.name || t('common.user')}
            </Text>
            <Text style={[styles.email, { color: theme.colors.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, { backgroundColor: theme.colors.card }]}
            onPress={item.onPress}
            disabled={isLoading}
          >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={item.color || theme.colors.primary}
              />
            </View>
            <Text
              style={[
                styles.menuItemText,
                { color: item.color || theme.colors.text },
              ]}
            >
              {item.title}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textSecondary}
              style={styles.chevron}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
});

export default ProfileScreen; 