import React, { useEffect, useState } from "react";
import "../css/AdminDashboard.css";
import { trackingRoute } from '../utils/APIRoutes';
import axios from 'axios';
import LocationFromIP from '../components/LocationFromIP'

function AdminDashboard() {
  const [dataType, setDataType] = useState("opens");
  const [orderBy, setOrderBy] = useState("time");
  const [emailData, setEmailData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [expandedEmail, setExpandedEmail] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.post(trackingRoute, {dataType: dataType});
        setEmailData(res.data.records)
      } catch (err) {
        console.error("Failed to fetch tracking data:", err);
      }
    };

    fetchData();
  }, [dataType]);



  useEffect(() => {
    const grouped = {};
    emailData.forEach((entry) => {
      const key = entry.email;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(entry);
    });

    let sortedEmails = Object.entries(grouped);
    if (orderBy === "alpha") {
      sortedEmails.sort((a, b) => a[0].localeCompare(b[0]));
    } else {
      sortedEmails.sort((a, b) => {
        const aTime = new Date(a[1][0][dataType === "opens" ? "openedAt" : "clickedAt"]);
        const bTime = new Date(b[1][0][dataType === "opens" ? "openedAt" : "clickedAt"]);
        return bTime - aTime;
      });
    }

    setFilteredData(sortedEmails);
  }, [emailData, orderBy]);

  const toggleExpand = (email) => {
    setExpandedEmail(expandedEmail === email ? null : email);  
  };
  return (
    <div className="admin-dashboard">
      <h1 className="title">📬 Email Analytics Dashboard</h1>

      <div className="filters">
        <label>
          Data Type:
          <select value={dataType} onChange={(e) => setDataType(e.target.value)}>
            <option value="opens">Opens</option>
            <option value="clicks">Clicks</option>
          </select>
        </label>
        <label>
          Order By:
          <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            <option value="time">Time</option>
            <option value="alpha">A-Z</option>
          </select>
        </label>
      </div>

      <div className="results">
        {filteredData.map(([email, records]) => (
  <div className="email-group" key={email}>
    <div
      className="email-header"
      onClick={() => toggleExpand(email)}
    >
      <h3>{email}</h3> {expandedEmail === email ? "▲" : "▼"}
    </div>
    {expandedEmail === email && (
      <div className="email-details">
        <table>
          <thead>
            <tr>
              {dataType === "opens" ? (
                <>
                  <th>IP</th>
                  <th>Email Client</th>
                  <th>Opened At</th>
                  <th>User-Agent</th>
                  <th>Engagement Time</th>
                </>
              ) : (
                <>
                  <th>URL</th>
                  <th>IP</th>
                  <th>Clicked At</th>
                  <th>Location</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {records.map((entry, index) => (
              <tr key={index}>
                {dataType === "opens" ? (
                  <>
                    <td>{entry.ip}</td>
                    <td>{entry.emailClient}</td>
                    <td>{new Date(entry.openedAt).toLocaleString()}</td>
                    <td>{entry.userAgent}</td>
                    <td>
                      {Math.floor((Date.now() - new Date(entry.openedAt)) / 1000)}s ago
                    </td>
                  </>
                ) : (
                  <>
                    <td>{entry.url}</td>
                    <td>{entry.ip}</td>
                    <td>{new Date(entry.clickedAt).toLocaleString()}</td>
                    <td>
                      {entry.location ? (
                        entry.location
                      ) : (
                        <LocationFromIP ip={entry.ip} />
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
))}
      </div>
    </div>
  );
}

export default AdminDashboard;
