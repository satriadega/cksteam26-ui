import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import "./input.css";
import App from "./App.tsx";
import Modal from './components/Modal';
import { isAuthenticated } from './utils/auth';
import { setUser } from './store/userSlice';
import { getProfile } from './api'; // Import getProfile

// Check authentication status on app load and dispatch setUser if authenticated
const initializeAuth = async () => {
  const isUserAuthenticated = isAuthenticated();
  console.log("Is user authenticated (from utils/auth):", isUserAuthenticated);

  if (isUserAuthenticated) {
    try {
      const profileResponse = await getProfile();
      // Assuming profileResponse.data is { data: [{ username: "..." }] }
      if (profileResponse.data && profileResponse.data.data && profileResponse.data.data.length > 0) {
        const fetchedUsername = profileResponse.data.data[0].username || null;
        store.dispatch(setUser({ username: fetchedUsername }));
        console.log("User profile fetched and Redux state updated on app load. Username:", fetchedUsername);
      } else {
        console.warn("No user profile data found on app load.");
        localStorage.removeItem("token");
        store.dispatch(setUser({ username: null }));
      }
    } catch (error) {
      console.error("Error fetching user profile on app load:", error);
      // Optionally clear token if profile fetch fails, indicating invalid token
      localStorage.removeItem("token");
      store.dispatch(setUser({ username: null })); // Reset user state
    }
  }
};

initializeAuth();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
      <Modal />
    </Provider>
  </StrictMode>
);
