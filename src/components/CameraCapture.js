import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/camera.css";

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Error accessing webcam:", err);
      });
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], "captured_image.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await fetch("http://127.0.0.1:10000/predict-age-gender", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.age_group && data.gender) {
          navigate("/ads", { state: { ageGroup: data.age_group, gender: data.gender } });
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }, "image/jpeg");
  };

  return (
    <div className="camera-page">
      <div className="camera-left">
        <h1>Smart, Ethical, and Engaging</h1>
      </div>
      <div className="camera-right">
        <video ref={videoRef} autoPlay className="webcam-feed" />
        <canvas ref={canvasRef} style={{ display: "none" }} />
        <div className="spinner-wrapper" onClick={captureImage}>
          <div className="spinner"></div>
          {loading && <p className="loading-text">Analyzing and getting your ads...</p>}
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
