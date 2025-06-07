import React, { useState } from "react";
import { Modal, Form, Button, Alert, Spinner } from "react-bootstrap";

export default function ModalBeforeAfterPost({ show, onClose, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Gestione invio del form
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    // Validazione
    if (!title.trim() || !description.trim() || files.length === 0) {
      setError("Completa tutti i campi e carica almeno un file");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("http://localhost:8080/api/beforeafter/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let responseBody;
      const contentType = res.headers.get("Content-Type") || "";

      if (contentType.includes("application/json")) {
        responseBody = await res.json();
      } else {
        const text = await res.text();
        responseBody = { message: text };
      }

      if (!res.ok) {
        throw new Error(responseBody.message || `Errore: ${res.status} ${res.statusText}`);
      }

      // Reset form e notifiche
      setTitle("");
      setDescription("");
      setFiles([]);
      onPostCreated(responseBody);
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  // Gestione caricamento file
  function handleFileChange(e) {
    setFiles(Array.from(e.target.files));
  }

  return (
    <Modal show={show} onHide={onClose} centered size="lg" dialogClassName="beforeafter-modal">
      <Modal.Header closeButton>
        <Modal.Title className="green fw-bold">Crea post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit} className="green fw-semibold mt-3">
          <Form.Group className="mb-3">
            <Form.Label>Titolo</Form.Label>
            <Form.Control
              type="text"
              placeholder="Titolo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Descrizione</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Descrizione"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Immagini</Form.Label>
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              required
              disabled={loading}
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Pubblica"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
