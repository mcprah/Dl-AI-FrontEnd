import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import Logo from "./assets/header-logo-blue.svg";
import AddBtn from "./assets/add-30.png";
import home from "./assets/user-profile-filled-svgrepo-com.svg";
import saved from "./assets/logout-svgrepo-com.svg";
import sendBtn from "./assets/send.svg";
import userIcon from "./assets/user-icon.png";
import AILogo from "./assets/loooogo.png";
import LandingPage from "./LandingPage";
import Sidebar from "./Sidebar";

function TypewriterEffect({ text }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, 20); // Adjust this value to change the speed of the typewriter effect

      return () => clearTimeout(timer);
    }
  }, [currentIndex, text]);

  return <span>{displayedText}</span>;
}

function MainPage() {
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [isRealTime, setIsRealTime] = useState(false); // For controlling typewriter effect
  const [messages, setMessages] = useState([]);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();
  const [refreshSidebar, setRefreshSidebar] = useState(false); // For refreshing sidebar

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleNewChatClick = async () => {
    setLoading(true);
    setMessages([]);

    try {
      const userauth = JSON.parse(localStorage.getItem("userauth"));
      const userPseudoId = userauth?.user_pseudo_id;

      if (!userPseudoId) {
        alert("User is not authenticated");
        setLoading(false);
        return;
      }

      const response = await fetch(" https://backend-615425956737.us-central1.run.app/discovery/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userPseudoId }),
      });

      if (response.ok) {
        const data = await response.json();
        const sessionName = data.name;
        userauth.sessionId = sessionName;
        localStorage.setItem("userauth", JSON.stringify(userauth));

        setLoading(false);
        setShowNewChat(true);
      } else {
        alert("Failed to create a new session");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error starting new chat session:", error);
      setLoading(false);
    }
  };

  const handleSessionClick = async (sessionId) => {
    setLoading(true);
    setIsRealTime(false); // Disable typewriter effect for session history
    setMessages([]);

    try {
      const userauth = JSON.parse(localStorage.getItem("userauth"));

      // Update the active sessionId
      userauth.sessionId = sessionId;
      localStorage.setItem("userauth", JSON.stringify(userauth));
      // Extract the last part of the sessionId
      const parsedSessionId = sessionId?.split("/").pop();
      // Fetch the messages for the selected session
      const response = await fetch(
        ` https://backend-615425956737.us-central1.run.app/discovery/session/?name=${parsedSessionId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Parse the turns and add them to the messages state
        const parsedMessages = data.turns
          .map((turn) => {
            return [
              {
                type: "user",
                text: turn.query.text,
              },
              {
                type: "bot",
                text: turn.answerDetails.answerText,
              },
            ];
          })
          .flat();

        setMessages(parsedMessages);
        setShowNewChat(true);
      } else {
        alert("Failed to load session messages");
      }
    } catch (error) {
      console.error("Error loading session messages:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSend = async () => {
    if (!input.trim()) return;

    const userauth = JSON.parse(localStorage.getItem("userauth"));
    const sessionId = userauth?.sessionId;

    if (!sessionId) {
      alert("Session ID is missing. Please start a new chat.");
      return;
    }

    const newMessage = {
      type: "user",
      text: input.trim(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "bot", text: "", isLoading: true },
    ]);
    setIsRealTime(true); // Enable typewriter effect for real-time AI response
    try {
      const response = await fetch(" https://backend-615425956737.us-central1.run.app/discovery/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: newMessage.text,
          session_id: sessionId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          type: "bot",
          text: data.answer.answerText,
          isLoading: false,
        };

        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          aiMessage,
        ]);
        setRefreshSidebar((prevRefresh) => !prevRefresh);
      } else {
        alert("Failed to get a response from the AI");
        setMessages((prevMessages) => prevMessages.slice(0, -1));
      }
    } catch (error) {
      console.error("Error during chat request:", error);
      setMessages((prevMessages) => prevMessages.slice(0, -1));
    }
  };


  return (
    <div className="App">
      <div className="sideBar">
        <div className="upperSide">
          <div className="upperSideTop">
            <img src={Logo} alt="Logo" className="logo" />
            <span className="brand"></span>
          </div>
          <button className="midBtn" onClick={handleNewChatClick}>
            <img src={AddBtn} alt="new chat" className="addBtn" /> New Chat
          </button>
          <div className="upperSideBottom">
          <Sidebar 
              handleSessionClick={handleSessionClick} 
              refreshSidebar={refreshSidebar} // Pass the refresh trigger to Sidebar
            />
          </div>
        </div>

        <div className="lowerSide">
          <div className="listItems">
            <img src={home} alt="" className="listItemsImg" />
            Profile
          </div>
          <div className="listItems" onClick={handleLogout}>
            <img src={saved} alt="" className="listItemsImg" />
            LogOut
          </div>
        </div>
      </div>

      <div className="main">
        {loading && (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        )}
        {!loading && !showNewChat && (
          <LandingPage handleNewChatClick={handleNewChatClick} />
        )}
        {!loading && showNewChat && (
          <>
            <div className="chats" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="ready-container">
                  <img
                    src={AILogo}
                    alt="Ready to assist"
                    className="ready-icon"
                  />
                  <p className="ready-text">Dennis AI is ready to assist you</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    className={message.type === "user" ? "chat" : "chat bot"}
                    key={index}
                  >
                    <img
                      className="chatImg"
                      src={message.type === "user" ? userIcon : AILogo}
                      alt={message.type === "user" ? "User" : "Bot"}
                    />
                    <p className="txt">
                      {message.type === "bot" && message.isLoading ? (
                        <div className="ai-loader"></div>
                      ) : message.type === "bot" && isRealTime ? (
                        <TypewriterEffect text={message.text} />
                      ) : (
                        message.text
                      )}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="chatFooter">
              <div className="inp">
                <input
                  type="text"
                  placeholder="Message DennisAi"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                />
                <button className="send" onClick={handleSend}>
                  <img src={sendBtn} alt="Send" />
                </button>
              </div>
              <p>Visit Website www.dennislaw.com</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MainPage;
