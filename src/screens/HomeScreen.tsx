import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = StackNavigationProp<RootStackParamList>;

type SimpleRoute = Extract<
  keyof RootStackParamList,
  'Home' | 'Facilities' | 'Profile' | 'Settings' | 'EmergencyAIAssistant'
>;

interface CardItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: SimpleRoute;
}

const testData: CardItem[] = [
  {
    id: '1',
    title: 'Медицинские учреждения',
    subtitle: 'Найдите ближайшую клинику',
    icon: 'medical',
    route: 'Facilities',
  },
  {
    id: '2',
    title: 'Экстренная помощь',
    subtitle: 'Получите помощь в экстренной ситуации',
    icon: 'alert-circle',
    route: 'EmergencyAIAssistant',
  },
  {
    id: '3',
    title: 'Мои записи',
    subtitle: 'Управляйте своими записями',
    icon: 'calendar',
    route: 'Profile',
  },
  {
    id: '4',
    title: 'Профиль',
    subtitle: 'Управление личными данными',
    icon: 'person',
    route: 'Profile',
  },
  {
    id: '5',
    title: 'Настройки',
    subtitle: 'Настройки приложения',
    icon: 'settings',
    route: 'Settings',
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleNavigation = (route: SimpleRoute) => {
    navigation.navigate(route);
  };

  const renderItem = ({ item }: { item: CardItem }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleNavigation(item.route)}>
      <View style={styles.iconContainer}>
        <Ionicons name={item.icon} size={32} color={COLORS.light.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.list}
        data={testData}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        numColumns={2}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 12,
    elevation: 3,
    justifyContent: 'center',
    marginBottom: 16,
    padding: 16,
    shadowColor: COLORS.light.text,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '48%',
  },
  cardContent: {
    alignItems: 'center',
    padding: 8,
  },
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
    borderRadius: 20,
    height: 64,
    justifyContent: 'center',
    marginBottom: 8,
    width: 64,
  },
  list: {
    padding: 16,
  },
  subtitle: {
    color: COLORS.light.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    color: COLORS.light.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
});
