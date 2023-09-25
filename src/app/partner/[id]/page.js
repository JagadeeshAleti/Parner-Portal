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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  console.log({ showCreatePopup });

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

  async function handleEdit(userid) {
    try {
      const { data } = await axios.get(`http://localhost:3001/admin/partner/${id}/users/${userid}`);
      setFormData(data);
      setShowCreatePopup(true);
    } catch (err) {
      console.error("Error is : ", err);
    }
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
      setShowCreatePopup(false);
    }

  }

  return (

    creatingUser ?
      <div className="saving">
        <div className="loading-spinner"></div>
        Saving new user to the database
      </div> :
      <div className="partner-info">
        <div className="header">
          <h1>Partner Details</h1>
          <button onClick={() => {
            setPopupBtnName("Create");
            setShowCreatePopup(true);
          }}>Create</button>
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

        <ul className="users">
          {users.length > 0 && users.map((u) => (
            <li key={u.id} className="user">
              <p>{u.name}</p>
              <p>{u.email || "Unavailable"}</p>
              <p>{u.phone || "Unavailable"}</p>
              <div>
                <button className="edit" onClick={() => {
                  setUserId(u?.id);
                  setPopupBtnName("Edit");
                  handleEdit(u?.id);
                }}>Edit</button>
              </div>
            </li>
          ))}
        </ul>

        {showCreatePopup && (
          <>
            <div class="overlay" onClick={() => setShowCreatePopup(false)}></div>
            <div className="create-popup">
              <h2>Create New Entry</h2>
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