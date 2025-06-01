import React, { useEffect, useState, useRef, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Image, Spinner, Alert, Form, Button, Modal } from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import { MdOutlineCameraAlt } from "react-icons/md";
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

function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
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
  const { userId } = useParams(); // da URL
  const fileInputRef = useRef();

  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [profileDescription, setProfileDescription] = useState("");
  const [isEditingProfileDescription, setIsEditingProfileDescription] = useState(false);
  const [isEditingArticle, setIsEditingArticle] = useState(false);

  const [viewedUser, setViewedUser] = useState(null);
  const [viewedUserArticles, setViewedUserArticles] = useState([]);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  /*   const isOwnProfile = userId && authUser?.id ? Number(userId) === authUser.id : false;
  console.log("authUser.id:", authUser?.id);
  console.log("authUser.role:", authUser?.role);

  const isAdmin = authUser?.role === "ADMIN" || authUser?.role === "admin"; */

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Utente non autenticato.");
      setLoading(false);
      return;
    }

    const decoded = parseJwt(token);
    const userRole = decoded?.role || decoded?.roles || decoded?.authorities?.[0] || null;
    const userIdFromToken = decoded?.id || decoded?.userId || null;

    setAuthUser({
      id: userIdFromToken,
      role: userRole,
      token: token,
    });

    const loadProfile = async () => {
      try {
        const profileData =
          Number(userId) === Number(userIdFromToken)
            ? await fetchUserProfile(token)
            : await fetchUserProfileById(token, userId);

        const articles =
          Number(userId) === Number(userIdFromToken)
            ? await fetchUserArticles(token)
            : await fetchArticlesByUserId(token, userId);

        setViewedUser(profileData);
        setViewedUserArticles(articles.sort((a, b) => b.id - a.id));

        if (Number(userId) === Number(userIdFromToken)) {
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

  // ✅ Calcoli dinamici qui
  const isOwnProfile = authUser?.id && userId ? Number(userId) === Number(authUser.id) : false;

  console.log("authUser.id:", authUser);
  console.log("userId:", userId);

  const isAdmin = useMemo(() => {
    if (!authUser) return false;
    if (Array.isArray(authUser.role)) {
      return authUser.role.includes("ROLE_ADMIN");
    }
    return authUser.role === "ROLE_ADMIN";
  }, [authUser]);

  console.log("authUser:", authUser);
  console.log("isOwnProfile:", isOwnProfile);
  console.log("isAdmin:", isAdmin);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const updatedUser = await updateProfileImage(file);
      dispatch({ type: "SET_USER_PROFILE", payload: updatedUser });
      dispatch(updateAuthUserProfileImage(updatedUser));
      setViewedUser(updatedUser);
    } catch (err) {
      console.error(err);
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

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  /*   if (error || !viewedUser) {
    return (
      <Container className="text-center py-5">
        <Alert variant="danger">{error || "Errore caricamento profilo"}</Alert>
      </Container>
    );
  } */
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

  const handleDeleteArticle = (deletedArticleId) => {
    setViewedUserArticles((prev) => prev.filter((article) => article.id !== deletedArticleId));
  };
  const handleConfirmDeleteProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token || !authUser) {
      setDeleteError("Dati utente non disponibili. Riprova più tardi.");
      return;
    }

    const isOwnProfile = Number(userId) === authUser.id;

    console.log("authUser.id:", authUser.id);
    console.log("authUser.role:", authUser.role);
    console.log("isOwnProfile:", isOwnProfile);
    console.log("isAdmin:", isAdmin);

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

  return (
    <Container className="py-5">
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
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    borderRadius: "50%",
                    padding: "4px",
                  }}
                >
                  <MdOutlineCameraAlt size={20} />
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
          <h3 className="fw-bold">{viewedUser.username}</h3>
          <p className="text-muted">{viewedUser.email}</p>
          {isOwnProfile ? (
            isEditingProfileDescription ? (
              <>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={profileDescription}
                  onChange={(e) => setProfileDescription(e.target.value)}
                />
                <div className="text-end mt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="me-2"
                    onClick={() => {
                      setProfileDescription(viewedUser.description || "");
                      setIsEditingProfileDescription(false);
                    }}
                  >
                    Annulla
                  </Button>
                  <Button size="sm" variant="success" onClick={handleSaveProfileDescription}>
                    Salva
                  </Button>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center">
                <p className="mb-0 me-2 flex-grow-1 text-muted">
                  {viewedUser.description?.trim() || "Nessuna descrizione disponibile."}
                </p>
                <FaEdit
                  size={18}
                  onClick={() => setIsEditingProfileDescription(true)}
                  style={{ cursor: "pointer" }}
                  title="Modifica descrizione"
                />
              </div>
            )
          ) : (
            <p className="text-muted">{viewedUser.description || "Nessuna descrizione disponibile."}</p>
          )}
          <div className="mt-3">
            {isOwnProfile && (
              <Button variant="danger" onClick={() => setShowDeleteModal(true)} disabled={!authUser}>
                Elimina Profilo
              </Button>
            )}

            {isAdmin && !isOwnProfile && (
              <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="ms-2">
                Elimina utente come Admin
              </Button>
            )}
          </div>
        </Col>
      </Row>

      <hr className="my-5" />

      <h4>{isOwnProfile ? "I tuoi annunci" : `Annunci di ${viewedUser.username}`}</h4>
      {viewedUserArticles.length === 0 ? (
        <p>Nessun articolo pubblicato.</p>
      ) : (
        <Row>
          {viewedUserArticles.map((article) => (
            <div key={article.id} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2-4-custom mb-4">
              <ArticleCard article={article} onClick={handleCardClick} showFavoriteIcon={!isOwnProfile} />
            </div>
          ))}
        </Row>
      )}

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
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annulla
          </Button>

          {/*           <Button
            variant="danger"
            onClick={() => {
              if (authUser) {
                handleConfirmDeleteProfile();
              } else {
                setDeleteError("Dati utente non disponibili. Riprova tra qualche secondo.");
              }
            }}
            disabled={!authUser}
          >
            Elimina Profilo
          </Button> */}
          <Button
            variant="danger"
            onClick={() => {
              if (isAdmin || isOwnProfile) {
                handleConfirmDeleteProfile();
              } else {
                setDeleteError("Operazione non consentita.");
              }
            }}
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
