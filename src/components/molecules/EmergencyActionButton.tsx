import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '../atoms/Text';
import { useTheme } from '../../theme';
import { Icon } from '../ui/atoms/Icon';

export interface EmergencyActionButtonProps {
  label: string;
  iconName: string;
  iconFamily?: 'material' | 'community' | 'fontawesome' | 'ionicons';
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Компонент EmergencyActionButton - кнопка для экстренных действий
 */
export const EmergencyActionButton: React.FC<EmergencyActionButtonProps> = ({
  label,
  iconName,
  iconFamily = 'material',
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.text.disabled;

    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'danger':
        return theme.colors.error;
      case 'success':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          shadowColor: theme.colors.shadow || theme.colors.text.primary,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon name={iconName} family={iconFamily} size={24} color={theme.colors.text.inverse} />
      <Text style={[styles.label, { color: theme.colors.text.inverse }]} variant="subtitle">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 6,
    padding: 16,
    shadowColor: undefined, // Будет установлено через theme.colors
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontWeight: '600',
    marginLeft: 12,
  },
});
