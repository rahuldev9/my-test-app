import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import LoadingBar from "../LoadingBar"; // Import LoadingBar

function Addpost() {
  const [message, setMessage] = useState("");
  const [showFileInput, setShowFileInput] = useState(false);
  const [uploadedImage, setUploadedImage] = useState([]);
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [Caption, setCaption] = useState(''); // State to store the preview image
  // const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    fetchImages(); // Fetch images when component mounts
  }, []);

  
  const fetchImages = async () => {
    try {
      const response = await fetch(
        `http://localhost:4500/getposts/${user._id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Response Data:", data); // Log the entire response
        setUploadedImage(data.images || []); // Set the images data to state
      } 
    } catch (error) {
      console.error(error);
      
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
      setPreviewImage(reader.result); // Store base64 string for preview
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleupload = async (e) => {
    e.preventDefault();
    // setLoading(true);
    const userid = user._id;
    const username = user.name

    try {
      const response = await fetch(`http://localhost:4500/post/${userid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({
          imageData: image,
          username:username,
          Caption:Caption,
          
        }),
      });

      const result = await response.json();
      //   setLoading(false);
      setPreviewImage(null); // Reset preview after upload

      if (response.ok) {
        setMessage(result.message);
        fetchImages(); // Re-fetch images after successful upload
      } else {
        alert("Failed to upload image: " + result.message);
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred while uploading the image.");
    }
  };
  return (
    <div>
        <div>
            
        </div>
      <p>hello</p>
      <div>
      {previewImage && (
        <>
            <div>
              <h3>Image Preview:</h3>
              <img
                src={previewImage} // Base64 data URL for the preview
                alt="Preview"
                style={{ maxWidth: "300px", height: "400px" }}
              />
              <textarea
             name="textarea"
             id="textarea"
             cols="50"
             value={Caption}
             type="text"
             placeholder="Enter Caption"
             onChange={(e) => {
               setCaption(e.target.value);
             }}
             rows="8"
             style={{ width: "80%", display: "flex", alignSelf: "center",height:'50px',margin:'10px'}}
           ></textarea>
            </div>

           </>
          )}
          
      </div>
      {!showFileInput ? (
        <button
          onClick={() => setShowFileInput(true)}
          style={{ marginTop: "20px" }}
          className="inpdddut"
        >
          Change Profile
        </button>
      ) : (
        <form onSubmit={handleupload}>
          <div className="incontainer">
            <label htmlFor="arquivo">Choose a file:</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>
          <div>
            <button type="submit" className="inpdddut">
              Upload
            </button>
          </div>
          {message && <p>{message}</p>}
          
        </form>
        
      )}
      <div style={{height:'200px',backgroundColor:'black'}}>

      </div>
    </div>
  );
}

export default Addpost;
