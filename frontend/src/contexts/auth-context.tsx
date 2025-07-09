import React, {createContext, useContext, useState, useEffect} from "react";
import Keycloak from "keycloak-js";
import {useToast} from "@/hooks/use-toast";

interface AuthContextType {
    keycloak: Keycloak | null;
    initialized: boolean;
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    error: string | null;
    login: () => void;
    logout: () => void;
}

interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
}

const AuthContext = createContext<AuthContextType>({
    keycloak: null,
    initialized: false,
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
    login: () => {
    },
    logout: () => {
    },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
    const [initialized, setInitialized] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const {toast} = useToast();

    useEffect(() => {
        const initKeycloak = async () => {
            try {
                const keycloakClient = new Keycloak({
                    url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
                    realm: import.meta.env.VITE_KEYCLOAK_REALM || "delivery-system",
                    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "delivery-client",
                });

                const initialized = await keycloakClient.init({
                    onLoad: "check-sso",
                    silentCheckSsoRedirectUri:
                        window.location.origin + "/silent-check-sso.html",
                    pkceMethod: "S256",
                });

                setKeycloak(keycloakClient);
                setInitialized(initialized);
                setIsAuthenticated(keycloakClient.authenticated || false);

                if (keycloakClient.authenticated) {
                    // Extract user profile data
                    const profile = await keycloakClient.loadUserProfile();
                    const roles = keycloakClient.realmAccess?.roles || [];

                    setUser({
                        id: keycloakClient.subject || "",
                        username: profile.username || "",
                        email: profile.email || "",
                        firstName: profile.firstName || "",
                        lastName: profile.lastName || "",
                        roles,
                    });
                }

                keycloakClient.onTokenExpired = () => {
                    keycloakClient.updateToken(30).catch(() => {
                        // If token refresh fails, log the user out
                        keycloakClient.logout();
                    });
                };

                setLoading(false);
            } catch (error) {
                console.error("Failed to initialize Keycloak:", error);
                setError("Failed to initialize authentication service");
                setLoading(false);
                toast({
                    variant: "destructive",
                    title: "Authentication Error",
                    description: "Failed to connect to authentication service.",
                });
            }
        };

        initKeycloak();

        // Cleanup function
        return () => {
            // Any cleanup needed for Keycloak
        };
    }, [toast]);

    const login = () => {
        if (keycloak) {
            keycloak.login();
        }
    };

    const logout = () => {
        if (keycloak) {
            keycloak.logout();
        }
    };

    const value = {
        keycloak,
        initialized,
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};