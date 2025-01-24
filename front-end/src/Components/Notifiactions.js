import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `https://my-test-app-api.onrender.com/notifications/${user._id}`,
        {
          headers: {
            authorization: `Bearer ${JSON.parse(localStorage.getItem("token"))}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        const formattedNotifications = data.map((notification) => ({
          ...notification,
          createdAt: formatTimeTo12Hour(notification.createdAt),
          timeElapsed: calculateTimeElapsed(notification.createdAt),
        }));

        setNotifications(formattedNotifications);
      } else {
        alert("Failed to fetch notifications.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while fetching notifications.");
    }
  };

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
  useEffect(() => {
    fetchNotifications();
  }, []);
  const formatTimeTo12Hour = (dateString) => {
    const date = new Date(dateString);
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    return new Intl.DateTimeFormat("en-US", options).format(date);
  };

  // Accept follow request
  const acceptFollowRequest = async (notificationId, followRequestId) => {
    try {
      const response = await fetch(
        "http://localhost:4500/notifications/accept-follow",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
          body: JSON.stringify({ notificationId, followRequestId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification._id !== notificationId
          )
        );
      } else {
        alert("Failed to accept follow request.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while accepting the follow request.");
    }
  };

  // Reject follow request
  const rejectFollowRequest = async (notificationId, followRequestId) => {
    try {
      const response = await fetch(
        "http://localhost:4500/notifications/reject-follow",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
          body: JSON.stringify({ notificationId, followRequestId }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setNotifications((prevNotifications) =>
          prevNotifications.filter(
            (notification) => notification._id !== notificationId
          )
        );
      } else {
        alert("Failed to reject follow request.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while rejecting the follow request.");
    }
  };
  const goToProfile = (userId) => {
    if (user._id === userId) {
      navigate("/profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <>
    <h3>Notifications</h3>
    <div style={{padding:'20px',display:'flex',flexDirection:'column-reverse' }}>
     

      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification._id}
            // className={notification.read ? "read" : "unread"}
            style={{display:'flex',flexDirection:'row'}}
            
          >
            <div class="notifycard">
              <div
                className="proimage"
                style={{ height: "50px", width: "50px"}}
                onClick={()=>goToProfile(notification.from)}
              >
                    <div style={{ marginBottom: "20px" }}>
                      <img
                        
                        src={notification.data || "logo192.png"} // Display the uploaded image
                        alt="Uploaded"
                        style={{
                          height: "50px",
                          width: "50px",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    </div>

              </div>
              <div class="textBox">
                <div class="textContent">
                  <p class="h1">{notification.message}</p>

                  <span style={{ color: "gray", fontSize: "14px" }}>
                    {notification.timeElapsed} {/* Display time elapsed */}
                  </span>
                  {/* <p>{notification.createdAt}</p> */}
                </div>
                <button
                  onClick={() =>
                    acceptFollowRequest(
                      notification._id,
                      notification.followRequestId
                    )
                  }
                  style={{
                    backgroundColor: "#2196f3",
                    color: "white",
                    padding: "10px",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Accept
                </button>
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
                    rejectFollowRequest(
                      notification._id,
                      notification.followRequestId
                    )
                  }
                >
                  Reject
                </button>
                {/* <p class="p">@{notificatione}</p>.nam */}
                <div></div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No notifications available.</p>
      )}
    </div>
    </>
  );
}

export default Notifications;
