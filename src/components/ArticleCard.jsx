import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites, toggleFavorite, setFavorites } from "../redux/actions/index";

const ArticleCard = ({ article, onClick, showFavoriteIcon = true }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const favoriteArticles = useSelector((state) => state.favorites.favorites); // ATTENZIONE: qui è "favorites" non "articles"
  const [isHovered, setIsHovered] = useState(false);

  const isFavorited = favoriteArticles.some((fav) => fav.id === article.id);

  useEffect(() => {
    if (token) {
      // carico i preferiti all'avvio
      fetchFavorites(token)
        .then((articles) => dispatch(setFavorites(articles)))
        .catch((err) => console.error("Errore fetch preferiti:", err));
    }
  }, [dispatch, token]);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (!token) {
      window.dispatchEvent(new Event("openRegisterModal"));
      return;
    }

    toggleFavorite(article.id, token, isFavorited)
      .then((updatedFavorites) => dispatch(setFavorites(updatedFavorites)))
      .catch((err) => console.error("Errore toggle favorito:", err));
  };

  return (
    <Card onClick={() => onClick(article)} className="article-card position-relative">
      <Card.Img
        variant="top"
        src={article.imageUrls?.[0] || "https://via.placeholder.com/300"}
        className="article-card-image"
      />
      {showFavoriteIcon && (
        <div
          className="favorite-icon-wrapper position-absolute top-0 end-0 m-2 p-1 bg-white rounded-circle"
          onClick={handleToggleFavorite}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ cursor: "pointer", zIndex: 10 }}
        >
          {isFavorited || isHovered ? (
            <GoHeartFill className="green" size={20} />
          ) : (
            <GoHeart className="green" size={20} />
          )}
        </div>
      )}
    </Card>
  );
};

export default ArticleCard;
