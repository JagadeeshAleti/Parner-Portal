"use client";
import axios from "axios";
import './global.css';
import { useEffect, useState } from "react";

export default function Home() {
  const [partners, setPartners] = useState([]);
  
  useEffect(() => {
    getPartners();
  }, []);

  async function getPartners() {
    try {
      const { data } = await axios.get(`http://localhost:3001/admin/partner`);
      console.log(data);
      setPartners(data)
    } catch (err) {
      console.error("Error is: ", err);
    }
  }

  function handlePartner(id) {
    window.location.href = `partner/${id}`;
  };

  return (
    <div className="main">
      <h1>Welcome to partner portal app</h1>
      <ul className="partners">
        {partners.length > 0 && partners.map((partner) => (
          <li key={partner.id} className="partner" onClick={() => handlePartner(partner.id)}>
            <p>{partner.name}</p>
            <p>{partner.region}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
