import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import SplashScreen from '../components/SplashScreen'; 

const PrivateRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const authToken = Cookies.get('authToken');

  useEffect(() => {
    // Simulando la verificación de autenticación
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); 

    return () => clearTimeout(timer);
  }, []);


  if (loading) {
    return <SplashScreen />;
  }

  return authToken ? children : <Navigate to="/Home" />;
};

export default PrivateRoute;
