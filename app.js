const API_KEY = "72b809a9fbc7659e52bef152a5d8f4ff";
const API_URL = `https://api.openweathermap.org/data/2.5/`;
const API_ICON_URL = `https://openweathermap.org/img/wn/`;
const weatherData = document.getElementById("weatherData");
const cityName = document.getElementById("cityName");
const errorDiv = document.getElementById("errorDiv");

window.onload = askForLocationPermission();

function askForLocationPermission() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, denied);
    } else {
        console.log("Location Permission Denied!");
        const cityD = "delhi";
        document.getElementById("city").value = cityD;
        functionRunner(cityD);
    }
}

function denied(error) {
    if (error.code === 1) {
        console.log("Location Permission Denied!");
        falseInput(error);
    }
}

function resume() {
    console.log("Resuming Processes... City Set to Default");
    errorDiv.innerHTML = "";
    const cityD = "delhi";
    document.getElementById("city").value = cityD;
    functionRunner(cityD);
}

function falseInput(error) {
    console.error(error);
    errorDiv.innerHTML = "<h4>No City Found...</h4>";
    setTimeout(resume, 1000);
}

window.onload = askForLocationPermission;

function functionRunner(city) {
    cityName.innerHTML = `<h1>${city}</h1>`;
    getWeatherData(city);
    getWeatherForecast(city);
}

function success(position) {
    console.log("Location Permission Granted!")
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetch(`${API_URL}weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
    .then(function (response) {
        return response.json();
    })
    .then(function (loadData) {
        const { name } = loadData;
        document.getElementById("city").value = name;
        console.log(`Loading data for ${name}`);
        functionRunner(name);
    })
    .catch(function (error) {
        console.log("Error Occured in function success().");
        falseInput(error);
    });
}
    
document.getElementById("submitBtn").addEventListener("click", function () {
    const city = document.getElementById("city").value;
    if (city) {
        console.log(`Loading data for ${city}`);
        functionRunner(city);
    }
});

document.getElementById("city").addEventListener("keypress", function(event) {
    if (event.key === "Enter"){
        event.preventDefault();
        document.getElementById("submitBtn").click();
    }
});

document.getElementById("toggleBtn").addEventListener("click", function () { 
    const city = document.getElementById('city').value;
    let toggler = document.getElementById("toggleBtn").className;
    if (toggler == "card") {
        console.log(`Loading charts..`);
        document.getElementById("toggleBtn").innerHTML = "Toggle Card"
        document.getElementById("toggleBtn").className = "chart";
        getWeatherForecastChart(city);
    } else{
        console.log(`Loading cards..`);
        document.getElementById("toggleBtn").innerHTML = "Toggle Chart"
        document.getElementById("toggleBtn").className = "card";
        getWeatherForecast(city);
    }
});

function getWeatherForecastChart(city) {
    
    document.getElementById("forecast-container").innerHTML = `<canvas id="weatherChart"></canvas>`;
        
    const weatherChart = new Chart(document.getElementById("weatherChart"), {
        type: "bar",
        data: {
            labels: [],
            datasets: [
            {
                label: "Temperature (°C)",
                data: [],
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
            {
                label: "Humidity (%)",
                data: [],
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
                borderWidth: 1,
            },
            ],
        },
        options: {
            scales: {
            yAxes: [
                {
                ticks: {
                    beginAtZero: true,
                },
                },
            ],
            },
        },
    });

    fetch(`${API_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`)
    .then(response => response.json())
    .then(data => {

        weatherChart.data.labels = [];
        weatherChart.data.datasets[0].data = [];
        weatherChart.data.datasets[1].data = [];
        weatherChart.update();

        const forecastList = data.list;
    
        for (let i = 0; i < forecastList.length; i++) {
            if (forecastList[i].dt_txt.includes("12:00:00")) {
                const date = new Date(forecastList[i].dt * 1000).toLocaleDateString();
                const temperature = forecastList[i].main.temp;
                const humidity = forecastList[i].main.humidity;

                weatherChart.data.labels.push(date);
                weatherChart.data.datasets[0].data.push(temperature);
                weatherChart.data.datasets[1].data.push(humidity);
                weatherChart.update();
            }
        }
    })
    .catch(function (error) {
        console.log("Error Occured in function getWeatherForecastChart().");
        falseInput(error);
    });
}

function getWeatherData(city) {
    fetch(`${API_URL}weather?q=${city}&appid=${API_KEY}&units=metric`)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        const { main, weather, wind, dt} = data;
        const { temp, humidity } = main;
        const [{ description, icon }] = weather;
        const date = new Date(dt * 1000);

        weatherData.innerHTML = `<div class="info_card">
            <h2>Today's Weather</h2>
            <img src=${API_ICON_URL}${icon}@2x.png>
            <p class="infoDesc">${description}</p>
            <p class="infoTemp">${temp} &#8451;</p>
            <p class="infoWind">Wind: ${wind.speed} m/s</p>
            <p class="infoHumid">Humidity:${humidity}%</p>
            <p class="infoDT">${date.toLocaleString()}</p></div>
        `;
    })
    .catch(function (error) {
        console.log("Error Occured in function getWeatherData().");
        falseInput(error);
    });
}

function getWeatherForecast(city) {
    fetch(`${API_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`)
    .then(response => response.json())
    .then(data => {
        document.getElementById("forecast-container").innerHTML = "";
        const forecastList = data.list;

        for (let i = 0; i < forecastList.length; i++) {
            if (forecastList[i].dt_txt.includes("12:00:00")) {
                const date = new Date(forecastList[i].dt * 1000).toLocaleDateString();
                const temperature = forecastList[i].main.temp;
                const humidity = forecastList[i].main.humidity;
                const condition = forecastList[i].weather[0].description;
                const forecastIcon = forecastList[i].weather[0].icon;
                const forecastDiv = document.createElement("div");
                forecastDiv.id = "info-cards";
                forecastDiv.innerHTML = `<div class="info_card">
                    <h3 class="h3Fc">${date}</h3>
                    <p class="tempFc">${temperature}°C</p>
                    <p class="humidFc">Humidity: ${humidity}%</p>
                    <img src=${API_ICON_URL}${forecastIcon}@2x.png>
                    <p class="condFc">${condition}</p></div>
                `;
                document.getElementById("forecast-container").appendChild(forecastDiv);
            }
        }
    })
    .catch(function (error) {
        console.log("Error Occured in function getWeatherForecast().");
        falseInput(error);
    });
}