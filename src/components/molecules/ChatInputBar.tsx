import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../ui/atoms/Icon';

export interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

/**
 * Компонент ChatInputBar - поле ввода сообщений для чата
 */
export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSendMessage,
  placeholder = 'Напишите сообщение...',
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim().length > 0) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        style,
      ]}
    >
      <TextInput
        style={[
          styles.input,
          {
            color: theme.colors.text.primary,
            backgroundColor: `${theme.colors.background}80`,
            borderColor: theme.colors.border,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.secondary}
        value={message}
        onChangeText={setMessage}
        multiline
        maxLength={500}
        numberOfLines={1}
        editable={!disabled}
      />
      <TouchableOpacity
        style={[
          styles.sendButton,
          {
            backgroundColor:
              message.trim().length > 0 ? theme.colors.primary : `${theme.colors.primary}60`,
          },
        ]}
        onPress={handleSend}
        disabled={message.trim().length === 0 || disabled}
      >
        <Icon name="send" family="material" size={22} color={theme.colors.text.inverse} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderTopColor: undefined, // Будет установлено через theme.colors.border
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  input: {
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginLeft: 8,
    width: 48,
  },
});
