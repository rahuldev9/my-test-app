import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import LoadingBar from "../LoadingBar"; // Import LoadingBar

function Login() {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loginFailed, setLoginFailed] = useState(false); // New state variable
  const [loading, setLoading] = useState(false); // State for loading
  const navigate = useNavigate();
  
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleLogin = async () => {
    if (!email || !password) {
      setError(true);
      return false;
    }

    setLoading(true); // Start loading before the API request

    try {
      let result = await fetch(`${apiUrl}/login`, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: { "Content-Type": "application/json" },
      });

      result = await result.json();
      
      if (result.auth) {
        // If login is successful
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", JSON.stringify(result.auth));
        setLoading(false); // Stop loading
        navigate("/home");
        window.location.reload();
      } else {
        // If login fails (invalid credentials)
        setLoginFailed(true);
        setLoading(false); // Stop loading
      }
    } catch (error) {
      // Handle any errors that occur during the fetch operation
      setError("An error occurred while logging in. Please try again.");
      setLoginFailed(true);
      setLoading(false); // Stop loading
      console.error("Error during login:", error);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignContent: "center",
        flexDirection: "column",
      }}
    >
      <div style={{
          display: "flex",
          flexDirection: 'column',
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: 'flex-start',
        }}>
      {loading && <LoadingBar />}

      <form class="form">
    <p id="heading">Login</p>
    <div class="field">
    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M13.106 7.222c0-2.967-2.249-5.032-5.482-5.032-3.35 0-5.646 2.318-5.646 5.702 0 3.493 2.235 5.708 5.762 5.708.862 0 1.689-.123 2.304-.335v-.862c-.43.199-1.354.328-2.29.328-2.926 0-4.813-1.88-4.813-4.798 0-2.844 1.921-4.881 4.594-4.881 2.735 0 4.608 1.688 4.608 4.156 0 1.682-.554 2.769-1.416 2.769-.492 0-.772-.28-.772-.76V5.206H8.923v.834h-.11c-.266-.595-.881-.964-1.6-.964-1.4 0-2.378 1.162-2.378 2.823 0 1.737.957 2.906 2.379 2.906.8 0 1.415-.39 1.709-1.087h.11c.081.67.703 1.148 1.503 1.148 1.572 0 2.57-1.415 2.57-3.643zm-7.177.704c0-1.197.54-1.907 1.456-1.907.93 0 1.524.738 1.524 1.907S8.308 9.84 7.371 9.84c-.895 0-1.442-.725-1.442-1.914z"></path>
    </svg>
      <input  class="input-field" value={email}
          type="email"
          placeholder="Enter email"
          onChange={(e) => setEmail(e.target.value)} ></input>
    </div>
    {error && !email && (
          <span
            style={{
              color: "red",
              alignSelf:'center',
              right: "45px",
              bottom: "10px",
            }}
          >
            Enter a valid email
          </span>
        )}
    <div class="field">
    <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
    </svg>
      <input value={password}
          type="password"
          placeholder="Enter password"
          class="input-field"
          onChange={(e) => setPassword(e.target.value)}></input>

    </div>
    {error && !password && (
          <span
            style={{
              color: "red",
              alignSelf:'center',
              right: "35px",
              bottom: "10px",
            }}
          >
            Enter a valid password
          </span>
        )}
    <div class="btn">
    <button class="button1" type="button" onClick={handleLogin}>Login</button>
    <button class="button2" > <Link to="/signup" style={{ textDecoration: "none",color:'white' }}>
            Sign up
          </Link></button>
    </div>
    <button class="button3"> <Link to="/forgot-password" style={{ textDecoration: "none",color:'white' }}>
            Forget Password
          </Link></button>
        
          {loginFailed && (
          <span
            style={{
              color: "red",
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
          Please check your email & password.
          </span>
        )}
</form>
      </div>
      


    </div>
  );
}


export default Login;
