import { StyleSheet } from 'react-native';

// Константы цветов
const COLORS = {
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  SHADOW: '#000000',
  CARD_BG: 'rgba(255, 255, 255, 0.95)',
};

// Размеры карты для веб
export const webMap = {
  border: 'none',
  height: '100%',
  width: '100%',
};

export const styles = StyleSheet.create({
  calloutContainer: {
    borderRadius: 8,
    minWidth: 150,
    padding: 8,
  },
  container: {
    flex: 1,
  },
  emptyListContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  errorContainer: {
    alignItems: 'center',
    borderRadius: 8,
    left: 16,
    padding: 16,
    position: 'absolute',
    right: 16,
    top: 16,
  },
  filterButton: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filtersBlock: {
    marginBottom: 16,
  },
  filtersContainer: {
    borderRadius: 8,
    elevation: 4,
    left: 16,
    padding: 16,
    position: 'absolute',
    right: 16,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    top: 16,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 1,
  },
  markerDetailSection: {
    marginBottom: 16,
  },
  markerDetailsContainer: {
    padding: 16,
  },
  markerDetailsHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  markerDetailsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  markerDetailsTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 16,
  },
  markerListContainer: {
    borderLeftWidth: 1,
    width: 300,
  },
  markerTypeIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    marginRight: 8,
    width: 32,
  },
  myLocationButton: {
    alignItems: 'center',
    borderRadius: 24,
    bottom: 16,
    elevation: 4,
    height: 48,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: 48,
  },
  radiusContainer: {
    marginBottom: 16,
  },
  slider: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  sliderButton: {
    padding: 8,
  },
  sliderThumb: {
    borderRadius: 2,
    height: '100%',
  },
  sliderTrack: {
    borderRadius: 2,
    flex: 1,
    height: 4,
    marginHorizontal: 8,
  },
  toggleFiltersButton: {
    alignItems: 'center',
    borderRadius: 24,
    bottom: -24,
    height: 48,
    justifyContent: 'center',
    left: '50%',
    marginLeft: -24,
    position: 'absolute',
    width: 48,
  },
  viewDetailsButton: {
    alignItems: 'center',
    borderRadius: 8,
    padding: 12,
  },
  webFiltersContainer: {
    borderBottomWidth: 1,
    padding: 16,
  },
  webMapContainer: {
    flex: 1,
    flexDirection: 'row',
  },
});

export default styles;
