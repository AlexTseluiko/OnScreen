import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { useTheme } from '../../../theme/ThemeContext';

interface LogoWithoutBackgroundProps {
  size?: number;
  color?: string;
}

export const LogoWithoutBackground: React.FC<LogoWithoutBackgroundProps> = ({
  size = 100,
  color,
}) => {
  const { theme } = useTheme();

  // Используем цвет из параметров или основной цвет из темы
  const logoColor = color || theme.colors.primary;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Это стилизованная буква "O" как часть "OnScreen" */}
        <Circle cx="50" cy="50" r="30" fill={logoColor} />
        <Circle cx="50" cy="50" r="20" fill="white" />
        {/* Добавляем значок экрана в центре */}
        <G>
          <Path
            d="M65 40H35c-2.8 0-5 2.2-5 5v20c0 2.8 2.2 5 5 5h30c2.8 0 5-2.2 5-5V45c0-2.8-2.2-5-5-5zm0 25H35V45h30v20z"
            fill={logoColor}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
