import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx: Starting application initialization...');

try {
  const rootElement = document.getElementById("root");
  console.log('Main.tsx: Root element found:', rootElement);
  
  if (!rootElement) {
    console.error('Main.tsx: Root element not found!');
    throw new Error('Root element not found');
  }
  
  console.log('Main.tsx: Creating React root...');
  const root = createRoot(rootElement);
  
  console.log('Main.tsx: Rendering App component...');
  root.render(<App />);
  
  console.log('Main.tsx: App successfully rendered');
} catch (error) {
  console.error('Main.tsx: Error during initialization:', error);
}
