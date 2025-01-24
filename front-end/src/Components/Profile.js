import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoadingBar from "../LoadingBar"; // Import LoadingBar

function Profile({ toggleColor }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFileInput, setShowFileInput] = useState(false);
  const [image, setImage] = useState(null);
  const [products, setProducts] = useState([]);
  const [Posts, setposts] = useState([]);
  const [uploadedImage, setUploadedImage] = useState(null); // Single image state
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const [showpopup, setpopup] = useState(false);

  const gotopostpage=()=>{
    navigate('/addpost')
  }
  useEffect(() => {
    fetchImages(); // Fetch images when component mounts
    fetchFollowStats(); // Fetch follow stats when component mounts
    fetchposts();
  }, []);
  const fetchposts = async () => {
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
        console.log(data.images)
        setposts(data.images || []); // Set the images data to state
      } 
    } catch (error) {
      console.error(error);
      alert("An error occurred while fetching images.");
    }
  };

  const goToProfile = (userId) => {
    if (user._id === userId) {
      navigate("/profile");
      setpopup(false);
    } else {
      navigate(`/profile/${userId}`);
      setpopup(false);
    }
  };
  const fetchFollowStats = async () => {
    try {
      const response = await fetch(
        `http://localhost:4500/getfollow/${user._id}`,
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
        setFollowersCount(data.followersCount);
        setFollowingCount(data.followingCount);
      } else {
        alert("Failed to fetch follow stats.");
      }
    } catch (error) {
      console.error("Error fetching follow stats:", error);
      alert("An error occurred while fetching follow stats.");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/signup");
    window.location.reload();
  };

  const gotonotify = () => {
    navigate("/notify");
  };
  const gotopersonalchat = () => {
    navigate("/personalchat");
  };

  // Convert image to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleupload = async (e) => {
    e.preventDefault();
    setLoading(true);
    const userid = user._id;
    try {
      const response = await fetch("http://localhost:4500/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({
          data: image,
          Id: userid, // Ensure this matches the backend
        }),
      });

      const result = await response.json();
      setLoading(false);

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

  // Fetch images (single image)
  const fetchImages = async () => {
    try {
      const response = await fetch(`http://localhost:4500/images/${user._id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUploadedImage(data.data); // Assuming 'data' contains the image object
      } else {
        alert("Failed to fetch image.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while fetching image.");
    }
  };
  const getfollowers = async (getuser) => {
    setpopup(true);
    try {
      const result = await fetch(
        `http://localhost:4500/getfollowers/${getuser}`,
        {
          headers: {
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        }
      );
      const data = await result.json();
      getmutualusers(data.following || [])
      setProducts(data.followers || []); // Set products after data is fetched
      // setProducts(data.following || []);
      // setLoading(false); // Stop loading once data is fetched
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };
  const getfollowering = async (getuser) => {
    setpopup(true);
    try {
      const result = await fetch(
        `http://localhost:4500/getfollowers/${getuser}`,
        {
          headers: {
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        }
      );
      const data = await result.json();

      // setProducts(data.followers || []); // Set products after data is fetched
      setProducts(data.following || []);
      getmutualusers(data.following || [])
      // setLoading(false); // Stop loading once data is fetched
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };
  const closepopip = () => {
    setpopup(false);
  };  const [mutualStatus, setMutualStatus] = useState([]);

  const getmutualusers = async (data) => {
    try {
      const response = await fetch("http://localhost:4500/check-mutual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user._id,
          ids: data.map((item) => item._id),
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Map each ID to its mutual follower/following status
        const mutualStatusResult = data.map((user) => ({
          id: user._id,
          isFollower: result.mutualFollowers.includes(user._id) ? "yes" : "no",
          isFollowing: result.mutualFollowing.includes(user._id) ? "yes" : "no",
        }));

        setMutualStatus(mutualStatusResult); // Update state with the result
      } else {
        console.error("Failed to check mutual users.");
      }
    } catch (error) {
      console.error("Error checking mutual users:", error);
    }
  };

  return (
    <div>
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
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-start",
              marginTop: "20px",
            }}
          >
            <div
              style={{
                height: "50px",
                width: "100%",
                display: "flex",
                flexDirection: "row-reverse",
              }}
            >
              <div
                style={{
                  margin: "10px",
                  display: "flex",
                  flexDirection: "row-reverse",
                  width: "20%",
                  justifyContent: "space-evenly",
                }}
              >
                <i
                  className="fa-solid fa-bell"
                  onClick={gotonotify}
                  style={{ fontSize: "30px", cursor: "pointer" }}
                ></i>
                <i
                  class="fa-solid fa-message"
                  onClick={gotopersonalchat}
                  style={{ fontSize: "30px", cursor: "pointer" }}
                ></i>
              </div>
            </div>
            {user ? (
              <div>
                <div className="procard">
                  <div className="proimage">
                    {uploadedImage ? (
                      <div style={{ marginBottom: "20px" }}>
                        <img
                          src={uploadedImage || "logo192.png"} // Display the uploaded image
                          alt="Uploaded"
                          type="file" 
                          accept="image/*, video/*" 
                          style={{
                            height: "100px",
                            width: "100px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      </div>
                    ) : (
                      <img
                          src={"logo192.png"} // Display the uploaded image
                          style={{
                            height: "100px",
                            width: "100px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                    )}
                  </div>
                  <div className="procard-info">
                    <span>@{user.name}</span>
                    {/* <p>{user.email}</p> */}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-around",
                      width: "100%",
                    }}
                  >
                    <div>
                      <h3 style={{ color: "black" }}>{followersCount}</h3>
                      <p
                        style={{ color: "black", cursor: "pointer" }}
                        onClick={() => getfollowers(user._id)}
                      >
                        Followers
                      </p>
                    </div>
                    <div>
                      <h3 style={{ color: "black" }}>{followingCount}</h3>
                      <p
                        style={{ color: "black", cursor: "pointer" }}
                        onClick={() => getfollowering(user._id)}
                      >
                        Following
                      </p>
                    </div>
                  </div>
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
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>
                    <div>
                      <button type="submit" className="inpdddut">
                        Upload
                      </button>
                    </div>
                    {message && <p>{message}</p>}
                  </form>
                )}
                <button onClick={()=>gotopostpage()}
                    style={{ marginTop: "20px" }}
                    className="inpdddut"
                  >
                    Add Post
                  </button>
                <button className="buttonsend" onClick={logout}>
                  <h4>
                    <Link to="/signup">Logout</Link>
                  </h4>
                </button>
              </div>
            ) : (
              <p>No user logged in</p>
            )}
            <div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                }}
              >
                <input
                  type="checkbox"
                  className="theme-checkbox"
                  onClick={toggleColor}
                ></input>
              </div>
            </div>
          </div>
          <div
            style={{
              display: showpopup ? "flex" : "none",
              width: "100%",
              height: "100%",
            }}
          >
            <div style={styles.overlay}>
              <div style={styles.popup}>
                <div
                  style={{ display: "flex", flexDirection: "column-reverse" }}
                >
                  <button className="exit-popbutton">
                    <svg
                      height="20px"
                      viewBox="0 0 384 512"
                      onClick={closepopip}
                    >
                      <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"></path>
                    </svg>
                  </button>
                </div>
                <div>
                {products.length > 0 ? (
                    products.map((item) => {
                      const mutualUser = mutualStatus.find(
                        (user) => user.id === item._id
                      );

                      return (
                        <div
                          className="card red"
                          style={{
                            margin: "2px",
                            height: "auto",
                            width: "auto",
                            display: "flex",
                            flexDirection: "row",
                            flexWrap:'wrap',
                            // justifyContent:'space-around',
                            maxHeight: "250px",
                            overflow: "hidden",
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                          key={item._id}
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
                          <p
                            style={{ textAlign: "start",width:'100px'}}
                            onClick={() => goToProfile(item._id)}
                          >
                            @{item.name}
                          </p>
                          {mutualUser && ( // Render mutual status if it exists
                            <div >
                              {mutualUser.isFollower === "yes" && ( // Show button only if the user is a follower
                                <button
                                  style={{
                                    backgroundColor: "#2196f3",
                                    color: "white",
                                    
                                    borderRadius: "5px",
                                    border: "none",
                                    cursor: "pointer",
                                  }}
                                  onClick={() =>
                                    navigate("/messagebox", {
                                      state: { userDetails: item },
                                    })
                                  }
                                >
                                  Message
                                </button>
                              )}
                            </div>
                          )}
                          <div className="card-content"></div>
                        </div>
                      );
                    })
                  ) : (
                    <h1 style={{ color: "black" }}>No Results</h1>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {Posts.length === 0 ? (
          <p>No images found.</p>
        ) : (
          Posts.map((image, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <img
                src={image.data} // Base64 data URL for the image
                alt={`User Image ${index + 1}`}
                style={{ maxWidth: "100%", height: "auto" }}
              />
              <p>Uploaded on: {new Date(image.createdAt).toLocaleString()}</p>
            </div>
          ))
        )}
    </div>
  );
}

export default Profile;
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
