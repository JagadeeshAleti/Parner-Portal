"use client";
import axios from "axios";
import './global.css';
import Select from 'react-select';
import { useEffect, useState } from "react";

const countries = [
  { label: "United States" },
  { label: "Canada" },
  { label: "India" },
  { label: "Srilanka" },
  { label: "Bhutan" },
  { label: "Italy" },
  { label: "Seria" },
  { label: "Newyork" },
];

const tiers = [
  { label: "Bornze" },
  { label: "Silver" },
  { label: "Gold" },
  { label: "Platinum" },
];

const milestonesOptions = [
  { value: 'nda', label: 'NDA' },
  { value: 'portal-access', label: 'Portal Access' },
  { value: 'sales-training', label: 'Sales Training' },
  { value: 'product-training', label: 'Product Training' },
  { value: 'demo-account', label: 'Demo Account' },
  { value: 'certification', label: 'Certification' },
];

function getLabel(value) {
  const milestone = milestonesOptions.find(option => option.value === value);
  return milestone?.label;
}

export default function Home() {
  const [partners, setPartners] = useState([]);
  const [partnerId, setPartnerId] = useState(null);
  const [popupBtnName, setPopupBtnName] = useState(null);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [editPartner, setEditPartner] = useState(false);
  const [createPartner, setCreatePartner] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedTire, setSelectedTire] = useState(null);
  const [discount, setDiscount] = useState('');
  const [selectedMilestones, setSelectedMilestones] = useState([]);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    region: "",
    address: ""
  });

  useEffect(() => {
    getPartners();
  }, []);

  async function getPartners() {
    try {
      const { data } = await axios.get(`http://localhost:3001/admin/partner`);
      setPartners(data)
    } catch (err) {
      console.error("Error is: ", err);
    }
  }

  const handleCountrySelect = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setFormData(pre => ({
      ...pre,
      region: selectedOption?.label
    }
    ))
  };

  const handleTireSelect = (selectedOption) => {
    setSelectedTire(selectedOption);
    setFormData(pre => ({
      ...pre,
      tier: selectedOption?.label
    }
    ))
  };

  const handleMilestonesSelect = (selectedOptions) => {
    setSelectedMilestones(selectedOptions);
    const mileStones = selectedOptions.map(o => o.value);
    setFormData(pre => ({
      ...pre,
      milestones: mileStones
    }
    ))
  };

  function handlePartner(id) {
    window.location.href = `partner/${id}`;
  };

  function handleInputChange(e) {
    setError(null);
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: (name === 'discount') ? value / 100 : value
    });
  }

  function handleEdit(p, i) {
    setDiscount(() => {
      const value = parseFloat(p?.discount);
      const d = isNaN(value) ? '' : (value * 100);
      return d;
    });
    setSelectedMilestones(() => {
      const milestones = p?.milestones;
      const selected = milestones?.map(m => ({
        label: getLabel(m),
        value: m
      }));
      return selected;
    })
    setSelectedTire(() => !p?.tier ? null : { label: p?.tier });
    setSelectedCountry(() => !p?.region ? null : { label: p?.region });
    setError(null);
    setPartnerId(p?.id);
    setFormData(partners[i]);
    setPopupBtnName("Edit");
    setShowCreatePopup(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.id) {
      setError("ID is required");
      return;
    }
    if (!formData.name) {
      setError("Name is required");
      return;
    }
    if (formData.name.length < 5) {
      setError("Name atleast contains 5 letters");
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailPattern.test(formData.email)) {
      setError("Invalid email format");
      return
    }

    const headers = {
      headers: {
        'Content-Type': 'application/json'
      }
    }

    try {
      if (popupBtnName === 'Create') {
        setCreatePartner(true);
        await axios.post(`http://localhost:3001/admin/partner`, formData, headers);
      } else if (popupBtnName === "Edit") {
        setEditPartner(true);
        const { name, email, phone, region, address, tier, milestones } = formData;
        const body = { name, email, phone, region, address, tier, milestones, discount: discount / 100 };
        await axios.patch(`http://localhost:3001/admin/partner/${partnerId}`, body, headers);
      }
      setEditPartner(false);
      setCreatePartner(false);
      setFormData({});
      setSelectedMilestones([]);
      setShowCreatePopup(false);
      getPartners();
    } catch (err) {
      setCreatePartner(false);
      setEditPartner(false);
      const { response: { data: { error } } } = err;
      if (error) {
        setError(error);
      }
      console.error("Error is: ", err);
    }

  }

  return (
    (createPartner || editPartner) ?
      <div className="saving">
        <div className="loading-spinner"></div>
        {createPartner ? "Creating New Partner" : "Updating Parner Details"}
      </div> :
      <div className="main">

        <div className="header">
          <h1>Welcome to partner portal app</h1>
          <button onClick={() => {
            setError(null);
            setFormData({});
            setSelectedCountry(null);
            setPopupBtnName("Create");
            setShowCreatePopup(true);
          }}>Create</button>
        </div>

        <ul className="partners">
          {partners.length > 0 && partners.map((partner, i) => (
            <li key={partner.id} className="partner">
              <p>{partner.name}</p>
              <p>{partner.region}</p>
              <div>
                <button className="view" onClick={() => handlePartner(partner?.id)}>View</button>
                <button className="edit" type="button" onClick={() => {
                  handleEdit(partner, i);
                }}>Edit</button>
              </div>
            </li>
          ))}
        </ul>

        {showCreatePopup && (
          <>
            <div className="overlay" onClick={() => setShowCreatePopup(false)}></div>
            <div className="create-popup">
              <h2>
                {popupBtnName === "Create" ? "Create New Partner" : "Edit Partner Details"}
              </h2>
              <form className="form" onSubmit={handleSubmit}>
                {popupBtnName === "Create" &&
                  <div className="form-group">
                    <label>Id:</label>
                    <input
                      type="text"
                      name="id"
                      value={formData.id || ''}
                      onChange={handleInputChange}
                    />
                  </div>}
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
                <div className="form-group two-fields">
                  <Select
                    options={countries}
                    value={selectedCountry}
                    onChange={handleCountrySelect}
                    isSearchable={true}
                    placeholder="Select a country..."
                  />
                  {popupBtnName === "Edit" &&
                    <Select
                      options={tiers}
                      value={selectedTire}
                      onChange={handleTireSelect}
                      isSearchable={true}
                      placeholder="Select a Tire..."
                    />
                  }
                </div>

                {popupBtnName === "Edit" &&
                  <>
                    <div className="form-group">
                      <Select
                        options={milestonesOptions}
                        value={selectedMilestones}
                        onChange={handleMilestonesSelect}
                        isMulti
                        placeholder="Select milestones..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Discount:</label>
                      <input
                        type="number"
                        step="0.01"
                        value={discount}
                        onChange={e => {
                          const value = parseFloat(e.target.value);
                          setDiscount(isNaN(value) ? '' : value);
                        }}
                      />
                    </div>
                  </>
                }
                <div className="form-group">
                  <label>Address:</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                  />
                </div>
                {error && <div className="form-group error">{error}</div>}

                <button type="submit" className="submit" onClick={handleSubmit}>{popupBtnName}</button>
                <button type="submit" className="cancel" onClick={() => setShowCreatePopup(false)}>Cancel</button>
              </form>
            </div>
          </>
        )}
      </div>
  )
}
