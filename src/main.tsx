import { createRoot } from 'react-dom/client';
import './index.css';
import SplashScreen from './components/SplashScreen';
import FloatingToolbar from './components/FloatingToolbar';
import { TooltipProvider } from './lib/ui';
import App from './App';

const hash = window.location.hash.slice(1); // strip leading #

let Component: React.ComponentType;
switch (hash) {
  case 'splash':
    Component = SplashScreen;
    break;
  case 'toolbar':
    Component = FloatingToolbar;
    break;
  default:
    Component = App;
}

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <TooltipProvider>
    <Component />
  </TooltipProvider>,
);
