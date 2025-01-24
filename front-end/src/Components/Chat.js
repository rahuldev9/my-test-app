import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Chat() {
  const location = useLocation();
  const { productId, productName } = location.state || {};
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [popupMessageId, setPopupMessageId] = useState(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [editButtonVisible, setEditButtonVisible] = useState(false);
  const [replyingToMessageId, setReplyingToMessageId] = useState(undefined); // State for tracking replied message
  const [replyMessage, setReplyMessage] = useState(""); // State for reply message content
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (user) {
      setCurrentUserId(user._id);
    }
    if (productId) {
      loadMessages(productId, productName);
    }

    const interval = setInterval(() => {
      loadMessages(productId);
    }, 1000);

    return () => clearInterval(interval);
  }, [productId]);

  useEffect(() => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadMessages = async (productId) => {
    try {
      const result = await fetch(`https://my-test-app-api.onrender.com/message/${productId}`, {
        headers: {
          method: "GET",
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
      });

      if (!result.ok) {
        throw new Error("Failed to load messages");
      }

      const data = await result.json();
      setMessages(data);
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    // Trim the message to remove leading and trailing spaces
    const messageToSend = replyingToMessageId
      ? replyMessage.trim()
      : message.trim();

    // Check if the message is empty or contains only a username
    const isOnlyUsername = /^@\w+$/.test(messageToSend);

    if (!messageToSend || isOnlyUsername) {
      alert("Message cannot be empty or contain only a username.");
      return;
    }

    try {
      const newMessage = {
        userId: currentUserId,
        message: messageToSend,
        userName: user.name,
        replyingTo: replyingToMessageId || null, // Store the replied message ID
      };

      setMessages((prevMessages) => [...prevMessages, newMessage]);

      const result = await fetch(`https://my-test-app-api.onrender.com/message/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: `bearer ${JSON.parse(localStorage.getItem("token"))}`,
        },
        body: JSON.stringify(newMessage),
      });

      if (!result.ok) {
        throw new Error("Failed to send message");
      }

      setMessage("");
      setReplyMessage("");
      setEditButtonVisible(true);

      // Hide the edit button after 1 minute
      setTimeout(() => {
        setEditButtonVisible(false);
      }, 60000);

      setReplyingToMessageId(undefined); // Reset after sending the message
      setIsUserScrolling(false);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const result = await fetch(
        `https://my-test-app-api.onrender.com/message/${productId}/${messageId}`,
        {
          method: "DELETE",
          headers: {
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
        }
      );

      if (!result.ok) {
        throw new Error("Failed to delete message");
      }

      const data = await result.json();
      setMessages(data);
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };
  const handleEditMessageSubmit = async (e) => {
    e.preventDefault();
    if (!editMessage.trim()) return;

    try {
      const result = await fetch(
        `https://my-test-app-api.onrender.com/message/${productId}/${editingMessageId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `bearer ${JSON.parse(
              localStorage.getItem("token")
            )}`,
          },
          body: JSON.stringify({ message: editMessage }),
        }
      );

      if (!result.ok) {
        throw new Error("Failed to edit message");
      }

      const data = await result.json();
      setMessages(data);
      setEditingMessageId(null);
      setEditMessage("");
      setEditButtonVisible(false); // Hide the edit button after the action
    } catch (err) {
      console.error("Error editing message:", err);
    }
  };

  const handleReplyToMessage = (msg) => {
    setReplyingToMessageId(msg._id); // Store the replied message's ID
    setReplyMessage(`@${msg.name}: `); // Prefill reply with username
  };

  const goToProfile = (userId) => {
    if (user._id === userId) {
      navigate("/profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    setIsUserScrolling(scrollTop + clientHeight < scrollHeight - 50);
  };

  const handleLongPress = (messageId) => {
    setPopupMessageId(messageId);
  };

  const closePopup = () => {
    setPopupMessageId(null);
    setEditButtonVisible(false);
  };

  const renderMessageWithLinks = (messageText, replyingToMessage) => {
    const regex = /@([a-zA-Z0-9_]+)/g;
    return (
      <>
        {/* Removed the condition for rendering "Replying to" here */}
        {messageText.split(regex).map((part, index) => {
          if (index % 2 === 1) {
            const userId = messages.find((msg) => msg.name === part)?.userId; // Find userId for the username
            return (
              <span
                key={index}
                style={{ color: "#2196f3", cursor: "pointer" }}
                onClick={() => userId && goToProfile(userId)} // Navigate to profile using userId
              >
                @{part}
              </span>
            );
          } else {
            return part;
          }
        })}
      </>
    );
  };

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
      {productId ? <h1>{productName}</h1> : <p>No Classroom selected.</p>}
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
                  {renderMessageWithLinks(
                    msg.message,
                    messages.find((m) => m._id === msg.replyingTo)
                  )}
                </p>

                {/* Reply button */}
              </div>
              {msg.userId !== currentUserId && !msg.replyingTo && (
                <>
                  <button
                    class="replybutton"
                    onClick={() => handleReplyToMessage(msg)}
                    style={{paddingTop:'10px'}}
                  >
                    <i class="fa-solid fa-reply"></i>
                  </button>
                </>
              )}

              {/* Only show delete button if the message belongs to the current user */}
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
          <p>Start Sending messages</p>
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
          value={replyingToMessageId ? replyMessage : message}
          onInput={(e) => {
            e.target.style.height = "auto"; // Reset height to the initial value
            // e.target.style.height = ${e.target.scrollHeight}px; // Adjust height dynamically
          }}
          onChange={(e) =>
            replyingToMessageId
              ? setReplyMessage(e.target.value)
              : setMessage(e.target.value)
          }
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
            height: "20px",
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

export default Chat;
