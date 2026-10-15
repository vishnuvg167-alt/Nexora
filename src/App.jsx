import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/Approutes";
import ScrollToTop from "./common/ScrollToTop";
import UserDataPersistence from "./common/UserDataPersistence";

function App() {
  return (
    <BrowserRouter>
      <UserDataPersistence />

      <ScrollToTop />

      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;