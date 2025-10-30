import axios from "axios";

const instance = axios.create({
  withCredentials: true, // send cookies for JWT auth
});

export default instance;
