import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Messagebox() {
  const location = useLocation();
  const { userDetails } = location.state || {}; // Retrieve userDetails from state
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const messagesEndRef = useRef(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const messagesContainerRef = useRef(null);
  const [popupMessageId, setPopupMessageId] = useState(null);
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null); 
  useEffect(() => {
    if (user) {
      setCurrentUserId(user._id);
    }
    if (userDetails) {
      fetchMessages(userDetails._id); // Fetch messages for this user
    }
    if (userDetails) {
      fetchImages(userDetails._id);
    }
    const interval = setInterval(() => {
      fetchMessages(userDetails);
    }, 4000);
    return () => clearInterval(interval);
  }, [userDetails]);

  useEffect(() => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async (userId) => {
    try {
      const response = await fetch(`https://my-test-app-api.onrender.com/message-request`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify({
          fromUserId: user._id,
          toUserId: userId,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to load messages");
      } // Set messages if available
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      alert("Message cannot be empty.");
      return;
    }

    try {
      const newMessage = {
        userId: user._id,
        message: trimmedMessage,
        userName: user.name,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      const result = await fetch(
        `https://my-test-app-api.onrender.com/message-box/${userDetails._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
          body: JSON.stringify(newMessage),
        }
      );

      if (result.ok) {
        const updatedMessages = await result.json();
        setMessages(updatedMessages); // Update with the new list of messages
        setMessage(""); // Clear input field
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:");
    }
  };

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    setIsUserScrolling(scrollTop + clientHeight < scrollHeight - 50);
  };

  const closePopup = () => {
    setPopupMessageId(null);
    // setEditButtonVisible(false);
  };

  const handleLongPress = (messageId) => {
    setPopupMessageId(messageId);
  };
  const deleteMessage = async (messageId) => {
    if (!messageId || !userDetails._id) {
      console.error("Invalid messageId or userDetails not found");
      return;
    }

    try {
      const response = await fetch(
        `https://my-test-app-api.onrender.com/message-box/${userDetails._id}/${messageId}`,
        {
          method: "DELETE",
          headers: {
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete message");
      }

      // Update the local messages state with the updated list
      const updatedMessages = await response.json();
      setMessages(updatedMessages);
    } catch (err) {
      console.error("Error deleting message:", err.message);
    }
  };
  const goToProfile = (userId) => {
    if (user._id === userId) {
      navigate("/profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };
  const fetchImages = async () => {
    try {
      const response = await fetch(
        `https://my-test-app-api.onrender.com/images/${userDetails._id}`,{
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

  if (!userDetails) {
    return <div>No user details provided.</div>;
  }

  return (
    <div style={{ padding: "10px" }}>
      <button
        onClick={() => navigate(-1)} // Navigate to the previous page
        style={{
          width: "50px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        <i class="fa-solid fa-arrow-left"></i>
      </button>
      <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-start'}}>
      <div
        className="proimage"
        style={{ height: "50px", width: "50px",}}
      >
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
      <h2 style={{alignSelf:'end'}}>@{userDetails.name}</h2>
      </div>
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          marginBottom: "20px",
          border: "1px solid #ccc",
          borderRadius: "5px",
          padding: "10px",
          maxHeight: "400px",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",

          height: "700px",
        }}
      >
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg._id}
              className="message"
              style={{
                display: "flex",
                justifyContent:
                  msg.userId === currentUserId ? "flex-end" : "flex-start",
                margin: "5px 0",
              }}
            >
              <div
                style={{
                  maxWidth: "60%",
                  padding: "10px",
                  borderRadius: "10px",
                  backgroundColor:
                    msg.userId === currentUserId ? "#dcf8c6" : "#353535",
                  textAlign: "left",
                  boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
                  position: "relative",
                }}
                onDoubleClick={() => {
                  msg.longPressTimeout = setTimeout(() => {
                    handleLongPress(msg._id);
                  }, 100);
                }}
              >
                {/* {msg.replyingTo && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#888",
                      marginBottom: "5px",
                    }}
                  >
                    <strong>Replying to:</strong>{" "}
                    {messages.find((m) => m._id === msg.replyingTo)?.message}
                  </div>
                )} */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "5px",
                  }}
                >
                  {/* <p>{msg.userId}</p> */}

                  <div
                    onClick={() => goToProfile(msg.userId)}
                    style={{
                      cursor: "pointer",
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: "#2196f3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: "10px",
                    }}
                  >
                    
                    {msg.name ? msg.name.charAt(0).toUpperCase() : ""}
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: "bold",
                      color: msg.userId === currentUserId ? "#1a1a1a" : "white",
                    }}
                  >
                    {msg.userId === currentUserId ? "You" : msg.name}
                  </p>
                </div>

                <p
                  style={{
                    margin: "5px 0 0 0",
                    color: msg.userId === currentUserId ? "#1a1a1a" : "white",
                  }}
                >
                  {/* {renderMessageWithLinks(
                    msg.message,
                    messages.find((m) => m._id === msg.replyingTo)
                  )} */}
                </p>
                <p
                  style={{
                    margin: "5px 0 0 0",
                    color: msg.userId === currentUserId ? "#1a1a1a" : "white",
                  }}
                >
                  {msg.message}
                </p>
                {/* Reply button */}
              </div>
              {msg.userId === currentUserId && popupMessageId === msg._id && (
                <div
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "white",
                    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px",
                    padding: "20px",
                    zIndex: 1000,
                  }}
                >
                  <p style={{ color: "black" }}>What would you like to do?</p>
                  <p>{}</p>
                  {/* {editButtonVisible && (
                    <button
                      onClick={() => {
                        setEditingMessageId(popupMessageId);
                        setEditMessage(
                          messages.find((msg) => msg._id === popupMessageId)
                            .message
                        );
                        closePopup();
                      }}
                      style={{
                        backgroundColor: "#2196f3",
                        color: "white",
                        padding: "10px",
                        marginRight: "10px",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                  )} */}
                  <button
                    onClick={() => {
                      deleteMessage(popupMessageId);
                      closePopup();
                    }}
                    style={{
                      backgroundColor: "#f44336",
                      color: "white",
                      padding: "10px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={closePopup}
                    style={{
                      backgroundColor: "#999",
                      color: "white",
                      padding: "10px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                      marginLeft: "10px",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No messages yet.</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
          gap: "10px",
          backgroundColor: "#0b090a",
          position: "fixed",
          bottom: "0px",
          height: "70px",
          width: "95%",
          zIndex: "9999",
        }}
      >
        <textarea
          placeholder="Write a message"
          value={message}
          onInput={(e) => {
            e.target.style.height = "auto"; // Reset height to the initial value
            e.target.style.height = `${e.target.scrollHeight}px`; // Adjust height dynamically
          }}
          onChange={(e) => setMessage(e.target.value)}
          style={{
            flex: 1,
            padding: "10px",
            margin: "10px",
            color: "white",
            backgroundColor: "rgb(28,28,30)",
            borderRadius: "5px",
            border: "none",
            overflowY: "auto",
            resize: "none",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        />
        <button
          type="submit"
          style={{
            backgroundColor: "#2196f3",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Messagebox;
