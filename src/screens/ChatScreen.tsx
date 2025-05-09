import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Message } from '../types/chat';
import { COLORS } from '../theme/colors';

export const ChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      // Здесь будет запрос к API для получения сообщений
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (messageText.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: messageText.trim(),
        senderId: user?.id || '',
        receiverId: 'recipient-id', // TODO: Заменить на реальный ID получателя
        timestamp: new Date().toISOString(),
        status: 'sent',
      };
      setMessages([...messages, message]);
      setMessageText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === user?.id ? styles.sentMessage : styles.receivedMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Загрузка...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={t('typeMessage')}
          placeholderTextColor={theme.colors.textSecondary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: messageText.trim() ? theme.colors.primary : theme.colors.disabled,
            },
          ]}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>{t('send')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.light.background,
    flex: 1,
  },
  input: {
    backgroundColor: COLORS.light.whiteBackground,
    borderRadius: 20,
    flex: 1,
  },
  inputContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.light.whiteBackground,
    borderTopColor: COLORS.light.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 10,
  },
  messageContainer: {
    alignItems: 'flex-end',
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  messageText: {
    color: COLORS.light.text,
    fontSize: 16,
  },
  messagesList: {
    flex: 1,
    padding: 10,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.light.lightGray,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: COLORS.light.primary,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    marginLeft: 10,
    width: 50,
  },
  sendButtonText: {
    color: COLORS.light.whiteText,
    fontSize: 20,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.light.primary,
  },
  timestamp: {
    color: COLORS.light.whiteText,
    fontSize: 12,
    marginTop: 4,
  },
});
