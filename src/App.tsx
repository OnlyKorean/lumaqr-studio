import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SettingsProvider } from './store/settingsStore';
import { ToastProvider } from './store/toast';
import { DesignProvider } from './store/designStore';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { CreatePage } from './pages/CreatePage';
import { TemplatesPage } from './pages/TemplatesPage';
import { DesignsPage } from './pages/DesignsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <DesignProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/create" element={<CreatePage />} />
                  <Route path="/templates" element={<TemplatesPage />} />
                  <Route path="/designs" element={<DesignsPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </DesignProvider>
      </ToastProvider>
    </SettingsProvider>
  );
}
