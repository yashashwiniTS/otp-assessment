import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://otp-assessment.onrender.com";

function App() {
  // -----------------------------
  // REGISTRATION
  // -----------------------------

  const [registrationData, setRegistrationData] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });

  const [registrationMessage, setRegistrationMessage] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // -----------------------------
  // CHECKOUT
  // -----------------------------

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    shipping_address: "",
  });

  const [message, setMessage] = useState("");
  const [userFound, setUserFound] = useState(false);
  const [userName, setUserName] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  // -----------------------------
  // OTP LOGIN
  // -----------------------------

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  // -----------------------------
  // EMAIL VALIDATION
  // -----------------------------

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // -----------------------------
  // REGISTRATION INPUT
  // -----------------------------

  const handleRegistrationChange = (event) => {
    setRegistrationData({
      ...registrationData,
      [event.target.name]: event.target.value,
    });
  };

  // -----------------------------
  // REGISTER USER
  // -----------------------------

  const handleRegistration = async (event) => {
    event.preventDefault();

    setRegistrationMessage("");
    setGeneratedOtp("");

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        setRegistrationMessage(
          data.detail || "Registration failed."
        );
        return;
      }

      setGeneratedOtp(data.otp);

      setRegistrationMessage(
        "Registration successful! Your OTP is shown below."
      );
    } catch (error) {
      console.error("Registration failed:", error);

      setRegistrationMessage(
        "Could not connect to the server."
      );
    }
  };

  // -----------------------------
  // CHECKOUT INPUT
  // -----------------------------

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  // -----------------------------
  // CHECK IF EMAIL IS REGISTERED
  // -----------------------------

  const checkUser = async (email) => {
    if (!isValidEmail(email)) {
      setUserFound(false);
      setUserName("");
      setShowOtpModal(false);
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);

    try {
      const response = await fetch(
        `${API_URL}/check-user?email=${encodeURIComponent(email)}`
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

  // -----------------------------
  // REAL-TIME EMAIL RECOGNITION
  // -----------------------------

  useEffect(() => {
    const email = formData.email.trim();

    setUserFound(false);
    setUserName("");

    if (!email || !isValidEmail(email)) {
      setShowOtpModal(false);
      setCheckingEmail(false);
      return;
    }

    const timer = setTimeout(() => {
      checkUser(email);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // -----------------------------
  // VERIFY OTP
  // -----------------------------

  const verifyOtp = async () => {
    setOtpError("");

    if (otp.length !== 6) {
      setOtpError("Please enter a 6-digit OTP.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/verify-otp`,
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

      setOtpError(
        "Could not connect to the server."
      );
    }
  };

  // -----------------------------
  // SKIP OTP
  // -----------------------------

  const handleSkip = () => {
    setShowOtpModal(false);
    setOtp("");
    setOtpError("");
  };

  // -----------------------------
  // CHECKOUT SUBMIT
  // -----------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/checkout`,
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
        throw new Error(
          data.detail || "Checkout failed"
        );
      }

      setMessage(
        "Checkout information saved successfully."
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  // -----------------------------
  // PAGE
  // -----------------------------

  return (
    <div className="page">

      <div className="main-container">

        {/* REGISTRATION SECTION */}

        <div className="registration-card">

          <h1>OTP Login / Registration</h1>

          <p className="subtitle">
            Register your account using your email.
          </p>

          <form onSubmit={handleRegistration}>

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={registrationData.email}
              onChange={handleRegistrationChange}
              required
            />

            <label>First Name</label>

            <input
              type="text"
              name="first_name"
              placeholder="Enter your first name"
              value={registrationData.first_name}
              onChange={handleRegistrationChange}
              required
            />

            <label>Last Name</label>

            <input
              type="text"
              name="last_name"
              placeholder="Enter your last name"
              value={registrationData.last_name}
              onChange={handleRegistrationChange}
              required
            />

            <button type="submit">
              Register
            </button>

          </form>

          {registrationMessage && (
            <div
              className={
                generatedOtp
                  ? "success"
                  : "error"
              }
            >
              {registrationMessage}
            </div>
          )}

          {generatedOtp && (
            <div className="otp-display">

              <p>Your 6-digit OTP is:</p>

              <strong>
                {generatedOtp}
              </strong>

              <p>
                Keep this code for login.
              </p>

            </div>
          )}

        </div>


        {/* CHECKOUT SECTION */}

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
              onChange={handleChange}
              required
            />

            {formData.email &&
              !isValidEmail(formData.email) && (
                <p className="error-text">
                  Please enter a valid email address.
                </p>
              )}

            {checkingEmail && (
              <p>
                Checking email...
              </p>
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

      </div>


      {/* OTP MODAL */}

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