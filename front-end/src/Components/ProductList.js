import React, { useState, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import LoadingBar from "../LoadingBar"; // Import LoadingBar
import DeletePopup from "./DeletePopup";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [showPopup, setShowPopup] = useState(false); // Popup visibility state
  const [productToDelete, setProductToDelete] = useState(null); // Track product to delete
  const [uploadedImage, setUploadedImage] = useState(null); // Single image state
  const navigate = useNavigate();
  useEffect(() => {
    getProducts(); // Fetch products when the component mounts
  }, []);

  const fetchImages = async (userid) => {
    try {
      const response = await fetch(
        `https://my-test-app-api.onrender.com/images/${userid}`,{
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUploadedImage(data.data);
      } else {
        alert("Failed to fetch images.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while fetching images.");
    }
  };
  const getProducts = async () => {
    const userid = JSON.parse(localStorage.getItem("user"))._id;
    
    let result = await fetch(`https://my-test-app-api.onrender.com/products/${userid}`, {
      headers: {
        authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
      },
    });

    result = await result.json();
    if (userid) {
      fetchImages(userid);
    }

    setLoading(false); // Set loading to false when data is fetched
    setProducts(result); // Set products data
  };

  const deleteProduct = async (id) => {
    let result = await fetch(`https://my-test-app-api.onrender.com/product/${id}`, {
      method: "DELETE",
      headers: {
        authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
      },
    });
    result = await result.json();

    if (result) {
      setShowPopup(false); // Close the popup after deletion
      getProducts(); // Refresh the product list
    }
  };

  const handleOpenPopup = (productId) => {
    setProductToDelete(productId); // Set the product ID to be deleted
    setShowPopup(true); // Show the popup
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup
    setProductToDelete(null); // Reset the product to delete
  };

  const toggleLikedBy = (index) => {
    // Update the showLikedBy state for the specific product
    setProducts((prevProducts) =>
      prevProducts.map((product, i) =>
        i === index
          ? { ...product, showLikedBy: !product.showLikedBy }
          : product
      )
    );
  };
  const getuser = async (like) => {
  
    try {
      const response = await fetch(`https://my-test-app-api.onrender.com/search-user/${like}`);
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Something went wrong.");
      }
      const data = await response.json();
     
      navigate(`/profile/${data.userId}`);
      
    } catch (err) {
      console.error(err);
      alert("An error occurred while fetching images.");

    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {loading ? (
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
          <h1>My Posts</h1>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {products.length > 0 ? (
              products.map((item, index) => (
                <div
                  style={{
                    border: "1px solid #ccc",
                    margin: "10px",
                    padding: "10px",
                    textAlign: "center",
                    width: "80%",
                  }}
                  key={index}
                >
                  {showPopup && productToDelete === item._id && (
                    <DeletePopup
                      onClose={handleClosePopup}
                      onDelete={deleteProduct}
                      itemId={item._id}
                    />
                  )}
                  <div className="main" style={{ width: "100%" }}>
                    <div
                      className="card"
                      style={{
                        width: "100%",
                        height: "100%",
                        maxHeight: "250px",
                        overflow: "auto",
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <div
                        className="card_content"
                        style={{ display: "flex", flexDirection: "column" }}
                      >
                        <h1>{item.message}</h1>
                        <p>{item.Caption}</p>
                      </div>
                    </div>
                    <div className="data">
                      <div className="img">
                      {uploadedImage ? (
                    <div style={{ marginBottom: "20px" }}>
                      <img
                        src={uploadedImage} // Display the uploaded image
                        alt="Uploaded"
                        style={{
                          height: "50px",
                          width: "50px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    </div>
                  ) : (
                    <p>No profile image uploaded yet.</p>
                  )}
                      </div>
                      <div className="text">
                        <div className="text_s">@{item.name}</div>
                      </div>
                    </div>
                    <div className="btns">
                      <div className="likes">
                        <svg className="likes_svg" viewBox="-2 0 105 92">
                          <path d="M85.24 2.67C72.29-3.08 55.75 2.67 50 14.9 44.25 2 27-3.8 14.76 2.67 1.1 9.14-5.37 25 5.42 44.38 13.33 58 27 68.11 50 86.81 73.73 68.11 87.39 58 94.58 44.38c10.79-18.7 4.32-35.24-9.34-41.71Z"></path>
                        </svg>
                        <span className="likes_text">{item.likes}</span>
                      </div>
                      <button
                        className="card-button primary"
                        onClick={() => handleOpenPopup(item._id)}
                        style={{
                          height: "30px",
                          background: "#FF3333",
                          color: "white",
                          border: "none",
                          width: "50px",
                        }}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                      <button
                        className="card-button primary"
                        style={{
                          height: "30px",
                          background: "#FF3333",
                          color: "white",
                          border: "none",
                          width: "50px",
                        }}
                      >
                        <Link
                          to={`/update/${item._id}`}
                          style={{ textDecoration: "none", color: "white" }}
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </Link>
                      </button>

                      <div
                        style={{
                          position: "relative",
                          display: showPopup ? "none" : "block",
                        }}
                      >
                        <h4
                          style={{
                            margin: "10px 0",
                            cursor: "pointer",
                            color: "#007bff",
                          }}
                          onClick={() => toggleLikedBy(index)}
                        >
                          Liked By: {item.showLikedBy ? "▲" : "▼"}
                        </h4>
                        {item.showLikedBy && (
                          <ul
                            style={{
                              position: "absolute", // Position dropdown absolutely
                              top: "100%", // Position below the toggle
                              left: 0,
                              width: "200px", // Fixed width for the dropdown
                              zIndex: 1000, // High z-index to ensure visibility
                              paddingLeft: "20px",
                              textAlign: "left",

                              backgroundColor: "black",
                              color: "white",
                              borderRadius: "5px",
                              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                              maxHeight: "100px", // Set max height for scrolling
                              overflowY: "scroll",
                              scrollbarWidth: "none",
                              msOverflowStyle: "none",
                            }}
                          >
                            {item.likedBy.length > 0 ? (
                              item.likedBy.map((like, i) => (
                                  <p onClick={()=>getuser(like)} style={{cursor:'pointer'}}>@{like}</p>
                              ))
                            ) : (
                              <p>No likes yet.</p>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <h1>No Results</h1>
            )}
          </div>
          <div style={{ height: "150px" }}>
            <button onClick={getProducts}>Refresh</button>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductList;
