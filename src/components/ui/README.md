# Библиотека компонентов OnScreen

## Обзор

Библиотека компонентов OnScreen построена по методологии Atomic Design и включает в себя:

- **Атомы**: базовые компоненты, которые служат строительными блоками для более сложных компонентов
- **Молекулы**: группы атомов, которые функционируют как единое целое
- **Организмы**: более сложные группы молекул, образующие отдельные разделы интерфейса

## Компоненты

### Атомы

| Компонент     | Описание                                                |
| ------------- | ------------------------------------------------------- |
| Text          | Текстовый компонент с различными вариантами отображения |
| Button        | Кнопка с различными вариантами стилей и состояний       |
| Input         | Поле ввода текста с поддержкой различных состояний      |
| Icon          | Иконка из библиотеки Ionicons или Material Icons        |
| Card          | Карточка для группировки контента                       |
| TouchableCard | Интерактивная карточка с эффектом нажатия               |
| Avatar        | Аватар пользователя с возможностью загрузки изображения |
| Divider       | Разделительная линия                                    |
| Checkbox      | Чекбокс для выбора опций                                |
| Badge         | Бейдж для отображения статуса или количества            |
| Chip          | Компонент для отображения тегов или фильтров            |
| Rating        | Компонент для отображения и выбора рейтинга             |

### Молекулы

| Компонент    | Описание                                                                          |
| ------------ | --------------------------------------------------------------------------------- |
| Alert        | Компонент для отображения информационных, предупреждающих или ошибочных сообщений |
| IconButton   | Кнопка с иконкой                                                                  |
| ListItem     | Элемент списка с различными опциями отображения                                   |
| SearchInput  | Поле поиска с иконкой и кнопкой очистки                                           |
| FormField    | Поле формы с меткой, вспомогательным текстом и индикацией ошибок                  |
| MenuList     | Список элементов меню с иконками и обработчиками нажатий                          |
| ToggleButton | Кнопка с двумя состояниями (вкл/выкл)                                             |
| Dropdown     | Выпадающий список для выбора опций                                                |
| Accordion    | Сворачиваемый/разворачиваемый контейнер для контента                              |
| BottomSheet  | Нижняя панель с возможностью перетаскивания                                       |

### Организмы

| Компонент   | Описание                              |
| ----------- | ------------------------------------- |
| FilterModal | Модальное окно с фильтрами для поиска |

## Использование

Все компоненты поддерживают:

- Темный и светлый режимы
- Различные состояния (активное, неактивное, ошибка и т.д.)
- Кастомизацию через props
- Доступность для скринридеров

### Пример использования FormField

```tsx
import { FormField, Input } from '../components/ui';

const MyForm = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  return (
    <FormField
      label="Электронная почта"
      helperText="Введите действующий адрес электронной почты"
      error={error}
      required
    >
      <Input
        value={value}
        onChangeText={setValue}
        placeholder="example@mail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={!!error}
      />
    </FormField>
  );
};
```

### Пример использования Dropdown

```tsx
import { Dropdown } from '../components/ui';

const MyComponent = () => {
  const [selectedValue, setSelectedValue] = useState<string | number | null>(null);

  const options = [
    { value: '1', label: 'Опция 1', icon: 'star' },
    { value: '2', label: 'Опция 2', icon: 'heart' },
    { value: '3', label: 'Опция 3', icon: 'calendar' },
  ];

  return (
    <Dropdown
      label="Выберите опцию"
      options={options}
      value={selectedValue}
      onSelect={option => setSelectedValue(option.value)}
      placeholder="Выберите из списка"
      helperText="Выберите одну опцию из списка"
    />
  );
};
```

### Пример использования ToggleButton

```tsx
import { ToggleButton } from '../components/ui';

const MyComponent = () => {
  const [selected, setSelected] = useState(false);

  return (
    <ToggleButton
      label="Уведомления"
      icon="notifications"
      selected={selected}
      onToggle={() => setSelected(!selected)}
    />
  );
};
```

### Пример использования Accordion

```tsx
import { Accordion, Text } from '../components/ui';

const MyComponent = () => {
  return (
    <Accordion title="Раздел 1" icon="information-circle" defaultExpanded={true}>
      <Text>
        Это содержимое раздела, которое можно скрыть или показать. Оно может содержать любые
        компоненты и контент.
      </Text>
    </Accordion>
  );
};
```

### Пример использования MenuList

```tsx
import { MenuList } from '../components/ui';

const MyComponent = () => {
  const menuItems = [
    {
      id: '1',
      title: 'Профиль',
      subtitle: 'Личная информация',
      leftIcon: 'person',
      rightIcon: 'chevron-forward',
      onPress: () => navigation.navigate('Profile'),
    },
    {
      id: '2',
      title: 'Настройки',
      subtitle: 'Предпочтения приложения',
      leftIcon: 'settings',
      rightIcon: 'chevron-forward',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  return <MenuList items={menuItems} showDividers />;
};
```
