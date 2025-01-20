import React, { useEffect, useState } from "react";
import "../css/SplashScreen.css";

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simula una carga incrementando el progreso del 1 al 100
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) return prev + 1;
        clearInterval(interval); // Detener cuando llegue a 100
        return prev;
      });
    }, 30); // Ajusta el tiempo para cambiar la velocidad de la animación
  }, []);

  return (
    <div className="splash-container">
      <div className="splash-content">
        <h1 className="splash-title">Laicos-RD</h1>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <p className="progress-text">{progress}%</p>
      </div>
    </div>
  );
};

export default SplashScreen;
