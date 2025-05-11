import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useTheme } from '../../theme';
import { themes } from '../../theme/theme';

export interface AvatarProps {
  size?: number;
  uri?: string | null;
  source?: ImageSourcePropType;
  initials?: string;
  text?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ size = 40, uri, source, initials, text }) => {
  const { isDark } = useTheme();
  const theme = isDark ? themes.dark : themes.light;

  // Используем text как альтернативу для initials, если оно указано
  const displayInitials = initials || text || '?';

  const getImageStyle = () => ({
    ...styles.image,
    width: size,
    height: size,
    borderRadius: size / 2,
  });

  const getContainerStyle = () => ({
    ...styles.container,
    width: size,
    height: size,
    backgroundColor: theme.colors.primary,
    borderRadius: size / 2,
  });

  const getInitialsStyle = () => ({
    ...styles.initials,
    color: theme.colors.text.inverse,
    fontSize: size * 0.4,
  });

  // Если есть source (для компонента Image), используем его
  if (source) {
    return <Image source={source} style={getImageStyle()} />;
  }

  // Если есть URI для изображения, показываем его
  if (uri) {
    return <Image source={{ uri }} style={getImageStyle()} />;
  }

  // Если есть инициалы, показываем их
  return (
    <View style={getContainerStyle()}>
      <Text style={getInitialsStyle()}>{displayInitials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    overflow: 'hidden',
  },
  initials: {
    fontWeight: 'bold',
  },
});
