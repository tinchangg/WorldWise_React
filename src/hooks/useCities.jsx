import { useContext } from "react";
import { CitiesContext } from "../contexts/CitiesContext";

// USE CITIES CONTEXT HOOK
function useCities() {
  const value = useContext(CitiesContext);

  if (value === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  return value;
}

export { useCities };
