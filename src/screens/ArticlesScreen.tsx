import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../api/apiClient';
import { Article } from '../types/article';
import { ApiResponse, ArticlesResponse } from '../types/api';

type SortOption = 'date' | 'likes' | 'comments';

export const ArticlesScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [articles, setArticles] = useState<Article[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Функция для загрузки статей
  const fetchArticles = useCallback(async (page = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (!refresh && page === 1) {
      setLoading(true);
    }
    
    try {
      const params: any = { page };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      
      const response = await apiClient.getArticles(params) as unknown as ApiResponse<ArticlesResponse>;
      
      if (response?.data?.articles) {
        const articlesWithBookmarks = response.data.articles.map(article => ({
          ...article,
          isBookmarked: false,
        }));
        
        if (page === 1 || refresh) {
          setArticles(articlesWithBookmarks);
        } else {
          setArticles(prev => [...prev, ...articlesWithBookmarks]);
        }
        
        setCurrentPage(response.data.pagination?.page || 1);
        setTotalPages(response.data.pagination?.pages || 1);
        
        // Загружаем категории, если это первая загрузка
        if (categories.length === 1) {
          const uniqueCategories = ['all', ...new Set(response.data.articles.map(article => article.category))];
          setCategories(uniqueCategories);
        }
      }
      
      setError(null);
    } catch (error) {
      console.error('Ошибка при загрузке статей:', error);
      setError(t('articles.loadError'));
      Alert.alert(
        t('common.error'),
        t('articles.loadError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [searchQuery, selectedCategory, categories.length, t]);

  // Загружаем статьи при первом рендере
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Выполняем поиск при изменении параметров
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchArticles(1);
    }, 500);
    
    return () => clearTimeout(delaySearch);
  }, [searchQuery, selectedCategory, fetchArticles]);

  const filteredArticles = articles
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'likes':
          // Для нашего API у нас пока нет счетчика лайков, поэтому оставляем по дате
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'comments':
          // Для нашего API у нас пока нет счетчика комментариев, поэтому оставляем по дате
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const onRefresh = useCallback(() => {
    fetchArticles(1, true);
  }, [fetchArticles]);

  const toggleBookmark = (articleId: string) => {
    setArticles(prevArticles =>
      prevArticles.map(article =>
        article._id === articleId
          ? { ...article, isBookmarked: !article.isBookmarked }
          : article
      )
    );
  };

  const loadMoreArticles = () => {
    if (currentPage < totalPages && !loading && !refreshing) {
      fetchArticles(currentPage + 1);
    }
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <Animated.View
      style={[
        styles.articleContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={[styles.articleCard, { backgroundColor: theme.colors.card }]}
        onPress={() => {
          setSelectedArticle(item);
          setShowArticleModal(true);
        }}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Image 
          source={{ uri: item.imageUrl || 'https://picsum.photos/200/300' }} 
          style={styles.articleImage} 
        />
        <View style={styles.articleContent}>
          <View style={styles.articleHeader}>
            <View style={styles.categoryContainer}>
              <Ionicons name="bookmark-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.category, { color: theme.colors.primary }]}>
                {item.category}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleBookmark(item._id)}
              style={styles.bookmarkButton}
            >
              <Ionicons
                name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={item.isBookmarked ? theme.colors.primary : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {item.title}
          </Text>
          <View style={styles.articleFooter}>
            <View style={styles.authorContainer}>
              <Ionicons name="person-circle-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
                {item.author ? `${item.author.firstName} ${item.author.lastName}` : 'Автор не указан'}
              </Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={t('searchArticles')}
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="funnel-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              {
                backgroundColor: selectedCategory === category
                  ? theme.colors.primary
                  : theme.colors.card,
              },
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                {
                  color: selectedCategory === category
                    ? theme.colors.white
                    : theme.colors.text,
                },
              ]}
            >
              {category === 'all' ? t('allCategories') : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => fetchArticles(1, true)}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.white }]}>
              {t('retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredArticles}
          renderItem={renderArticle}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.articlesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={loadMoreArticles}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            currentPage < totalPages && !loading ? (
              <ActivityIndicator 
                size="small" 
                color={theme.colors.primary}
                style={styles.footerLoader} 
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="newspaper-outline"
                size={48}
                color={theme.colors.textSecondary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                {t('noArticlesFound')}
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={showSortModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('sortBy')}
            </Text>
            {(['date', 'likes', 'comments'] as SortOption[]).map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  {
                    backgroundColor: sortBy === option
                      ? theme.colors.primary + '20'
                      : 'transparent',
                  },
                ]}
                onPress={() => {
                  setSortBy(option);
                  setShowSortModal(false);
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    {
                      color: sortBy === option
                        ? theme.colors.primary
                        : theme.colors.text,
                    },
                  ]}
                >
                  {t(option)}
                </Text>
                {sortBy === option && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showArticleModal}
        animationType="slide"
        onRequestClose={() => setShowArticleModal(false)}
      >
        {selectedArticle && (
          <View style={[styles.articleModalContainer, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.articleModalHeader, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowArticleModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bookmarkButton}
                onPress={() => toggleBookmark(selectedArticle._id)}
              >
                <Ionicons
                  name={selectedArticle.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={selectedArticle.isBookmarked ? theme.colors.primary : theme.colors.text}
                />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.articleModalContent}>
              <Image
                source={{ uri: selectedArticle.imageUrl || 'https://picsum.photos/200/300' }}
                style={styles.articleModalImage}
              />
              <View style={styles.articleModalInfo}>
                <Text style={[styles.articleModalTitle, { color: theme.colors.text }]}>
                  {selectedArticle.title}
                </Text>
                <View style={styles.articleModalMeta}>
                  <Text style={[styles.articleModalAuthor, { color: theme.colors.textSecondary }]}>
                    {selectedArticle.author ? `${selectedArticle.author.firstName} ${selectedArticle.author.lastName}` : 'Автор не указан'}
                  </Text>
                  <Text style={[styles.articleModalDate, { color: theme.colors.textSecondary }]}>
                    {new Date(selectedArticle.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.articleModalText, { color: theme.colors.text }]}>
                  {selectedArticle.content}
                </Text>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  sortButton: {
    padding: 8,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  articlesList: {
    padding: 16,
  },
  articleContainer: {
    marginBottom: 16,
  },
  articleCard: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  articleImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  articleContent: {
    padding: 16,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  bookmarkButton: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  articleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  author: {
    fontSize: 12,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    fontSize: 16,
  },
  articleModalContainer: {
    flex: 1,
  },
  articleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  closeButton: {
    padding: 8,
  },
  articleModalContent: {
    flex: 1,
  },
  articleModalImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  articleModalInfo: {
    padding: 16,
  },
  articleModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  articleModalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  articleModalAuthor: {
    fontSize: 14,
  },
  articleModalDate: {
    fontSize: 14,
  },
  articleModalText: {
    fontSize: 16,
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footerLoader: {
    marginTop: 16,
    marginBottom: 16,
  },
}); 