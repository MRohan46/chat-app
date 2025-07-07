import React, { useEffect, useState } from "react";
import axios from "axios";

const LocationFromIP = ({ ip }) => {
  const [location, setLocation] = useState("Loading...");

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Some IPs may contain multiple addresses (comma-separated), so pick the first one
        const cleanIP = ip.split(",")[0].trim();

        if (
        cleanIP.startsWith("10.") ||
        cleanIP.startsWith("172.") ||
        cleanIP.startsWith("192.168") ||
        cleanIP.startsWith("127.") ||
        cleanIP === "localhost"
        ) {
        setLocation("Internal IP");
        return;
        }


        const response = await axios.get(`https://ipwho.is/${cleanIP}`);
        if (response.data && response.data.success) {
        setLocation(`${response.data.city}, ${response.data.country}`);
        } else {
        setLocation("Unknown location");
        }

      } catch (error) {
        console.error("Error fetching location for IP:", ip, error);
        setLocation("Location unavailable");
      }
    };

    if (ip) fetchLocation();
  }, [ip]);

  return <span>{location}</span>;
};

export default LocationFromIP;
