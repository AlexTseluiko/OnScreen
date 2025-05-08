import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from 'react-i18next';

// Using English for mock data since it's development data, not user-facing translated content
const mockMessages = [
  {
    id: '1',
    text: 'Hello! How can I help you today?',
    sender: 'doctor',
    timestamp: '10:00',
  },
  {
    id: '2',
    text: 'Good day! I have a question about flu vaccination.',
    sender: 'user',
    timestamp: '10:01',
  },
  {
    id: '3',
    text: 'Of course, I can answer your questions. What specifically interests you?',
    sender: 'doctor',
    timestamp: '10:02',
  },
];

export const ChatScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(mockMessages);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === 'user' ? styles.userMessage : styles.doctorMessage,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: item.sender === 'user'
              ? theme.colors.primary
              : theme.colors.card,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            {
              color: item.sender === 'user'
                ? theme.colors.white
                : theme.colors.text,
            },
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            styles.timestamp,
            {
              color: item.sender === 'user'
                ? theme.colors.white
                : theme.colors.textSecondary,
            },
          ]}
        >
          {item.timestamp}
        </Text>
      </View>
    </View>
  );

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
        inverted={false}
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder={t('typeMessage')}
          placeholderTextColor={theme.colors.textSecondary}
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: message.trim() ? theme.colors.primary : theme.colors.disabled,
            },
          ]}
          onPress={sendMessage}
          disabled={!message.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={message.trim() ? theme.colors.white : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  doctorMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    padding: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
}); 