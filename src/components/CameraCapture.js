import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/camera.css";

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
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
        setError("Unable to access camera. Please check permissions.");
      });
  };

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Camera not initialized.");
      return;
    }

    setIsLoading(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setError("Failed to capture image.");
        setIsLoading(false);
        return;
      }

      const file = new File([blob], "captured_image.jpg", {
        type: "image/jpeg",
      });

      sendToBackend(file);
    }, "image/jpeg");
  };

  const sendToBackend = async (imageFile) => {
    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch("http://127.0.0.1:10000/predict-age-gender", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log(data.age_group,data.gender);
      if (data.error) {
        setError(data.error);
        setIsLoading(false);
      } else {
        navigate("/ads", {
          state: { ageGroup: data.age_group, gender: data.gender },
        });
      }
    } catch (error) {
      console.error("Error sending image:", error);
      setError("Server error while sending image.");
      setIsLoading(false);
    }
  };

  return (
    <div className="camera-container">
      <h2>🎯 AI-Powered Advertisement Dashboard</h2>

      {error && <p className="error">{error}</p>}

      <video ref={videoRef} autoPlay className="webcam-feed"></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      <button className="capture-btn" onClick={captureImage}>
        📷 Capture Image
      </button>

      {isLoading && <p className="analyzing-text">🔍 Analyzing and fetching your ads...</p>}
    </div>
  );
};

export default CameraCapture;
