import styles from "./AppLayout.module.css";
import User from "../components/User";
import Sidebar from "../components/Sidebar";
import Map from "../components/Map";

function AppLayout() {
  return (
    <div className={styles.app}>
      <User />
      <Sidebar />
      <Map />
    </div>
  );
}

export default AppLayout;
