import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Header.css';
import { FaBell, FaSearch, FaCaretDown, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import Cookies from 'js-cookie';
import axios from 'axios';
import Modal from '../components/Modal/modalNotificacion';
import Aside from '../components/Aside/Aside'

const Header = ({handleComponentChange}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState({});
  const navigate = useNavigate();
  const userId = Cookies.get('IdUser');
  const authToken = Cookies.get('authToken');
  const userRole = Cookies.get('userRole');
  const [notificaciones, setShowNotificaciones] = useState([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const URL = process.env.REACT_APP_DOMINIO;
  const clearCookies = () => {
    Cookies.remove('authToken');
    Cookies.remove('userRole');
    Cookies.remove('twoFactorVerified');
    Cookies.remove('IdUser');
    Cookies.remove('isTwoFaEnabled');
  };
  // clearCookies()
  const handleClickOutside = (event) => {
    if (!event.target.closest('.profile-container')) {
      setShowMenu(false);
    }
    if (!event.target.closest('.notification-container')) {
      setShowModal(false); // Cierra el modal si se hace clic fuera de él
    }
  };
  
  // Función para obtener notificaciones
  const obtenerNotificaciones = async () => {
    if (!authToken) return;

    try {
      const response = await axios.get(`${URL}/api/notificaciones/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setShowNotificaciones(response.data);
    } catch (error) {
      console.error("Error al obtener notificaciones:", error);
    }
  };
  const obtenerSolicitudesPendientes = async()=>{
     // Obtener solicitudes pendientes
     const respuestaSolicitudes = await fetch(`${URL}/api/solicitud/pendientes`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Cookies.get('authToken')}`
      },
    });
    const dataSolicitudes = await respuestaSolicitudes.json() ;
    setSolicitudesPendientes(dataSolicitudes);
  }

  useEffect(() => {
    obtenerNotificaciones();
    obtenerSolicitudesPendientes();
  }, [authToken]);


  const handleLogout = async () => {
    //clearCookies();
    try {
      await axios.post(`${URL}/api/administradores/logout`, {}, {
        headers: {
          'Authorization': `Bearer ${Cookies.get('authToken')}`
        }
      });

      clearCookies();
      Object.keys(Cookies.get()).forEach(function(cookieName) {
        Cookies.remove(cookieName, { path: '/', domain: 'tudominio.com' });
      });
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const toggleNotificaciones = () => {
    setShowModal((prevState) => !prevState);
  };
  const toggleMenu = () => {
    setShowMenu((prevState) => !prevState);
  };

  const obtenerUsuario = async () => {
    if (!authToken) {
      console.log("Token no encontrado. Redirigiendo al login...");
      navigate('/login');
      return;
    }

    if (!userId) return;

    try {
      const response = await axios.get(`${URL}/api/administradores/${userId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      });
      if (response.data) {
       
        setUser(response.data);
      } else {
        console.log("No se encontraron datos de usuario.");
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  };

  useEffect(() => {
    if (!authToken || !userRole) {
      navigate('/login');
    } else {
      obtenerUsuario();
    }
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-container')) {
        setShowMenu(false);
      }
    };
    const checkAuthToken = setInterval(() => {
      const token = Cookies.get('authToken');
      if (!token) {
        navigate('/login');
      }
    }, 60000);

    return () => clearInterval(checkAuthToken);

  }, [userId]);


  return (
    <header>
      <nav className="navegador">
        {<Aside handleComponentChange={handleComponentChange} userRole={userRole}/>}
        <h1 className='titulo-header'>LAICOS-RD</h1>
        <ul className="nav-icon-lista">
          <li className="notification-container ">
            <FaBell className="nav-icon" title="Notificaciones" onClick={toggleNotificaciones} />{solicitudesPendientes.length || notificaciones.length}
            {notificaciones.length > 0 && (
              <span className="notification-badge">{notificaciones.length}</span>
            )}
          </li>
          <li><FaSearch className="nav-icon " title="Buscar" /></li>
          <li className="profile-li icon">
            <FaUser className="profile-pic" onClick={toggleMenu} />
            <FaCaretDown className="arrow-icon" onClick={toggleMenu} />
            {showMenu && (
              <ul className="dropdown-menu">
                {user.nombre && user.apellido ? (
                  <li className="greeting-container">
                    <div className="profile-image">
                      {user.foto ? (
                        <img src={user.foto} alt={user.nombre} />
                      ) : (
                        <span>{user.nombre.charAt(0)}{user.apellido.charAt(0)}</span>
                      )}
                    </div>
                    <div className="greeting">
                      <p className='user-names'>Hola, {user.nombre} {user.apellido}</p>
                      <p className='user-email'>{user.email}</p>
                    </div>
                  </li>
                ) : (
                  <li>No se encontraron datos de usuario.</li>
                )}
                <hr />
               <ul className='dropdown-buttons'>
               <li>
                  <button onClick={() => navigate("/Perfil")} className="dropdown-button">
                    <FaCog /> Mi Perfil
                  </button>
                </li>
                <li>
                  <button onClick={handleLogout} className="dropdown-button">
                    <FaSignOutAlt /> Cerrar sesión
                  </button>
                </li>
               </ul>
              </ul>
            )}
          </li>
        </ul>
      </nav>
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        notifications={notificaciones}
        solicitudesPendientes={solicitudesPendientes}
      />
    </header>
  );
};


export default Header;
