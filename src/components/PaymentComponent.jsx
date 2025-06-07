import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51RTjtGPCP8skLpHb6EhJ81t7Exla84q8bu9obiMjxXPTAYsuV4XKnf4JRsTcPNPyooutmmFwOLedjdbv6mHou41u00v919Pdfz"
);

const CheckoutForm = ({ userData, totalAmount, onPaymentSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8080/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100),
          shippingInfo: userData,
        }),
      });

      if (!response.ok) throw new Error("Errore nella creazione del PaymentIntent");

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: userData.name,
            address: {
              line1: userData.address,
              city: userData.city,
              postal_code: userData.postalCode,
            },
          },
        },
      });

      if (result.error) {
        setMessage(result.error.message);
      } else if (result.paymentIntent?.status === "succeeded") {
        setMessage("Pagamento riuscito! 🎉");
        onPaymentSuccess();
      }
    } catch (error) {
      console.error(error);
      setMessage("Errore durante il pagamento.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h5>Riepilogo ordine</h5>
      <ul className="list-group mb-3">
        <li className="list-group-item d-flex justify-content-between">
          <span className="text-secondary">Costo articolo</span>
          <strong className="green">0,00 €</strong>
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <span className="text-secondary">Spedizione</span>
          <strong className="green">3,99 €</strong>
        </li>
        <li className="list-group-item d-flex justify-content-between">
          <span className="text-secondary">Totale</span>
          <strong className="green">{totalAmount.toFixed(2)} €</strong>
        </li>
      </ul>

      <h5>Inserisci i dati della carta</h5>
      <CardElement options={{ hidePostalCode: true }} />

      <div className="d-flex justify-content-between mt-3 ">
        <button type="button" onClick={onBack} className="btn btn-secondary" disabled={loading}>
          Indietro
        </button>
        <button type="submit" disabled={!stripe || loading} className="btn btn-primary">
          {loading ? "Attendere..." : `Paga ${totalAmount.toFixed(2)} €`}
        </button>
      </div>

      {message && <div className="alert alert-info mt-3">{message}</div>}
    </form>
  );
};

const PaymentComponent = ({ onPaymentSuccess }) => {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const articleCost = 0.0;
  const shippingCost = 3.99;
  const totalAmount = articleCost + shippingCost;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    const form = e.target;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setStep(2);
  };

  return (
    <div className="payment-modal p-2">
      <Elements stripe={stripePromise}>
        {step === 1 && (
          <form onSubmit={handleNext}>
            <h5 className="modal-header m-0">Inserisci i tuoi dati di spedizione</h5>

            <div className="modal-body p-4">
              <input
                type="text"
                name="name"
                placeholder="Nome completo"
                value={userData.name}
                onChange={handleInputChange}
                className="form-control mb-2 "
                required
              />
              <input
                type="text"
                name="address"
                placeholder="Indirizzo"
                value={userData.address}
                onChange={handleInputChange}
                className="form-control mb-2"
                required
              />
              <input
                type="text"
                name="city"
                placeholder="Città"
                value={userData.city}
                onChange={handleInputChange}
                className="form-control mb-2"
                required
              />
              <input
                type="text"
                name="postalCode"
                placeholder="CAP"
                value={userData.postalCode}
                onChange={handleInputChange}
                className="form-control mb-3"
                required
              />
            </div>

            <div className="modal-footer">
              <button type="submit" className="btn btn-primary w-100">
                Continua al pagamento
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="payment-modal ">
            <CheckoutForm
              userData={userData}
              totalAmount={totalAmount}
              onPaymentSuccess={onPaymentSuccess}
              onBack={() => setStep(1)}
            />
          </div>
        )}
      </Elements>
    </div>
  );
};

export default PaymentComponent;
