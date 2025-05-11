import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  PanResponder,
  Dimensions,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme/ThemeContext';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MINIMUM_SHEET_HEIGHT = 100;
const MAXIMUM_SHEET_HEIGHT = SCREEN_HEIGHT * 0.8;

export interface BottomSheetProps {
  /**
   * Видимость нижнего листа
   */
  visible: boolean;

  /**
   * Callback, вызываемый при закрытии листа
   */
  onClose: () => void;

  /**
   * Заголовок листа
   */
  title?: string;

  /**
   * Высота листа (по умолчанию 50% высоты экрана)
   */
  height?: number;

  /**
   * Максимальная высота листа при перетаскивании
   */
  maxHeight?: number;

  /**
   * Callback, вызываемый при изменении высоты листа
   */
  onHeightChange?: (height: number) => void;

  /**
   * Разрешить перетаскивание
   */
  enableDrag?: boolean;

  /**
   * Closeble при свайпе вниз
   */
  closeOnSwipeDown?: boolean;

  /**
   * Дочерние элементы
   */
  children: React.ReactNode;

  /**
   * Дополнительные стили для контейнера
   */
  containerStyle?: ViewStyle;

  /**
   * Показать индикатор перетаскивания
   */
  showDragIndicator?: boolean;
}

/**
 * Компонент BottomSheet
 *
 * Отображает содержимое в виде выдвигающегося снизу листа с возможностью перетаскивания
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  height = SCREEN_HEIGHT * 0.5,
  maxHeight = MAXIMUM_SHEET_HEIGHT,
  onHeightChange,
  enableDrag = true,
  closeOnSwipeDown = true,
  children,
  containerStyle,
  showDragIndicator = true,
}) => {
  const { theme, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState<boolean>(visible);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.Value(0)).current;

  // Обновление видимости модального окна при изменении props
  useEffect(() => {
    toggleModal(visible);
  }, [visible]);

  // Функция для открытия/закрытия модального окна с анимацией
  const toggleModal = (isVisible: boolean) => {
    if (isVisible) {
      setModalVisible(true);
      Animated.spring(animatedHeight, {
        toValue: 1,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // По завершении анимации закрываем модальное окно
        setModalVisible(false);
        pan.setValue(0);
      });
    }
  };

  // Обработчик перетаскивания
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableDrag,
      onPanResponderMove: (e, gestureState) => {
        // Ограничиваем перетаскивание только вверх и вниз
        if (gestureState.dy > 0) {
          // Перетаскивание вниз (максимум до изначальной высоты)
          pan.setValue(gestureState.dy);
        } else if (gestureState.dy < 0) {
          // Перетаскивание вверх (максимум до maxHeight)
          const newHeight = height - gestureState.dy;
          if (newHeight <= maxHeight) {
            pan.setValue(gestureState.dy);
          }
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (closeOnSwipeDown && gestureState.dy > 100) {
          // Если пользователь свайпнул достаточно вниз, закрываем лист
          onClose();
        } else if (gestureState.dy < -50) {
          // Если пользователь свайпнул вверх, расширяем до maxHeight
          Animated.spring(pan, {
            toValue: height - maxHeight > 0 ? height - maxHeight : 0,
            useNativeDriver: false,
          }).start();
          if (onHeightChange) {
            onHeightChange(maxHeight);
          }
        } else {
          // Возвращаем к исходной высоте
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
          if (onHeightChange) {
            onHeightChange(height);
          }
        }
      },
    })
  ).current;

  // Вычисляем высоту листа с учётом перетаскивания
  const sheetHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  const draggedHeight = Animated.subtract(sheetHeight, pan);

  // Вычисляем непрозрачность фона
  const backdropOpacity = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  // Если модальное окно не видимо, ничего не рендерим
  if (!modalVisible) {
    return null;
  }

  return (
    <Modal transparent visible={modalVisible} animationType="none" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              backgroundColor: 'black',
              opacity: backdropOpacity,
            },
          ]}
        >
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdropTouchable} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              height: draggedHeight,
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.borderRadius.lg,
              borderTopRightRadius: theme.borderRadius.lg,
              borderColor: theme.colors.border,
              borderWidth: isDark ? 1 : 0,
              borderBottomWidth: 0,
            },
            containerStyle,
          ]}
        >
          <View {...(enableDrag ? panResponder.panHandlers : {})} style={styles.dragHandle}>
            {showDragIndicator && (
              <View style={[styles.dragIndicator, { backgroundColor: theme.colors.text.hint }]} />
            )}
          </View>

          {title && (
            <View style={styles.header}>
              <Text variant="subtitle" style={styles.title}>
                {title}
              </Text>
              <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.closeButton}>
                  <Icon
                    name="close"
                    family="ionicons"
                    size={24}
                    color={theme.colors.text.primary}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          )}

          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouchable: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  dragHandle: {
    alignItems: 'center',
    height: 24,
    justifyContent: 'center',
    width: '100%',
  },
  dragIndicator: {
    borderRadius: 2,
    height: 4,
    width: 40,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      height: -6,
      width: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  title: {
    flex: 1,
  },
});
