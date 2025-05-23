import React, { useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import styles from './EmergencyAIAssistantScreen.styles';
import { ChatMessage } from '../components/molecules/ChatMessage';
import { ChatInputBar } from '../components/molecules/ChatInputBar';
import { EmergencyActionButton } from '../components/molecules/EmergencyActionButton';

const OPENAI_API_KEY =
  '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';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export const EmergencyAIAssistantScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('emergencyAI.greeting'),
      timestamp: new Date(),
    },
    {
      role: 'system',
      content: t('emergencyAI.systemWelcome'),
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (inputText: string) => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
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
          {
            role: 'assistant',
            content: t('emergencyAI.error429'),
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (!response.ok) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: t('emergencyAI.errorOpenAI', {
              status: response.status,
              statusText: response.statusText,
            }),
            timestamp: new Date(),
          },
        ]);
        return;
      }

      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || t('emergencyAI.errorNetwork');

      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: aiMessage,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: t('emergencyAI.errorNetwork'),
          timestamp: new Date(),
        },
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
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.contentContainer}>
        <FlatList
          data={messages}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={({ item }) => (
            <ChatMessage
              content={item.content}
              role={item.role}
              timestamp={item.timestamp}
              isLoading={
                loading && item === messages[messages.length - 1] && item.role === 'assistant'
              }
            />
          )}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.quickActions}>
          <EmergencyActionButton
            label={t('emergencyAI.call103')}
            iconName="call"
            iconFamily="ionicons"
            onPress={handleCall}
            variant="danger"
          />
          <EmergencyActionButton
            label={t('emergencyAI.showHospitals')}
            iconName="medkit"
            iconFamily="ionicons"
            onPress={handleShowHospitals}
            variant="primary"
          />
          <EmergencyActionButton
            label={t('emergencyAI.sendLocation')}
            iconName="location"
            iconFamily="ionicons"
            onPress={handleSendLocation}
            variant="secondary"
          />
        </View>

        <ChatInputBar
          onSendMessage={sendMessage}
          placeholder={t('emergencyAI.inputPlaceholder')}
          disabled={loading}
        />
      </View>
    </KeyboardAvoidingView>
  );
};
