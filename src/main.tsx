import { createRoot } from "react-dom/client";
import App from "./App";
import { installExternalLinkHandler } from "./lib/external-links";
import "./index.css";

installExternalLinkHandler();

createRoot(document.getElementById("root")!).render(<App />);
