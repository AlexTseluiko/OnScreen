import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  errorContainer: {
    borderRadius: 8,
    bottom: 70,
    left: 10,
    padding: 10,
    position: 'absolute',
    right: 10,
  },
  filterButton: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filtersBlock: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  filtersContainer: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    left: 10,
    position: 'absolute',
    right: 10,
    top: 0,
    zIndex: 10,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  myLocationButton: {
    alignItems: 'center',
    borderRadius: 30,
    bottom: 16,
    height: 60,
    justifyContent: 'center',
    position: 'absolute',
    right: 16,
    width: 60,
    zIndex: 2,
  },
  radiusContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  toggleFiltersButton: {
    alignItems: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    height: 30,
    justifyContent: 'center',
    width: '100%',
  },
  webFiltersContainer: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    left: 10,
    position: 'absolute',
    right: 10,
    top: 0,
    zIndex: 10,
  },
});

export const webMap = {
  border: '0',
  height: '100%',
  width: '100%',
};

export default styles;
