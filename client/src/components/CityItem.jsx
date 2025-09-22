import { Link } from "react-router-dom";
import styles from "./CityItem.module.css";
import { useCities } from "../hooks/useCities";

const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

function CityItem({ cityItem }) {
  // HOOKS
  const { currentCity, deleteCity } = useCities();

  // PROPS
  const { id, position, emoji, city, date } = cityItem;

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
        to={`${id}?lat=${position.x}&lng=${position.y}`}
      >
        <span className={styles.emoji}>{emoji}</span>
        <h3 className={styles.name}>{city}</h3>
        <time className={styles.date}>{formatDate(date)}</time>
        <button className={styles.deleteBtn} onClick={handleClick}>
          &times;
        </button>
      </Link>
    </li>
  );
}

export default CityItem;
