import { Link } from "react-router-dom";
import styles from "./CityItem.module.css";
import { useCities } from "../hooks/useCities";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

function CityItem({ city }) {
  // HOOKS
  const { currentCity, deleteCity } = useCities();

  // PROPS
  const { id, position, emoji, cityName, date } = city;

  // HANDLES
  const handleClick = (event) => {
    event.preventDefault();
    deleteCity(id);
  };

  // UI
  // Style
  const cityItemStyle = `${styles.cityItem} ${
    currentCity.id === id && styles["cityItem--active"]
  }`;

  // UI component
  return (
    <li>
      <Link
        className={cityItemStyle}
        to={`${id}?lat=${position.lat}&lng=${position.lng}`}
      >
        <span className={styles.emoji}>{emoji}</span>
        <h3 className={styles.name}>{cityName}</h3>
        <time className={styles.date}>{formatDate(date)}</time>
        <button className={styles.deleteBtn} onClick={handleClick}>
          &times;
        </button>
      </Link>
    </li>
  );
}

export default CityItem;
