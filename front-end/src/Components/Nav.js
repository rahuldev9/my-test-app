import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Nav() {
  const navigate = useNavigate();
  const [color, setColor] = useState(''); // State to track the current selected tab
  const [auth, setAuth] = useState(null); // State to track authentication status

  // Load data from localStorage when the component mounts
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setAuth(user); // Set the authenticated user if available
    }
  }, []);

  const current = (id) => {
    setColor(id); // Set the currently selected tab ID
    // window.location.reload();
  };

  // Uncomment and use this function to implement logout
  // const logout = () => {
  //   localStorage.clear();
  //   setAuth(null);
  //   navigate('/signup');
  // };

  return (
    <>
      <div
        style={{
          display: 'flex',
          background: '#0b090a',
          flexDirection: 'column',
          justifyContent: 'space-evenly',
          alignContent: 'center',
          alignItems: 'center',
          position: 'fixed',
          bottom: '0px',
          width: '100%',
          zIndex: '9999',
        }}
      >
        {auth ? (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <h4>
              <Link to="/home">
                <i
                  className="fa-solid fa-house"
                  onClick={() => current(1)}
                  style={{
                    color: color === 1 ? 'green' : 'white',
                    fontSize: '20px',
                  }}
                ></i>
              </Link>
            </h4>
            <h4>
              <Link to="/searchuser">
                <i
                  className="fa-solid fa-magnifying-glass"
                  onClick={() => current(5)}
                  style={{
                    color: color === 5 ? 'green' : 'white',
                    fontSize: '20px',
                  }}
                ></i>
              </Link>
            </h4>
            <h4>
              <Link to="/products">
                <i
                  className="fa-solid fa-list"
                  onClick={() => current(2)}
                  style={{
                    color: color === 2 ? 'green' : 'white',
                    fontSize: '20px',
                  }}
                ></i>
              </Link>
            </h4>
            <h4>
              <Link to="/add">
                <i
                  className="fa-regular fa-square-plus"
                  onClick={() => current(3)}
                  style={{
                    color: color === 3 ? 'green' : 'white',
                    fontSize: '20px',
                  }}
                ></i>
              </Link>
            </h4>
            <h4>
              <Link to="/profile">
                <i
                  className="fa-solid fa-user"
                  onClick={() => current(4)}
                  style={{
                    color: color === 4 ? 'green' : 'white',
                    fontSize: '20px',
                  }}
                ></i>
              </Link>
            </h4>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <h4>
              <Link to="/signup" style={{ color: 'white' }}>
                Signup
              </Link>
            </h4>
            <h4>
              <Link to="/login" style={{ color: 'white' }}>
                Login
              </Link>
            </h4>
          </div>
        )}
      </div>
    </>
  );
}

export default Nav;
