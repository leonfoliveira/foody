import axios from "axios";
import React, { useEffect, useState } from "react";
import type { UserModel } from "../models/UserModel";

const AuthenticationContext = React.createContext<{
  loggedInUser?: UserModel;
  setLoggedInUser: React.Dispatch<React.SetStateAction<UserModel | undefined>>;
}>({
  loggedInUser: undefined,
  setLoggedInUser: () => {},
});

export function AuthenticationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loggedInUser, setLoggedInUser] = useState<UserModel | undefined>(
    undefined,
  );
  const [isLoadingFirstAuthentication, setIsLoadingFirstAuthentication] =
    useState<boolean>(true);

  async function fetchUserDetails() {
    try {
      const result = await axios.get("/v1/users/me");
      setLoggedInUser(result.data);
    } catch {
      setLoggedInUser(undefined);
    } finally {
      setIsLoadingFirstAuthentication(false);
    }
  }

  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <AuthenticationContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {isLoadingFirstAuthentication ? <p>Loading...</p> : children}
    </AuthenticationContext.Provider>
  );
}

export default AuthenticationContext;
