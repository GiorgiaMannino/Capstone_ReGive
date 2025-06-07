import React, { useEffect, useState } from "react";
import { Container, Navbar, FormControl, Button, Form, Nav, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import logo from "../assets/logo.png";
import { loginSuccess, loginUser, registerUser, fetchUserProfile } from "../redux/actions/index";
import AuthModals from "./AuthModals";
import { IoNotifications } from "react-icons/io5";
import { GoHeartFill } from "react-icons/go";
import { BsLightbulbFill } from "react-icons/bs";
import { GoHomeFill } from "react-icons/go";
import { FaSearch } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
const MyNav = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
    console.log("User roles:", user?.roles);
  }, [user]);

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
  const token = localStorage.getItem("token");
  const decoded = token ? parseJwt(token) : null;
  const isAdmin = decoded?.roles?.includes("ROLE_ADMIN");
  console.log("USER:", user, "Decoded:", decoded, "isAdmin:", isAdmin);

  const showRegisterModal = useSelector((state) => state.modal.showRegisterModal);
  const showLoginModal = useSelector((state) => state.modal.showLoginModal);

  const [profileImage, setProfileImage] = useState(user?.profileImage || null);

  // Register/Login stato
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [registerErrors, setRegisterErrors] = useState({});
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});

  // Ricerca stato
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setProfileImage(user?.profileImage || null);
  }, [user?.profileImage]);

  const openRegister = () => dispatch({ type: "SHOW_REGISTER_MODAL" });
  const closeRegister = () => dispatch({ type: "HIDE_REGISTER_MODAL" });
  const openLogin = () => dispatch({ type: "SHOW_LOGIN_MODAL" });
  const closeLogin = () => dispatch({ type: "HIDE_LOGIN_MODAL" });

  // Logout
  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const openRegisterModal = () => dispatch({ type: "SHOW_REGISTER_MODAL" });
    window.addEventListener("openRegisterModal", openRegisterModal);
    return () => window.removeEventListener("openRegisterModal", openRegisterModal);
  }, [dispatch]);

  const validateLogin = () => {
    const errors = {};
    const { email, password } = loginData;

    if (!email.trim()) {
      errors.email = "L'email è obbligatoria.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      errors.email = "Email non valida.";
    }

    if (!password) {
      errors.password = "La password è obbligatoria.";
    }

    return errors;
  };

  // Registrazione
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterErrors({});

    try {
      const registeredUser = await registerUser(registerData);
      const userProfile = await fetchUserProfile(registeredUser.token);

      dispatch(loginSuccess({ ...userProfile, token: registeredUser.token }));
      localStorage.setItem("user", JSON.stringify({ ...userProfile, token: registeredUser.token }));
      localStorage.setItem("token", registeredUser.token);
      closeRegister();
      setRegisterData({ username: "", email: "", password: "" });
    } catch (error) {
      const parsed = (() => {
        try {
          return JSON.parse(error.message || "{}");
        } catch {
          return null;
        }
      })();

      setRegisterErrors(
        parsed && typeof parsed === "object" ? parsed : { server: error.message || "Errore generico." }
      );
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    const errors = validateLogin();
    setLoginErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      //login e prendo il token
      const loginResponse = await loginUser(loginData);

      const userProfile = await fetchUserProfile(loginResponse.token);
      console.log("User Profile:", userProfile);

      dispatch(loginSuccess({ ...userProfile, token: loginResponse.token }));

      localStorage.setItem("user", JSON.stringify({ ...userProfile, token: loginResponse.token }));
      localStorage.setItem("token", loginResponse.token);

      // Chiusura modale e resetta form login
      closeLogin();
      setLoginData({ email: "", password: "" });
    } catch (error) {
      const msg = error.message.toLowerCase();

      if (msg.includes("credenziali")) {
        setLoginErrors({
          email: " ",
          password: "Email o password non corretta.",
        });
      } else {
        setLoginErrors({ server: error.message });
      }
    }
  };

  // Ricerca
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    if (!searchTerm || searchTerm.trim() === "") return;

    if (!user) {
      window.dispatchEvent(new Event("openRegisterModal"));
      return;
    }

    const term = searchTerm.trim();
    navigate(`/search?term=${encodeURIComponent(term)}`);
    setSearchTerm("");

    setShowMobileSearch(false);
  };
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const toggleSearch = () => setShowMobileSearch(!showMobileSearch);

  return (
    <>
      {/* NAVBAR DESKTOP */}
      <Navbar expand="lg" className="shadow-sm py-3 navbar-top d-none d-lg-flex">
        <Container className="d-flex justify-content-between align-items-center">
          <div className="navbar-left">
            <Navbar.Brand as={Link} to="/">
              <img src={logo} height="40" alt="Logo" />
            </Navbar.Brand>
          </div>

          <div className="navbar-center flex-grow-1 d-flex justify-content-center me-3">
            <Form onSubmit={handleSearchSubmit} className="search-bar w-100">
              <FormControl
                type="search"
                placeholder="Cerca articoli"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="search-icon" />
            </Form>
          </div>

          <div className="navbar-right d-flex align-items-center gap-3">
            {user ? (
              isAdmin ? (
                // Se è admin, mostra solo bottone logout
                <>
                  <Nav.Link className="nav-icon-text text-white text-center ">
                    <IoNotifications size={26} />
                    <div className="icon-label">Notifiche</div>
                  </Nav.Link>
                  <Nav.Link as={Link} to="/beforeafter" className="nav-icon-text text-white text-center me-1">
                    <BsLightbulbFill size={26} />
                    <div className="icon-label">Prima & Dopo</div>
                  </Nav.Link>
                  <Nav.Link className="nav-icon-text text-white text-center me-1" onClick={handleLogout}>
                    <IoLogOut size={26} />
                    <div className="icon-label">Esci</div>
                  </Nav.Link>
                </>
              ) : (
                // Se non è admin, mostra preferiti, notifiche, prima & dopo + dropdown profilo
                <>
                  <Nav.Link as={Link} to="/favorites" className="nav-icon-text text-white text-center me-1">
                    <GoHeartFill size={26} />
                    <div className="icon-label">Preferiti</div>
                  </Nav.Link>

                  <Nav.Link className="nav-icon-text text-white text-center ">
                    <IoNotifications size={26} />
                    <div className="icon-label">Notifiche</div>
                  </Nav.Link>

                  <Nav.Link as={Link} to="/beforeafter" className="nav-icon-text text-white text-center me-1">
                    <BsLightbulbFill size={26} />
                    <div className="icon-label">Prima & Dopo</div>
                  </Nav.Link>

                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" className="p-0 border-0 bg-transparent">
                      <img
                        src={profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
                        alt="User"
                        width="50"
                        height="50"
                        className="rounded-circle object-fit-cover nav-img"
                      />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item as={Link} to="/profile">
                        Profilo
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item onClick={handleLogout}>Esci</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </>
              )
            ) : (
              // Se non loggato
              <>
                <Button onClick={openLogin} className="nav-btn">
                  Accedi
                </Button>
                <Button onClick={openRegister} className="btn nav-btn2">
                  Registrati
                </Button>
              </>
            )}
          </div>
        </Container>
      </Navbar>

      {/* NAVBAR MOBILE */}
      <div className="navbar-bottom d-lg-none">
        <Nav.Link as={Link} to="/beforeafter" className="text-white">
          <BsLightbulbFill size={25} />
        </Nav.Link>

        <Nav.Link onClick={toggleSearch} className="text-white">
          <FaSearch size={24} />
        </Nav.Link>

        <Nav.Link as={Link} to="/" className="nav-home-icon text-white">
          <GoHomeFill size={26} />
        </Nav.Link>

        <Nav.Link className="text-white">
          <IoNotifications size={25} />
        </Nav.Link>

        <Dropdown align="end" className="d-lg-none">
          <Dropdown.Toggle variant="light" className="p-0 border-0 bg-transparent">
            <img
              src={profileImage || "https://cdn-icons-png.flaticon.com/512/847/847969.png"}
              alt="User"
              width="30"
              height="30"
              className="rounded-circle object-fit-cover border border-white"
            />
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {user ? (
              <>
                <Dropdown.Item as={Link} to="/profile">
                  Profilo
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Esci</Dropdown.Item>
              </>
            ) : (
              <>
                <Dropdown.Item onClick={openLogin} className="mb-2">
                  Accedi
                </Dropdown.Item>
                <Dropdown.Item onClick={openRegister}>Registrati</Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {showMobileSearch && (
        <div className="mobile-search-overlay">
          <Form onSubmit={handleSearchSubmit} className="d-flex p-2 bg-white">
            <FormControl
              type="search"
              placeholder="Cerca articoli"
              className="me-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </Form>
        </div>
      )}

      {/* Modali login/register */}
      <AuthModals
        showRegisterModal={showRegisterModal}
        showLoginModal={showLoginModal}
        handleCloseRegister={closeRegister}
        handleCloseLogin={closeLogin}
        registerData={registerData}
        setRegisterData={setRegisterData}
        registerErrors={registerErrors}
        handleRegisterSubmit={handleRegisterSubmit}
        loginData={loginData}
        setLoginData={setLoginData}
        loginErrors={loginErrors}
        handleLoginSubmit={handleLoginSubmit}
      />
    </>
  );
};

export default MyNav;
