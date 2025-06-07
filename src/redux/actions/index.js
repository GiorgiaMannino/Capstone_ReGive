// ------------------- AUTH -------------------

export async function loginUser(credentials) {
  const response = await fetch("http://localhost:8080/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    let errorMessage = "Errore nel login";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = await response.text();
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  localStorage.setItem("token", data.token);
  return data;
}

export async function registerUser(userData) {
  const response = await fetch("http://localhost:8080/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  let responseText = await response.text();

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (data && data.message) {
      throw new Error(data.message);
    }
    throw new Error(responseText);
  }

  if (data) return data;

  return responseText;
}

export const loginSuccess = (userData) => ({
  type: "LOGIN_SUCCESS",
  payload: userData,
});

export const logout = () => ({
  type: "LOGOUT",
});

// ------------------- ARTICLES -------------------

export async function uploadArticle(formData) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("Utente non autenticato. Effettua il login.");

  console.log("📦 FormData:");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}:`, value);
  }

  try {
    const response = await fetch("http://localhost:8080/api/articles", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await response.text();
    console.log("📨 Status:", response.status, responseText);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Sessione scaduta. Effettua nuovamente il login.");
      }
      throw new Error(`Errore ${response.status}: ${responseText}`);
    }

    return responseText;
  } catch (error) {
    console.error("Errore upload:", error);
    throw error;
  }
}

export async function updateArticle(token, articleId, formData) {
  const response = await fetch(`http://localhost:8080/api/articles/${articleId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error("Errore durante l'aggiornamento dell'articolo.");
  return response.json();
}

export async function fetchUserArticles(token) {
  const response = await fetch("http://localhost:8080/api/articles/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("Errore nel recupero degli articoli.");
  return response.json();
}

export async function fetchOtherUsersArticles(token) {
  if (!token) throw new Error("Token non presente.");

  const response = await fetch("http://localhost:8080/api/articles/articles/others", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

export async function fetchArticlesByUserId(token, userId) {
  const response = await fetch(`http://localhost:8080/api/articles/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Errore nel recupero degli articoli dell'utente");
  }

  return response.json();
}

export const fetchAllArticles = async (token) => {
  const response = await fetch("http://localhost:8080/api/articles", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Errore nel recupero degli articoli.");
  }

  return await response.json();
};

export const fetchArticleById = async (token, id) => {
  const response = await fetch(`http://localhost:8080/api/articles/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Errore nel caricamento dell'articolo");

  const data = await response.json();
  return data;
};

export async function deleteArticle(token, articleId) {
  const response = await fetch(`http://localhost:8080/api/articles/${articleId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Errore durante l'eliminazione dell'articolo.");
}

// ------------------- PROFILE -------------------

export const fetchUserCount = async (token) => {
  const response = await fetch("http://localhost:8080/api/profile/all", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 403) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Errore nel caricamento del conteggio utenti: ${text}`);
  }

  const count = await response.json();
  return count;
};

export const fetchUserProfile = async (token) => {
  const response = await fetch("http://localhost:8080/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 403) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Errore nel caricamento del profilo: ${text}`);
  }

  return await response.json();
};

export async function updateProfileImage(file) {
  const token = localStorage.getItem("token");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8080/api/profile/image", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) throw new Error("Errore aggiornamento immagine");

  return await response.json();
}

export async function updateUserProfile(token, updatedData) {
  const response = await fetch("http://localhost:8080/api/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore aggiornamento profilo: ${errorText}`);
  }

  const updatedUser = await response.json();

  const user = JSON.parse(localStorage.getItem("user"));
  localStorage.setItem("user", JSON.stringify({ ...user, ...updatedUser }));

  return updatedUser;
}

export const updateAuthUserProfileImage = (updatedUser) => ({
  type: "UPDATE_AUTH_USER_PROFILE_IMAGE",
  payload: updatedUser.profileImage,
});

export const fetchUserProfileById = async (token, userId) => {
  const response = await fetch(`http://localhost:8080/api/profile/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Errore nel caricamento del profilo utente");
  return await response.json();
};

export async function deleteUserProfile(token) {
  const response = await fetch("http://localhost:8080/api/profile", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore cancellazione profilo: ${errorText}`);
  }
  console.log("Status:", response.status);
  console.log("Response text:", await response.text());

  return;
}

export async function deleteUserProfileByAdmin(token, userId) {
  console.log("Chiamata API deleteUserProfileByAdmin con userId:", userId);
  const response = await fetch(`http://localhost:8080/api/profile/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 403) {
    throw new Error("Non puoi eliminare il tuo stesso profilo da admin.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore cancellazione profilo (admin): ${errorText}`);
  }

  return;
}

// ------------------- PREFERITI -------------------

export const SET_FAVORITES = "SET_FAVORITES";

const API_URL = "http://localhost:8080/api/favorites";

export const setFavorites = (articles) => ({
  type: SET_FAVORITES,
  payload: articles,
});

export async function fetchFavorites(token) {
  const response = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore nel fetch dei preferiti: ${errorText}`);
  }

  const data = await response.json();

  const articles = (Array.isArray(data) ? data : [data]).map((fav) => fav.article).filter(Boolean);

  return articles;
}

export async function toggleFavorite(articleId, token, isFavorited) {
  let response;

  if (isFavorited) {
    response = await fetch(`${API_URL}?articleId=${articleId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } else {
    response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ articleId }),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Errore toggle favorito: ${errorText}`);
  }

  return fetchFavorites(token);
}
