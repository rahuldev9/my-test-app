import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingBar from "../LoadingBar"; // Import the LoadingBar component

function Searchuser() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Set loading to true initially
  const [hideusers, showusers] = useState(true);
  const [usersearch, setUserSearch] = useState(""); // State to hold the search query
  const user = JSON.parse(localStorage.getItem("user"));
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const [showpopup, setpopup] = useState(false);
  const [likedByUsers, setLikedByUsers] = useState([]);
  const [comment, setcomment] = useState('');

  const calculateTimeElapsed = (createdAt) => {
    const now = new Date();
    const createdTime = new Date(createdAt);
    const differenceInSeconds = Math.floor((now - createdTime) / 1000);

    if (differenceInSeconds < 60) {
      return `${differenceInSeconds} second${
        differenceInSeconds > 1 ? "s" : ""
      } ago`;
    } else if (differenceInSeconds < 3600) {
      const minutes = Math.floor(differenceInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else {
      const hours = Math.floor(differenceInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }
  };
  const formatTimeTo12Hour = (dateString) => {
    const date = new Date(dateString);
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  const toggleLike = async (productId) => {
    try {
      const userId = JSON.parse(localStorage.getItem("user"))._id; // Get logged-in user ID
      console.log(productId);
      const result = await fetch(
        `http://localhost:4500/like-post/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await result.json();
      fetchprofileimages(user.name)
      // Update the product's like count, likedBy list, and check if user likes the product
      setPosts(
        posts.map((product) =>
          product._id === productId
            ? { ...product, likes: data.likes, likedBy: data.likedBy }
            : product
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  useEffect(() => {
    getProducts(); // Fetch products when component mounts
    fetchAllPosts();
  }, []);
  const fetchprofileimages=async(username)=>{
    try {
      const response = await fetch(
        `http://localhost:4500/search-profile/${username}`
      );
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Something went wrong.");
      }
      const data = await response.json();
      console.log(data)
    } catch (err) {
      console.error("Error fetching user details:", err);
      alert("An error occurred while fetching user details.");
    }
  }
  const fetchAllPosts = async () => {
    try {
      const response = await fetch("http://localhost:4500/getposts", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        const formattedData = data
          .map((notification) => ({
            ...notification,
            createdAt: new Date(notification.createdAt), // Ensure createdAt is a Date object
            timeElapsed: calculateTimeElapsed(notification.createdAt),
          }))
          .sort((a, b) => b.createdAt - a.createdAt); // Sort by createdAt (newest first) the images in the state
        setPosts(formattedData);
      } else {
        alert("Failed to fetch images.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false once the request completes
    }
  };

  const getProducts = async () => {
    try {
      const result = await fetch("http://localhost:4500/usernames", {
        headers: {
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });
      const data = await result.json();
      console.log(data);

      setProducts(data); // Set products after data is fetched
      setLoading(false); // Stop loading once data is fetched
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const goToProfile = (userId) => {

    if (user.name === userId) {
      
      navigate("/profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const searchHandle = async (event) => {
    let key = event.target.value;
    setUserSearch(key); // Update the search query in state
    showusers(false);

    // If input is empty, show an alert and stop searching
    if (!key) {
      showusers(true);
      return;
    }

    try {
      const result = await fetch(`http://localhost:4500/searchuser/${key}`, {
        headers: {
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });
      const data = await result.json();
      if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Error searching users:", err);
    }
  };
  const toggleLikedBy = (index) => {
    setLikedByUsers(posts[index].likedBy); // Set the likedByUsers state
    setpopup(true); // Open the popup
  };

  const closePopup = () => {
    setpopup(false); // Close the popup
    setLikedByUsers([]); // Clear the likedByUsers state
  };

  const getuser = async (username) => {
    try {
      const response = await fetch(
        `http://localhost:4500/search-user/${username}`
      );
      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Something went wrong.");
      }
      const data = await response.json();

      if (user._id === data.userId) {
      
        navigate("/profile");
      } else {
        navigate(`/profile/${data.userId}`);
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      alert("An error occurred while fetching user details.");
    }
  };
  // const closePopup = () => {
  //   setpopup(false);
  //   setLikedByUsers([]);
  // };
  const addcoment = async (postid) => {
    // e.preventDefault();
    // setLoading(true);
    const userid = user._id;
    const username = user.name

    try {
      const response = await fetch(`http://localhost:4500/addcomment/${postid}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({
          comment:comment,
        }),
      });

      const result = await response.json();
      //   setLoading(false);

      if (response.ok) {
      } 
    } catch (error) {
      console.error(error);

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
              display: hideusers ? "none" : "flex",
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
                  onClick={() => goToProfile(item._id)}
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
          <div
            style={{
              display: hideusers ? "flex" : "none",
              flexDirection: "column",
            }}
          >
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <div key={index}>
                  <div class="postcard shadow" style={{ margin: "5px" }}>
                    <div
                      style={{
                        position: "relative",
                        width: "300px",
                        height: "auto",
                      }}
                    >
                      <img
                        src={post.data}
                        alt={`Image ${index}`}
                        style={{ width: "300px", height: "300px" }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)", // Fixed transform
                          width: "100%",
                          maxHeight: "50px",
                          backgroundColor: "transparent",
                          color: "black",
                          textAlign: "center", // Centered text horizontally
                        }}
                      >
                        <p
                          style={{
                            margin: "10px",
                            cursor: "pointer",
                            textAlign: "left",
                            position: "relative",
                            top: "-120px",
                          }}
                          onClick={() => goToProfile(post.userid)}
                        >
                          @{post.username}
                        </p>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "80%",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                        }}
                      >
                        <div
                          // className="card red"
                          style={{
                            margin: "20px",

                            height: "auto",
                            width: "90%",
                            display: "flex",
                            flexWrap: "wrap",
                            // maxHeight: "250px",
                          }}
                          key={post._id}
                        >
                          <p>{post.caption}</p>
                          <div className="card-content"></div>
                        </div>
                        <button
                          className="like"
                          onClick={() => toggleLike(post._id)}
                          style={{ alignSelf: "baseline", paddingTop: "50px" }}
                        >
                          <i
                            className="fa-solid fa-heart"
                            style={{
                              color: post.likedBy.includes(
                                JSON.parse(localStorage.getItem("user")).name
                              )
                                ? "#c1121f" // Red color when liked
                                : "#343a40", // Black color when not liked
                            }}
                          ></i>
                        </button>
                        <p
                          style={{
                            margin: "0px",
                            alignSelf: "start",
                            paddingLeft: "20px",
                            cursor: "pointer",
                          }}
                          onClick={() => toggleLikedBy(index)}
                        >
                          {post.showLikedBy ? `${post.likes}` : `${post.likes}`}
                        </p>
                        <textarea
             name="textarea"
             id="textarea"
             cols="50"
             value={comment}
             type="text"
             placeholder="Comment post"
             onChange={(e) => {
               setcomment(e.target.value);
             }}
             rows="8"
             style={{ width: "80%", display: "flex", alignSelf: "center",height:'50px',margin:'10px'}}
           ></textarea>
           <button onClick={()=>addcoment(post._id)}>Add</button>
                        {/* <p className="card-para" style={{margin:'10px'}}>{post.time}</p> */}
                        <span
                          style={{
                            color: "gray",
                            fontSize: "14px",
                            margin: "10px",
                          }}
                        >
                          {post.timeElapsed} {/* Display time elapsed */}
                        </span>
                      </div>
                      {/* <h4
                          style={{
                            margin: "10px 0",
                            cursor: "pointer",
                            color: "#007bff",
                          }}
                          onClick={() => toggleLikedBy(index)}
                        >
                          Liked By: {post.showLikedBy ? "▲" : "▼"}
                        </h4> */}
                      {showpopup && (
                        <div style={styles.overlay}>
                          <div style={styles.popup}>
                            <div style={{ display: "flex", flexDirection: "column-reverse" }}>
                            <button className="exit-popbutton">
                              <svg
                                height="20px"
                                viewBox="0 0 384 512"
                                onClick={closePopup}
                              >
                                <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                              </svg>
                            </button>
                            </div>
                            <div>
                            {likedByUsers.length > 0 ? (
                              likedByUsers.map((user, i) => (
                                <div className="card red"
                                style={{
                                  margin: "2px",
                                  height: "70px",
                                  width: "100%",
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent:'space-around',
                                  maxHeight: "250px",
                                  overflow: "hidden",
                                  scrollbarWidth: "none",
                                  msOverflowStyle: "none",
                                }}>
                                <p
                                  key={i}
                                  onClick={() => getuser(user)} // Navigate to the user's profile
                                  style={{ cursor: "pointer" }}
                                >
                                  @{user}
                                </p>
                                </div>
                              ))
                            ) : (
                              <p>No likes yet.</p>
                            )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No images found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Searchuser;
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  popup: {
    background: "#fff",
    padding: "20px",
    height: "500px",
    width: "300px",
    borderRadius: "8px",
    textAlign: "center",
    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
    flexDirection: "column",
    margin: "10px",

    overflow: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
  },
};
