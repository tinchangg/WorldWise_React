import { useParams, useSearchParams } from "react-router-dom";
import { useCities } from "../hooks/useCities";
import { useEffect } from "react";
import styles from "./City.module.css";
import Spinner from "./Spinner";
import BackButton from "./BackButton";

// Fn
const formatDate = (date) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  }).format(new Date(date));

// COMPONENT
function City() {
  // Hooks
  const { isLoading, currentCity, getCity } = useCities();
  const { city, emoji, date, notes } = currentCity;

  // URL params
  const { id } = useParams();

  // Effects
  useEffect(() => {
    getCity(id);
  }, [id]);

  // Practice access url query
  // const [searchParams, setSearchParams] = useSearchParams();
  // const lat = searchParams.get("lat");
  // const lng = searchParams.get("lng");

  // UI
  if (isLoading) return <Spinner />;

  return (
    <div className={styles.city}>
      <div className={styles.row}>
        <h6>City name</h6>
        <h3>
          <span>{emoji}</span> {city}
        </h3>
      </div>

      <div className={styles.row}>
        <h6>You went to {city} on</h6>
        <p>{formatDate(date || null)}</p>
      </div>

      {notes && (
        <div className={styles.row}>
          <h6>Your notes</h6>
          <p>{notes}</p>
        </div>
      )}

      <div className={styles.row}>
        <h6>Learn more</h6>
        <a
          href={`https://en.wikipedia.org/wiki/${city}`}
          target="_blank"
          rel="noreferrer"
        >
          Check out {city} on Wikipedia &rarr;
        </a>
      </div>

      <div>
        <BackButton />
      </div>
    </div>
  );
}

export default City;
