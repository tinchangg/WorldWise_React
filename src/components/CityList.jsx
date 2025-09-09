import CityItem from "./CityItem";
import Spinner from "./Spinner";
import Message from "./Message";
import styles from "./CityList.module.css";
import { useCities } from "../hooks/useCities";

function CityList() {
  const { cities, isLoading } = useCities();

  if (isLoading) return <Spinner />;

  if (!cities.length) {
    return (
      <Message message="Add your first city by clicking a city on the map" />
    );
  }

  const renderedCities = cities.map((city) => {
    return <CityItem key={city.id} city={city} />;
  });

  return <ul className={styles.cityList}>{renderedCities}</ul>;
}

export default CityList;
