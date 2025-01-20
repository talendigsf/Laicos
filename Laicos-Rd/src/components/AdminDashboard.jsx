import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/dashboard.css';
import Cookies from 'js-cookie';
import axios from 'axios';
import Modal from 'react-modal';
import Header from './Header';
import Feed from './feed';
import AdministradoresList from './AdministradoresList';
import ActividadesList from './ActividadesList';
import Parroquias from './Parroquia/ParroquiaList';
import Diocesis from './Diocesis/DiocesisList';
import SecuritySettings from './SecuritySettings';
import Chat from './Chat';
import Comunidad from './Comunidades/ComunidadList';
import ModalAdminsitrador from './Modal/ModalAdministrador';

Modal.setAppElement('#root');

const AdminDashboard = () => {
  const URL = process.env.REACT_APP_DOMINIO;
  const userRole = Cookies.get('userRole');
  const [administradores, setAdministradores] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);  
  const [currentAdmin, setCurrentAdmin] = useState({
    nombre: '',
    apellido: '',
    email: '',
    sexo: 'Seleccionar',
    celular: '',
    nacimiento: '',
    esMiembro: false,
    password: '',
    rolUsuario: userRole === 'Administrador' ? 'Administrador' : 'clero',
  });
  const [activeComponent, setActiveComponent] = useState('feed');
  const navigate = useNavigate();
  const authToken = Cookies.get('authToken');
  const twoFaVerified = Cookies.get('twoFactorVerified');

  useEffect(() => {

    if (!twoFaVerified) {
      navigate('/login');
    } else if (userRole === 'Administrador' || userRole === 'clero') {
      obtenerAdministradores();
    }
   
  }, [twoFaVerified, navigate, userRole]);

  const obtenerAdministradores = async () => {
    try {
      const response = await axios.get(`${URL}/api/administradores`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setAdministradores(response.data);
    } catch (error) {
      console.error('Error al obtener los administradores:', error);
    }
  };

  const handleOpenModal = (admin = null) => {
    if (admin) {
      setCurrentAdmin(admin);
    } else {
      setCurrentAdmin({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        sexo: 'Seleccionar',
        celular: '',
        nacimiento: '',
        esMiembro: false,
        rolUsuario: userRole === 'Administrador' ? 'Administrador' : 'clero',
      });
    }
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
  };

  const handleDelete = async (adminId) => {
    try {
      await axios.delete(`${URL}/api/administradores/${adminId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      obtenerAdministradores();
    } catch (error) {
      console.error('Error al eliminar administrador:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAdmin({ ...currentAdmin, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprobar si el usuario es clero y está intentando crear un administrador
    if (userRole === 'clero' && currentAdmin.rolUsuario === 'Administrador') {
      alert("No tienes permiso para crear administradores.");
      return; // No proceder con el envío
    }

    try {
      if (currentAdmin._id) {
        // Editar administrador existente
        await axios.patch(`${URL}/api/administradores/${currentAdmin._id}`, currentAdmin, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      } else {
        // Añadir nuevo administrador
        await axios.post(`${URL}/api/administradores`, currentAdmin, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
      }
      obtenerAdministradores();
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar administrador:', error);
    }
  };

  const handleComponentChange = (component) => {
    setActiveComponent(component);
  };


  return twoFaVerified ? (
    <>
      <Header  handleComponentChange={handleComponentChange} />
      <div className="admin-dashboard">
       
        <div className="content">
          {activeComponent === 'feed' && <Feed />}
          {activeComponent === 'Actividades' && <ActividadesList />}
          {activeComponent === 'Administradores' && (userRole === 'Administrador' || userRole === 'clero') && (
            <AdministradoresList
              administradores={administradores}
              handleOpenModal={handleOpenModal}
              handleDelete={handleDelete}
            />
          )}
          {activeComponent === 'Parroquias' && (userRole === 'Administrador' || userRole === 'clero') && <Parroquias />}
          {activeComponent === 'Diocesis' && (userRole === 'Administrador' || userRole === 'clero') && <Diocesis />}
          {activeComponent === 'security' && <SecuritySettings />}
          {activeComponent === 'Chat' && <Chat />}
          {activeComponent === 'Comunidades' && <Comunidad token={authToken} userId={Cookies.get('IdUser')}/>}
         
        </div>
        <ModalAdminsitrador isOpen={modalIsOpen} onRequestClose={handleCloseModal}  currentAdmin={currentAdmin} userRole={userRole}
           handleInputChange={handleInputChange}
           onSubmit={handleSubmit} />
        
      </div>
    </>
  ) : null;
};

export default AdminDashboard;
