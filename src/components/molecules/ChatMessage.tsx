import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../atoms/Text';
import { useTheme } from '../../theme';
import { Icon } from '../ui/atoms/Icon';

export interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp?: Date;
  isLoading?: boolean;
  onPress?: () => void;
}

/**
 * Компонент ChatMessage отображает сообщение в чате
 * Поддерживает разные роли сообщений (от пользователя, от ассистента, системные)
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  role,
  timestamp,
  isLoading = false,
  onPress,
}) => {
  const { theme } = useTheme();

  // Определяем стили в зависимости от роли
  const getMessageStyles = () => {
    switch (role) {
      case 'user':
        return {
          container: [
            styles.container,
            styles.userContainer,
            { backgroundColor: `${theme.colors.primary}20` },
          ],
          wrapper: [styles.wrapper, styles.userWrapper],
        };
      case 'assistant':
        return {
          container: [
            styles.container,
            styles.assistantContainer,
            { backgroundColor: theme.colors.surface },
          ],
          wrapper: [styles.wrapper, styles.assistantWrapper],
        };
      case 'system':
        return {
          container: [
            styles.container,
            styles.systemContainer,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ],
          wrapper: [styles.wrapper, styles.systemWrapper],
        };
      default:
        return {
          container: [styles.container, { backgroundColor: theme.colors.surface }],
          wrapper: [styles.wrapper],
        };
    }
  };

  const styles_with_theme = getMessageStyles();

  const messageContent = isLoading ? 'Печатает...' : content;

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles_with_theme.container}
      onPress={handlePress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles_with_theme.wrapper}>
        {role === 'assistant' && (
          <View style={styles.iconContainer}>
            <Icon
              name="medical-services"
              family="material"
              size={20}
              color={theme.colors.primary}
            />
          </View>
        )}

        <View style={styles.contentContainer}>
          <Text
            style={[styles.content, { color: theme.colors.text.primary }]}
            variant={role === 'system' ? 'secondary' : 'body1'}
          >
            {messageContent}
          </Text>

          {timestamp && (
            <Text
              style={[styles.timestamp, { color: theme.colors.text.secondary }]}
              variant="caption"
            >
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  container: {
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '85%',
    padding: 0,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  contentContainer: {
    flex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    marginRight: 8,
    width: 28,
  },
  systemContainer: {
    alignSelf: 'center',
    borderWidth: 1,
    marginVertical: 16,
    opacity: 0.8,
  },
  systemWrapper: {
    justifyContent: 'center',
  },
  timestamp: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  wrapper: {
    flexDirection: 'row',
    padding: 12,
  },
});
