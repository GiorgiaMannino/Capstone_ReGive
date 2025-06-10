import React, { useState } from "react";
import { uploadArticle } from "../redux/actions";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import CustomBreadcrumb from "./CustomBreadcrumb";

// Lista categorie
const categories = ["Elettronica", "Arredo", "Libri", "Giochi", "Cucina", "Sport", "Accessori", "Animali"];

// Breadcrumb
const breadcrumbItems = [
  { label: "Home", href: "/" },
  { label: "Nuovo Articolo", href: "" },
];

const UploadArticle = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [imageFiles, setImageFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Gestione invio del form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageFiles.length === 0) {
      alert("Per favore carica almeno un'immagine");
      return;
    }

    if (imageFiles.length > 6) {
      alert("Puoi caricare un massimo di 6 immagini.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    imageFiles.forEach((file) => formData.append("images", file));

    try {
      setLoading(true);
      await uploadArticle(formData);
      alert("Articolo caricato con successo!");
      setTimeout(() => navigate("/"), 0);
    } catch (error) {
      console.error("Errore:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-page container mb-3 py-4">
      {loading ? (
        <Loader message="Caricamento articolo in corso..." />
      ) : (
        <>
          {breadcrumbItems && (
            <div className="w-100 mb-3 mt-4 ms-2">
              <CustomBreadcrumb items={breadcrumbItems} />
            </div>
          )}
          <h2 className="mb-5 mt-5">Carica un nuovo articolo</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Titolo */}
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Titolo
              </label>
              <input
                type="text"
                id="title"
                className="form-control form-control-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Inserisci il titolo"
              />
            </div>

            {/* Descrizione */}
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Descrizione
              </label>
              <textarea
                id="description"
                className="form-control form-control-lg"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                placeholder="Inserisci la descrizione"
              />
            </div>

            {/* Categoria */}
            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                Categoria
              </label>
              <select
                id="category"
                className="form-select form-select-lg"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Caricamento immagini */}
            <div className="mb-3">
              <label htmlFor="images" className="form-label">
                Immagini (max 6)
              </label>
              <input
                type="file"
                id="images"
                className="form-control"
                accept="image/*"
                multiple
                required
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  if (files.length > 6) {
                    alert("Puoi caricare un massimo di 6 immagini.");
                    e.target.value = null;
                    return;
                  }
                  setImageFiles(files);
                }}
              />
            </div>

            {/* Anteprima immagini */}
            {imageFiles.length > 0 && (
              <div className="mb-4 d-flex flex-wrap gap-4">
                {imageFiles.map((file, index) => (
                  <img
                    key={index}
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    style={{
                      width: "200px",
                      height: "250px",
                      objectFit: "cover",
                      borderRadius: "35px",
                      border: "2px solid #d5ddd4",
                    }}
                  />
                ))}
              </div>
            )}

            {/* Bottone submit */}
            <div className="text-end">
              <button type="submit" className="btn btn-primary btn-lg fw-semibold px-4 py-3">
                Carica Articolo
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default UploadArticle;
