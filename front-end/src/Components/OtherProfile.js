import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import LoadingBar from "../LoadingBar";

function Profile() {
  const { userId } = useParams(); // Get the userId from the URL
  const [userDetails, setUserDetails] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null); // Single image state
  const [followStatus, setFollowStatus] = useState("Follow"); // Initial button state
  const user = JSON.parse(localStorage.getItem("user"));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false); // Set loading to true initially
  const navigate = useNavigate();
  const [followersCount, setFollowersCount] = useState(0);
  const [showpopup, setpopup] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);


  const goToProfile = (userId) => {
    if (user._id === userId) {
      navigate("/profile");
      setpopup(false);
    } else {
      navigate(`/profile/${userId}`);
      setpopup(false);
    }
  };

  // Fetch images based on email
  const fetchImages = async (userId) => {
    try {
      const response = await fetch(`https://my-test-app-api.onrender.comimages/${userId}`, {
        method: "GET",
        headers: {
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });

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

  // Check follow status of the current user with the target user
  const checkFollowStatus = async (currentUserId, targetUserId) => {
    try {
      const response = await fetch(
        `https://my-test-app-api.onrender.com/follow-status/${currentUserId}/${targetUserId}`,
        {
          method: "GET",
          headers: {
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        }
      );
      const data = await response.json();
      setFollowStatus(data.status);
    } catch (err) {
      console.error("Error checking follow status:", err);
    }
  };

  // Handle sending follow request
  const sendFollowRequest = async () => {
    try {
      console.log(user._id, userDetails._id);
      const response = await fetch("https://my-test-app-api.onrender.com/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({
          fromUserId: user._id,
          toUserId: userDetails._id,
        }),
      });

      if (response.ok) {
        setFollowStatus("Requested"); // Change status to Requested
      } else {
        alert("Error sending follow request.");
      }
    } catch (err) {
      console.error("Error sending follow request:", err);
    }
  };

  const messagerequest = async () => {
    try {
      const response = await fetch(`https://my-test-app-api.onrender.com/message-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({
          fromUserId: user._id,
          toUserId: userDetails._id,
        }),
      });

      if (response.ok) {
        console.log(userDetails);
        navigate("/messagebox", { state: { userDetails } });
      } else {
        alert("Error sending follow request.");
      }
    } catch (err) {
      console.error("Error sending follow request:", err);
    }
  };

  // Handle unfollow action
  const unfollowUser = async () => {

    try {
     
      const response = await fetch("https://my-test-app-api.onrender.com/unfollow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({
          userId: user._id,
          targetUserId: userDetails._id,
        }),
      });
      if (response.ok) {
        setFollowStatus("Follow"); // Reset follow status to "Follow"
      } else {
        alert("Error unfollowing user.");
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  const fetchFollowStats = async (userId) => {
    try {
      const response = await fetch(
        `https://my-test-app-api.onrender.com/getotherfollows/${userId}`,
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
      } 
    } catch (error) {
      console.error("Error fetching follow stats:", error);
      
    }
  };
  const [mutualStatus, setMutualStatus] = useState([]);

  const getmutualusers = async (data) => {
    try {
      const response = await fetch("https://my-test-app-api.onrender.com/check-mutual", {
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
      console.error("Error checking mutual users:");
    }
  };

  // Fetch user details
  useEffect(() => {
    setLoading(true)
    const fetchUserDetails = async () => {
      try {
        
        const response = await fetch(`https://my-test-app-api.onrender.com/user/${userId}`, {
          method: "GET",
          headers: {
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        });
        const data = await response.json();
        setUserDetails(data);
        setLoading(false)
        // Fetch images for this user using their email after fetching user details
        if (data._id) {
          fetchImages(data._id);
        }

        // Check the follow status between the current user and the profile user
        const currentUserId = JSON.parse(localStorage.getItem("userId"));

        if (user._id) {
          checkFollowStatus(user._id, data._id);
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    if (userId) {
      fetchUserDetails();
      fetchFollowStats(userId);
    }
  }, [userId]);
  // const openmessagebox = (productId,productName) => {
  //   navigate("/chat", { state: { productId ,productName} });
  // };

  const getfollowers = async (getuser) => {
    setpopup(true);

    try {
      const result = await fetch(
        `https://my-test-app-api.onrender.com/getfollowers/${getuser}`,
        {
          headers: {
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        }
      );
      const data = await result.json();
      getmutualusers(data.followers || []);
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
        `https://my-test-app-api.onrender.com/getfollowers/${getuser}`,
        {
          headers: {
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        }
      );
      const data = await result.json();
      getmutualusers(data.following || []);
      // setProducts(data.followers || []); // Set products after data is fetched
      setProducts(data.following || []);
      // setLoading(false); // Stop loading once data is fetched
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };
  const closepopip = () => {
    setpopup(false);
  };
  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 style={{ textAlign: "center" }}>User Profile</h1>
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
                  <p>No profile!</p>
                )}
              </div>
              <div className="procard-info">
                <span>@{userDetails.name}</span>
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
                    onClick={() => getfollowers(userDetails._id)}
                    style={{ color: "black", cursor: "pointer" }}
                  >
                    Followers
                  </p>
                </div>
                <div>
                  <h3 style={{ color: "black" }}>{followingCount}</h3>
                  <p
                    onClick={() => getfollowering(userDetails._id)}
                    style={{ color: "black", cursor: "pointer" }}
                  >
                    Following
                  </p>
                </div>
              </div>
              <div>
                {/* Render Follow Button */}
                {followStatus === "Follow" && (
                  <button
                    onClick={sendFollowRequest}
                    style={{
                      backgroundColor: "#2196f3",
                      color: "white",
                      padding: "10px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Follow
                  </button>
                )}
                {followStatus === "Requested" && (
                  <>
                    <button
                      onClick={unfollowUser}
                      style={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Requested
                    </button>
                  </>
                )}
                {followStatus === "Following" && (
                  <>
                    <button
                      onClick={unfollowUser}
                      style={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Unfollow
                    </button>
                    <button
                      onClick={messagerequest}
                      style={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        padding: "10px",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Message
                    </button>
                  </>
                )}
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
                            height: "70px",
                            width: "100%",
                            display: "flex",
                            flexDirection: "row",
                            justifyContent:'space-around',
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
                            style={{ textAlign: "start",width:'100px' }}
                            onClick={() => goToProfile(item._id)}
                          >
                            @{item.name}
                          </p>
                          {mutualUser && ( // Render mutual status if it exists
                            <div>
                              {mutualUser.isFollower === "yes" && ( // Show button only if the user is a follower
                                <button
                                  style={{
                                    backgroundColor: "#2196f3",
                                    color: "white",
                                    padding: "10px",
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
