import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingBar from '../LoadingBar'; // Import LoadingBar component

function AddProduct() {
  const [message, setMessage] = useState('');
  const [Caption, setCaption] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const navigate = useNavigate();

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert to 12-hour format
    return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
  };

  const addProduct = async () => {
    if (!message.trim() || !Caption.trim()) {
      setError(true); // Show error if message is empty
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const formData = {
      message,
      Caption,
      userid: user._id,
      name: user.name,
      time: getCurrentTime(),
    };

    setLoading(true); // Start loading

    try {
      const result = await fetch('http://localhost:4500/add-product', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json',
          authorization: `bearer ${JSON.parse(localStorage.getItem('token'))}`,
        },
      });

      if (result.ok) {
        const data = await result.json();
        // console.log(data);
        navigate('/products'); // Navigate to products page after success
      } else {
        // console.error('Error adding product');
        setError(true); // Set error if the request failed
      }
    } catch (error) {
      // console.error('Error:', error);
      setError(true); // Set error if there's an exception
    } finally {
      
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      {loading ? (
        // Show LoadingBar while the product is being added
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1000,
          }}
        >
          <LoadingBar />
        </div>
      ) : (
        <>
          <h2>Add Classroom</h2>
          <div className="form-container" style={{ width: '90%' }}>
            <form className="form" onSubmit={addProduct}>
              <div className="form-group">
                <label htmlFor="textarea"></label>
                <textarea
                  name="textarea"
                  id="textarea"
                  cols="50"
                  value={message}
                  type="text"
                  placeholder="Enter Classroom Name"
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setError(false); // Reset error when user starts typing
                  }}
                  rows="8"
                  style={{ width: "80%", display: "flex", alignSelf: "center",height:'50px',margin:'10px' }}
                ></textarea>
                <textarea
                  name="textarea"
                  id="textarea"
                  cols="50"
                  value={Caption}
                  type="text"
                  placeholder="Enter Caption"
                  onChange={(e) => {
                    setCaption(e.target.value);
                    setError(false); // Reset error when user starts typing
                  }}
                  rows="8"
                  style={{ width: "80%", display: "flex", alignSelf: "center",height:'50px',margin:'10px'}}
                ></textarea>
              </div>
              <button className="form-submit-btn" type="submit">
                Submit
              </button>
              {error && <span style={{ color: 'red', marginBottom: '10px' }}>Message is empty</span>}
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default AddProduct;
