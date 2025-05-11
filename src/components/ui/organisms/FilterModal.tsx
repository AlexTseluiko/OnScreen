import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';
import { Icon } from '../atoms/Icon';
import { Divider } from '../atoms/Divider';

export interface FilterOption {
  id: string;
  label: string;
  selected: boolean;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
}

export interface FilterModalProps {
  /**
   * Видимость модального окна
   */
  visible: boolean;

  /**
   * Callback, вызываемый при закрытии модального окна
   */
  onClose: () => void;

  /**
   * Callback, вызываемый при применении фильтров
   */
  onApply: (filters: FilterGroup[]) => void;

  /**
   * Группы фильтров
   */
  filterGroups: FilterGroup[];

  /**
   * Заголовок модального окна
   */
  title?: string;
}

/**
 * Модальное окно фильтров
 *
 * Позволяет пользователю выбрать фильтры из нескольких групп и применить их.
 * Поддерживает сброс всех фильтров и закрытие без применения.
 */
export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  filterGroups,
  title = 'Фильтры',
}) => {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<FilterGroup[]>(filterGroups);

  // Обработчик изменения состояния чекбокса
  const handleCheckboxChange = (groupId: string, optionId: string) => {
    const updatedFilters = filters.map(group => {
      if (group.id === groupId) {
        const updatedOptions = group.options.map(option => {
          if (option.id === optionId) {
            return { ...option, selected: !option.selected };
          }
          return option;
        });
        return { ...group, options: updatedOptions };
      }
      return group;
    });
    setFilters(updatedFilters);
  };

  // Сброс всех фильтров
  const handleReset = () => {
    const resetFilters = filters.map(group => ({
      ...group,
      options: group.options.map(option => ({ ...option, selected: false })),
    }));
    setFilters(resetFilters);
  };

  // Применение фильтров
  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  // Подсчет выбранных фильтров
  const selectedCount = filters.reduce(
    (count, group) => count + group.options.filter(option => option.selected).length,
    0
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          {/* Заголовок */}
          <View style={styles.header}>
            <Text variant="title">{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" family="ionicons" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <Divider />

          {/* Контент */}
          <ScrollView style={styles.content}>
            {filters.map(group => (
              <View key={group.id} style={styles.filterGroup}>
                <Text variant="subtitle" style={styles.groupTitle}>
                  {group.title}
                </Text>

                {group.options.map(option => (
                  <Checkbox
                    key={option.id}
                    label={option.label}
                    checked={option.selected}
                    onPress={() => handleCheckboxChange(group.id, option.id)}
                    containerStyle={styles.checkboxContainer}
                  />
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Футер с кнопками */}
          <View style={styles.footer}>
            <Button
              variant="ghost"
              title="Сбросить все"
              onPress={handleReset}
              disabled={selectedCount === 0}
            />
            <Button
              title={`Применить${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
              onPress={handleApply}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    marginBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  groupTitle: {
    marginBottom: 8,
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    bottom: 0,
    elevation: 5,
    height: '80%',
    left: 0,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
});
