import { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext"

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 4 * 60 * 1000; // 2 min before timeout

export const useSessionTimeout = () => {
  const { logout } = useContext(AuthContext);
  let inactivityTimer;
  let warningTimer;

  const resetTimer = () => {
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);

    warningTimer = setTimeout(() => {
      if (window.confirm("Your session will expire soon. Continue?")) {
        resetTimer();
      } else {
        logout();
      }
    }, WARNING_TIME);

    inactivityTimer = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      clearTimeout(inactivityTimer);
      clearTimeout(warningTimer);
    };
  }, []);
};
