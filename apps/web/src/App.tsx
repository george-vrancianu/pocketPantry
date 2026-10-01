import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { RedirectIfSignedIn } from './components/RedirectIfSignedIn';
import { RequireAuth } from './components/RequireAuth';
import { AdminPage } from './pages/Admin/AdminPage';
import { CustomisePage } from './pages/Customise/CustomisePage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { FamilyPage } from './pages/Family/FamilyPage';
import { PantryPage } from './pages/Pantry/PantryPage';
import { RecipesPage } from './pages/Recipes/RecipesPage';
import { ScanPage } from './pages/Scan/ScanPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { ShoppingPage } from './pages/Shopping/ShoppingPage';
import { SignInPage } from './pages/SignIn/SignInPage';
import { SignUpPage } from './pages/SignUp/SignUpPage';
import { Navigate } from 'react-router-dom';

export function App() {
  return (
    <Routes>
      <Route element={<RedirectIfSignedIn />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="customise" element={<CustomisePage />} />
          <Route path="pantry" element={<PantryPage />} />
          <Route path="shopping" element={<ShoppingPage />} />
          <Route path="scan" element={<ScanPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="family" element={<FamilyPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
