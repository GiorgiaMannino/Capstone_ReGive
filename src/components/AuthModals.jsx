import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

const AuthModals = ({
  showRegisterModal,
  showLoginModal,
  handleCloseRegister,
  handleCloseLogin,
  registerData,
  setRegisterData,
  registerErrors,
  handleRegisterSubmit,
  loginData,
  setLoginData,
  loginErrors,
  handleLoginSubmit,
}) => {
  // Gestione input con aggiornamento stato dinamico
  const handleInputChange = (setter) => (e) => {
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <>
      {/* Modal di Registrazione */}
      <Modal show={showRegisterModal} onHide={handleCloseRegister} centered size="lg" className="register-modal">
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center mt-3 green">Unisciti a ReGive!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRegisterSubmit}>
            {/* Username */}
            <Form.Group className="mb-2 mt-4" controlId="formUsername">
              <Form.Control
                type="text"
                placeholder="Nome utente"
                name="username"
                value={registerData.username}
                onChange={handleInputChange(setRegisterData)}
                isInvalid={!!registerErrors.username}
                required
              />
              {registerErrors.username ? (
                <Form.Control.Feedback type="invalid">{registerErrors.username}</Form.Control.Feedback>
              ) : (
                <Form.Text className="text-muted">
                  Scegli un nome utente unico! Può contenere lettere e numeri.
                </Form.Text>
              )}
            </Form.Group>

            {/* Email */}
            <Form.Group className="mb-2 mt-4" controlId="formEmail">
              <Form.Control
                type="email"
                placeholder="E-mail"
                name="email"
                value={registerData.email}
                onChange={handleInputChange(setRegisterData)}
                isInvalid={!!registerErrors.email}
                required
              />
              {registerErrors.email ? (
                <Form.Control.Feedback type="invalid">{registerErrors.email}</Form.Control.Feedback>
              ) : (
                <Form.Text className="text-muted">Inserisci l'indirizzo e-mail che vuoi usare su ReGive.</Form.Text>
              )}
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-4 mt-4" controlId="formPassword">
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                value={registerData.password}
                onChange={handleInputChange(setRegisterData)}
                isInvalid={!!registerErrors.password}
                required
              />
              {registerErrors.password ? (
                <Form.Control.Feedback type="invalid">{registerErrors.password}</Form.Control.Feedback>
              ) : (
                <Form.Text className="text-muted">
                  La password deve avere almeno 7 caratteri, una maiuscola e un numero.
                </Form.Text>
              )}
            </Form.Group>

            {/* Errore server */}
            {registerErrors.server && (
              <div className="alert alert-danger text-center" role="alert">
                {registerErrors.server}
              </div>
            )}

            {/* Bottone Registrati */}
            <Button variant="primary" type="submit" size="lg" className="d-block mx-auto btn-green px-4">
              Registrati
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal di Login */}
      <Modal show={showLoginModal} onHide={handleCloseLogin} centered size="lg" className="register-modal">
        <Modal.Header closeButton>
          <Modal.Title className="w-100 text-center mt-3 green">Accedi a ReGive</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLoginSubmit}>
            {/* Email */}
            <Form.Group className="mb-4 mt-4" controlId="loginEmail">
              <Form.Control
                type="email"
                placeholder="E-mail"
                name="email"
                value={loginData.email}
                onChange={handleInputChange(setLoginData)}
                isInvalid={!!loginErrors.email}
                required
              />
              {loginErrors.email && <Form.Control.Feedback type="invalid">{loginErrors.email}</Form.Control.Feedback>}
              <Form.Text className="text-muted">Inserisci l'e-mail collegata al tuo account.</Form.Text>
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-4" controlId="loginPassword">
              <Form.Control
                type="password"
                placeholder="Password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange(setLoginData)}
                isInvalid={!!loginErrors.password}
                required
              />
              {loginErrors.password && (
                <Form.Control.Feedback type="invalid">{loginErrors.password}</Form.Control.Feedback>
              )}
              <Form.Text className="text-muted">Inserisci la password del tuo account.</Form.Text>
            </Form.Group>

            {/* Errore server */}
            {loginErrors.server && (
              <div className="alert alert-danger text-center" role="alert">
                {loginErrors.server}
              </div>
            )}

            {/* Bottone Login */}
            <Button variant="primary" type="submit" size="lg" className="d-block mx-auto btn-green px-4">
              Accedi
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AuthModals;
