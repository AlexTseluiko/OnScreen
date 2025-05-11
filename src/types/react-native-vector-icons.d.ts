/**
 * Объявления типов для react-native-vector-icons
 */

declare module 'react-native-vector-icons/MaterialIcons' {
  import { Component } from 'react';
  import { TextStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
    testID?: string;
  }

  export default class MaterialIcons extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { TextStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
    testID?: string;
  }

  export default class MaterialCommunityIcons extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/FontAwesome' {
  import { Component } from 'react';
  import { TextStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
    testID?: string;
  }

  export default class FontAwesome extends Component<IconProps> {}
}

declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  import { TextStyle } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: TextStyle;
    testID?: string;
  }

  export default class Ionicons extends Component<IconProps> {}
}
