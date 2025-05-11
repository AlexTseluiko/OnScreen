/**
 * Базовый Container компонент
 * Отвечает за бизнес-логику и обработку событий
 */

import React from 'react';
import { BaseComponentView } from './BaseComponentView';
import { BaseComponentProps } from './types';

export const BaseComponentContainer: React.FC<BaseComponentProps> = props => {
  const handlePress = () => {
    if (props.disabled || props.loading) {
      return;
    }
    props.onPress?.();
  };

  return <BaseComponentView {...props} onPress={handlePress} />;
};
