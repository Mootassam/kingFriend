// Visitor pages rendered without the workspace shell.
const publicRoutes = [
  {
    path: "/",
    loader: () => import("src/view/pages/Landing/LandingPage"),
  },
  {
    path: "/login",
    loader: () => import("src/view/pages/Auth/SigninPage"),
  },
  {
    path: "/register",
    loader: () => import("src/view/pages/Auth/SignupPage"),
  },
];

// Workspace pages rendered inside LayoutPage (topbar + sidebar).
const navRoutes = [
  {
    path: "/app",
    loader: () => import("src/view/pages/Home/HomePage"),
  },
  {
    path: "/app/quotes",
    loader: () => import("src/view/pages/Market/MarketPage"),
  },
  {
    path: "/app/trade",
    loader: () => import("src/view/pages/Trade/TradePage"),
  },
  {
    path: "/app/orders",
    loader: () => import("src/view/pages/Order/OrderPage"),
  },
  {
    path: "/app/news",
    loader: () => import("src/view/pages/News/NewsPage"),
  },
  {
    path: "/app/copy",
    loader: () => import("src/view/pages/Copy/CopyPage"),
  },
  {
    path: "/app/profile",
    loader: () => import("src/view/pages/profile/ProfilePage"),
  },
  {
    path: "/app/service",
    loader: () => import("src/view/pages/Support/SupportPage"),
  },
  {
    path: "/app/service/faq",
    loader: () => import("src/view/pages/Support/FaqPage"),
  },
  {
    path: "/app/service/faq/:id",
    loader: () => import("src/view/pages/Support/FaqDetailPage"),
  },
  {
    path: "/app/service/guide",
    loader: () => import("src/view/pages/Support/GuidePage"),
  },
  {
    path: "/app/service/guide/:id",
    loader: () => import("src/view/pages/Support/GuideDetailPage"),
  },
];

export default {
  publicRoutes,
  navRoutes,
};
