import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingBar from "../LoadingBar"; // Import the LoadingBar component


function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Set loading to true initially
  
  const navigate = useNavigate();

  useEffect(() => {
    getProducts(); // Fetch products when component mounts
    
  }, []);

  const openChat = (productId,productName) => {
    navigate("/chat", { state: { productId ,productName} });
  };
  

  const getProducts = async () => {
    try {
      const result = await fetch("http://localhost:4500/home", {
        headers: {
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });
      
      const data = await result.json();
      setProducts(data); // Set products after data is fetched
      setLoading(false); // Stop loading once data is fetched
    } catch (err) {
      console.error("Error fetching products:", err);
      // setLoading(false); // Stop loading even if there's an error
    }
    
  };

  // Toggle like/dislike for a product
  const toggleLike = async (productId) => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"))._id; // Get logged-in user ID
      const username = JSON.parse(localStorage.getItem("user")).name; // Get logged-in username

      const result = await fetch(`http://localhost:4500/like-product/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await result.json();
      // Update the product's like count, likedBy list, and check if user likes the product
      setProducts(
        products.map((product) =>
          product._id === productId
            ? { ...product, likes: data.likes, likedBy: data.likedBy }
            : product
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const searchHandle = async (event) => {
    let key = event.target.value;
    if (key) {
      try {
        const result = await fetch(`http://localhost:4500/search/${key}`, {
          headers: {
            authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
          },
        });
        const data = await result.json();
        if (data) {
          setProducts(data);
        }
      } catch (err) {
        // console.error("Error searching products:", err);
      }
    } else {
      getProducts(); // Re-fetch all products when search is cleared
    }
  };

  return (
    <div className="cards" style={{ textAlign: "center", marginTop: "50px" }}>
      {loading ? (
        // When loading is true, show the LoadingBar centered
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
          <input
            id="query"
            className="input"
            type="search"
            placeholder="Search..."
            name="searchbar"
            onChange={searchHandle}
            style={{ width: "70%" }}
          />

          <div
            className="cards"
            style={{
              display: "flex",
              flexDirection:'row',
              alignItems: "center",
              flexWrap: 'wrap',
              justifyContent: 'space-around',
              
            }}
          >
            
            {products.length > 0 ? (
              products.map((item) => (
                <div
                  className="card red"
                  style={{
                    margin: "10px",
                    
                    height: "auto",
                    width: "250px",
                    maxHeight: "250px",
                    overflow: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  key={item._id}
                >
                  <h1 style={{textAlign:'left',margin:'10px'}}>{item.message}</h1>
                  <p style={{textAlign:'left',margin:'10px'}}>{item.Caption}</p>
                  <p style={{textAlign:'left',margin:'10px'}}>@{item.name}</p>
                  <div className="card-content">
                  <button
                      className="like"
                      onClick={() => toggleLike(item._id)}
                      style={{alignSelf:'baseline'}}
                    >
                      <i
                        className="fa-solid fa-heart"
                        style={{
                          color: item.likedBy.includes(
                            JSON.parse(localStorage.getItem("user")).name
                          )
                            ? "#c1121f" // Red color when liked
                            : "#000000", // Black color when not liked
                        }}
                      ></i>
                      <p style={{margin:'5px'}}>{item.likes}</p>
                      
                    </button>
                    <button onClick={() => openChat(item._id,item.message)} className="buttonsend">Enter
                    <i class="fa-solid fa-person-through-window" style={{fontSize:'15px',margin:'5px'}}></i></button>
                    <p className="card-para">{item.time}</p>
                  </div>
                  
                  
                </div>
              ))
            ) : (

              <h1>No Results</h1>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Home;
