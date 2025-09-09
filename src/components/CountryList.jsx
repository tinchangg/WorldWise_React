import CountryItem from "./CountryItem";
import Spinner from "./Spinner";
import Message from "./Message";
import styles from "./CountryList.module.css";
import { useCities } from "../hooks/useCities";

function CountryList() {
  const { cities, isLoading } = useCities();

  if (isLoading) return <Spinner />;

  if (!cities.length) {
    return (
      <Message message="Add your first city by clicking a city on the map" />
    );
  }

  // Cities object with unique country
  const filteredCities = cities.filter(
    (city, index, self) =>
      index === self.findIndex((c) => c.country === city.country)
  );

  const renderedCountries = filteredCities.map((city) => {
    return <CountryItem country={city} key={city.country} />;
  });

  return <ul className={styles.countryList}>{renderedCountries}</ul>;
}

export default CountryList;
