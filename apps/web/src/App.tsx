import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { RedirectIfSignedIn } from './components/RedirectIfSignedIn';
import { RequireAdmin } from './components/RequireAdmin';
import { IntroGate } from './components/IntroGate';
import { RequireAuth } from './components/RequireAuth';
import { IntroProvider } from './lib/useIntro';
import { AllSetPage } from './pages/Intro/AllSetPage';
import { LanguagesPage } from './pages/Intro/LanguagesPage';
import { SetupOrSkipPage } from './pages/Intro/SetupOrSkipPage';
import { SetupReviewPage } from './pages/Intro/SetupReviewPage';
import { SayItPage } from './pages/Intro/SayItPage';
import { SnapPage } from './pages/Intro/SnapPage';
import { AdminPage } from './pages/Admin/AdminPage';
import { CustomisePage } from './pages/Customise/CustomisePage';
import { DashboardPage } from './pages/Dashboard/DashboardPage';
import { FamilyPage } from './pages/Family/FamilyPage';
import {
  EditMealPlanPage,
  NewMealPlanPage,
} from './pages/MealPlans/MealPlanFormPage';
import { MealPlanPage } from './pages/MealPlans/MealPlanPage';
import { MealPlansPage } from './pages/MealPlans/MealPlansPage';
import { PantryPage } from './pages/Pantry/PantryPage';
import {
  EditFamilyRecipePage,
  NewRecipePage,
  NewVariantPage,
} from './pages/Recipes/FamilyRecipePages';
import { CookTonightPage } from './pages/Recipes/CookTonightPage';
import { RecipeDetailPage } from './pages/Recipes/RecipeDetailPage';
import { RecipeFromLinkPage } from './pages/Recipes/RecipeFromLinkPage';
import { RecipeDraftsPage } from './pages/Recipes/RecipeDraftsPage';
import { RecipesPage } from './pages/Recipes/RecipesPage';
import { ExplorePage } from './pages/Recipes/ExplorePage';
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
    <IntroProvider>
      <Routes>
        <Route element={<RedirectIfSignedIn />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/intro/languages" element={<LanguagesPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<IntroGate />}>
            <Route path="/intro/setup" element={<SetupOrSkipPage />} />
            <Route path="/intro/snap" element={<SnapPage />} />
            <Route path="/intro/review/:scanId" element={<SetupReviewPage />} />
            <Route path="/intro/say-it" element={<SayItPage />} />
            <Route path="/intro/all-set" element={<AllSetPage />} />
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
              <Route path="meal-plans" element={<MealPlansPage />} />
              <Route path="meal-plans/new" element={<NewMealPlanPage />} />
              <Route path="meal-plans/:id" element={<MealPlanPage />} />
              <Route
                path="meal-plans/:id/edit"
                element={<EditMealPlanPage />}
              />
              <Route path="scan" element={<ScanPage />} />
              <Route path="scan/review" element={<ReviewOverviewPage />} />
              <Route path="scan/review/:scanId" element={<ReviewPage />} />
              <Route path="recipes" element={<RecipesPage />} />
              <Route path="recipes/explore" element={<ExplorePage />} />
              <Route path="recipes/new" element={<NewRecipePage />} />
              <Route path="recipes/drafts" element={<RecipeDraftsPage />} />
              <Route
                path="recipes/cook-tonight"
                element={<CookTonightPage />}
              />
              <Route
                path="recipes/from-link"
                element={<RecipeFromLinkPage />}
              />
              <Route path="recipes/:id" element={<RecipeDetailPage />} />
              <Route
                path="recipes/:id/edit"
                element={<EditFamilyRecipePage />}
              />
              <Route
                path="recipes/:id/variant/new"
                element={<NewVariantPage />}
              />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="family" element={<FamilyPage />} />
              <Route element={<RequireAdmin />}>
                <Route path="admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </IntroProvider>
  );
}
