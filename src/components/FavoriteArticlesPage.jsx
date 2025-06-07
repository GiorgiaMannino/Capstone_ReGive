import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import ArticleCard from "../components/ArticleCard";
import CustomBreadcrumb from "./CustomBreadcrumb";

import { fetchFavorites, setFavorites } from "../redux/actions/index";

// Breadcrumb della pagina
const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Preferiti", href: "" },
];

const FavoriteArticlesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const allFavorites = useSelector((state) => state.favorites.favorites);

  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    if (!token) return;

    const loadFavorites = async () => {
      try {
        const articles = await fetchFavorites(token);
        dispatch(setFavorites(articles));
      } catch (error) {
        console.error("Errore nel caricamento preferiti:", error);
      }
    };

    loadFavorites();
  }, [dispatch, token]);

  // Ordina i preferiti
  useEffect(() => {
    let sorted = [...allFavorites];

    if (sortOrder === "desc") {
      sorted.reverse(); // Mostra i più recenti prima
    }

    setFilteredFavorites(sorted);
  }, [sortOrder, allFavorites]);

  // Se non loggato, messaggio
  if (!token) {
    return (
      <div className="container mt-5">
        <p className="text-center">Devi essere loggato per vedere i tuoi articoli preferiti.</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {/* Breadcrumb */}
      <div className="container mt-4 mb-2">
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="container py-4 mt-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
          <div>
            <h2 className="fw-semibold green">I tuoi preferiti</h2>
            <p className="text-muted">{filteredFavorites.length} articoli</p>
          </div>

          <div className="mt-3 mt-md-0 d-flex align-items-center gap-2">
            <label htmlFor="sortOrder" className="green mb-0">
              Ordina per:
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select custom-select w-auto "
              style={{ paddingRight: "1.8rem" }}
            >
              <option value="desc">Più recenti</option>
              <option value="asc">Meno recenti</option>
            </select>
          </div>
        </div>

        {/* Grid articoli */}
        {filteredFavorites.length > 0 ? (
          <div className="row g-3">
            {filteredFavorites.map((article) => (
              <div key={article.id} className="col-12 col-sm-6 col-md-3 col-lg-2 mt-4">
                <ArticleCard article={article} onClick={() => navigate(`/article/${article.id}`)} showFavoriteIcon />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center mt-5">
            <p className="text-muted">Non hai ancora aggiunto articoli ai preferiti.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoriteArticlesPage;
