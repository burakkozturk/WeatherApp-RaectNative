import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, SafeAreaView, Image, Dimensions, ScrollView } from 'react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNight, setIsNight] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const API_KEY = '856dd5c844a271db78e247c96deb2b80';
  const CITY = 'Tokyo, JP';

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

  const getWeatherImage = (weatherCondition) => {
    if (!weatherCondition) return require('./assets/img/clear-day.png');

    const condition = weatherCondition.toLowerCase();
    if (condition.includes('clear')) {
      return isNight 
        ? require('./assets/img/clear-night.png')
        : require('./assets/img/clear-day.png');
    } else if (condition.includes('clouds')) {
      return isNight
        ? require('./assets/img/cloudy-night.png')
        : require('./assets/img/cloudy.png');
    } else if (condition.includes('rain')) {
      return require('./assets/img/rain.png');
    } else if (condition.includes('snow')) {
      return require('./assets/img/snow.png');
    } else if (condition.includes('mist') || condition.includes('fog')) {
      return require('./assets/img/fog.png');
    } else if (condition.includes('wind')) {
      return require('./assets/img/wind.png');
    } else {
      return require('./assets/img/partly-cloudy.png');
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
      
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric&lang=en`
      );
      
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric&lang=en`
      );
      
      setIsNight(checkIfNight(weatherResponse.data));
      setWeather(weatherResponse.data);
      setForecast(forecastResponse.data);
      setError(null);
    } catch (err) {
      console.error('API Error:', err?.response?.data || err.message);
      if (err.response?.status === 401) {
        setError('Invalid API key. Please use a valid API key.');
      } else if (err.response?.status === 404) {
        setError('City not found. Please enter a valid city name.');
      } else {
        setError('Could not fetch weather data. Please check your internet connection.');
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
        <Text style={styles.loadingText}>Loading Weather...</Text>
      </View>
    );
  }

  const backgroundColor = weather?.weather?.[0]?.main ? getBackgroundColor(weather.weather[0].main) : '#2193b0';

  const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(date * 1000).getDay()];
  };

  const getNextDaysWeather = () => {
    if (!forecast) return [];
    const today = new Date().getDate();
    return forecast.list
      .filter(item => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate.getHours() === 12 && itemDate.getDate() > today;
      })
      .slice(0, 5);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#000000' }]}>
      <View style={styles.weatherContainer}>
        <Text style={styles.time}>{currentTime}</Text>
        
        <View style={styles.mainContent}>
          <Text style={styles.cityName}>{weather?.name || 'Unknown City'}</Text>
          <View style={styles.temperatureContainer}>
            <Text style={styles.temperature}>
              {weather?.main && Math.round(weather.main.temp)}°
            </Text>
            <Image 
              source={weather?.weather?.[0] ? getWeatherImage(weather.weather[0].main) : require('./assets/img/clear-day.png')}
              style={styles.weatherIcon}
            />
          </View>
        </View>

        <View style={styles.forecastContainer}>
          {getNextDaysWeather().map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastDay}>{getDayName(item.dt).slice(0, 3)}</Text>
              <Image 
                source={getWeatherImage(item.weather[0].main)}
                style={styles.forecastIcon}
              />
              <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°</Text>
            </View>
          ))}
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
  weatherContainer: {
    flex: 1,
    padding: 20,
  },
  time: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '400',
    fontFamily: 'System',
    marginTop: 10,
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -height * 0.1,
  },
  cityName: {
    fontSize: 42,
    fontWeight: '300',
    color: '#ffffff',
    textTransform: 'uppercase',
    fontFamily: 'System',
    letterSpacing: 2,
    marginBottom: 10,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperature: {
    fontSize: 120,
    fontWeight: '200',
    color: '#ffffff',
    fontFamily: 'System',
  },
  weatherIcon: {
    width: 100,
    height: 100,
    tintColor: '#ffffff',
    opacity: 0.5,
    marginLeft: 20,
  },
  forecastContainer: {
    marginTop: 'auto',
    paddingTop: 20,
  },
  forecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  forecastDay: {
    flex: 1,
    color: '#666666',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'System',
  },
  forecastIcon: {
    width: 20,
    height: 20,
    tintColor: '#666666',
    marginHorizontal: 15,
  },
  forecastTemp: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '300',
    fontFamily: 'System',
    width: 40,
    textAlign: 'right',
  },
  error: {
    position: 'absolute',
    top: height * 0.05,
    left: 20,
    right: 20,
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    padding: 15,
    borderRadius: 12,
    overflow: 'hidden',
    fontFamily: 'System',
  },
}); 