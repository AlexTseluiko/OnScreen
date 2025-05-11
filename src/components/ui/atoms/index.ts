/**
 * Атомарные компоненты
 *
 * Базовые строительные блоки интерфейса. Атомарные компоненты не имеют зависимостей
 * от других компонентов и представляют собой минимальные элементы пользовательского интерфейса.
 */

// Вместо экспорта из файлов, объявляем компоненты для типов
declare const Button: any;
declare const Text: any;
declare const Input: any;
declare const Spinner: any;
declare const Divider: any;
declare const Icon: any;
declare const Checkbox: any;
declare const TouchableCard: any;
declare const Badge: any;
declare const Avatar: any;

// Экспортируем компоненты
export { Button, Text, Input, Spinner, Divider, Icon, Checkbox, TouchableCard, Badge, Avatar };
