import { useSearchParams } from "react-router-dom";

// Params from URL
function useUrlLocation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  return [lat, lng];
}

export { useUrlLocation };
