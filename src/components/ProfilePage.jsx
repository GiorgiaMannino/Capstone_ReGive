import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Image, Alert, Form, Button, Modal } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";
import Loader from "./Loader";
import ArticleModal from "./ArticleModal";
import ArticleCard from "./ArticleCard";
import {
  fetchUserProfile,
  fetchUserProfileById,
  updateProfileImage,
  fetchUserArticles,
  updateArticle,
  updateUserProfile,
  updateAuthUserProfileImage,
  fetchArticlesByUserId,
  deleteUserProfile,
  deleteUserProfileByAdmin,
} from "../redux/actions/index";

// Decodifica JWT
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Errore nel parsing del token JWT:", e);
    return null;
  }
}

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams();

  const fileInputRef = useRef();

  const [authUser, setAuthUser] = useState(null);
  const [viewedUser, setViewedUser] = useState(null);
  const [viewedUserArticles, setViewedUserArticles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const [profileDescription, setProfileDescription] = useState("");
  const [isEditingProfileDescription, setIsEditingProfileDescription] = useState(false);

  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isOwnProfile = userId === undefined;

  const isAdmin = useMemo(() => {
    if (!authUser) return false;
    if (Array.isArray(authUser.role)) return authUser.role.includes("ROLE_ADMIN");
    return authUser.role === "ROLE_ADMIN";
  }, [authUser]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Utente non autenticato.");
      setLoading(false);
      return;
    }

    const decoded = parseJwt(token);
    const userRole = decoded?.role || decoded?.roles || decoded?.authorities?.[0] || null;
    const userIdFromToken = decoded?.sub || decoded?.userId || null;

    setAuthUser({
      id: userIdFromToken,
      role: userRole,
      token: token,
    });

    const loadProfile = async () => {
      try {
        const profileData = userId ? await fetchUserProfileById(token, userId) : await fetchUserProfile(token);

        const articles = userId ? await fetchArticlesByUserId(token, userId) : await fetchUserArticles(token);

        setViewedUser(profileData);
        setViewedUserArticles(articles.sort((a, b) => b.id - a.id));

        if (!userId) {
          dispatch({ type: "SET_USER_PROFILE", payload: profileData });
        }

        setProfileDescription(profileData.description || "");
      } catch (err) {
        setError(err.message || "Errore durante il caricamento del profilo.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [dispatch, userId]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const updatedUser = await updateProfileImage(file);
      dispatch({ type: "SET_USER_PROFILE", payload: updatedUser });
      dispatch(updateAuthUserProfileImage(updatedUser));
      setViewedUser(updatedUser);
    } catch {
      alert("Errore nel caricamento dell'immagine");
    }
  };

  const handleSaveProfileDescription = async () => {
    const token = localStorage.getItem("token");
    try {
      const updatedUser = await updateUserProfile(token, {
        description: profileDescription,
        profileImage: viewedUser.profileImage,
      });
      dispatch({ type: "SET_USER_PROFILE", payload: updatedUser });
      setViewedUser(updatedUser);
      setIsEditingProfileDescription(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCardClick = (article) => {
    if (isOwnProfile) {
      setSelectedArticle(article);
      setShowModal(true);
    } else {
      navigate(`/article/${article.id}`);
    }
  };

  const handleSaveArticle = async (articleId, formData) => {
    const token = localStorage.getItem("token");
    try {
      const updatedArticle = await updateArticle(token, articleId, formData);
      setViewedUserArticles((prev) => prev.map((a) => (a.id === updatedArticle.id ? updatedArticle : a)));
      setIsEditingArticle(false);
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteArticle = (deletedArticleId) => {
    setViewedUserArticles((prev) => prev.filter((a) => a.id !== deletedArticleId));
  };

  const handleConfirmDeleteProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token || !authUser) {
      setDeleteError("Dati utente non disponibili. Riprova più tardi.");
      return;
    }

    try {
      if (isAdmin && !isOwnProfile) {
        await deleteUserProfileByAdmin(token, userId);
        navigate("/");
      } else if (isOwnProfile) {
        await deleteUserProfile(token);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: "LOGOUT" });
        navigate("/");
      } else {
        setDeleteError("Operazione non consentita.");
      }
    } catch (err) {
      setDeleteError(err.message || "Errore durante la cancellazione del profilo.");
    }
  };

  if (loading) {
    return <Loader message="Caricamento profilo in corso..." />;
  }

  // Admin senza profilo
  if (isAdmin && isOwnProfile) {
    return (
      <Container className="text-center py-5">
        <Alert variant="info">
          Sei autenticato come amministratore. Non hai un profilo personale, ma puoi visualizzare gli utenti.
        </Alert>
      </Container>
    );
  }

  if (error || !viewedUser) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">{error || "Errore caricamento profilo"}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* 🔳 Header profilo */}
      <Row className="align-items-center mb-4">
        <Col md="auto" className="text-center position-relative">
          <div className="profile-avatar position-relative">
            <Image
              src={viewedUser.profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
              alt="Foto profilo"
              roundedCircle
              className="profile-avatar-img"
              width={130}
              height={130}
            />

            {isOwnProfile && (
              <>
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="custom-camera-wrapper position-absolute bottom-0 end-0"
                  title="Cambia foto profilo"
                  style={{
                    borderRadius: "50%",
                    padding: "4px",
                  }}
                >
                  <FaCamera size={20} />
                </div>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  style={{ display: "none" }}
                />
              </>
            )}
          </div>
        </Col>

        <Col>
          <div className="d-flex justify-content-between align-items-start flex-wrap">
            <div>
              <h2 className="fw-bold green mb-1">
                {viewedUser.username !== viewedUser.email ? viewedUser.username : "Nome non disponibile"}
              </h2>
              <p className="text-muted mb-4">{viewedUser.email}</p>
            </div>
            {isOwnProfile && (
              <Button
                variant="danger"
                size="sm"
                className="btn-delete"
                onClick={() => setShowDeleteModal(true)}
                disabled={!authUser}
              >
                Elimina Profilo
              </Button>
            )}
            {isAdmin && !isOwnProfile && (
              <Button variant="danger" className="btn-delete ms-2" onClick={() => setShowDeleteModal(true)}>
                Elimina utente
              </Button>
            )}
          </div>
          {/*Descrizione profilo */}
          {isOwnProfile ? (
            isEditingProfileDescription ? (
              <>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={profileDescription}
                  onChange={(e) => setProfileDescription(e.target.value)}
                />
                <div className="text-end mt-3 me-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="me-2 profile-cancel-btn"
                    onClick={() => {
                      setProfileDescription(viewedUser.description || "");
                      setIsEditingProfileDescription(false);
                    }}
                  >
                    Annulla
                  </Button>
                  <Button size="sm" variant="success" className="btn-green" onClick={handleSaveProfileDescription}>
                    Salva
                  </Button>
                </div>
              </>
            ) : (
              <div className="mb-0 text-muted" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                {viewedUser.description?.trim() || "Nessuna descrizione disponibile."}
                <FaEdit
                  size={22}
                  onClick={() => setIsEditingProfileDescription(true)}
                  style={{ cursor: "pointer" }}
                  className="ms-2 green"
                  title="Modifica descrizione"
                />
              </div>
            )
          ) : (
            <p className="text-muted">{viewedUser.description || "Nessuna descrizione disponibile."}</p>
          )}
        </Col>
      </Row>

      <hr className="my-5 green" />

      {/* Articoli */}
      <h4 className="mb-4 green fw-semibold">
        {isOwnProfile ? "I tuoi annunci" : `Annunci di ${viewedUser.username}`}
      </h4>
      {viewedUserArticles.length === 0 ? (
        <p>Nessun articolo pubblicato.</p>
      ) : (
        <Row>
          {viewedUserArticles.map((article) => (
            <div key={article.id} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2-4-custom mb-4">
              <ArticleCard article={article} onClick={handleCardClick} showFavoriteIcon={!isOwnProfile && !isAdmin} />
            </div>
          ))}
        </Row>
      )}

      {/* Modale articoli */}
      {isOwnProfile && (
        <ArticleModal
          show={showModal}
          handleClose={() => {
            setShowModal(false);
            setIsEditingArticle(false);
          }}
          article={selectedArticle}
          setArticle={setSelectedArticle}
          isEditing={isEditingArticle}
          setIsEditing={setIsEditingArticle}
          handleSave={handleSaveArticle}
          handleDelete={handleDeleteArticle}
        />
      )}

      {/* Modale eliminazione profilo */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Conferma Eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isOwnProfile
            ? "Sei sicuro di voler eliminare definitivamente il tuo profilo? Questa azione non può essere annullata."
            : `Sei sicuro di voler eliminare il profilo dell'utente "${viewedUser.username}"?`}
          {deleteError && (
            <Alert variant="danger" className="mt-3">
              {deleteError}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            className="btn-delete"
            onClick={handleConfirmDeleteProfile}
            disabled={!(isAdmin || isOwnProfile)}
          >
            Elimina Profilo
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
