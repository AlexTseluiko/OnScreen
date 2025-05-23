import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { CommentSection } from '../components/molecules/CommentSection';
import { Article } from '../types/article';

interface ArticleScreenProps {
  article: Article;
}

export const ArticleScreen: React.FC<ArticleScreenProps> = ({ article }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* ... existing article content ... */}

        {/* Добавляем секцию комментариев */}
        <CommentSection articleId={article._id} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
