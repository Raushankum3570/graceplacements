import { createContext } from "react";

// Create context with default values to prevent null reference errors
export const UserDetailContext = createContext({
  user: null,
  setUser: () => {},
  isLoading: true,
  error: null
});