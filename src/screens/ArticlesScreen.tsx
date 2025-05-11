import React, { useState, useCallback, useEffect } from 'react';
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
import { articlesApi } from '../api/articlesApi';
import { Article } from '../types/article';
import { COLORS } from '../theme/colors';

type SortOption = 'date' | 'likes' | 'comments';

const INACTIVE_CATEGORY_COLOR = '#E3EFFF';
const TRANSPARENT_PRIMARY_COLOR = 'rgba(0, 122, 255, 0.2)';
const MODAL_OVERLAY_COLOR = 'rgba(0, 0, 0, 0.5)';
const TRANSPARENT_COLOR = 'transparent';

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
  const fetchArticles = useCallback(
    async (page = 1, refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else if (!refresh && page === 1) {
        setLoading(true);
      }

      try {
        const params = {
          page,
          limit: 10,
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          sortBy,
        };

        const response = await articlesApi.getArticles(params);

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
            try {
              const categoriesResponse = await articlesApi.getCategories();
              if (categoriesResponse?.data?.categories) {
                const uniqueCategories = ['all', ...categoriesResponse.data.categories];
                setCategories(uniqueCategories);
              }
            } catch (catError) {
              console.error('Ошибка при загрузке категорий:', catError);
            }
          }
        }

        setError(null);
      } catch (error) {
        console.error('Ошибка при загрузке статей:', error);
        setError(t('articles.loadError'));
        Alert.alert(t('common.error'), t('articles.loadError'), [{ text: t('common.ok') }]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [searchQuery, selectedCategory, sortBy, categories.length, t]
  );

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

  const filteredArticles = articles.sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'likes':
        // Если в API нет счетчика лайков, оставляем сортировку по дате
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'comments':
        // Если в API нет счетчика комментариев, оставляем сортировку по дате
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

  const toggleBookmark = async (articleId: string) => {
    try {
      await articlesApi.toggleBookmark(articleId);
      setArticles(prevArticles =>
        prevArticles.map(article =>
          article._id === articleId ? { ...article, isBookmarked: !article.isBookmarked } : article
        )
      );
    } catch (error) {
      console.error('Ошибка при изменении закладки:', error);
    }
  };

  const loadMoreArticles = () => {
    if (currentPage < totalPages && !loading && !refreshing) {
      fetchArticles(currentPage + 1);
    }
  };

  const renderArticle = ({ item }: { item: Article }) => (
    <Animated.View style={[styles.articleContainer, { transform: [{ scale: scaleAnim }] }]}>
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
          <Text style={[styles.title, { color: theme.colors.text }]}>{item.title}</Text>
          <View style={styles.articleFooter}>
            <View style={styles.authorContainer}>
              <Ionicons name="person-circle-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.author, { color: theme.colors.textSecondary }]}>
                {item.author
                  ? `${item.author.firstName} ${item.author.lastName}`
                  : 'Автор не указан'}
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

  const renderSortOption = (option: SortOption, label: string) => (
    <TouchableOpacity
      style={styles.sortOption}
      onPress={() => {
        setSortBy(option);
        setShowSortModal(false);
      }}
    >
      <View style={styles.sortOptionRow}>
        <Text style={[styles.sortOptionText, { color: theme.colors.text }]}>{label}</Text>
        <View style={sortBy === option ? styles.selectedSortOption : styles.transparentBackground}>
          {sortBy === option && (
            <Ionicons name="checkmark" size={18} color={theme.colors.primary} />
          )}
        </View>
      </View>
    </TouchableOpacity>
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
        <TouchableOpacity style={styles.sortButton} onPress={() => setShowSortModal(true)}>
          <Ionicons name="funnel-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category
                ? styles.activeCategoryButton
                : styles.inactiveCategoryButton,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                {
                  color: selectedCategory === category ? theme.colors.white : theme.colors.primary,
                },
              ]}
            >
              {category === 'all' ? t('articles.allCategories') : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={onRefresh}
          >
            <Text style={[styles.retryButtonText, { color: theme.colors.white }]}>
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : filteredArticles.length === 0 ? (
        <View style={styles.noResultsContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
            {searchQuery
              ? t('articles.noSearchResults')
              : selectedCategory !== 'all'
                ? t('articles.noCategoryResults')
                : t('articles.noArticles')}
          </Text>
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
              colors={[COLORS.palette.primary]}
            />
          }
          onEndReached={loadMoreArticles}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            currentPage < totalPages ? (
              <ActivityIndicator
                style={styles.footerLoader}
                size="small"
                color={theme.colors.primary}
              />
            ) : null
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent
        visible={showSortModal}
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={[styles.sortModalContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.sortModalTitle, { color: theme.colors.text }]}>
              {t('articles.sortBy')}
            </Text>
            {renderSortOption('date', t('articles.sortByDate'))}
            {renderSortOption('likes', t('articles.sortByLikes'))}
            {renderSortOption('comments', t('articles.sortByComments'))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={showArticleModal}
        onRequestClose={() => setShowArticleModal(false)}
      >
        {selectedArticle && (
          <View
            style={[styles.articleModalContainer, { backgroundColor: theme.colors.background }]}
          >
            <View style={styles.articleModalHeader}>
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
                  color={
                    selectedArticle.isBookmarked ? theme.colors.primary : theme.colors.textSecondary
                  }
                />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.articleModalContent}
              contentContainerStyle={styles.articleModalContentContainer}
            >
              <Image
                source={{
                  uri: selectedArticle.imageUrl || 'https://picsum.photos/400/200',
                }}
                style={styles.articleModalImage}
              />
              <View style={styles.articleModalCategoryContainer}>
                <Text style={[styles.articleModalCategory, { color: theme.colors.primary }]}>
                  {selectedArticle.category}
                </Text>
              </View>
              <Text style={[styles.articleModalTitle, { color: theme.colors.text }]}>
                {selectedArticle.title}
              </Text>
              <View style={styles.articleModalMetadata}>
                <View style={styles.articleModalAuthor}>
                  <Ionicons
                    name="person-circle-outline"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text
                    style={[styles.articleModalAuthorText, { color: theme.colors.textSecondary }]}
                  >
                    {selectedArticle.author
                      ? `${selectedArticle.author.firstName} ${selectedArticle.author.lastName}`
                      : 'Автор не указан'}
                  </Text>
                </View>
                <View style={styles.articleModalDate}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                  <Text
                    style={[styles.articleModalDateText, { color: theme.colors.textSecondary }]}
                  >
                    {new Date(selectedArticle.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.articleModalContent, { color: theme.colors.text }]}>
                {selectedArticle.content}
              </Text>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  activeCategoryButton: {
    backgroundColor: COLORS.palette.primary,
  },
  articleCard: {
    borderRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    shadowColor: COLORS.palette.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  articleContainer: {
    marginBottom: 16,
  },
  articleContent: {
    padding: 16,
  },
  articleFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  articleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  articleImage: {
    height: 150,
    width: '100%',
  },
  articleModalAuthor: {
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 16,
  },
  articleModalAuthorText: {
    fontSize: 14,
    marginLeft: 4,
  },
  articleModalCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  articleModalCategoryContainer: {
    marginBottom: 8,
  },
  articleModalContainer: {
    flex: 1,
  },
  articleModalContent: {
    flex: 1,
  },
  articleModalContentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  articleModalDate: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  articleModalDateText: {
    fontSize: 14,
    marginLeft: 4,
  },
  articleModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  articleModalImage: {
    borderRadius: 12,
    height: 200,
    marginBottom: 16,
    width: '100%',
  },
  articleModalMetadata: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  articleModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  articlesList: {
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  author: {
    fontSize: 12,
    marginLeft: 4,
  },
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  bookmarkButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 8,
    maxHeight: 50,
  },
  categoriesContent: {
    paddingHorizontal: 16,
  },
  category: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  categoryButton: {
    borderRadius: 16,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  closeButton: {
    padding: 4,
  },
  container: {
    flex: 1,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 24,
    marginTop: 16,
    textAlign: 'center',
  },
  footerLoader: {
    marginVertical: 16,
  },
  inactiveCategoryButton: {
    backgroundColor: INACTIVE_CATEGORY_COLOR,
  },
  loaderContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  modalOverlay: {
    backgroundColor: MODAL_OVERLAY_COLOR,
    flex: 1,
    justifyContent: 'flex-end',
  },
  noResultsContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  noResultsText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    height: 48,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },
  selectedSortOption: {
    backgroundColor: TRANSPARENT_PRIMARY_COLOR,
  },
  sortButton: {
    marginLeft: 8,
    padding: 4,
  },
  sortModalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 5,
    padding: 16,
    shadowColor: COLORS.palette.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sortModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sortOption: {
    paddingVertical: 12,
  },
  sortOptionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortOptionText: {
    fontSize: 16,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  transparentBackground: {
    backgroundColor: TRANSPARENT_COLOR,
  },
});

export default ArticlesScreen;
