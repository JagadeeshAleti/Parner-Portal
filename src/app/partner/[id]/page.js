"use client";
import axios from "axios";
import './partner.css';
import { useEffect, useState } from "react";

export default function Page(props) {
  const { params: { id } } = props;
  const [partner, setPartner] = useState(null);
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [popupBtnName, setPopupBtnName] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [editUser, setEditUser] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    getPartnerDetails();
    getUsers();
  }, []);

  async function getPartnerDetails() {
    try {
      const { data } = await axios.get(`http://localhost:3001/admin/partner/${id}`);
      setPartner(data);
    } catch (err) {
      console.error("Error is: ", err);
    }
  }

  async function getUsers() {
    try {
      const { data } = await axios.get(`http://localhost:3001/admin/partner/${id}/users`);
      setUsers(data);
    } catch (err) {
      console.error("Error is: ", err);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }

  async function handleEdit(u, i) {
    setUserId(u?.id);
    setPopupBtnName("Edit");
    setFormData(users[i]);
    setShowCreatePopup(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    const headers = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    try {
      if (popupBtnName === 'Create') {
        setCreatingUser(true);
        await axios.post(`http://localhost:3001/admin/partner/${id}/users`, formData, headers);
      } else if (popupBtnName === "Edit") {
        setEditUser(true);
        await axios.patch(`http://localhost:3001/admin/partner/${id}/users/${userId}`, formData, headers);
      }
      getUsers();
    } catch (err) {
      console.error("Error is: ", err);
    } finally {
      setFormData({
        name: "",
        email: "",
        phone: ""
      });
      setCreatingUser(false);
      setEditUser(false);
      setShowCreatePopup(false);
    }

  }

  return (

    (creatingUser || editUser) ?
      <div className="saving">
        <div className="loading-spinner"></div>
        {creatingUser ? "Saving new user to the database" : "Editing user details"}
      </div> :
      <div className="partner-info">
        <div className="header">

          <h1>Partner Details</h1>
          <div className="btns">
            <button onClick={() => window.location.href = `/`}>Partners</button>
            <button onClick={() => {
              setFormData({})
              setPopupBtnName("Create");
              setShowCreatePopup(true);
            }}>Create</button>
          </div>
        </div>
        {partner &&
          <div className="details">
            <div className="row">
              <label>Name</label>
              <span>{partner?.name || "Unavailable"}</span>
            </div>
            <div className="row">
              <label>Region</label>
              <span>{partner?.region || "Unavailable"}</span>
            </div>
            <div className="row">
              <label>Email</label>
              <span>{partner?.email || "Unavailable"}</span>
            </div>
            <div className="row">
              <label>Phone</label>
              <span>{partner?.phone || "Unavailable"}</span>
            </div>
            <div className="row">
              <label>Address</label>
              <span>{partner?.address || "Unavailable"}</span>
            </div>

          </div>
        }

        {
          users.length > 0 ?
            <ul className="users">
              {users.length > 0 && users.map((u, i) => (
                <li key={u.id} className="user">
                  <p>{u.name}</p>
                  <p>{u.email || "Unavailable"}</p>
                  <p>{u.phone || "Unavailable"}</p>
                  <div>
                    <button className="edit" onClick={() => {

                      handleEdit(u, i);
                    }}>Edit</button>
                  </div>
                </li>
              ))}
            </ul> :
            <></>
            // <div className="no-users">No users under this parner</div>
        }

        {showCreatePopup && (
          <>
            <div className="overlay" onClick={() => setShowCreatePopup(false)}></div>
            <div className="create-popup">
              <h2>
                {popupBtnName === "Create" ? "Create New User" : "Edit User Details"}
              </h2>
              <form className="form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone:</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="submit" onClick={handleSubmit}>{popupBtnName}</button>
                <button type="submit" className="cancel" onClick={() => setShowCreatePopup(false)}>Cancel</button>
              </form>
            </div>
          </>
        )}
      </div>

  )
}