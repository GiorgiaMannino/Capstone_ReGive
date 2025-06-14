import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Carousel } from "react-bootstrap";
import Loader from "./Loader";
import { deleteArticle } from "../redux/actions/index";

const ArticleModal = ({
  show,
  handleClose,
  article,
  setArticle,
  isEditing,
  setIsEditing,
  handleSave,
  handleDelete,
}) => {
  const [newImages, setNewImages] = useState([]);
  const [originalArticle, setOriginalArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef();

  // Apertura/chiusura modale di conferma eliminazione
  const openDeleteConfirm = () => setShowDeleteConfirm(true);
  const closeDeleteConfirm = () => setShowDeleteConfirm(false);

  useEffect(() => {
    if (isEditing && article) {
      setOriginalArticle({ ...article });
    }
  }, [isEditing, article]);

  if (!article) return null;

  // Gestione input form (titolo, categoria, descrizione)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setArticle((prev) => ({ ...prev, [name]: value }));
  };

  // Selezione immagini (massimo 6)
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > 6) {
      alert("Puoi caricare un massimo di 6 immagini.");
      e.target.value = "";
      return;
    }

    setNewImages(files);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Salvataggio dei dati modificati (e immagini nuove se presenti)
  const internalHandleSave = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("title", article.title);
    formData.append("description", article.description);
    formData.append("category", article.category);
    newImages.forEach((img) => formData.append("images", img));

    try {
      await handleSave(article.id, formData);
      setNewImages([]);
      setIsEditing(false);
      handleClose();
    } catch (err) {
      console.error("Errore durante il salvataggio:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Annulla modifiche e ripristina articolo originale
  const handleCancel = () => {
    if (originalArticle) {
      setArticle(originalArticle);
    }
    setNewImages([]);
    setIsEditing(false);
  };

  // Verifica se ci sono più immagini per attivare i controlli Carousel
  const hasMultipleImages = article.imageUrls && article.imageUrls.length > 1;

  // Richiesta conferma eliminazione
  const onDeleteClick = () => {
    openDeleteConfirm();
  };

  // Conferma eliminazione dell’articolo
  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Utente non autenticato");
      await deleteArticle(token, article.id);
      handleDelete(article.id);
      handleClose();
      closeDeleteConfirm();
    } catch (error) {
      alert("Errore durante l'eliminazione: " + error.message);
    }
  };

  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} centered size="xl" className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title className="green fw-semibold mt-2 p-3">
            {isEditing ? "Modifica Articolo" : article.title}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="custom-modal-body p-5">
          {isLoading ? (
            <Loader message="Salvataggio in corso..." />
          ) : isEditing ? (
            <>
              {/* Modifica titolo */}
              <Form.Group className="mb-4">
                <Form.Label>Titolo</Form.Label>
                <Form.Control name="title" value={article.title} onChange={handleChange} />
              </Form.Group>

              {/* Modifica categoria */}
              <Form.Group className="mb-4">
                <Form.Label>Categoria</Form.Label>
                <Form.Select name="category" value={article.category} onChange={handleChange}>
                  <option value="">Seleziona una categoria</option>
                  <option value="ELETTRONICA">Elettronica</option>
                  <option value="ARREDO">Arredo</option>
                  <option value="LIBRI">Libri</option>
                  <option value="GIOCHI">Giochi</option>
                  <option value="CUCINA">Cucina</option>
                  <option value="SPORT">Sport</option>
                  <option value="ACCESSORI">Accessori</option>
                  <option value="ANIMALI">Animali</option>
                </Form.Select>
              </Form.Group>

              {/* Modifica descrizione */}
              <Form.Group className="mb-4">
                <Form.Label>Descrizione</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={article.description}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* Upload nuove immagini */}
              <Form.Group className="mb-3">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <Form.Label className="mb-3 mt-2">Nuove Immagini (opzionale, max 6)</Form.Label>
                  <Button onClick={triggerFileInput} className="article-modal-btn mb-3 mt-2">
                    Carica Immagini
                  </Button>
                </div>

                {/* Input nascosto */}
                <Form.Control
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  multiple
                  accept="image/*"
                  style={{ display: "none" }}
                />

                {/* Anteprima immagini caricate */}
                {newImages.length > 0 && (
                  <div className="mt-3 d-flex flex-wrap gap-3">
                    {newImages.map((file, i) => (
                      <div key={i} className="preview-image-wrapper">
                        <img src={URL.createObjectURL(file)} alt={`preview-${i}`} className="image-preview" />
                      </div>
                    ))}
                  </div>
                )}
              </Form.Group>
            </>
          ) : (
            <>
              {/* Visualizzazione immagini esistenti */}
              <div className="custom-carousel-wrapper mb-4">
                {article.imageUrls?.length > 0 ? (
                  <Carousel controls={hasMultipleImages} indicators={hasMultipleImages}>
                    {article.imageUrls.map((url, index) => (
                      <Carousel.Item key={index}>
                        <img src={url} alt={`Immagine ${index + 1}`} className="carousel-image mb-2" />
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <img src="https://via.placeholder.com/600x300" alt="Nessuna immagine" className="carousel-image" />
                )}
              </div>

              {/* Info articolo */}
              <div className="info-box mb-1">
                <p className="mb-3">
                  <strong>Categoria:</strong> {capitalize(article.category) || "Nessuna"}
                </p>

                <p>
                  <strong>Descrizione:</strong> {article.description || "—"}
                </p>
              </div>
            </>
          )}
        </Modal.Body>

        {/* Pulsanti footer: Salva/Annulla o Elimina/Modifica */}
        <Modal.Footer>
          {!isLoading &&
            (isEditing ? (
              <div className="d-flex gap-2 justify-content-end w-100">
                <Button onClick={handleCancel} disabled={isLoading} className="article-modal-btn">
                  Annulla
                </Button>
                <Button onClick={internalHandleSave} disabled={isLoading} className="article-modal-btn2">
                  Salva
                </Button>
              </div>
            ) : (
              <div className="d-flex justify-content-between w-100 p-3">
                <Button variant="danger" onClick={onDeleteClick} title="Elimina" className="rounded-pill btn-delete">
                  Elimina
                </Button>

                <Button className="article-modal-btn2" onClick={() => setIsEditing(true)}>
                  Modifica
                </Button>
              </div>
            ))}
        </Modal.Footer>
      </Modal>

      {/* Modale di conferma eliminazione */}
      <Modal show={showDeleteConfirm} onHide={closeDeleteConfirm} centered>
        <Modal.Header closeButton>
          <Modal.Title>Conferma eliminazione</Modal.Title>
        </Modal.Header>
        <Modal.Body>Sei sicuro di voler eliminare questo articolo? L'operazione è irreversibile.</Modal.Body>
        <Modal.Footer>
          <Button className="btn-delete" variant="danger" onClick={confirmDelete}>
            Elimina
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ArticleModal;
