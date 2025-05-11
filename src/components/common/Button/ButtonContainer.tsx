/**
 * Container компонент Button
 * Отвечает за бизнес-логику и обработку событий
 */

import React from 'react';
import { ButtonView } from './ButtonView';
import { ButtonProps } from './types';

export const ButtonContainer: React.FC<ButtonProps> = props => {
  const handlePress = () => {
    if (props.disabled || props.loading) {
      return;
    }
    props.onPress?.();
  };

  return <ButtonView {...props} onPress={handlePress} />;
};
