import React, { useState, useEffect } from 'react';
import '../styles/adslideshow.css';
import { useLocation, useNavigate } from 'react-router-dom';

const AdSlideshow = () => {
  const [ads, setAds] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { ageGroup, gender } = location.state || {};

  // ✅ Replace with your actual QR feedback link
  const feedbackQRUrl = "https://adgorithmbucket-2025-new.s3.ap-south-1.amazonaws.com/form.png";

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
        const imageFormats = ['jpg', 'png', 'jpeg'];

        const urls = [];

        for (let i = 1; i <= 5; i++) {
          for (let format of imageFormats) {
            const adUrl = `${baseUrl}/${genderFolder}/${ageRange}/ad${i}.${format}`;
            const qrUrl = `${baseUrl}/${genderFolder}/qr/${ageRange}/ad${i}.png`;
            const isValidAd = await validateImage(adUrl);
            const isValidQR = await validateImage(qrUrl);

            if (isValidAd) {
              urls.push({
                src: adUrl,
                qrSrc: isValidQR ? qrUrl : null,
                link: `https://example.com/ad${i}`
              });
              break;
            }
          }
        }

        if (urls.length === 0) {
          urls.push({
            src: "https://via.placeholder.com/800x600?text=No+Ads+Available",
            qrSrc: null,
            link: "#"
          });
        }

        setAds(urls);
      } catch (err) {
        console.error(err);
        setAds([{
          src: "https://via.placeholder.com/800x600?text=Error+Loading+Ads",
          qrSrc: null,
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
    if (ads.length === 0 || showFeedback) return;

    const timer = setInterval(() => {
      setCurrentAdIndex((prevIndex) => {
        if (prevIndex + 1 === ads.length) {
          setShowFeedback(true); // Show feedback after last ad
          clearInterval(timer);
        }
        return (prevIndex + 1) % ads.length;
      });
    }, 5000);

    return () => clearInterval(timer);
  }, [ads, showFeedback]);

  // Redirect to camera page after feedback QR is shown for 10 seconds
  useEffect(() => {
    if (showFeedback) {
      const redirectTimer = setTimeout(() => {
        navigate('/');
      }, 10000); // 10 seconds
      return () => clearTimeout(redirectTimer);
    }
  }, [showFeedback, navigate]);

  if (ads.length === 0) return <div className="loading-text">Loading ads...</div>;

  return (
    <div className="ad-slideshow">
      <h1 className="header">
        {showFeedback ? "We'd love your feedback!" : "WATCH OUT FOR THIS"}
      </h1>
      <div className="slideshow-container">
        {showFeedback ? (
          <div className="feedback-container">
            <img src={feedbackQRUrl} alt="Feedback QR" className="feedback-qr" />
            <p className="feedback-text">Scan the QR code to share your thoughts!</p>
          </div>
        ) : (
          <>
            <a href={ads[currentAdIndex].link} target="_blank" rel="noopener noreferrer">
              <img src={ads[currentAdIndex].src} alt={`Ad ${currentAdIndex + 1}`} className="slide-image" />
            </a>
            {ads[currentAdIndex].qrSrc && (
              <img src={ads[currentAdIndex].qrSrc} alt={`QR for Ad ${currentAdIndex + 1}`} className="qr-image" />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdSlideshow;
