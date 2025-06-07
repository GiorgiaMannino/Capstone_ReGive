import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArticleCard from "../components/ArticleCard";
import Categories from "../components/Categories";
import { fetchAllArticles } from "../redux/actions/index";
import { Collapse } from "react-bootstrap";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import CustomBreadcrumb from "./CustomBreadcrumb";
import Loader from "./Loader";

// Breadcrumb
const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Ricerca", href: "" },
];

const SearchResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [allArticles, setAllArticles] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("TUTTE");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [showCategories, setShowCategories] = useState(false);

  // Ordina articoli per ID crescente o decrescente
  const sortArticles = (articles, order) => {
    return [...articles].sort((a, b) => (order === "desc" ? b.id - a.id : a.id - b.id));
  };

  const applyFilters = (articles, category, order) => {
    const filtered = category === "TUTTE" ? articles : articles.filter((a) => a.category?.toUpperCase() === category);
    return sortArticles(filtered, order);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const searchParams = new URLSearchParams(location.search);
    const termFromURL = searchParams.get("term")?.toLowerCase().trim() || "";
    const categoryFromURL = searchParams.get("category")?.toUpperCase() || "TUTTE";

    const loadArticles = async () => {
      try {
        const articles = await fetchAllArticles(token);
        let matched = articles;

        if (termFromURL) {
          matched = matched.filter((a) => a.title?.toLowerCase().includes(termFromURL));
        }

        const sorted = sortArticles(matched, sortOrder);
        setAllArticles(sorted);
        const filtered = applyFilters(sorted, categoryFromURL, sortOrder);
        setFilteredResults(filtered);
        setSelectedCategory(categoryFromURL);
      } catch (error) {
        console.error("Errore nel caricamento degli articoli:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [location]);

  useEffect(() => {
    const sorted = sortArticles(allArticles, sortOrder);
    const filtered = applyFilters(sorted, selectedCategory, sortOrder);
    setFilteredResults(filtered);
  }, [sortOrder, selectedCategory, allArticles]);

  const handleCategoryFilter = (category) => {
    const newCategory = category.toUpperCase();
    setSelectedCategory(newCategory);
    const filtered = applyFilters(allArticles, newCategory, sortOrder);
    setFilteredResults(filtered);

    // Aggiorna URL senza ricaricare
    const params = new URLSearchParams(location.search);
    if (newCategory !== "TUTTE") {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    window.history.replaceState(null, "", `/search?${params.toString()}`);
  };

  const formatCategoryLabel = (cat) => {
    if (!cat) return "";
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  };

  return (
    <div className="container mt-5">
      <div className="container mt-4 mb-2">
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>
      <div className="row">
        {/* Colonna sinistra - Filtri */}
        <div className="col-12 col-md-3 mb-4 p-4">
          <h4 className="mb-5 mt-2 fw-semibold">Filtri</h4>

          {/* Ordinamento */}
          <div className="mb-5 ">
            <label className="fw-bold mb-2 green" htmlFor="sortOrder">
              Ordina per:
            </label>
            <select
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select custom-select mt-1"
            >
              <option value="desc">Più recenti</option>
              <option value="asc">Meno recenti</option>
            </select>
          </div>

          {/* Categorie collapsabili */}

          <div
            className="d-flex justify-content-between align-items-center "
            style={{ cursor: "pointer" }}
            onClick={() => setShowCategories(!showCategories)}
          >
            <p className="fw-bold mb-0 mt-4 green">Categorie</p>
            <span className="mt-4">{showCategories ? <IoIosArrowUp /> : <IoIosArrowDown />}</span>
          </div>

          <Collapse in={showCategories}>
            <div>
              <Categories
                onSelect={handleCategoryFilter}
                activeCategory={selectedCategory}
                layout="vertical"
                className="search-results-categories"
              />
            </div>
          </Collapse>
        </div>

        {/* Colonna destra - Risultati */}
        <div className="col-12 col-md-9 p-4">
          {loading ? (
            <Loader message="Caricamento risultati..." />
          ) : filteredResults.length > 0 ? (
            <div className="row">
              {filteredResults.map((article) => (
                <div key={article.id} className="col-12 col-sm-6 col-md-4 mb-4">
                  <ArticleCard
                    article={article}
                    onClick={(a) => {
                      const token = localStorage.getItem("token");
                      if (token) {
                        navigate(`/article/${a.id}`, {
                          state: {
                            breadcrumbItems: [
                              { label: "Home", href: "/" },
                              {
                                label: formatCategoryLabel(a.category),
                                href: `/search?category=${a.category?.toUpperCase()}`,
                              },
                              { label: a.title, href: "" },
                            ],
                          },
                        });
                      } else {
                        window.dispatchEvent(new Event("openRegisterModal"));
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-secondary mt-5">Nessun risultato trovato per questa categoria.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
