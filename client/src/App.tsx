import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import VaultApp from './pages/VaultApp';
import HowItWorks from './pages/HowItWorks';
import AdminDashboard from './pages/AdminDashboard';
import MyAssets from './pages/MyAssets';
import Profile from './pages/Profile';
import Insights from './pages/Insights';
import AIPortfolio from './pages/AIPortfolio';
import About from './pages/About';
import LegalPage from './pages/LegalPage';
import GoldVault from './pages/GoldVault';

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={LandingPage} />
      <Route path={"/dashboard"} component={Home} />
      <Route path={"/vault"} component={VaultApp} />
      <Route path={"/vault/gold"} component={GoldVault} />
      <Route path={"/how-it-works"} component={HowItWorks} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/my-assets"} component={MyAssets} />
      <Route path={"/profile"} component={Profile} />
      <Route path={"/insights"} component={Insights} />
      <Route path={"/ai"} component={AIPortfolio} />
      <Route path={"/about"} component={About} />
      <Route path={"/privacy"} component={() => <LegalPage type="privacy" />} />
      <Route path={"/terms"} component={() => <LegalPage type="terms" />} />
      <Route path={"/risk-disclosure"} component={() => <LegalPage type="risk-disclosure" />} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
