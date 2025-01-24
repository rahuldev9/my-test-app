import React, { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import LoadingBar from "../LoadingBar"; // Import the LoadingBar component

function PersonalChat() {
    const [userDetails, setUserDetails] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); // Set loading to true initially
    const [usersearch, setUserSearch] = useState(""); // State to hold the search query
    const user = JSON.parse(localStorage.getItem("user"));
    
    const navigate = useNavigate();
  
    useEffect(() => {
      getProducts(); // Fetch products when component mounts
      
    }, []);
  
    const getProducts = async () => {
      try {
        
        const result = await fetch(`https://my-test-app-api.onrender.com/myfollowers/${user._id}`, {
          headers: {
            authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
          },
        });
        const data = await result.json();
        
        setProducts(data.followers || []); // Set products after data is fetched
        setProducts(data.following || []);
        setLoading(false); // Stop loading once data is fetched
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
  
    // const goToProfile = (userId) => {
    //   if (user._id === userId) {
    //     navigate("/profile");
    //   } else {
    //     navigate(`/profile/${userId}`);
    //   }
    // };
  
    const searchHandle = async (event) => {
      let key = event.target.value;
      setUserSearch(key); // Update the search query in state
      if(!key){
        getProducts()
      }
  
      try {
        const result = await fetch(`https://my-test-app-api.onrender.com/personalchat/${user._id}/${key}`, {
          headers: {
            authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
          },
        });
        const data = await result.json();
        if (data) {
          setProducts(data.followers);
        }
      } catch (err) {
        console.error("Error searching users:", err);
      }
    };
    const fetchUserDetails = async (userId) => {
        try {
          const response = await fetch(`https://my-test-app-api.onrender.com/user/${userId}`, {
            method: "GET",
            headers: {
              authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
            },
          });
      
          if (response.ok) {
            const data = await response.json();
            setUserDetails(data);
            
            navigate("/messagebox", { state: { userDetails: data } });
          }
        } catch (err) {
          console.error("Error fetching user details:", err);
        }
      };
      
  return (
    <div className="cards" style={{ textAlign: "center", marginTop: "50px" }}>
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
          <input
            id="query"
            className="input"
            type="search"
            placeholder="Search..."
            value={usersearch}
            name="searchbar"
            onChange={searchHandle}
            style={{ width: "70%" }}
          />

          <div
            className="cards"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "space-around",
             
            }}
          >
            {products.length > 0 ? (
              products.map((item) => (
                <div
                  className="card red"
                  style={{
                    margin: "2px",
                    height: "60px",
                    width: "250px",
                    display: "flex",
                    flexDirection: "row",
                    maxHeight: "250px",
                    overflow: "auto",
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                  }}
                  key={item._id}
                  onClick={() =>fetchUserDetails(item._id)}
                >
                  <img
                    src={item.data || "logo192.png"} // Display the uploaded image
                    alt="Uploaded"
                    style={{
                      height: "50px",
                      width: "50px",
                      objectFit: "cover",
                      borderRadius: "50%",
                      margin: "5px",
                    }}
                  />
                  <p style={{ textAlign: "start", margin: "10px" }}>
                    @{item.name}
                  </p>
                  <div className="card-content"></div>
                </div>
              ))
            ) : (
              <h1>No Results</h1>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default PersonalChat
