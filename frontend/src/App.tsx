import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AppProviders } from "@/providers";
import { AppRoutes } from "@/components/app-routes";
import "./App.css";

function App() {
    return (
        <div className="w-full h-screen">
            <AppProviders>
                <Router future={{ v7_relativeSplatPath: true }}>
                    <AppRoutes />
                    <Toaster />
                </Router>
            </AppProviders>
        </div>
    );
}

export default App;
