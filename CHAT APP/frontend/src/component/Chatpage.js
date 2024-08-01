import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseconfig";
import { collection, getDocs } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import ChatSection from "./ChatSection";
import "../styles/chats.css";

const ChatPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recipientId, setRecipientId] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [Avatar, setAvatar] = useState("");
  const [searchTarget, setSearchTarget] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchUsers();
      } else {
        navigate("/");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);

      const currentUser = usersList.find(
        (user) => user.userId === auth.currentUser?.uid
      );
      const currentUseravatar = currentUser.avatar;
      setAvatar(currentUseravatar);

      if (currentUser) {
        setCurrentUser(currentUser.name);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const filteredUsers = users
    .filter((u) => u.userId !== auth.currentUser?.uid)
    .filter((user) =>
      user.name.toLowerCase().includes(searchTarget.toLowerCase())
    );

  return (
    <div className="chat-page">
      <div className="users-list">
        <label>CHATS </label>
        <input type="text" placeholder="Search" onChange={(e) => setSearchTarget(e.target.value)} />
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`chats-box ${recipientId === user.userId ? 'selected' : ''}`}
            onClick={() => setRecipientId(user.userId)}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="avatar" />
            ) : (
              <div className="avatar-placeholder">No Image</div>
            )}
            <span className="user-name">{user.name}</span>
          </div>
        ))}
      </div>
      <div className="chat-section-container">
        {recipientId && (
          <ChatSection
            recipientId={recipientId}
            setRecipientId={setRecipientId}
            currentUser={user}
            users={users}
          />
        )}
      </div>

      <div className="current-user-info">
        <h1 style={{ textAlign: "center" }}>About Me</h1>
        {Avatar ? (
          <img src={Avatar} alt="Current User Avatar" className="avatar-me" />
        ) : (
          <div className="avatar-placeholder">No Avatar</div>
        )}
        <h1 style={{ textAlign: "center" }}>{currentUser}</h1>
      </div>
    </div>
  );
};

export default ChatPage;
