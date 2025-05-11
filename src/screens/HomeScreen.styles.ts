import { StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default StyleSheet.create({
  additionalSquare: {
    alignItems: 'center',
    backgroundColor: COLORS.palette.white,
    borderRadius: 10,
    elevation: 2,
    justifyContent: 'center',
    margin: 4,
    padding: 10,
    shadowColor: COLORS.palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: '22%',
  },
  additionalSquareTitle: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  additionalSquaresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  articleCard: {
    backgroundColor: COLORS.palette.white,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  articleContent: {
    padding: 12,
  },
  articleDescription: {
    color: COLORS.palette.gray[600],
    fontSize: 14,
  },
  articleImage: {
    height: 150,
    width: '100%',
  },
  articleSummary: {
    color: COLORS.palette.gray[600],
    fontSize: 14,
  },
  articleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  articlesSection: {
    marginBottom: 16,
    padding: 16,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  cardContainer: {
    marginBottom: 16,
  },
  container: {
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  square: {
    alignItems: 'center',
    backgroundColor: COLORS.palette.white,
    borderRadius: 12,
    elevation: 2,
    flex: 1,
    justifyContent: 'center',
    margin: 6,
    padding: 16,
    shadowColor: COLORS.palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  squareIcon: {
    marginBottom: 8,
  },
  squareTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  squaresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  subtitle: {
    color: COLORS.palette.gray[600],
    fontSize: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  viewAllText: {
    color: COLORS.palette.primary,
    fontSize: 14,
  },
});
