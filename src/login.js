//login.js
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useEffect } from "react";
const config = require("./Apiconfig");

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState("email");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [customer_name, setcustomer_name] = useState("");
  const [customer_addr_1, setcustomer_addr_1] = useState("");
  const [customer_addr_2, setcustomer_addr_2] = useState("");
  const [customer_area, setcustomer_area] = useState("");
  const [customer_state, setcustomer_state] = useState("");
  const [customer_country, setcustomer_country] = useState("");
  const [customer_email_id, setcustomer_email_id] = useState("");
  const [customer_mobile_no, setcustomer_mobile_no] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
const [phoneNumber, setPhoneNumber] = useState("");
const [phoneOtp, setPhoneOtp] = useState(["", "", "", "", "", ""]);

useEffect(() => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");
  if (isLoggedIn) {
    navigate("/home", { replace: true });
  }
}, []);

  const navigate = useNavigate();

  // ✅ ALWAYS SUCCESS LOGIN
  const doLogin = () => {
  setIsLoading(true);
  setTimeout(() => {
    sessionStorage.setItem("isLoggedIn", "true");
    navigate("/home", { replace: true });
  }, 500);
};

  const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z._\-0-9]+@[A-Za-z]+\.[a-z]{2,4}$/;
    return emailRegex.test(email);
  };

  const handleInsert = async () => {
    if (
      !customer_name ||
      !customer_addr_1 ||
      !customer_area ||
      !customer_state ||
      !customer_country ||
      !customer_email_id ||
      !customer_mobile_no
    ) {
      toast.warning("Please fill all required fields");
      return;
    }

    if (!validateEmail(customer_email_id)) {
      toast.warning("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/addCustomerDetData`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: customer_name,
            customer_addr_1: customer_addr_1,
            customer_addr_2: customer_addr_2,
            customer_area: customer_area,
            customer_state: customer_state,
            customer_country: customer_country,
            customer_email_id: customer_email_id,
            customer_mobile_no: customer_mobile_no,
            tempstr1: 'Application',
            company_code: 'YJKT'
          }),
        }
      );

      if (response.ok) {
        toast.success("Customer created successfully", {
          onClose: () => setShowCreate(false),
        });
      } else {
        const err = await response.json();
        toast.warning(err.message || "Insert failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error inserting customer data");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch(`${config.apiBaseUrl}/VerifyCustomer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ customer_email_id: email }),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ SAVE CUSTOMER PROFILE HERE
      sessionStorage.setItem(
        "customerProfile",
        JSON.stringify(data.customer)
      );

      toast.success(data.message);
      setIsEmailOtpSent(true);
    } else {
      toast.warning(data.message || "Insert failed");
    }
  } catch (error) {
    console.error(error);
    toast.error("Error inserting customer data");
  } finally {
    setIsLoading(false); // 👈 small fix (was setLoading)
  }
};



  const handleVerifyOtp = async () => {
    const enteredOtp = otpValues.join("");
    setIsLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/verifyOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_email_id: email,
          enteredOtp: enteredOtp,
        }),
      });

      const data = await response.json();

      // ✅ SUCCESS = status 200
      if (response.ok) {
        sessionStorage.setItem("isLoggedIn", "true");

        // ✅ Navigate to home
        navigate("/home", { replace: true });
      } else {
        toast.warning(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error while verifying OTP");
    } finally {
      setIsLoading(false);
    }
  };

//   const generateRecaptcha = () => {
//   if (!window.recaptchaVerifier) {
//     window.recaptchaVerifier = new RecaptchaVerifier(
//       auth,
//       "recaptcha-container",
//       {
//         size: "invisible",
//       }
//     );
//   }
// };

//   const handleSendPhoneOtp = async (e) => {
//   e.preventDefault();

//   if (!phoneNumber || phoneNumber.length !== 10) {
//     toast.warning("Enter valid mobile number");
//     return;
//   }

//   try {
//     setIsLoading(true);
//     generateRecaptcha();

//     const appVerifier = window.recaptchaVerifier;

//     const confirmationResult = await signInWithPhoneNumber(
//       auth,
//       "+91" + phoneNumber,
//       appVerifier
//     );

//     window.confirmationResult = confirmationResult;
//     setIsOtpSent(true);
//     toast.success("OTP sent successfully");
//   } catch (error) {
//     console.error(error);
//     toast.error(error.message);
//   } finally {
//     setIsLoading(false);
//   }
// };


// const handleVerifyPhoneOtp = async () => {
//   try {
//     const otp = phoneOtp.join("");

//     await window.confirmationResult.confirm(otp);

//     sessionStorage.setItem("isLoggedIn", "true");
//     navigate("/home", { replace: true });

//   } catch (error) {
//     toast.error("Invalid OTP");
//   }
// };


  return (
    <>
      <ToastContainer />
      <div className="container min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card p-4 shadow" style={{ width: "400px" }}>
          <h4 className="text-center mb-3">Shop Login</h4>

          <div className="btn-group w-100 mb-3">
            <button
              className={`btn ${authMethod === "email" ? "btn-danger" : "btn-light"
                }`}
              onClick={() => {
                setAuthMethod("email");
                setIsOtpSent(false);
              }}
            >
              Email
            </button>

            <button
              className={`btn ${authMethod === "phone" ? "btn-danger" : "btn-light"
                }`}
              onClick={() => {
                setAuthMethod("phone");
                setIsOtpSent(false);
              }}
            >
              Phone
            </button>
          </div>

          {authMethod === "email" ?
            <>
              {/*---------------- EMAIL VIEW ----------------*/}
              {!isEmailOtpSent ? (
                <form
                  onSubmit={handleSendOtp}
                >
                  <input
                    type="email"
                    className="form-control mb-3 rounded-pill"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="btn btn-danger w-100 rounded-pill mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? "Checking..." : "Sign In"}
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <h6>Enter 4-Digit OTP</h6>
                  <div className="d-flex justify-content-center gap-2 mb-3">
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}   // ✅ ADD THIS
                        type="text"
                        maxLength="1"
                        className="form-control text-center"
                        style={{ width: "45px", height: "45px", fontSize: "20px" }}
                        value={otpValues[index] || ""}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, ""); // allow only digits
                          const newOtp = [...otpValues];
                          newOtp[index] = value;
                          setOtpValues(newOtp);

                          // ✅ Move focus safely
                          if (value && index < 3) {
                            const nextInput = document.getElementById(`otp-${index + 1}`);
                            if (nextInput) nextInput.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                  <button
                    className="btn btn-danger w-100 rounded-pill mb-2"
                    onClick={handleVerifyOtp}
                  >
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </button>
                  <button
                    className="btn btn-link btn-sm text-decoration-none"
                    onClick={() => setIsEmailOtpSent(false)}
                  >
                    Back to Email
                  </button>
                </div>
              )}

              {!isEmailOtpSent && (
                <div className="text-center mt-3">
                  <span className="text-muted me-2">If you don’t have an account?</span>
                  <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => setShowCreate(true)}
                  >
                    Create
                  </button>
                </div>
              )}
            </>
            :
            <>
  {!isOtpSent ? (
    <form >
      <input
        className="form-control mb-3 rounded-pill"
        placeholder="Mobile Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />

      <button
        className="btn btn-danger w-100 rounded-pill"
        disabled={isLoading}
      >
        {isLoading ? "Sending..." : "Send OTP"}
      </button>
    </form>
  ) : (
    <div className="text-center">
      <h6>Enter OTP</h6>

      <div className="d-flex justify-content-center gap-2 mb-3">
        {[0,1,2,3,4,5].map((i) => (
          <input
            key={i}
            type="text"
            maxLength="1"
            className="form-control text-center"
            style={{ width: "40px" }}
            value={phoneOtp[i]}
            onChange={(e) => {
              const arr = [...phoneOtp];
              arr[i] = e.target.value.replace(/\D/g, "");
              setPhoneOtp(arr);
            }}
          />
        ))}
      </div>

      <button
        className="btn btn-danger w-100 rounded-pill"
      >
        Verify & Login
      </button>
    </div>
  )}
</>
          }
        </div>


        {/*---------------- CREATE ACCOUNT MODAL ----------------*/}
        <div
          className="modal show"
          style={{
            display: showCreate ? "block" : "none",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Customer Account</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowCreate(false)}
                />
              </div>

              <div className="modal-body">
                <input className="form-control mb-2 rounded-pill" placeholder="Customer Name" value={customer_name} onChange={(e) => setcustomer_name(e.target.value)} />
                <input className="form-control mb-2 rounded-pill" placeholder="Address Line 1" value={customer_addr_1} onChange={(e) => setcustomer_addr_1(e.target.value)} />
                <input className="form-control mb-2 rounded-pill" placeholder="Address Line 2" value={customer_addr_2} onChange={(e) => setcustomer_addr_2(e.target.value)} />
                <input className="form-control mb-2 rounded-pill" placeholder="Area" value={customer_area} onChange={(e) => setcustomer_area(e.target.value)} />
                <input className="form-control mb-2 rounded-pill" placeholder="State" value={customer_state} onChange={(e) => setcustomer_state(e.target.value)} />
                <input className="form-control mb-2 rounded-pill" placeholder="Country" value={customer_country} onChange={(e) => setcustomer_country(e.target.value)} />
                <input type="email" className="form-control mb-2 rounded-pill" placeholder="Email ID" value={customer_email_id} onChange={(e) => setcustomer_email_id(e.target.value)} />
                <input className="form-control mb-2 rounded-pill" placeholder="Mobile Number" value={customer_mobile_no} onChange={(e) => setcustomer_mobile_no(e.target.value)} />
              </div>

              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleInsert}>
                  {loading ? "Saving..." : "Create Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </>
  );
}