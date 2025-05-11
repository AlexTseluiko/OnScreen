import React, { useState, useEffect } from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { SearchInput } from '../components/ui/molecules/SearchInput';
import { FilterModal, FilterGroup } from '../components/ui/organisms/FilterModal';
import { Text } from '../components/ui/atoms/Text';
import { Card } from '../components/ui/atoms/Card';
import { Divider } from '../components/ui/atoms/Divider';
import { Icon } from '../components/ui/atoms/Icon';
import { Alert } from '../components/ui/atoms/Alert';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    title: 'Консультация терапевта',
    description: 'Общий осмотр и консультация',
    category: 'Консультации',
    date: '15.06.2023',
  },
  {
    id: '2',
    title: 'МРТ головного мозга',
    description: 'Диагностическое исследование',
    category: 'Исследования',
    date: '22.07.2023',
  },
  {
    id: '3',
    title: 'Анализ крови общий',
    description: 'Лабораторное исследование',
    category: 'Анализы',
    date: '05.08.2023',
  },
  {
    id: '4',
    title: 'Консультация невролога',
    description: 'Специализированная консультация',
    category: 'Консультации',
    date: '12.09.2023',
  },
  {
    id: '5',
    title: 'УЗИ брюшной полости',
    description: 'Ультразвуковое исследование',
    category: 'Исследования',
    date: '30.09.2023',
  },
];

// Моковые группы фильтров для демонстрации
const mockFilterGroups: FilterGroup[] = [
  {
    id: 'category',
    title: 'Категория',
    options: [
      { id: 'consultations', label: 'Консультации', selected: false },
      { id: 'research', label: 'Исследования', selected: false },
      { id: 'analysis', label: 'Анализы', selected: false },
      { id: 'procedures', label: 'Процедуры', selected: false },
    ],
  },
  {
    id: 'period',
    title: 'Период',
    options: [
      { id: 'week', label: 'За неделю', selected: false },
      { id: 'month', label: 'За месяц', selected: false },
      { id: 'quarter', label: 'За квартал', selected: false },
      { id: 'year', label: 'За год', selected: false },
      { id: 'all', label: 'За все время', selected: false },
    ],
  },
];

export const SearchScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>(mockFilterGroups);
  const [activeFilters, setActiveFilters] = useState<number>(0);

  // Эффект для имитации поиска
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) {
        setIsLoading(true);
        // Имитация задержки API
        setTimeout(() => {
          const filtered = mockSearchResults.filter(
            item =>
              item.title.toLowerCase().includes(query.toLowerCase()) ||
              item.description.toLowerCase().includes(query.toLowerCase())
          );
          setResults(filtered);
          setIsLoading(false);
        }, 800);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [query]);

  // Обработчик изменения фильтров
  const handleApplyFilters = (updatedFilters: FilterGroup[]) => {
    setFilterGroups(updatedFilters);

    // Подсчет активных фильтров
    const activeCount = updatedFilters.reduce(
      (count, group) => count + group.options.filter(option => option.selected).length,
      0
    );
    setActiveFilters(activeCount);

    // В реальном приложении здесь бы происходило применение фильтров к результатам
  };

  // Рендер элемента результата поиска
  const renderResultItem = ({ item }: { item: SearchResult }) => (
    <Card style={styles.card} onPress={() => console.log('Выбран результат:', item.id)}>
      <View style={styles.resultHeader}>
        <Text variant="subtitle">{item.title}</Text>
        <Text variant="caption" style={styles.dateText}>
          {item.date}
        </Text>
      </View>
      <Text variant="body" style={styles.description}>
        {item.description}
      </Text>
      <Divider style={styles.divider} />
      <View style={styles.categoryContainer}>
        <Icon name="medical" family="ionicons" size={16} color={theme.colors.text.secondary} />
        <Text variant="body" style={styles.categoryText}>
          {item.category}
        </Text>
      </View>
    </Card>
  );

  // Рендер пустого состояния
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="body" style={styles.emptyStateText}>
            {t('search.loading')}
          </Text>
        </View>
      );
    }

    if (query.trim() && !results.length) {
      return (
        <View style={styles.emptyStateContainer}>
          <Icon name="search-off" family="material" size={60} color={theme.colors.text.secondary} />
          <Text variant="body" style={styles.emptyStateText}>
            {t('search.noResults')}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyStateContainer}>
        <Icon name="search" family="ionicons" size={60} color={theme.colors.text.secondary} />
        <Text variant="body" style={styles.emptyStateText}>
          {t('search.startTyping')}
        </Text>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View style={styles.header}>
        <Text variant="title" style={styles.title}>
          {t('search.title')}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput
          value={query}
          onSearch={setQuery}
          onClear={() => setQuery('')}
          placeholder={t('search.placeholder')}
          showFilterButton
          onFilter={() => setFilterModalVisible(true)}
          activeFiltersCount={activeFilters}
        />

        {activeFilters > 0 && (
          <Alert
            variant="info"
            message={t('search.activeFiltersInfo', { count: activeFilters })}
            onClose={() => {
              // Сброс всех фильтров
              const resetFilters = filterGroups.map(group => ({
                ...group,
                options: group.options.map(option => ({ ...option, selected: false })),
              }));
              setFilterGroups(resetFilters);
              setActiveFilters(0);
            }}
            containerStyle={styles.alertContainer}
          />
        )}
      </View>

      <FlatList
        data={results}
        renderItem={renderResultItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        filterGroups={filterGroups}
        title={t('search.filters')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    marginBottom: 8,
  },
  card: {
    marginBottom: 12,
  },
  categoryContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  categoryText: {
    marginLeft: 6,
  },
  container: {
    flex: 1,
  },
  dateText: {
    opacity: 0.8,
  },
  description: {
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  emptyStateContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    marginTop: 16,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  resultHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchContainer: {
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
});
