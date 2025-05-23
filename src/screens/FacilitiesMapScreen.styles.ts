import { StyleSheet } from 'react-native';

// Константы для цветов
const COLORS = {
  OVERLAY: 'rgba(0, 0, 0, 0.5)',
  SHADOW: '#000',
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    width: '100%',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  clinicAddress: {
    fontSize: 14,
    marginBottom: 4,
  },
  clinicImage: {
    borderRadius: 8,
    height: 160,
    marginBottom: 16,
    width: '100%',
  },
  clinicInfoContainer: {
    paddingTop: 8,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  clinicPhone: {
    fontSize: 14,
    marginBottom: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 10,
  },
  container: {
    flex: 1,
  },
  containerWithDetails: {
    flex: 1,
    flexDirection: 'row',
  },
  detailsButton: {
    flex: 1,
    marginLeft: 8,
  },
  detailsContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailsIcon: {
    marginRight: 8,
  },
  detailsText: {
    fontSize: 14,
  },
  directionButton: {
    flex: 1,
    marginRight: 8,
  },
  estimatedTimeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    borderRadius: 20,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButtonText: {
    fontSize: 14,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  icon: {
    marginRight: 8,
  },
  modalContainer: {
    backgroundColor: COLORS.OVERLAY,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 16,
    paddingTop: 24,
  },
  moreServices: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.7,
  },
  noImage: {
    alignItems: 'center',
    borderRadius: 10,
    height: 150,
    justifyContent: 'center',
    marginBottom: 16,
    width: '100%',
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  serviceItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 6,
  },
  serviceText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
  },
  servicesContainer: {
    marginBottom: 16,
    width: '100%',
  },
  servicesList: {
    marginVertical: 8,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sideBySideButtons: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 14,
    marginLeft: 6,
  },
  updateLocationButton: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'absolute',
    shadowColor: COLORS.SHADOW,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    top: 16,
    zIndex: 10,
  },
  updateLocationText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default styles;
