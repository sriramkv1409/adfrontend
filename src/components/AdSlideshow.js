import React, { useState, useEffect } from 'react';
import '../styles/adslideshow.css';
import { useLocation } from 'react-router-dom';

const AdSlideshow = () => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const location = useLocation();
  const { ageGroup, gender } = location.state || {};

  useEffect(() => {
    const getAgeRange = (ageGroup) => {
      if (ageGroup.includes("Child")) return "0-12";
      if (ageGroup.includes("Teenager")) return "13-19";
      if (ageGroup.includes("Young Adult")) return "20-34";
      if (ageGroup.includes("Middle-aged")) return "35-49";
      return "50+";
    };

    const fetchAds = async () => {
      try {
        const baseUrl = "https://adgorithmbucket-2025-new.s3.ap-south-1.amazonaws.com";
        const genderFolder = gender === "Woman" ? "Woman" : "Man";
        const ageRange = getAgeRange(ageGroup);
        const imageFormats = ['jpg', 'png', 'jpeg']; // exclude webp for now

        const urls = [];

        for (let i = 1; i <= 5; i++) {
          for (let format of imageFormats) {
            const url = `${baseUrl}/${genderFolder}/${ageRange}/ad${i}.${format}`;
            const isValid = await validateImage(url);
            if (isValid) {
              urls.push({ src: url, link: `https://example.com/ad${i}` }); // Set your redirect link here
              break;
            }
          }
        }

        if (urls.length === 0) {
          urls.push({
            src: "https://via.placeholder.com/800x600?text=No+Ads+Available",
            link: "#"
          });
        }

        setAds(urls);
      } catch (err) {
        console.error(err);
        setAds([{
          src: "https://via.placeholder.com/800x600?text=Error+Loading+Ads",
          link: "#"
        }]);
      }
    };

    const validateImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };

    if (ageGroup && gender) {
      fetchAds();
    }
  }, [ageGroup, gender]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads]);

  if (ads.length === 0) return <div className="loading-text">Loading ads...</div>;

  return (
    <div className="ad-slideshow">
      <h1 className="header">WATCH OUT FOR THIS</h1>
      <div className="slideshow-container">
        <a href={ads[currentAdIndex].link} target="_blank" rel="noopener noreferrer">
          <img
            src={ads[currentAdIndex].src}
            alt={`Ad ${currentAdIndex + 1}`}
            className="slide-image"
          />
        </a>
      </div>
    </div>
  );
};

export default AdSlideshow;
