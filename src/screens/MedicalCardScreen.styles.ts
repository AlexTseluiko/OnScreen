import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default StyleSheet.create({
  card: {
    margin: 16,
  },
  container: {
    flex: 1,
  },
  diagnosisText: {
    fontWeight: '500',
    marginVertical: 8,
  },
  emptyState: {
    alignItems: 'center',
    marginVertical: 30,
    padding: 16,
  },
  emptyStateText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  errorAlert: {
    margin: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    flex: 1,
  },
  loader: {
    marginVertical: 30,
  },
  recordCard: {
    borderRadius: 8,
    elevation: 2,
    marginBottom: 12,
    padding: 16,
    shadowColor: COLORS.palette.gray[300],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  recordHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordsContainer: {
    marginTop: 8,
  },
  refreshButton: {
    marginTop: 16,
  },
  section: {
    marginBottom: 20,
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  value: {
    flex: 2,
  },
});
