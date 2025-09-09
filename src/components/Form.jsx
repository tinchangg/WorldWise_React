import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./Form.module.css";

import { useUrlLocation } from "../hooks/useUrlLocation";

import Button from "./Button";
import BackButton from "./BackButton";
import Spinner from "./Spinner";
import Message from "./Message";
import { useCities } from "../hooks/useCities";
import { useNavigate } from "react-router-dom";

const GeocodeURL = "https://api.bigdatacloud.net/data/reverse-geocode-client";
// request format
// "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=51.78&longitude=-0.37"

function convertToEmoji(countryCode) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
}

function Form() {
  // HOOKS -> URL location, addCity fn
  const [currentLat, currentLng] = useUrlLocation();
  const { addCity, isLoading } = useCities();
  const navigate = useNavigate();

  // STATES
  const [cityName, setCityName] = useState("");
  const [country, setCountry] = useState("");
  const [emoji, setEmoji] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isLoadingGeocode, setIsLoadingGeocode] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");

  // GEOCODING -> outside api
  useEffect(() => {
    // URL contains no lat or lng -> geocode api will use ip location
    if (!currentLat || !currentLng) return;

    // URL does contain lat & lng
    const geocoding = async () => {
      try {
        setGeocodeError(""); // reset
        setIsLoadingGeocode(true);

        const res = await fetch(
          `${GeocodeURL}?latitude=${currentLat}&longitude=${currentLng}`
        );
        const data = await res.json();

        // No corresponding city
        if (!data.city)
          throw new Error("No city has found. Click somewhere else.");

        // City Found
        setCityName(data.city);
        setCountry(data.countryName);
        setEmoji(convertToEmoji(data.countryCode));
      } catch (error) {
        setGeocodeError(error.message);
      } finally {
        setIsLoadingGeocode(false);
      }
    };
    geocoding();
  }, [currentLat, currentLng]);

  // HANDLE SUBMIT
  const handleSubmit = async (event) => {
    event.preventDefault();

    // No city or no date provided
    if (!cityName || !date) return;

    const newCity = {
      cityName,
      country,
      emoji,
      date,
      notes,
      position: {
        lat: currentLat,
        lng: currentLng,
      },
    };

    await addCity(newCity);
    navigate("/app/cities");
  };

  // UI
  // URL CONTAINS NO LAT OR LNG
  if (!currentLat || !currentLng)
    return <Message message={"Start by clicking on the map!"} />;

  // GEOCODING LOADING...
  if (isLoadingGeocode) return <Spinner />;

  // GEOCODING ERROR
  if (geocodeError) return <Message message={geocodeError} />;

  // GEOCODING SUCCESS -> FORM
  return (
    <form
      className={`${styles.form} ${isLoading && styles.loading}`}
      onSubmit={handleSubmit}
    >
      <div className={styles.row}>
        <label htmlFor="cityName">City name</label>
        <input
          id="cityName"
          onChange={(e) => setCityName(e.target.value)}
          value={cityName}
        />
        <span className={styles.flag}>{emoji}</span>
      </div>

      <div className={styles.row}>
        <label htmlFor="date">When did you go to {cityName}?</label>
        <DatePicker
          showicon
          id="date"
          onChange={(date) => setDate(date)}
          selected={date}
          dateFormat="yyyy/MM/dd"
        />
      </div>

      <div className={styles.row}>
        <label htmlFor="notes">Notes about your trip to {cityName}</label>
        <textarea
          id="notes"
          onChange={(e) => setNotes(e.target.value)}
          value={notes}
        />
      </div>

      <div className={styles.buttons}>
        <BackButton />
        <Button type="primary">Add</Button>
      </div>
    </form>
  );
}

export default Form;
