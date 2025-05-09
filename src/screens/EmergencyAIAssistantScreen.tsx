import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

const OPENAI_API_KEY =
  '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';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const EmergencyAIAssistantScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('emergencyAI.greeting') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: 300,
          temperature: 0.2,
        }),
      });
      if (response.status === 429) {
        setMessages([
          ...newMessages,
          { role: 'assistant' as const, content: t('emergencyAI.error429') },
        ]);
        return;
      }
      if (!response.ok) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant' as const,
            content: t('emergencyAI.errorOpenAI', {
              status: response.status,
              statusText: response.statusText,
            }),
          },
        ]);
        return;
      }
      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || t('emergencyAI.errorNetwork');
      setMessages([...newMessages, { role: 'assistant' as const, content: aiMessage }]);
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: 'assistant' as const, content: t('emergencyAI.errorNetwork') },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    Linking.openURL('tel:103');
  };

  const handleShowHospitals = () => {
    // Можно реализовать переход на карту с фильтром "Больницы"
    // navigation.navigate('FacilitiesMap', { filter: 'hospital' });
  };

  const handleSendLocation = () => {
    // Можно реализовать отправку координат экстренным контактам
    alert(t('emergencyAI.sendLocation'));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <FlatList
          data={messages}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.message,
                item.role === 'user' ? styles.userMessage : styles.aiMessage,
                {
                  backgroundColor:
                    item.role === 'user' ? theme.colors.primary + '20' : theme.colors.card,
                },
              ]}
            >
              <Text style={[styles.messageText, { color: theme.colors.text }]}>{item.content}</Text>
            </View>
          )}
          contentContainerStyle={{ padding: 16 }}
        />
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              {t('emergencyAI.call103')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShowHospitals}>
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              {t('emergencyAI.showHospitals')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleSendLocation}>
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              {t('emergencyAI.sendLocation')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.text,
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
            ]}
            value={input}
            onChangeText={setInput}
            placeholder={t('emergencyAI.inputPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            editable={!loading}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
            onPress={sendMessage}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>{loading ? '...' : t('common.submit')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontWeight: 'bold',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  container: {
    flex: 1,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    fontSize: 16,
    marginRight: 8,
    padding: 10,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    flexDirection: 'row',
    padding: 8,
  },
  message: {
    borderRadius: 10,
    marginBottom: 12,
    maxWidth: '85%',
    padding: 12,
  },
  messageText: {
    fontSize: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  sendButton: {
    alignItems: 'center',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
});
