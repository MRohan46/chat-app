// File: src/pages/AdminDashboard.jsx

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#5b2be0", "#8b3aff", "#d946ef", "#6366f1"];

const dummyStats = {
  totalEmails: 120,
  opened: 85,
  clicked: 42,
  replies: 7,
};

const dummyOpenData = [
  { name: "Opened", value: 85 },
  { name: "Not Opened", value: 35 },
];

const dummyClickData = [
  { email: "narutoapps913@gmail.com", clicks: 5 },
  { email: "support@toolmagic.app", clicks: 3 },
  { email: "hello@impulze.ai", clicks: 2 },
];

export default function AdminDashboard() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
        📊 Email Campaign Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1rem",
          marginTop: "1.5rem",
        }}
      >
        {Object.entries(dummyStats).map(([key, value]) => (
          <div
            key={key}
            style={{
              padding: "1rem",
              background: "#f9f9f9",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <p style={{ marginBottom: 5 }}>{key}</p>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</h2>
          </div>
        ))}
      </div>

      {/* Pie Chart */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Open Rate</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={dummyOpenData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {dummyOpenData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Clicked Emails */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Top Clicks</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Clicks</th>
            </tr>
          </thead>
          <tbody>
            {dummyClickData.map((row, i) => (
              <tr key={i}>
                <td style={tdStyle}>{row.email}</td>
                <td style={tdStyle}>{row.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* All Emails */}
      <div style={{ marginTop: "2rem" }}>
        <h2>All Emails</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Opens</th>
              <th style={thStyle}>Clicks</th>
              <th style={thStyle}>Replies</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i}>
                <td style={tdStyle}>test{i}@gmail.com</td>
                <td style={tdStyle}>{i % 3 === 0 ? "Sent" : "Opened"}</td>
                <td style={tdStyle}>{Math.floor(Math.random() * 3)}</td>
                <td style={tdStyle}>{Math.floor(Math.random() * 5)}</td>
                <td style={tdStyle}>{i % 5 === 0 ? 1 : 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
  padding: "0.5rem",
  borderBottom: "1px solid #ccc",
};

const tdStyle = {
  padding: "0.5rem",
  borderBottom: "1px solid #eee",
};
