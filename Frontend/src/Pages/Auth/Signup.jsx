import { useState } from "react";
import { NavLink } from "react-router-dom";
import "../../Style/signup.css";
import { API_BASE_URL } from "../../config/api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/;
    if (!usernameRegex.test(trimmedUsername)) {
      toast.error(
        "Username must be 3-20 characters long, start with a letter, and contain only letters, numbers, or underscores."
      );
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const signupRes = await fetch(`${API_BASE_URL}/signup/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password,
        }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok || !signupData.success) {
        toast.error(signupData.msg || "Signup failed.");
        setLoading(false);
        return;
      }

      const loginRes = await fetch(`${API_BASE_URL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUsername,
          password,
        }),
      });

      const loginData = await loginRes.json();

      if (!loginData.success) {
        toast.error("Signup successful, but login failed.");
        setLoading(false);
        navigate("/Login")
        return;
      }

      localStorage.setItem("access_token", loginData.tokens.access);
      localStorage.setItem("refresh_token", loginData.tokens.refresh);
      localStorage.setItem("user", JSON.stringify(loginData.user));

      toast.success("Account created successfully!");

      if (loginData.user.profile_completed) {
        navigate("/Home");
      } else {
        navigate("/Profile_create", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2>SmartZen</h2>

        <div className="signup-field">
          <label>Username</label>
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="signup-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="signup-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="signup-field">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          className="signup-btn"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="signup-login-text">
          Already have an account? <NavLink to="/Login">Login</NavLink>
        </p>
      </div>
    </div>
  );
};

export default Signup;
