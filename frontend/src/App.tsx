import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";
import { AppProviders } from "@/providers";
import { AppRoutes } from "@/components/app-routes";
import "./App.css";

function App() {
    return (
        <div className="w-full h-screen">
            <AppProviders>
                <Router future={{ 
                    v7_relativeSplatPath: true,
                    v7_startTransition: true 
                }}>
                    <AppRoutes />
                    <Toaster />
                </Router>
            </AppProviders>
        </div>
    );
}

export default App;
