import React from 'react';
import { View, StyleSheet, SafeAreaView, ViewProps, ScrollView } from 'react-native';
import { useTheme } from '../../theme';
import { commonStyles } from '../../constants/styles';

export interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  scrollable?: boolean;
  useSafeArea?: boolean;
  padding?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  scrollable = false,
  useSafeArea = true,
  padding = true,
  style,
  ...rest
}) => {
  const { isDark } = useTheme();
  const containerStyle = isDark ? commonStyles.containerDark : commonStyles.container;
  const paddingStyle = padding ? styles.padding : null;

  const content = (
    <View style={[containerStyle, paddingStyle, style]} {...rest}>
      {scrollable ? <ScrollView>{children}</ScrollView> : children}
    </View>
  );

  if (useSafeArea) {
    return <SafeAreaView style={styles.safeArea}>{content}</SafeAreaView>;
  }

  return content;
};

const styles = StyleSheet.create({
  padding: {
    padding: 16,
  },
  safeArea: {
    flex: 1,
  },
});
