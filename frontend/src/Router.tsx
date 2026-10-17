import { BrowserRouter, Route, Routes } from "react-router-dom";
import SignInPage from "./pages/SignInPage";
import RegisterPage from "./pages/RegisterPage";
import AuthenticatedPageLayout from "./layouts/AuthenticatedPageLayout";
import OrdersPage from "./pages/OrdersPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthenticatedPageLayout />}>
          <Route index element={<OrdersPage />} />
        </Route>
        <Route path="/login" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
