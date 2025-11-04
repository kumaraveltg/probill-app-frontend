import { useEffect, useRef, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const INACTIVITY_LIMIT = 5 * 60 * 1000; // 15 minutes
const WARNING_TIME = 2 * 60 * 1000;     // 2 min before timeout

export const useSessionTimeout = () => {
  const { logout } = useContext(AuthContext);
  const inactivityTimer = useRef(null);
  const warningTimer = useRef(null);

  const resetTimer = () => {
    clearTimeout(inactivityTimer.current);
    clearTimeout(warningTimer.current);

    // show warning 2 min before logout
    warningTimer.current = setTimeout(() => {
      if (window.confirm("Your session will expire soon. Continue?")) {
        resetTimer(); // user chooses to stay
      } else {
        logout();     // user cancels
      }
    }, WARNING_TIME);

    // logout after 15 minutes
    inactivityTimer.current = setTimeout(() => {
      logout();
    }, INACTIVITY_LIMIT);
  };

  useEffect(() => {
    // Reset timer whenever user interacts
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);

    resetTimer(); // start the first timer

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      clearTimeout(inactivityTimer.current);
      clearTimeout(warningTimer.current);
    };
  }, []); // run once
};
