import { Provider } from "react-redux";
import { Router } from "react-router-dom";
import { configureStore, getHistory } from "src/modules/store";
import { ThemeProvider } from "src/modules/theme/themeContext";
import { CinematicProvider } from "src/view/shared/cinematic/CinematicProvider";
import RoutesComponent from "src/view/shared/routes/RoutesComponent";
import "./theme.css";
import "./App.css";

const store = configureStore();

const App = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router history={getHistory()}>
          <CinematicProvider>
            <RoutesComponent />
          </CinematicProvider>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
