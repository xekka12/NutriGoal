import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import MealLayout from "./mealfolder/MealLayout.jsx";
import Dashboard from "./mealfolder/Dashboard.jsx";
import History from "./mealfolder/History.jsx";
import About from "./mealfolder/About.jsx";
import MealPlan from "./mealfolder/MealPlan.jsx";
import SavedPlans from "./mealfolder/SavedPlans.jsx";
import Login from "./login/Login.jsx";
import Register from "./login/Register.jsx";
import NotFound from "./NotFound.jsx";
import {
  GuestRoute,
  ProtectedRoute,
  RootRedirect,
} from "./lib/AuthRoute.jsx";
import { AuthProvider } from "./lib/AuthProvider.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MealLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/history" element={<History />} />
            <Route path="/saved-plans" element={<SavedPlans />} />
            <Route path="/about" element={<About />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;