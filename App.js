import React, { useState, useEffect } from 'react';
import { Text, View, ActivityIndicator, SafeAreaView, TextInput } from 'react-native';
import axios from 'axios';
import { styles } from './styles';

export default function App() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNight, setIsNight] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [currentCity, setCurrentCity] = useState('Chicago,US');

  const API_KEY = '*';

  const getBackgroundColor = () => {
    return isNight ? '#000000' : '#bde0fe';
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
    if (!weather?.timezone) return;

    const localTime = new Date();
    const utc = localTime.getTime() + (localTime.getTimezoneOffset() * 60000);
    const cityTime = new Date(utc + (1000 * weather.timezone));
    
    const hours = cityTime.getHours().toString().padStart(2, '0');
    const minutes = cityTime.getMinutes().toString().padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
  };

  const checkIfNight = (data) => {
    if (!data.sys) return false;
    const now = Date.now() / 1000;
    return now < data.sys.sunrise || now > data.sys.sunset;
  };
  
  const handleSearch = async () => {
    if (searchCity.trim()) {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric&lang=en`
        );
        setCurrentCity(searchCity);
        setSearchCity('');
        await getWeather();
      } catch (err) {
        setError('City not found. Please try another city name.');
        setTimeout(() => setError(null), 3000);
      }
      setLoading(false);
    }
  };

  const getWeather = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${API_KEY}&units=metric&lang=en`
      );
      
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${API_KEY}&units=metric&lang=en`
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
    
    const timeInterval = setInterval(updateTime, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // Weather verisi güncellendiğinde saati de güncelle
  useEffect(() => {
    if (weather) {
      updateTime();
    }
  }, [weather]);

  if (loading || !weather) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#000000' }]}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading Weather...</Text>
      </View>
    );
  }

  const backgroundColor = getBackgroundColor();

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
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.weatherContainer}>
        <Text style={[styles.time, { color: isNight ? '#666666' : '#333333' }]}>{currentTime}</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              color: isNight ? '#ffffff' : '#000000'
            }]}
            placeholder="Search city..."
            placeholderTextColor={isNight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
            value={searchCity}
            onChangeText={(text) => setSearchCity(text)}
            onEndEditing={handleSearch}
            editable={true}
          />
        </View>

        <View style={styles.mainContent}>
          <Text style={[styles.cityName, { color: isNight ? '#ffffff' : '#000000' }]}>
            {weather?.name || 'Unknown City'}
          </Text>
          <View style={styles.weatherInfo}>
            <Text style={[styles.temperature, { color: isNight ? '#ffffff' : '#000000' }]}>
              {weather?.main && Math.round(weather.main.temp)}°
            </Text>
            <Text style={styles.weatherEmoji}>
              {weather?.weather?.[0] ? getWeatherEmoji(weather.weather[0].main) : '🌤'}
            </Text>
          </View>
        </View>

        <View style={styles.forecastContainer}>
          {getNextDaysWeather().map((item, index) => (
            <View key={index} style={[styles.forecastItem, {
              borderTopColor: isNight ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
            }]}>
              <Text style={[styles.forecastDay, { color: isNight ? '#ffffff' : '#000000' }]}>
                {getDayName(item.dt).slice(0, 3)}
              </Text>
              <View style={styles.forecastRight}>
                <Text style={[styles.forecastTemp, { color: isNight ? '#ffffff' : '#000000' }]}>
                  {Math.round(item.main.temp)}°
                </Text>
                <Text style={styles.forecastEmoji}>
                  {getWeatherEmoji(item.weather[0].main)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </SafeAreaView>
  );
} 