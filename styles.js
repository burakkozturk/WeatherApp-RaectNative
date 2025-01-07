import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const styles = {
  container: {
    flex: 1,
  },
  weatherContainer: {
    flex: 1,
    padding: 20,
  },
  time: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
    marginTop: 10,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 300,
  },
  cityName: {
    fontSize: 32,
    fontWeight: '300',
    textTransform: 'uppercase',
    fontFamily: 'System',
    letterSpacing: 2,
    marginBottom: 5,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperature: {
    fontSize: 42,
    fontWeight: '200',
    fontFamily: 'System',
    marginRight: 10,
  },
  weatherEmoji: {
    fontSize: 42,
    opacity: 0.9,
  },
  forecastContainer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 0.3,
  },
  forecastDay: {
    marginLeft: 60,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'System',
  },
  forecastRight: {
    marginRight: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  forecastTemp: {
    fontSize: 14,
    fontWeight: '300',
    fontFamily: 'System',
    marginRight: 8,
  },
  forecastEmoji: {
    fontSize: 14,
    opacity: 0.8,
  },
  error: {
    position: 'absolute',
    top: height * 0.05,
    left: 20,
    right: 20,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    padding: 12,
    borderRadius: 8,
    overflow: 'hidden',
    fontFamily: 'System',
  },
  searchContainer: {
    marginVertical: 20,
  },
  searchInput: {
    height: 40,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'System',
    marginTop: 10,
  },
}; 