import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { UserContextProvider } from "./context/UserContext.jsx";
import { SnackbarProvider } from "notistack";
import { CommentContextProvider } from "./context/CommentContext.jsx";

createRoot(document.getElementById("root")).render(
  <SnackbarProvider maxSnack={3}>
    <UserContextProvider>
      <CommentContextProvider>
        <App />
      </CommentContextProvider>
    </UserContextProvider>
  </SnackbarProvider>
);
