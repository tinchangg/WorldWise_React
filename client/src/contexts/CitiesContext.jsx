import { createContext, useEffect, useReducer } from "react";
import axios from "axios";

// BASE URL
// const BASE_URL = "http://localhost:8000";

// DEV ONLY -> PAUSE function
const pause = (duration) => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};

// CREATE CONTEXT
const CitiesContext = createContext();

// REDUCER
const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

const reducer = (state, action) => {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return { ...state, cities: action.payload, isLoading: false };

    case "city/loaded":
      return { ...state, currentCity: action.payload, isLoading: false };

    case "city/added":
      return {
        ...state,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
        isLoading: false,
      };

    case "city/deleted":
      return {
        ...state,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
        isLoading: false,
      };

    case "rejected":
      return { ...state, error: action.payload, isLoading: false };

    default:
      throw new Error("Unknow action type: " + action.type);
  }
};

// PROVIDER
function CitiesProvider({ children }) {
  // STATES
  const [{ cities, isLoading, currentCity }, dispatch] = useReducer(
    reducer,
    initialState
  );

  // FETCH CITIES
  useEffect(() => {
    const fetchCities = async () => {
      dispatch({ type: "loading" });
      try {
        const res = await axios.get("/api/cities");
        const data = res.data;
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        console.error("Failed to fetch cities...");
        dispatch({ type: "rejected", payload: "Failed to fetch cities..." });
      }
    };
    fetchCities();
  }, []);

  // FUNCTION -> FETCH CURRENT CITY
  const getCity = async (id) => {
    // check -> id comes from URL -> strings
    if (parseInt(id) === currentCity.id) return;

    dispatch({ type: "loading" });
    try {
      const res = await axios.get(`/api/cities/${id}`);
      const data = res.data;
      dispatch({ type: "city/loaded", payload: data });
    } catch {
      console.error("Failed to fetch current city...");
      dispatch({
        type: "rejected",
        payload: "Failed to fetch current city...",
      });
    }
  };

  // FUNCTION -> ADD NEW CITY
  const addCity = async (newCity) => {
    dispatch({ type: "loading" });
    try {
      const res = await axios.post("/api/cities", newCity);
      const data = res.data;
      dispatch({ type: "city/added", payload: data });
    } catch {
      console.error("Failed to add new city...");
      dispatch({ type: "rejected", payload: "Failed to add new city..." });
    }
  };

  // FUNCTION -> DELETE CITY
  const deleteCity = async (id) => {
    dispatch({ type: "loading" });
    try {
      // await pause(500);
      // await fetch(`${BASE_URL}/cities/${id}`, {
      //   method: "DELETE",
      // });
      const res = await axios.delete(`/api/cities/${id}`);
      console.log(res.data);
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      console.error("Failed to delete city...");
      dispatch({ type: "rejected", payload: "Failed to delete city..." });
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
