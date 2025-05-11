import { StyleSheet, Platform, ViewStyle, TextStyle } from 'react-native';
import { COLORS } from '../theme/colors';

export interface Theme {
  colors: {
    background: string;
    border: string;
    card: string;
    error: string;
    overlay: string;
    primary: string;
    shadow: string;
    text: string;
    textSecondary: string;
    white: string;
  };
}

export const getDynamicStyles = (theme: Theme) => ({
  categoriesContainer: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    padding: 16,
  },
  favoriteFilterButtonActive: {
    backgroundColor: theme.colors.error + '20',
    borderRadius: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    elevation: 5,
    maxHeight: 600,
    padding: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 350,
  },
});

export default StyleSheet.create({
  ageRangeButton: {
    borderRadius: 20,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  } as ViewStyle,
  ageRangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  ageRangesContainer: {
    padding: 16,
  } as ViewStyle,
  categoryButton: {
    borderRadius: 20,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  } as ViewStyle,
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  container: {
    flex: 1,
    padding: 16,
  } as ViewStyle,
  description: {
    fontSize: 14,
    marginBottom: 8,
  } as TextStyle,
  detailSection: {
    marginBottom: 20,
  } as ViewStyle,
  detailText: {
    fontSize: 16,
    marginBottom: 4,
  } as TextStyle,
  detailTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  } as TextStyle,
  errorText: {
    fontSize: 14,
    margin: 16,
    textAlign: 'center',
  } as TextStyle,
  favoriteFilterButton: {
    marginLeft: 8,
    padding: 8,
  } as ViewStyle,
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  } as ViewStyle,
  modal: {
    alignItems: 'center',
    bottom: 0,
    flex: 1,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  } as ViewStyle,
  modalBody: {
    flex: 1,
  } as ViewStyle,
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  } as ViewStyle,
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  } as TextStyle,
  nextScreeningText: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  programCard: {
    borderRadius: 12,
    elevation: 4,
    marginBottom: 16,
    padding: 16,
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
        }
      : {
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        }),
  } as ViewStyle,
  programHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  } as ViewStyle,
  programsList: {
    padding: 16,
  } as ViewStyle,
  riskFactor: {
    fontSize: 16,
    marginBottom: 4,
    paddingLeft: 8,
  } as TextStyle,
  scheduleButton: {
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 16,
    padding: 16,
  } as ViewStyle,
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  searchContainer: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 12,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    padding: 8,
  } as TextStyle,
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  } as TextStyle,
});
