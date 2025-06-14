import React, { useState, useEffect, useRef } from "react";
import { Container, Button, Alert, Modal } from "react-bootstrap";
import { TiPlus } from "react-icons/ti";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { FaComment } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa6";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import ArticleCard from "./ArticleCard";
import ModalBeforeAfterPost from "./ModalBeforeAfterPost";
import CustomBreadcrumb from "./CustomBreadcrumb";
import Loader from "./Loader";

// Breadcrumb per la pagina
const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Prima & Dopo", href: "" },
];

function MediaSlider({ mediaFiles }) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (mediaFiles.length > 1) startAutoplay();
    return () => clearInterval(intervalRef.current);
  }, [index, mediaFiles]);

  function startAutoplay() {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % mediaFiles.length);
    }, 3000);
  }

  if (!mediaFiles || mediaFiles.length === 0) return <p>Nessun media disponibile</p>;

  const current = mediaFiles[index];

  return (
    <div className="position-relative text-center media-slider-wrapper mb-3">
      {current.fileType === "image" ? (
        <img src={current.url} alt={`Media ${index + 1}`} className="img-fluid rounded media-slider-media" />
      ) : (
        <video controls className="w-100 rounded media-slider-media">
          <source src={current.url} type="video/mp4" />
          Il tuo browser non supporta il video.
        </video>
      )}

      {mediaFiles.length > 1 && (
        <>
          <button
            className="slider-arrow left"
            onClick={() => setIndex((i) => (i === 0 ? mediaFiles.length - 1 : i - 1))}
          >
            <FaChevronLeft />
          </button>
          <button className="slider-arrow right" onClick={() => setIndex((i) => (i + 1) % mediaFiles.length)}>
            <FaChevronRight />
          </button>

          <div className="slider-indicator">
            {index + 1} / {mediaFiles.length}
          </div>
        </>
      )}
    </div>
  );
}

// Modale di dettaglio post
function BeforeAfterPostDetail({ post, onClose, currentUser, onDelete }) {
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [liked, setLiked] = useState(currentUser && post.likedBy?.some((u) => u.email === currentUser.email));
  const [deleting, setDeleting] = useState(false);
  const [hovering, setHovering] = useState(false);
  const token = localStorage.getItem("token");

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const commentsRef = useRef(null);
  const [showComments, setShowComments] = useState(false);

  const isAuthorOrAdmin =
    currentUser &&
    (currentUser.email === post.authorEmail ||
      currentUser.roles?.includes("ROLE_ADMIN") ||
      currentUser.roles?.includes("admin"));

  useEffect(() => {
    async function fetchComments() {
      setLoadingComments(true);
      try {
        const res = await fetch(`http://localhost:8080/api/beforeafter/${post.id}/comments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Errore nel caricamento dei commenti");
        const data = await res.json();
        setComments(data);
      } catch (e) {
        console.error("Errore nei commenti:", e);
      } finally {
        setLoadingComments(false);
      }
    }

    fetchComments();
  }, [post.id]);

  async function handleSubmitComment() {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/beforeafter/${post.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) throw new Error("Errore durante l'invio del commento");

      setNewComment("");
      const updatedComments = await fetch(`http://localhost:8080/api/beforeafter/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json());

      setComments(updatedComments);
    } catch (e) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleComments() {
    setShowComments((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          if (commentsRef.current) {
            commentsRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 0);
      }
      return next;
    });
  }

  async function toggleLike() {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      const res = await fetch(`http://localhost:8080/api/beforeafter/${post.id}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore nel like");
    } catch (e) {
      setLiked(!newLiked);
      setLikesCount((prev) => (!newLiked ? prev + 1 : prev - 1));
      alert(e.message);
    }
  }

  async function deletePost() {
    if (!window.confirm("Sei sicuro di voler eliminare questo post?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:8080/api/beforeafter/${post.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Errore nella cancellazione");

      alert("Articolo eliminato con successo.");
      onDelete(post.id);
      onClose();
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal show onHide={onClose} centered size="lg" dialogClassName="view-post-modal">
      <Modal.Body>
        <div className="post-header d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <div>
              <h6 className="m-0 fw-semibold text-green green">
                {post.authorUsername || post.authorUsername || post.authorEmail}
              </h6>
              <small className="text-muted" style={{ fontSize: "0.8em" }}>
                {new Date(post.createdAt).toLocaleDateString("it-IT", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </small>
            </div>
          </div>
          {isAuthorOrAdmin && (
            <button
              className="btn btn-outline-danger btn-sm rounded-pill"
              onClick={deletePost}
              disabled={deleting}
              title="Elimina il post"
            >
              {deleting ? "Eliminazione..." : "Elimina"}
            </button>
          )}
        </div>

        <p className="mb-4">{post.description}</p>
        <div className="mb-3">
          <MediaSlider mediaFiles={post.mediaFiles} />
        </div>
        <div className="d-flex align-items-center justify-content-end mb-3">
          <div
            className="d-flex align-items-center me-5"
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={toggleLike}
            title={liked ? "Togli Mi Piace" : "Metti Mi Piace"}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            {liked || hovering ? <GoHeartFill className="me-2 heart-icon" /> : <GoHeart className="me-2 heart-icon" />}
            <span>{likesCount}</span>
          </div>

          <div
            className="d-flex align-items-center"
            style={{ cursor: "pointer", userSelect: "none" }}
            onClick={toggleComments}
            title="Vai ai commenti"
          >
            <FaRegComment className="me-2 green" size={18} />
            <span>{comments.length}</span>
          </div>
        </div>

        {showComments && (
          <>
            <hr className="my-3 green" />
            <div className="d-flex" ref={commentsRef}>
              <h5 className="mb-3 me-1 mt-4 ">Commenti</h5>
            </div>

            {loadingComments ? (
              <Loader message="Caricamento commenti..." />
            ) : comments.length === 0 ? (
              <small className="text-secondary">Ancora nessun commento. Commenta prima di tutti!</small>
            ) : (
              <ul className="list-unstyled">
                {comments.map((comment, idx) => (
                  <li key={idx} className=" mb-3 bg-light rounded">
                    <div
                      className="border rounded-4 p-3 "
                      style={{ wordWrap: "break-word", whiteSpace: "normal", backgroundColor: "#f0f0f0" }}
                    >
                      <strong className="green">{comment.authorUsername || comment.authorEmail}</strong>
                      <p className="mb-1">{comment.content}</p>
                    </div>

                    <small className="d-block text-muted text-end" style={{ fontSize: "0.7em" }}>
                      {new Date(comment.createdAt).toLocaleString("it-IT", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: undefined,
                      })}
                    </small>
                  </li>
                ))}
              </ul>
            )}

            {currentUser && (
              <div className="mt-3">
                <textarea
                  className="form-control mb-2"
                  rows="3"
                  placeholder="Scrivi un commento..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="d-flex justify-content-end">
                  <button className="btn btn-green text-white mt-2" onClick={handleSubmitComment} disabled={submitting}>
                    {submitting ? "Invio..." : "Commenta"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}

// Pagina principale Prima & Dopo
export default function BeforeAfterPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const token = localStorage.getItem("token");

  function parseJwt(token) {
    try {
      const base64Payload = token.split(".")[1];
      return JSON.parse(atob(base64Payload));
    } catch (e) {
      console.error("Errore parsing JWT:", e);
      return null;
    }
  }

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        const tokenPayload = parseJwt(user.token);
        if (tokenPayload?.roles) user.roles = tokenPayload.roles;
        setCurrentUser(user);
      } catch (e) {
        console.error("Errore parsing user:", e);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:8080/api/beforeafter", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Errore nel caricamento dei post");
        const data = await res.json();
        setPosts(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [token]);

  function handlePostCreated(newPost) {
    setPosts((prev) => [newPost, ...prev]);
    setShowCreateModal(false);
  }

  function handleDeletePost(deletedPostId) {
    setPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  }

  return (
    <Container className="py-4">
      <div className="container mt-4 mb-2">
        <CustomBreadcrumb items={breadcrumbItems} />
      </div>

      <div className="p-3">
        <h2 className="mb-4 text-center green fw-semibold">Trasforma, condividi, ispira! 🚀</h2>
        <p className="text-muted ps-5 pe-5 m-0">
          Hai restaurato un oggetto, rinnovato uno spazio o dato nuova vita a qualcosa che sembrava da buttare?
          Condividi il tuo Prima & Dopo e ispira la community con il tuo tocco creativo e passione per il cambiamento!
        </p>

        <div className="d-flex justify-content-center">
          <Button className="my-3 before-after-btn" onClick={() => setShowCreateModal((v) => !v)}>
            <TiPlus />
          </Button>
        </div>

        <hr className="green" />

        <ModalBeforeAfterPost
          show={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      </div>

      {loading && <Loader message=" " />}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && posts.length === 0 && <p>Nessun post disponibile.</p>}

      <div className="beforeafter-grid override-article-style">
        {posts.map((post) => {
          const article = {
            id: post.id,
            title: post.title,
            imageUrls: post.mediaFiles?.filter((f) => f.fileType === "image").map((f) => f.url),
          };
          return (
            <div key={post.id} className="article-wrapper">
              <ArticleCard article={article} onClick={() => setSelectedPost(post)} showFavoriteIcon={false} />
            </div>
          );
        })}
      </div>

      {selectedPost && (
        <BeforeAfterPostDetail
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          currentUser={currentUser}
          onDelete={handleDeletePost}
        />
      )}
    </Container>
  );
}
