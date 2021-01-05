import React, { useContext, useState, createContext, useEffect } from "react";
import { auth } from "./firebaseConfig";

const AuthContext = createContext();

const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubsribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("Logged in");
      } else {
        console.log("Not logged in");
      }
    });

    // return unsubsribe();
  }, []);

  const value = {
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { useAuth, AuthProvider };
