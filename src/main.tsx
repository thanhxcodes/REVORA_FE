import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";

import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId="106203078815-vtlle17ljkjcl216kfneki4p6s5aevls.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
);