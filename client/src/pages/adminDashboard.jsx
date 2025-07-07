import React, { useState, useEffect } from "react";

const AdminDashboard = () => {
  const [dataType, setDataType] = useState("clicks"); // "clicks" or "opens"
  const [sortBy, setSortBy] = useState("time"); // "time" or "alphabet"
  const [clickData, setClickData] = useState([]);
  const [openData, setOpenData] = useState([]);

  useEffect(() => {
    fetch("/api/track/clicks")
      .then((res) => res.json())
      .then((data) => setClickData(groupByEmail(data)));

    fetch("/api/track/opens")
      .then((res) => res.json())
      .then((data) => setOpenData(groupByEmail(data)));
  }, []);

  const groupByEmail = (entries) => {
    const map = {};
    for (let item of entries) {
      if (!map[item.email]) map[item.email] = [];
      map[item.email].push(item);
    }
    return Object.entries(map).map(([email, logs]) => ({ email, logs }));
  };

  const sortedData = (data) => {
    return [...data].sort((a, b) => {
      if (sortBy === "alphabet") return a.email.localeCompare(b.email);
      return (
        new Date(b.logs[0].clickedAt || b.logs[0].openedAt) -
        new Date(a.logs[0].clickedAt || a.logs[0].openedAt)
      );
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>📊 Email Engagement Dashboard</h2>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Data Type:
          <select onChange={(e) => setDataType(e.target.value)} value={dataType}>
            <option value="clicks">Clicks</option>
            <option value="opens">Opens</option>
          </select>
        </label>
        <label style={{ marginLeft: "20px" }}>
          Sort By:
          <select onChange={(e) => setSortBy(e.target.value)} value={sortBy}>
            <option value="time">Time</option>
            <option value="alphabet">Alphabetical</option>
          </select>
        </label>
      </div>

      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Email</th>
            {dataType === "clicks" ? (
              <>
                <th>URL</th>
                <th>IP</th>
                <th>Location</th>
                <th>Clicked At</th>
              </>
            ) : (
              <>
                <th>IP</th>
                <th>Location</th>
                <th>Opened At</th>
                <th>User Agent</th>
                <th>Email Client</th>
                <th>Engagement Time (s)</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData(dataType === "clicks" ? clickData : openData).map((entry, i) => (
            <React.Fragment key={i}>
              {entry.logs.map((log, j) => (
                <tr key={j}>
                  <td>{entry.email}</td>
                  {dataType === "clicks" ? (
                    <>
                      <td>{log.url}</td>
                      <td>{log.ip}</td>
                      <td>{log.location || "-"}</td>
                      <td>{new Date(log.clickedAt).toLocaleString()}</td>
                    </>
                  ) : (
                    <>
                      <td>{log.ip}</td>
                      <td>{log.location || "-"}</td>
                      <td>{new Date(log.openedAt).toLocaleString()}</td>
                      <td>{log.userAgent}</td>
                      <td>{log.emailClient}</td>
                      <td>
                        {Math.floor((Date.now() - new Date(log.openedAt)) / 1000)}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
