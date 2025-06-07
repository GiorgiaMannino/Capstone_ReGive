import "./App.css";
import HomePage from "./components/HomePage";

import MyFooter from "./components/MyFooter";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import MyNav from "./components/MyNav";
import UploadArticle from "./components/UploadArticle";
import ProfilePage from "./components/ProfilePage";
import ArticleDetail from "./components/ArticleDetail";
import SearchResultsPage from "./components/SearchResultsPage";
import "animate.css";
import FavoriteArticlesPage from "./components/FavoriteArticlesPage";
import BeforeAfterPage from "./components/BeforeAfterPage";

function App() {
  return (
    <BrowserRouter>
      <MyNav> </MyNav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload-article" element={<UploadArticle />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />

        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/favorites" element={<FavoriteArticlesPage />} />

        <Route path="/beforeafter" element={<BeforeAfterPage />} />
      </Routes>
      <MyFooter />
    </BrowserRouter>
  );
}

export default App;
