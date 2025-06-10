import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import { Carousel, Spinner, Alert, Container, Modal } from "react-bootstrap";
import {
  fetchUserProfileById,
  fetchArticleById,
  fetchFavorites,
  toggleFavorite,
  deleteArticle,
} from "../redux/actions/index";
import { GoHeart, GoHeartFill } from "react-icons/go";
import PaymentComponent from "./PaymentComponent";
import CustomBreadcrumb from "./CustomBreadcrumb";
import Loader from "./Loader";

function parseJwt(token) {
  try {
    const base64Payload = token.split(".")[1];
    const payload = atob(base64Payload);
    return JSON.parse(payload);
  } catch (e) {
    console.error("Errore nel parsing del token:", e);
    return null;
  }
}

const ArticleDetail = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const breadcrumbItems = location.state?.breadcrumbItems;
  const token = localStorage.getItem("token");
  const decoded = token ? parseJwt(token) : null;
  const isAdmin = decoded?.roles?.includes("ROLE_ADMIN");
  const shippingCost = 3.99;

  const [article, setArticle] = useState(null);
  const [authorProfile, setAuthorProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccessAlert, setPaymentSuccessAlert] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchArticleById(token, id);
        setArticle(data);

        if (data.userId) {
          const userData = await fetchUserProfileById(token, data.userId);
          setAuthorProfile(userData);
        }

        if (!isAdmin) {
          const favorites = await fetchFavorites(token);
          const inFavorites = favorites.some((favArticle) => favArticle.id === Number(id));
          setIsFavorited(inFavorites);
        }
      } catch (err) {
        console.error("Errore fetch articolo:", err);
        setError("Impossibile caricare l'articolo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token, isAdmin]);

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(id, token, isFavorited);
      setIsFavorited((prev) => !prev);
    } catch (e) {
      console.error("Errore nel toggle del preferito:", e);
    }
  };

  const handleDeleteArticle = async () => {
    const conferma = window.confirm("Sei sicuro di voler eliminare questo articolo?");
    if (!conferma) return;

    try {
      await deleteArticle(token, id);
      alert("Articolo eliminato con successo!");
      navigate("/");
    } catch (error) {
      console.error("Errore eliminazione articolo:", error);
      alert("Errore durante l'eliminazione.");
    }
  };

  if (loading) {
    return <Loader message="Caricamento..." />;
  }

  if (error) {
    return (
      <Alert variant="danger" className="text-center my-5">
        {error}
      </Alert>
    );
  }

  return (
    <Container className="p-4 d-flex flex-column align-items-center">
      {breadcrumbItems && (
        <div className="w-100 mb-3 mt-4">
          <CustomBreadcrumb items={breadcrumbItems} />
        </div>
      )}

      <div className="p-3 w-100 mt-3 mb-4" style={{ maxWidth: "1000px" }}>
        <div className="d-flex justify-content-between align-items-center">
          <Link
            to={`/profile/${authorProfile?.id}`}
            className="d-flex align-items-center text-decoration-none text-dark"
          >
            <img
              src={authorProfile?.profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
              alt="Autore"
              className="rounded-circle me-2 article-user-img"
            />
            <span className="fw-semibold">{authorProfile?.username || "Autore"}</span>
          </Link>

          {!isAdmin && (
            <div className="article-detail-icon" title="Preferito" onClick={handleToggleFavorite}>
              {isFavorited ? <GoHeartFill size={30} className="green" /> : <GoHeart size={30} className="green" />}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 w-100 d-flex justify-content-center">
        {article.imageUrls?.length > 0 ? (
          <Carousel
            fade
            className="article-detail-carousel w-100"
            controls={article.imageUrls.length > 1}
            indicators={article.imageUrls.length > 1}
          >
            {article.imageUrls.map((url, index) => (
              <Carousel.Item key={index}>
                <img src={url} alt={`Immagine ${index + 1}`} className="d-block mx-auto rounded" />
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <img
            src="https://via.placeholder.com/500x400?text=Nessuna+Immagine"
            alt="Nessuna immagine"
            className="img-fluid shadow"
            style={{ maxWidth: "500px" }}
          />
        )}
      </div>

      <div className="px-2 px-md-5 w-100" style={{ maxWidth: "1000px" }}>
        <h5 className="fw-semibold mb-4 mt-2">{article.title}</h5>
        <hr className="green" />

        <h5 className="mt-5 mb-2 fw-semibold green">Categoria</h5>
        <p>{article.category.charAt(0) + article.category.slice(1).toLowerCase()}</p>
        <hr className="green" />

        <h5 className="mt-5 mb-2 fw-semibold green">Descrizione del prodotto</h5>
        <p className=" mb-4">{article.description}</p>
        <hr className="green" />
      </div>

      <div className="d-flex justify-content-end mt-4 w-100" style={{ maxWidth: "1000px" }}>
        {isAdmin ? (
          <button className="btn btn-danger btn-delete btn-lg px-5 fw-semibold me-5" onClick={handleDeleteArticle}>
            Elimina
          </button>
        ) : (
          <button className="btn btn-lg px-5 article-detail-btn fw-semibold me-5" onClick={() => setShowPayment(true)}>
            Acquista
          </button>
        )}
      </div>

      <Modal show={showPayment} onHide={() => setShowPayment(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pagamento ordine</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!paymentSuccessAlert ? (
            <PaymentComponent
              shippingCost={shippingCost}
              onPaymentSuccess={() => {
                setPaymentSuccessAlert(true);
              }}
            />
          ) : (
            <div className="text-center">
              <h5 className="p-5 green">Pagamento effettuato con successo!</h5>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ArticleDetail;
