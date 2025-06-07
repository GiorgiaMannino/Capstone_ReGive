import React from "react";
import Spinner from "react-bootstrap/Spinner";

const Loader = ({ message = "Caricamento in corso..." }) => {
  return (
    <div
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "75vh",
      }}
    >
      <Spinner animation="border" role="status" className="green" />
      <span className="mt-3">{message}</span>
    </div>
  );
};

export default Loader;
