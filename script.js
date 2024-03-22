let cityInput = document.querySelector("#city-input");
let searchButton = document.querySelector(".search-btn");
//let locationButton = document.querySelector("location-btn");
const locationButton = document.createElement("button");
let currentWeatherDiv = document.querySelector(".current-weather");
let weatherCardsDiv = document.querySelector(".weather-cards");
let searched = document.querySelector("#searchdata");
let searchHistory = (localStorage.searchHistory) ? JSON.parse(localStorage.searchHistory) : [];

//const API_KEY = "d2e10753e9177cde1bff34f56f43489d"; // API key for OpenWeatherMap API
const API_KEY = "249281e6cc79f719d0132c7ea0c3b402";

const createWeatherCard = (cityName, weatherItem, index) => {
    if(index === 0) { // HTML for the main weather card
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h6>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>${weatherItem.weather[0].description}</h6>
                </div>`;
    } else { // HTML for the other five day forecast card
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h6>
                    <h6>Wind: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidity: ${weatherItem.main.humidity}%</h6>
                </li>`;
    }
}

const getWeatherDetails = (cityName, latitude, longitude) => {
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        // Filter the forecasts to get only one forecast per day
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clearing previous weather data
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        // Creating weather cards and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => {
        alert("An error occurred while fetching the weather forecast!");
    });
}

const getCityCoordinates = () => {
    const cityName = cityInput.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
    
    // Get entered city coordinates (latitude, longitude, and name) from the API response
    fetch(API_URL).then(response => response.json()).then(data => {
        if (!data.length) return alert(`No coordinates found for ${cityName}`);
        const { lat, lon, name } = data[0];
        //let cityDetail = (({ name, lat, lon }) => ({ name, lat, lon }))(data[0]);
        searchHistory.push(data[0]);
        localStorage.searchHistory = JSON.stringify(searchHistory);
        //localStorage.setItem('searchHistory',cityObjectStringified);
        //retrievedCityObj = JSON.parse(localStorage.getItem('searchHistory'));
        //console.log(retrievedCityObj);

        getWeatherDetails(name, lat, lon);
        //displaySearchHistory();
    }).catch(() => {
        alert("An error occurred while fetching the coordinates!");
    });

    displaySearchHistory();
   
}
 


const detectClick = () =>{
    // searchHistory.forEach((search) => {
    //     getWeatherDetails(search.name, search.lat, search.lon);
    //     return;
    //   });

    for(let i in searchHistory){
        //console.log(searchHistory[i]);
        cityName = searchHistory[i].name;
        if(cityName === locationButton.innerHTML){
            getWeatherDetails(searchHistory[i].name,searchHistory[i].lat, searchHistory[i].lon);
            break;
        }
        

    }
}

/// Retrieving History and displayin it.
const displaySearchHistory = () =>{
    searchHistory.forEach((search) => {
        const {name, lat, lon} = search;
        locationButton.innerHTML =`${search.name}`;
        searched.appendChild(locationButton);
      });       

}

searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());
locationButton.addEventListener("click", detectClick);
