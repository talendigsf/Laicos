import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import RequestResetPassword from './components/RequestResetPassword';
import ResetPassword from './components/ResetPassword';
import Perfil from './components/Perfil';
import Cookies from 'js-cookie';
import PrivateRoute from './components/PrivateRoute';
import SessionsPage from './components/sessiones/SessionsList';
import ActividadDetalle from './components/ActividadDetalle'; 
import ComunidadDetalleVista from './components/Comunidades/ComunidadDetalle';
import UserFe from './components/feedUser/UserFeed'
import HomePage from './components/HomePage';


const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const authToken = Cookies.get('authToken');
  const role = Cookies.get('userRole');



  useEffect(() => {
    // Simula la carga para obtener el rol del usuario
    if (authToken) {
      setUserRole(role);
    } else {
      setUserRole(null);
    }
    setTimeout(() => setLoading(false), 2000);

  }, [userRole]); // Dependencias de authToken y role



  return (
    <Router>
      <Routes>
      <Route path="/Home" element={<HomePage/>} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Reset" element={<RequestResetPassword />} />
        <Route path="/Reset-password/:token" element={<ResetPassword />} />
        <Route path="/sessions" element={<PrivateRoute><SessionsPage /></PrivateRoute>} />
        <Route path="/Perfil" element={<PrivateRoute><Perfil/></PrivateRoute>}/>
        <Route path="/actividades/:id" element={<PrivateRoute><ActividadDetalle /></PrivateRoute>} />
        <Route path="/detalle/:comunidadId" element={<PrivateRoute><ComunidadDetalleVista/></PrivateRoute>} />
        <Route path="/user/feed/:userId" element={ <PrivateRoute><UserFe/> </PrivateRoute>} />
        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              {<AdminDashboard />}
            </PrivateRoute>
          }
        />
        {/* Redirección predeterminada */}
        <Route path="*" element={<Navigate to="/Home" />} />
      </Routes>
    </Router>
  );
};

export default App;
