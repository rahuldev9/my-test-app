import React, { useState } from 'react';
import { useParams,Link } from 'react-router-dom';

function ResetPassword() {
  const { token } = useParams(); // Get token from URL params
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async () => {
    if (!password) {
      setMessage('Please enter a new password');
      return;
    }

    try {
      let result = await fetch(`https://my-test-app-api.onrender.com/reset-password/${token}`, {
        method: 'POST',
        body: JSON.stringify({ password }), // Send the new password in the body
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Check if the response is successful
      if (!result.ok) {
        const errorData = await result.json(); // Get the error message
        setMessage(errorData.message || 'An error occurred while resetting password.');
        return;
      }

      // If successful, get the response message
      result = await result.json();
      setMessage(result.message || 'Password reset successful');

    } catch (error) {
      setMessage('An error occurred, please try again later.');
    }
  };

  return (
    <div>
      <h1>Reset Password</h1>
      <input
        type="password"
        placeholder="Enter new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleResetPassword}>Reset Password</button>
      {message && 
      <>
      <button><Link to='/login'>Back to login</Link></button>
      <p>{message}</p>
      </>}
      
    </div>
  );
}

export default ResetPassword;
