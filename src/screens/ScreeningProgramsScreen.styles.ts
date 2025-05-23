import { StyleSheet, ViewStyle, TextStyle, DimensionValue } from 'react-native';

// Константы для цветов для избежания литералов
const TRANSPARENT_BACKGROUND = 'rgba(0, 0, 0, 0.03)';
const BORDER_COLOR = 'rgba(0, 0, 0, 0.1)';

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
    backgroundColor: theme.colors.primary + '20',
    borderRadius: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    elevation: 5,
    maxHeight: 600,
    padding: 20,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '90%' as unknown as DimensionValue,
    maxWidth: 500 as unknown as DimensionValue,
  },
});

export default StyleSheet.create({
  ageRangeButton: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    marginVertical: 10,
  } as ViewStyle,
  ageRangeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  ageRangesContainer: {
    paddingHorizontal: 10,
  } as ViewStyle,
  bulletPoint: {
    fontSize: 16,
    paddingVertical: 4,
    paddingLeft: 8,
    lineHeight: 22,
  } as TextStyle,
  categoryButton: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 5,
    marginVertical: 10,
  } as ViewStyle,
  categoryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  } as TextStyle,
  categoryTag: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
  } as TextStyle,
  container: {
    flex: 1,
    padding: 16,
  } as ViewStyle,
  description: {
    fontSize: 14,
    marginTop: 4,
  } as TextStyle,
  detailSection: {
    marginBottom: 24,
  } as ViewStyle,
  detailText: {
    fontSize: 16,
    marginTop: 8,
    lineHeight: 22,
  } as TextStyle,
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  } as TextStyle,
  errorText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  } as TextStyle,
  favoriteFilterButton: {
    padding: 8,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  modalBody: {
    padding: 16,
    maxHeight: '80%',
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  } as ViewStyle,
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  } as TextStyle,
  nextScreeningText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  programCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  programsList: {
    marginTop: 8,
  } as ViewStyle,
  riskFactor: {
    marginBottom: 4,
    fontSize: 15,
    lineHeight: 20,
  } as TextStyle,
  scheduleButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 16,
  } as ViewStyle,
  scheduleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  } as TextStyle,
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
  } as TextStyle,
  subTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  } as TextStyle,
  testDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  } as TextStyle,
  testDetails: {
    backgroundColor: TRANSPARENT_BACKGROUND,
    borderRadius: 4,
    marginTop: 4,
    padding: 8,
  },
  testHeader: {
    alignItems: 'center',
    borderBottomColor: BORDER_COLOR,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  testInfoLabel: {
    width: '35%',
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
  testInfoRow: {
    flexDirection: 'row',
    marginVertical: 6,
  } as ViewStyle,
  testInfoValue: {
    flex: 1,
    fontSize: 14,
  } as TextStyle,
  testItem: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
    paddingBottom: 8,
  } as ViewStyle,
  testName: {
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  } as TextStyle,
});
