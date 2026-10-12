import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { RedirectIfSignedIn } from './components/RedirectIfSignedIn';
import { RequireAdmin } from './components/RequireAdmin';
import { RequireAuth } from './components/RequireAuth';
import { AdminPage } from './pages/Admin/AdminPage';
import { CustomisePage } from './pages/Customise/CustomisePage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { FamilyPage } from './pages/Family/FamilyPage';
import { PantryPage } from './pages/Pantry/PantryPage';
import {
  EditFamilyRecipePage,
  NewRecipePage,
  NewVariantPage,
} from './pages/Recipes/FamilyRecipePages';
import { RecipeDetailPage } from './pages/Recipes/RecipeDetailPage';
import { RecipesPage } from './pages/Recipes/RecipesPage';
import { ReviewOverviewPage } from './pages/Review/ReviewOverviewPage';
import { ReviewPage } from './pages/Review/ReviewPage';
import { ScanPage } from './pages/Scan/ScanPage';
import { SettingsPage } from './pages/Settings/SettingsPage';
import { ShoppingPage } from './pages/Shopping/ShoppingPage';
import { StaplesPage } from './pages/Shopping/StaplesPage';
import { TemplateEditorPage } from './pages/Shopping/templates/TemplateEditorPage';
import { TemplatesPage } from './pages/Shopping/templates/TemplatesPage';
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
          <Route path="shopping/staples" element={<StaplesPage />} />
          <Route path="shopping/templates" element={<TemplatesPage />} />
          <Route
            path="shopping/templates/:id"
            element={<TemplateEditorPage />}
          />
          <Route path="scan" element={<ScanPage />} />
          <Route path="scan/review" element={<ReviewOverviewPage />} />
          <Route path="scan/review/:scanId" element={<ReviewPage />} />
          <Route path="recipes" element={<RecipesPage />} />
          <Route path="recipes/new" element={<NewRecipePage />} />
          <Route path="recipes/:id" element={<RecipeDetailPage />} />
          <Route path="recipes/:id/edit" element={<EditFamilyRecipePage />} />
          <Route path="recipes/:id/variant/new" element={<NewVariantPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="family" element={<FamilyPage />} />
          <Route element={<RequireAdmin />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
