import React, { useEffect, useRef, useState } from "react";
import { Carousel, Container } from "react-bootstrap";
import ArticleCard from "./ArticleCard";
import Categories from "./Categories";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllArticles, fetchOtherUsersArticles, fetchUserCount } from "../redux/actions/index";
import { FaCamera, FaBoxOpen, FaSmileBeam } from "react-icons/fa";
import heroImage from "../assets/heroImage.jpg";
import Loader from "./Loader";
import "animate.css";
import { FaUsers, FaNewspaper } from "react-icons/fa";
import { FaStar } from "react-icons/fa";

// Animazioni su scroll
const useAnimateOnScroll = (trigger) => {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-animate-scroll]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target;
          const animation = el.dataset.animation || "animate__fadeInUp";
          const delay = el.dataset.delay || "0s";

          if (entry.isIntersecting) {
            el.style.opacity = 1;
            el.style.animationDelay = delay;
            el.classList.remove("animate__animated", animation);
            void el.offsetWidth;
            el.classList.add("animate__animated", animation);
          } else {
            el.classList.remove("animate__animated", animation);
            el.style.opacity = 0;
            el.style.animationDelay = "0s";
          }
        });
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [trigger]);
};

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
      .join("")
  );
  return JSON.parse(jsonPayload);
}

const HomePage = () => {
  const user = useSelector((state) => state.auth.user);
  const isLoggedIn = !!user;

  const token = localStorage.getItem("token");
  const decoded = token ? parseJwt(token) : null;
  const isAdmin = decoded?.roles?.includes("ROLE_ADMIN");
  console.log("USER:", user, "Decoded:", decoded, "isAdmin:", isAdmin);

  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [articleCount, setArticleCount] = useState(null);
  useAnimateOnScroll(`${isLoggedIn}-${articles.length}`);

  const heroRef = useRef();
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        let articlesData;

        if (isLoggedIn) {
          // Utente loggato vede gli articoli degli altri
          articlesData = await fetchOtherUsersArticles(token);
        } else {
          // Utente non loggato vede tutti gli articoli
          articlesData = await fetchAllArticles(null);
        }

        const shuffled = [...articlesData].sort(() => Math.random() - 0.5);
        setArticles(shuffled);
        setArticleCount(articlesData.length);

        if (isAdmin) {
          const count = await fetchUserCount(token);
          console.log("fetchUserCount response:", count);
          setUserCount(Array.isArray(count) ? count.length : 0);
        }
      } catch (err) {
        console.error("Errore caricamento articoli:", err);
        setError(err.message || "Errore nel caricamento degli articoli.");
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [isLoggedIn, isAdmin, token]);

  useEffect(() => {
    const heroEl = heroRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const animatedEls = heroEl.querySelectorAll("[data-animate-hero]");
          animatedEls.forEach((el) => {
            const animation = el.dataset.animation || "animate__fadeInDown";
            el.classList.remove("animate__animated", animation);
            void el.offsetWidth;
            el.classList.add("animate__animated", animation);
          });
        }
      },
      { threshold: 0.5 }
    );

    if (heroEl) observer.observe(heroEl);
    return () => observer.disconnect();
  }, [isLoggedIn]);

  const handleArticleClick = (article) => {
    if (isLoggedIn) {
      navigate(`/article/${article.id}`, {
        state: {
          breadcrumbItems: [
            { label: "Home", href: "/" },
            { label: article.title, href: "" },
          ],
        },
      });
    } else {
      window.dispatchEvent(new Event("openRegisterModal"));
    }
  };

  return (
    <main>
      {isAdmin ? (
        <>
          <section
            ref={heroRef}
            className="hero-section d-flex align-items-center text-center position-relative mb-5"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "80vh",
            }}
          >
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.42)", zIndex: 1 }}
            />

            <div className="container position-relative" style={{ zIndex: 2, padding: "3rem 1rem" }}>
              <h1 className="display-5 fw-bold mb-3 fs-1" data-animate-hero data-animation="animate__fadeInDown">
                Benvenuto!
              </h1>
              <p className="lead mb-4 fw-bold fs-2" data-animate-hero data-animation="animate__fadeInUp">
                Gestisci articoli, utenti e contenuti della community.
              </p>
            </div>
          </section>
          <div className="py-5 stats-container mt-5 mb-5">
            <div className="row justify-content-center">
              {[
                {
                  icon: <FaUsers size={40} className="green mb-3 " />,
                  title: "Utenti Registrati",
                  value: userCount === null ? "..." : userCount,
                },
                {
                  icon: <FaNewspaper size={40} className="green mb-3 " />,
                  title: "Articoli Pubblicati",
                  value: articleCount === null ? "..." : articleCount,
                },
              ].map(({ icon, title, value }, i) => (
                <div
                  key={i}
                  className="col-md-4 mb-4"
                  data-animate-scroll
                  data-animation="animate__fadeInDown"
                  data-delay={`${i * 0.5}s`}
                  style={{ opacity: 0 }}
                >
                  <div className="p-4 border rounded h-100 shadow-sm bg-white text-center">
                    {icon}
                    <h3 className="fw-semibold mb-3">{title}</h3>
                    <p className="fs-4  green">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* HOMEPAGE ADMIN */}
          <Container className="pt-5 pb-5" style={{ backgroundColor: "#F7F7F7" }}>
            <h2 className="mb-5  fw-bold green">Tutti gli articoli</h2>

            <div className="row">
              {articles.map((article) => (
                <div key={article.id} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2-4-custom mb-4">
                  <ArticleCard article={article} onClick={handleArticleClick} showFavoriteIcon={false} />
                </div>
              ))}
            </div>
          </Container>
        </>
      ) : (
        <>
          <section
            ref={heroRef}
            className="hero-section d-flex align-items-center text-center position-relative"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              minHeight: "80vh",
            }}
          >
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.42)", zIndex: 1 }}
            />
            <div className="container position-relative z-2 p-5 text-white">
              {isLoggedIn ? (
                <>
                  <h1 className="display-5 fw-bold mb-3 fs-1" data-animate-hero data-animation="animate__fadeInDown">
                    Bentornato su ReGive!
                  </h1>
                  <p className="lead mb-4 fw-bold fs-2" data-animate-hero data-animation="animate__fadeInUp">
                    Scopri cosa c'è di nuovo nella tua community!
                  </p>
                  <button
                    className="btn btn-success"
                    onClick={() => navigate("/upload-article")}
                    data-animate-hero
                    data-animation="animate__zoomIn"
                  >
                    + Aggiungi Articolo
                  </button>
                </>
              ) : (
                <>
                  <h1 className="display-5 fw-bold mb-3 fs-1" data-animate-hero data-animation="animate__fadeInDown">
                    Dai nuova vita agli oggetti!
                  </h1>
                  <p className="lead mb-4 fw-bold fs-2" data-animate-hero data-animation="animate__fadeInUp">
                    Regala o trova ciò che ti serve e scopri le opportunità che ti aspettano.
                  </p>
                  <button
                    className="btn btn-primary btn-green btn-lg"
                    onClick={() => window.dispatchEvent(new Event("openRegisterModal"))}
                    data-animate-hero
                    data-animation="animate__zoomIn"
                  >
                    Registrati ora
                  </button>
                </>
              )}
            </div>
          </section>

          {!isLoggedIn && (
            <section className="py-5 text-center bg-light">
              <div className="container mb-4">
                <h2
                  className="mb-5 mt-5 fw-bold h2-step green"
                  data-animate-scroll
                  data-animation="animate__fadeIn"
                  style={{ opacity: 0 }}
                >
                  Come funziona ReGive
                </h2>
                <div className="row justify-content-center">
                  {[
                    {
                      icon: <FaCamera size={40} className="green mb-3" />,
                      title: "Crea un annuncio gratuito",
                      text: "Scatta una foto dell’oggetto, descrivilo e pubblica l’annuncio. È facile e veloce.",
                    },
                    {
                      icon: <FaBoxOpen size={40} className="green mb-3" />,
                      title: "Spedisci l’oggetto",
                      text: "Quando hai un interessato, spedisci l’oggetto: le spese di spedizione sono a carico dell’acquirente.",
                    },
                    {
                      icon: <FaSmileBeam size={40} className="green mb-3" />,
                      title: "Dona e ispira la community",
                      text: "Fai spazio, trova oggetti e contribuisci a un mondo più sostenibile.",
                    },
                  ].map(({ icon, title, text }, i) => (
                    <div
                      key={i}
                      className="col-md-4 mb-4"
                      data-animate-scroll
                      data-animation="animate__fadeInDown"
                      data-delay={`${i * 0.5}s`}
                      style={{ opacity: 0 }}
                    >
                      <div className="p-4 border rounded h-100 shadow-sm bg-white">
                        {icon}
                        <h5 className="fw-semibold mb-3">{title}</h5>
                        <p className="text-muted">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {isLoggedIn && (
            <div
              data-animate-scroll
              data-animation="animate__fadeIn"
              data-delay="0.2s"
              style={{ opacity: 0 }}
              className="bg-white p-3 rounded "
            >
              <Categories onSelect={(category) => navigate(`/search?category=${category}`)} layout="horizontal" />
            </div>
          )}

          {loading ? (
            <Loader message="Caricamento articoli in corso..." />
          ) : error ? (
            <p className="text-danger text-center">Errore: {error}</p>
          ) : (
            <section className="pt-5 pb-5" style={{ backgroundColor: "#F7F7F7" }}>
              <Container>
                <h2 className="mb-4 fw-bold green">
                  {isLoggedIn ? "Articoli consigliati" : "Esplora gli articoli disponibili"}
                </h2>

                <div className="row">
                  {articles.slice(0, 10).map((article) => (
                    <div key={article.id} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2-4-custom mb-5">
                      <ArticleCard article={article} onClick={handleArticleClick} showFavoriteIcon={isLoggedIn} />
                    </div>
                  ))}
                </div>

                <h2 className="mt-5 mb-4 fw-bold green">
                  {isLoggedIn ? "Scelti dalla community" : "Scopri cosa piace agli altri"}
                </h2>

                <div className="row">
                  {articles.slice(10, 20).map((article) => (
                    <div key={article.id} className="col-12 col-sm-6 col-md-4 col-lg-3 col-xl-2-4-custom mb-4">
                      <ArticleCard article={article} onClick={handleArticleClick} showFavoriteIcon={isLoggedIn} />
                    </div>
                  ))}
                </div>
              </Container>
            </section>
          )}

          {!isLoggedIn && (
            <section
              className="testimonials-section py-5 text-center"
              data-animate-scroll
              data-animation="animate__fadeIn"
            >
              <h2 className="mb-4 green">Cosa dicono gli utenti</h2>
              <div className="container">
                <Carousel indicators={false} controls interval={2700}>
                  <Carousel.Item>
                    <blockquote className="testimonial-block px-3">
                      <div className="text-warning mb-2">
                        {[...Array(5)].map((_, j) => (
                          <FaStar key={j} className="mx-1 fs-5" />
                        ))}
                      </div>
                      <p className="mb-3 p-2">
                        “App molto intuitiva. Ho dato via vecchi oggetti che non usavo più e ho trovato cose utili per
                        casa. La sezione 'Prima & Dopo' è davvero ispirante.”
                      </p>
                      <footer className="text-white">— Giulia R.</footer>
                    </blockquote>
                  </Carousel.Item>

                  <Carousel.Item>
                    <blockquote className="testimonial-block px-3">
                      <div className="text-warning mb-2">
                        {[...Array(4)].map((_, j) => (
                          <FaStar key={j} className="mx-1 fs-5" />
                        ))}
                        <FaStar className="mx-1 text-secondary fs-5" />
                      </div>
                      <p className="mb-3 p-2">
                        “Adoro l’idea di ridare valore a quello che non serve più. Ho regalato una sedia rotta e l’hanno
                        trasformata in qualcosa di bellissimo!”
                      </p>

                      <footer className="text-white">— Luca M.</footer>
                    </blockquote>
                  </Carousel.Item>

                  <Carousel.Item>
                    <blockquote className="testimonial-block px-3">
                      <div className="text-warning mb-2">
                        {[...Array(5)].map((_, j) => (
                          <FaStar key={j} className="mx-1 fs-5" />
                        ))}
                      </div>
                      <p className="mb-3 p-2">
                        “ReGive è facilissima da usare! Ho donato una libreria e nel giro di un’ora avevo già trovato
                        qualcuno interessato.”
                      </p>
                      <footer className="text-white">— Serena B.</footer>
                    </blockquote>
                  </Carousel.Item>

                  <Carousel.Item>
                    <blockquote className="testimonial-block px-3">
                      <div className="text-warning mb-2">
                        {[...Array(4)].map((_, j) => (
                          <FaStar key={j} className="mx-1 fs-5" />
                        ))}
                        <FaStar className="mx-1 text-secondary fs-5" />
                      </div>
                      <p className="mb-3 p-2">
                        “Finalmente un modo semplice e utile per dare nuova vita agli oggetti!”
                      </p>
                      <footer className="text-white">— Marco T.</footer>
                    </blockquote>
                  </Carousel.Item>
                </Carousel>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
};

export default HomePage;
