import React, { useState, useEffect } from 'react';
import "./App.css";
import msgIcon from "./assets/message.svg";
import deleteIcon from "./assets/delete-svgrepo-com.svg";
import refreshIcon from "./assets/refresh-svgrepo-com.svg";

function Sidebar({ handleSessionClick, refreshSidebar }) {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [deletingSessionId, setDeletingSessionId] = useState(null); // Track which session is being deleted
  const [activeSession, setActiveSession] = useState(null); // Track the active session

  const fetchSessions = async (showLoader = true) => {
    if (showLoader) {
      setSessionsLoading(true);
    }
    try {
      const userauth = JSON.parse(localStorage.getItem('userauth'));
      const userPseudoId = userauth?.user_pseudo_id;

      if (!userPseudoId) {
        alert("User is not authenticated");
        return;
      }

      const response = await fetch(`https://backend-615425956737.us-central1.run.app/discovery/sessions/?userPseudoId=${userPseudoId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setSessions(data);
        } else {
          console.error("Invalid sessions data received:", data);
          setSessions([]);
        }
      } else {
        alert("Failed to fetch sessions");
        setSessions([]);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    } finally {
      if (showLoader) {
        setSessionsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchSessions(); // Initial load with loader
  }, []);

  useEffect(() => {
    if (refreshSidebar) {
      fetchSessions(false); // Fetch sessions when refreshSidebar becomes true
    }
  }, [refreshSidebar]);

  const handleDeleteSession = async (id) => {
    setDeletingSessionId(id); // Set the session as being deleted

    try {
      const response = await fetch(` https://backend-615425956737.us-central1.run.app/discovery/delete/?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions(sessions.filter(session => session.name !== id));
      } else {
        alert("Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setDeletingSessionId(null); // Reset the deleting state
    }
  };

  const handleSessionClickInternal = (sessionName) => {
    setActiveSession(sessionName); // Set the clicked session as active
    handleSessionClick(sessionName); // Trigger the parent's handler
  };

  return (
    <div className="upperSideBottom">
      {sessionsLoading ? (
        <div className="session-loader-container">
          <div className="session-loader"></div>
        </div>
      ) : (
        <div className="session-list">
          {sessions.length === 0 ? (
            <div className="no-history-container">
              <div className="no-history">No History</div>
            </div>
          ) : (
            sessions.map((session, index) => {
              const sessionName = session.turns?.[0]?.query?.text || 'Untitled';
              const displayName = sessionName.length > 19 ? sessionName.slice(0, 19) + '...' : sessionName;
  
              const isDeleting = deletingSessionId === session.name;
              const isActive = activeSession === session.name; // Check if this session is active
  
              return (
                <div
                  key={index}
                  className={`session-item ${isDeleting ? 'disabled' : ''} ${isActive ? 'active-session' : ''}`} // Apply active class if session is active
                >
                  <button 
                    className="query" 
                    onClick={() => handleSessionClickInternal(session.name)}
                    disabled={isDeleting} // Disable the button while deleting
                  >
                    <img src={msgIcon} alt="query" />
                    {displayName}
                  </button>
                  <img 
                    src={isDeleting ? refreshIcon : deleteIcon} // Change icon to refresh while deleting
                    alt={isDeleting ? "Deleting..." : "Delete session"} 
                    className={`delete-icon ${isDeleting ? 'rotating' : ''}`} // Optional rotating effect
                    onClick={() => !isDeleting && handleDeleteSession(session.name)} // Disable click while deleting
                  />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
