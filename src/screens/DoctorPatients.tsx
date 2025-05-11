import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components/ui/atoms/Text';
import { useTheme } from '../theme/ThemeContext';
import { COLORS } from '../theme/colors';

const DoctorPatients: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? COLORS.dark.background : COLORS.light.background },
      ]}
    >
      <Text>Список пациентов врача</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export default DoctorPatients;
