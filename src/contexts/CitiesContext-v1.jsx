import { createContext, useState, useEffect, useReducer } from "react";

// BASE URL
const BASE_URL = "http://localhost:8000";

// DEV ONLY -> PAUSE function
const pause = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

// CREATE CONTEXT
const CitiesContext = createContext();

// PROVIDER
function CitiesProvider({ children }) {
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCity, setCurrentCity] = useState({});

  // FETCH CITIES
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true);
        await pause(500);
        const res = await fetch(`${BASE_URL}/cities`);
        const data = await res.json();
        setCities(data);
      } catch (error) {
        console.log("Failed to fetch cities...");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCities();
  }, []);

  // FUNCTION -> FETCH CURRENT CITY
  const getCity = async (id) => {
    try {
      setIsLoading(true);
      await pause(500);
      const res = await fetch(`${BASE_URL}/cities/${id}`);
      const data = await res.json();
      setCurrentCity(data);
    } catch (error) {
      console.log("Failed to fetch current city...");
    } finally {
      setIsLoading(false);
    }
  };

  // FUNCTION -> ADD NEW CITY
  const addCity = async (newCity) => {
    try {
      setIsLoading(true);
      await pause(500);
      const res = await fetch(`${BASE_URL}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setCurrentCity(data);
      setCities((cities) => [...cities, data]);
    } catch (error) {
      console.log("Failed to add new city...");
    } finally {
      setIsLoading(false);
    }
  };

  // FUNCTION -> DELETE CITY
  const deleteCity = async (id) => {
    try {
      setIsLoading(true);
      await pause(500);
      await fetch(`${BASE_URL}/cities/${id}`, {
        method: "DELETE",
      });

      setCities((cities) => cities.filter((city) => city.id !== id));
    } catch (error) {
      console.log("Failed to delete city...");
    } finally {
      setIsLoading(false);
    }
  };

  // CONTEXT VALUE
  const value = {
    cities,
    isLoading,
    currentCity,
    getCity,
    addCity,
    deleteCity,
  };

  return (
    <CitiesContext.Provider value={value}>{children}</CitiesContext.Provider>
  );
}

export { CitiesProvider, CitiesContext };
