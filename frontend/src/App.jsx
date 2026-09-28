import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    shipping_address: "",
  });

  const [message, setMessage] = useState("");
  const [userFound, setUserFound] = useState(false);
  const [userName, setUserName] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const checkUser = async (email) => {
    if (!email) {
      setUserFound(false);
      setUserName("");
      setShowOtpModal(false);
      return;
    }

    setCheckingEmail(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/check-user?email=${encodeURIComponent(email)}`
      );

      const data = await response.json();

      if (data.registered) {
        setUserFound(true);
        setUserName(`${data.first_name} ${data.last_name}`);
        setShowOtpModal(true);
      } else {
        setUserFound(false);
        setUserName("");
        setShowOtpModal(false);
      }
    } catch (error) {
      console.error("Email recognition failed:", error);
      setUserFound(false);
      setUserName("");
      setShowOtpModal(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  const verifyOtp = async () => {
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Please enter a 6-digit OTP.");
      return;
    }

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            otp: otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.detail || "Invalid OTP.");
        return;
      }

      setLoggedIn(true);
      setUserName(`${data.first_name} ${data.last_name}`);
      setShowOtpModal(false);
      setOtp("");
    } catch (error) {
      console.error("OTP verification failed:", error);
      setOtpError("Could not connect to the server.");
    }
  };

  const handleSkip = () => {
    setShowOtpModal(false);
    setOtp("");
    setOtpError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Checkout failed");
      }

      setMessage("Checkout information saved successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="page">
      <div className="registration-card">
        <h1>Checkout</h1>

        <p className="subtitle">
          Enter your details to continue.
        </p>

        {loggedIn && (
          <div className="success">
            Welcome, {userName}!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(event) => {
              handleChange(event);
              checkUser(event.target.value);
            }}
            required
          />

          {checkingEmail && (
            <p>Checking email...</p>
          )}

          {userFound && !loggedIn && (
            <p className="success">
              Registered user detected: {userName}
            </p>
          )}

          <label>Phone</label>

          <input
            type="text"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          <label>Shipping Address</label>

          <textarea
            name="shipping_address"
            placeholder="Enter your shipping address"
            value={formData.shipping_address}
            onChange={handleChange}
            required
          />

          <button type="submit">
            Continue to Checkout
          </button>
        </form>

        {message && (
          <div className="success">
            {message}
          </div>
        )}
      </div>

      {showOtpModal && (
        <div className="modal-overlay">
          <div className="otp-modal">
            <h2>Welcome back!</h2>

            <p>
              We found your registered account.
            </p>

            <p>
              Enter your 6-digit OTP to log in.
            </p>

            <input
              type="text"
              maxLength="6"
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => {
                const value = event.target.value;

                if (/^\d*$/.test(value)) {
                  setOtp(value);
                }
              }}
            />

            {otpError && (
              <div className="error">
                {otpError}
              </div>
            )}

            <button
              type="button"
              onClick={verifyOtp}
            >
              Verify OTP
            </button>

            <button
              type="button"
              className="skip-button"
              onClick={handleSkip}
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;