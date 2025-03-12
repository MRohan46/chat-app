import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
import { FaSearch } from "react-icons/fa";

export default function Contacts({ contacts, currentUser, changeChat, socket }) {
    const [currentUserName, setCurrentUserName] = useState(undefined);
    const [currentUserImage, setCurrentUserImage] = useState(undefined);
    const [currentSelected, setCurrentSelected] = useState(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [contactStatuses, setContactStatuses] = useState({});
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        if (currentUser) {
            setCurrentUserImage(currentUser.avatarImage);
            setCurrentUserName(currentUser.username);
        }
    }, [currentUser]);

    useEffect(() => {
        if (contacts.length > 0) {
            setIsLoading(false);
        }
    }, [contacts]);

    useEffect(() => {
      if (!socket.current) return;

      socket.current.emit("get-online-users");
      socket.current.on("online-users", (users) => {
        const statuses = contacts.reduce((acc, contact) => {
            acc[contact._id] = users.includes(contact._id) ? "🟢" : "🔘";
            return acc;
        }, {});
        setContactStatuses(statuses);
      });
  
      return () => socket.current.off("online-users"); // Cleanup listener
  }, [contacts, socket]);

    // Polling to check contact status every 15 seconds
    useEffect(() => {
        if (!socket.current) return;

        const interval = setInterval(() => {
            socket.current.emit("get-online-users");

            socket.current.on("online-users", (users) => {
                const statuses = contacts.reduce((acc, contact) => {
                    acc[contact._id] = users.includes(contact._id) ? "🟢" : "🔘";
                    return acc;
                }, {});
                setContactStatuses(statuses);
            });
        }, 15000); // Polling every 15 seconds

        return () => {
            clearInterval(interval); // Clean up the polling interval
            socket.current.off("online-users"); // Remove the event listener
        };
    }, [contacts, socket]);

    const changeCurrentChat = (index, contact) => {
        setCurrentSelected(index);
        changeChat(contact);
    };
    // Filter contacts based on search input
    const filteredContacts = Array.isArray(contacts)
      ? searchQuery.trim()
        ? contacts.filter((contact) =>
            contact.username?.toLowerCase().includes(searchQuery.trim().toLowerCase())
          )
        : contacts
      : []; // Ensure filteredContacts is always an array

    return (
        <>
            {isLoading ? (
                <LoadingContainer>
                    <h4>Chats are still loading, please wait...</h4>
                </LoadingContainer>
            ) : (
                currentUserImage && currentUserName && (
                    <Container>
                        <div className="brand">
                            <img src={Logo} alt="logo" />
                            <h3>River Waves Solutions.</h3>
                        </div>
                        <div className="search">
                          <div className="input-container">
                            <form >
                              <input type="text" placeholder="Search users by username..." value={searchQuery} onChange={(e)=>{
                                setSearchQuery(e.target.value)
                              }}/>
                            </form>
                          </div>
                          <div className="search-emoji-container">
                            <FaSearch className="search-emoji"/>
                          </div>
                        </div>
                        <div className="contacts">
                        {
                          isLoading ? (
                            <p>Loading contacts...</p>
                          ) : !Array.isArray(filteredContacts) ? (
                            <p className="user-not-found">Error: Contacts data is not an array.</p>
                          ) : filteredContacts.length === 0 ? (
                            <p className="user-not-found">No users found.</p>
                          ) : (
                            filteredContacts.map((contact, index) => {
                              const status = contactStatuses[contact._id] || "🔘"; // Default to offline
                              return (
                                <div
                                  className={`contact ${index === currentSelected ? "selected" : ""}`}
                                  key={index}
                                  onClick={() => changeCurrentChat(index, contact)}
                                >
                                  <div className="avatar">
                                    <img src={`data:image/svg+xml;base64,${contact.avatarImage}`} alt="avatar" />
                                  </div>
                                  <div className="username">
                                    <h3>{contact.username}</h3> 
                                  </div>
                                  <div className="user-status">
                                    <h3>{status}</h3> 
                                  </div>
                                </div>
                              );
                            })
                          )
                        }

                        </div>
                        <div className="current-user">
                            <div className="avatar">
                                <Link to="/setAvatar">
                                    <img src={`data:image/svg+xml;base64,${currentUserImage}`} alt="cavatar" />
                                </Link>
                            </div>
                            <div className="username">
                                <h2>{currentUserName}</h2>
                            </div>
                        </div>
                    </Container>
                )
            )}
        </>
    );
}

const LoadingContainer = styled.div`
  border-top-left-radius: 2rem;
  border-bottom-left-radius: 2rem;
  display: grid;
  padding: 1rem;
  grid-template-rows: 10% 5% 70% 15%;
  overflow: hidden;
  background-color: #333;
  display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
  h4 {
    color: #ff6666;
    text-transform: uppercase;
    font-size: 14px;
  }
`;

const Container = styled.div`

.user-not-found{
  margin-top: 50%;
  font-weight: 800;
    color: #ff6666;
    text-transform: uppercase;
    font-size: 48;
}

.search{
  padding: 0.1rem;
  display: grid;
  grid-template-columns: 80% 20%;
  padding-left: 1rem;
    .input-container input{
      width: 100%;
      display: flex;
      border-radius: 2rem;
      justify-content: center;
      align-items: center;
      background-color: #181818;
      color: white;
      
      padding: 4px 12px 4px;
      border: none;
      font-size: 0.8rem;
      &::selection {
        background-color: #ff6666;
      }
      &:focus{
        outline: none;
      }
      @media screen and (min-width: 720px) and (max-width: 1080px){
          padding: 0 1rem;
          
      }
    
  }
  .search-emoji{
    cursor: pointer;
    font-size: 1.2rem;
    margin-left: 10px;
    color: white;
    font-weight: 800;
    
  
  }
}

.user-status{
  font-family: 'Noto Color Emoji', sans-serif;
  align-items: left;
  justify-content: left;
}
user-select: none;
border-top-left-radius: 2rem;
border-bottom-left-radius: 2rem;
display: grid;
grid-template-rows: 10% 5% 70% 15%;
overflow: hidden;
background-color: #333;
.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
  img {
    border-radius: 5rem;
    height: 2rem;
  }
  h3 {
    color: #ff6666;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ff6666;
        width: 0.3rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #4d4d4d;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.5rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
      .avatar {
        img {
          background-color: rgba(0,0,0,0.3);
          padding: 0.5rem;
          border-radius: 5rem;
          height: 3.5rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
        span {
          font-size: 1.2rem;
          color: white;
        }
      }
    }
    .selected {
      background-color: #ff6666;
    }
  }

  .current-user {
    background-color: #181818;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4.5rem;
        padding: .2rem;
        background-color: rgba(255, 102, 102, 0.7); 
        border-radius: 5rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;