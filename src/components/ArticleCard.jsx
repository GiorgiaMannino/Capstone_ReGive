import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites, toggleFavorite, setFavorites } from "../redux/actions/index";

const ArticleCard = ({ article, onClick, showFavoriteIcon = true }) => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const favoriteArticles = useSelector((state) => state.favorites.favorites);
  const [isHovered, setIsHovered] = useState(false);

  const [localIsFavorited, setLocalIsFavorited] = useState(favoriteArticles.some((fav) => fav.id === article.id));
  const [localLikesCount, setLocalLikesCount] = useState(article.likesCount);

  useEffect(() => {
    if (token) {
      fetchFavorites(token)
        .then((articles) => dispatch(setFavorites(articles)))
        .catch((err) => console.error("Errore fetch preferiti:", err));
    }
  }, [dispatch, token]);

  useEffect(() => {
    setLocalIsFavorited(favoriteArticles.some((fav) => fav.id === article.id));
  }, [favoriteArticles, article.id]);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();

    if (!token) {
      window.dispatchEvent(new Event("openRegisterModal"));
      return;
    }
    toggleFavorite(article.id, token, localIsFavorited)
      .then((updatedFavorites) => {
        dispatch(setFavorites(updatedFavorites));

        const isNowFavorited = updatedFavorites.some((fav) => fav.id === article.id);
        const newLikesCount = isNowFavorited ? localLikesCount + 1 : localLikesCount - 1;

        setLocalIsFavorited(isNowFavorited);
        setLocalLikesCount(newLikesCount);
      })
      .catch((err) => console.error("Errore toggle favorito:", err));
  };

  return (
    <Card onClick={() => onClick(article)} className="article-card position-relative ">
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
          <div className="d-flex align-items-center gap-1">
            {localIsFavorited || isHovered ? (
              <GoHeartFill className="green" size={20} />
            ) : (
              <GoHeart className="green" size={20} />
            )}
            <span className="small text-dark">{localLikesCount}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ArticleCard;
