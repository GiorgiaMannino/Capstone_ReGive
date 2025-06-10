import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const MyFooter = () => {
  return (
    <footer className="my-footer text-white py-5 ">
      <Container>
        <Row className="text-center text-md-start">
          <Col md={6} className="mb-4 mb-md-0">
            <h5>ReGive</h5>
            <p className="mb-2">Diamo nuova vita agli oggetti. Dona o trova ciò che ti serve, ispira il cambiamento.</p>
          </Col>
          <Col md={3} className="mb-4 mb-md-0">
            <h6>Link utili</h6>
            <ul className="list-unstyled">
              <li>
                <a href="/">Esplora</a>
              </li>
              <li>
                <a href="/beforeafter">Prima & dopo</a>
              </li>
            </ul>
          </Col>
          <Col md={3}>
            <h6>Contatti</h6>
            <ul className="list-unstyled">
              <li>
                <a href="https://www.linkedin.com/in/giorgia-mannino-065170218/">Linkedin</a>
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="border-light" />
        <p className="text-center small mb-0">&copy; {new Date().getFullYear()} ReGive. Tutti i diritti riservati.</p>
      </Container>
    </footer>
  );
};

export default MyFooter;
