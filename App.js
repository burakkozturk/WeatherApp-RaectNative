import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNight, setIsNight] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const API_KEY = '856dd5c844a271db78e247c96deb2b80';
  const CITY = 'Manchester,UK';

  const getBackgroundColor = (weatherCondition) => {
    if (!weatherCondition) return '#2193b0';

    const condition = weatherCondition.toLowerCase();
    if (condition.includes('clear')) {
      return isNight ? '#1a2a6c' : '#2193b0';
    } else if (condition.includes('clouds')) {
      return isNight ? '#373B44' : '#2c3e50';
    } else if (condition.includes('rain')) {
      return '#000046';
    } else if (condition.includes('snow')) {
      return '#8e9eab';
    } else if (condition.includes('mist')) {
      return '#606c88';
    } else {
      return '#2193b0';
    }
  };

  const getBackgroundImage = (weatherCondition) => {
    if (!weatherCondition) return require('./assets/img/clear-night.png');

    const condition = weatherCondition.toLowerCase();
    if (condition.includes('clear')) {
      return isNight ? require('./assets/img/clear-night.png') : require('./assets/img/clear-day.png');
    } else if (condition.includes('clouds')) {
      return isNight ? require('./assets/img/cloudy-night.png') : require('./assets/img/cloudy.png');
    } else if (condition.includes('rain')) {
      return require('./assets/img/rain.png');
    } else if (condition.includes('snow')) {
      return require('./assets/img/snow.png');
    } else if (condition.includes('mist')) {
      return require('./assets/img/fog.png');
    } else {
      return require('./assets/img/clear-night.png');
    }
  };

  const getWeatherEmoji = (weatherCondition) => {
    if (!weatherCondition) return '🌤';

    const condition = weatherCondition.toLowerCase();
    if (condition.includes('clear')) {
      return isNight ? '🌙' : '☀️';
    } else if (condition.includes('clouds')) {
      return isNight ? '☁️' : '⛅️';
    } else if (condition.includes('rain')) {
      return '🌧';
    } else if (condition.includes('snow')) {
      return '❄️';
    } else if (condition.includes('mist') || condition.includes('fog')) {
      return '🌫';
    } else if (condition.includes('wind')) {
      return '💨';
    } else {
      return '🌤';
    }
  };

  const updateTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
  };

  const checkIfNight = (data) => {
    if (!data.sys) return false;
    const now = Date.now() / 1000;
    return now < data.sys.sunrise || now > data.sys.sunset;
  };
  
  const getWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=tr`
      );
      
      console.log('API Response:', response.data);
      
      setIsNight(checkIfNight(response.data));
      setWeather(response.data);
      setError(null);
    } catch (err) {
      console.error('API Error:', err?.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('API anahtarı geçersiz. Lütfen geçerli bir API anahtarı kullanın.');
      } else if (err.response?.status === 404) {
        setError('Şehir bulunamadı. Lütfen geçerli bir şehir adı girin.');
      } else {
        setError('Hava durumu bilgisi alınamadı. Lütfen internet bağlantınızı kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getWeather();
    updateTime();
    
    const weatherInterval = setInterval(getWeather, 300000);
    const timeInterval = setInterval(updateTime, 1000);
    
    return () => {
      clearInterval(weatherInterval);
      clearInterval(timeInterval);
    };
  }, []);

  if (loading || !weather) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#2193b0' }]}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Hava Durumu Yükleniyor...</Text>
      </View>
    );
  }

  const backgroundColor = weather?.weather?.[0]?.main ? getBackgroundColor(weather.weather[0].main) : '#2193b0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.weatherContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.cityName}>{weather?.name || 'Bilinmeyen Şehir'}</Text>
          <Text style={styles.time}>{currentTime}</Text>
        </View>
        
        <View style={styles.mainContent}>
          <Text style={styles.weatherEmoji}>
            {weather?.weather?.[0] && getWeatherEmoji(weather.weather[0].main)}
          </Text>
          <Text style={styles.temperature}>
            {weather?.main && Math.round(weather.main.temp)}°
          </Text>
          <Text style={styles.weatherDescription}>
            {weather?.weather?.[0]?.description}
          </Text>
        </View>
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 16,
  },
  weatherContainer: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginTop: height * 0.05,
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -height * 0.1,
  },
  time: {
    fontSize: 20,
    color: '#ffffff',
    opacity: 0.8,
    fontWeight: '300',
    letterSpacing: 2,
    marginTop: 5,
  },
  cityName: {
    fontSize: height * 0.1,
    fontWeight: '100',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    marginBottom: 10,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#ffffff',
  },
  weatherEmoji: {
    fontSize: width * 0.4,
    marginBottom: 20,
  },
  temperature: {
    fontSize: height * 0.15,
    fontWeight: '200',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
    marginBottom: 10,
    lineHeight: height * 0.15,
  },
  weatherDescription: {
    fontSize: height * 0.03,
    color: '#ffffff',
    textTransform: 'capitalize',
    opacity: 0.8,
    letterSpacing: 1,
  },
  error: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255,59,48,0.9)',
    padding: 15,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 