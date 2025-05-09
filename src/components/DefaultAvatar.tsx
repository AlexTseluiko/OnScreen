import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface DefaultAvatarProps {
  size?: number;
}

export const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ size = 40 }) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: theme.colors.card,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            color: theme.colors.textSecondary,
            fontSize: size * 0.4,
          },
        ]}
      >
        ?
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    fontWeight: 'bold',
  },
});
