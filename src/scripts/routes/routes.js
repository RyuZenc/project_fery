import HomePage from "../pages/home/home-page.js";
import AboutPage from "../pages/about/about-page.js";
import LoginPage from "../pages/login/login-page.js";
import AddStoryPage from "../pages/add/add-story-page.js";
import RegisterPage from "../pages/login/register-page.js";
import DetailPage from "../pages/detail/detail-page.js"; // ✅ Tambahkan ini
import { MapPage } from "../pages/map/map-page.js";

const routes = {
  "/": HomePage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/add": AddStoryPage,
  "/about": AboutPage,
  "/map": MapPage,
  "/detail/:id": DetailPage, // ✅ Tambahkan ini juga
};

export default routes;
