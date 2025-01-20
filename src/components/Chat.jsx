import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../css/Chat.css';
import io from 'socket.io-client';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IoSearch } from 'react-icons/io5';
import { faUser, faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import custom from './Modal/modalEmoji'
import { useNavigate } from 'react-router-dom';



const URL = process.env.REACT_APP_DOMINIO;

const socket = io(`${URL}`, {
  auth: {
    token: Cookies.get('authToken')
  }
});


const Chat = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarEmojis, setMostrarEmojis] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [usuariosConectados, setUsuariosConectados] = useState([]);
  const [receptorId, setReceptorId] = useState('');
  const [receptor, setReceptor] = useState([]);
  const [amigos, setAmigos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState([]);
  const [user, setUser] = useState({});
  const [parroquiaId, setParroquiaId] = useState('');
  const [parroquia, setParroquia] = useState('');
  const [esChatGrupal, setEsChatGrupal] = useState(false);
  const userId = Cookies.get('IdUser');
  const authToken = Cookies.get('authToken');
  const mensajesRef = useRef(null);
  const [buscarTermino, setBuscarTermino] = useState('');
  const [mostrarChat, setMostrarChat] = useState(false);
  const navigate = useNavigate();

  const agregarEmoji = (emoji) => {
    setMensaje((prevMensaje) => prevMensaje + emoji.native); // Agrega el emoji al mensaje
    setMostrarEmojis(false);
  };

  function agruparMensajesPorFecha(mensajes) {
    return mensajes.reduce((acumulador, mensaje) => {
      const fecha = new Date(mensaje.fechaEnvio).toISOString().split('T')[0]; // Formato ISO (YYYY-MM-DD)
      if (!acumulador[fecha]) {
        acumulador[fecha] = [];
      }
      acumulador[fecha].push(mensaje);
      return acumulador;
    }, {});
  }

  React.useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);


  useEffect(() => {
    const obtenerParroquia = async () => {
      try {
        const miembroResponse = await axios.get(`${URL}/api/miembros/${userId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        if (miembroResponse.data?.Parroquia) {
          setParroquiaId(miembroResponse.data.Parroquia._id);
          setParroquia(miembroResponse.data.Parroquia);
        }
      } catch (error) {
        console.error('Error al obtener la parroquia:', error);
      }
    };
    obtenerParroquia();
  }, [userId, authToken]);



  // Socket event listeners
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Conectado al servidor con socket ID:', socket.id);
    });

    socket.on('nuevoMensaje', (data) => {
      setMensajes((prevMensajes) => [
        ...prevMensajes,
        { emisor: data.emisorId, mensaje: data.mensaje, fechaEnvio: data.fechaEnvio }
      ]);
    });

    socket.on('historialMensajes', (historial) => {
      setMensajes(historial);
    });


    socket.on('actualizarUsuariosConectados', (usuarios) => {
      const usuariosFiltrados = usuarios.filter(usuario => usuario.userInfo._id !== userId);
      setUsuariosConectados(usuariosFiltrados);
    });


    return () => {
      socket.off('connect');
      socket.off('nuevoMensaje');
      socket.off('actualizarUsuariosConectados');
      socket.off('historialMensajes');
    };
  }, [userId]);

  console.log(usuariosConectados);

  const verificarAmigoEnLinea = (usuarioId) => {
    // Verifica que usuariosConectados no esté vacío
    if (!usuariosConectados || usuariosConectados.length === 0) {
      console.log("No hay usuarios conectados.");
      return false;
    }
  
    // Verifica que usuarioId no sea undefined
    if (!usuarioId) {
      console.log("usuarioId es undefined.");
      return false;
    }
  
    // Buscar al usuario en la lista de conectados usando userInfo._id
    const usuarioConectado = usuariosConectados.find(u => String(u.userInfo._id) === String(usuarioId));
    console.log(usuarioConectado); // Para ver si está encontrando al usuario
  
    // Retorna si se encontró al usuario
    return usuarioConectado ? true : false;
  };
  

  const abrirModal = () => {
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);

  };
  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const [responseUsuario, responseAmigos] = await Promise.all([
          axios.get(`${URL}/api/administradores/${userId}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          }),
          axios.get(`${URL}/api/solicitud/aceptadas`, {
            headers: { Authorization: `Bearer ${authToken}` }
          }),
          axios.get(`${URL}/api/solicitud/pendientes`, {
            headers: { Authorization: `Bearer ${authToken}` }
          })
        ]);
        setUser(responseUsuario.data);
        setAmigos(responseAmigos.data);

      } catch (error) {
        console.error('Error al obtener datos del usuario o amigos:', error);
      }
    };
    obtenerDatosUsuario();
  }, [userId, authToken]);

  // Scroll automático al último mensaje
  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight;
    }
  }, [mensajes]);


  // Sending a message
  const enviarMensaje = useCallback(() => {
    if (!mensaje.trim()) {
      alert("Por favor, escribe un mensaje.");
      return;
    }

    const destino = esChatGrupal ? parroquiaId : receptorId;

    if (!destino) {
      alert("Por favor, selecciona un usuario o grupo receptor.");
      return;
    }

    socket.emit('enviarMensaje', { receptorId: destino, mensaje });

    setMensajes((prevMensajes) => [
      ...prevMensajes,
      { emisor: userId, mensaje, fechaEnvio: new Date(), leido: false }
    ]);

    socket.on('historialMensajes', (historial) => {
      setMensajes(historial);
    });
    setMensaje('');
  }, [mensaje, parroquiaId, receptorId, esChatGrupal, userId]);


  useEffect(() => {
    const obtenerDatos = async () => {
      try {

        const respuestaUsuarios = await fetch(`${URL}/api/administradores`, {
          headers: { 'Authorization': `Bearer ${Cookies.get('authToken')}` },
        });
        const dataUsuarios = await respuestaUsuarios.json();
        setUsuarios(dataUsuarios);

        // Obtener amigos
        const respuestaAmigos = await fetch(`${URL}/api/solicitud/aceptadas`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('authToken')}`
          },
        });
        const dataAmigos = await respuestaAmigos.json();
        setAmigos(dataAmigos);


      } catch (error) {

        console.error('Error al obtener datos:', error);

      }
      setSolicitudesEnviadas([]);
    };

    obtenerDatos();


  }, []);

  const enviarSolicitudAmistad = async (receptorId) => {
    try {
      const respuesta = await fetch(`${URL}/api/solicitud/enviar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('authToken')}`,
        },
        body: JSON.stringify({ receptor: receptorId }),
      });

      const data = await respuesta.json();
      alert(data.message);
      setSolicitudesEnviadas([...solicitudesEnviadas, { receptor: receptorId }]);
    } catch (error) {
      console.error('Error al enviar la solicitud de amistad:', error);
    }
  };

  const VerPerfil = async (userId) => {
    navigate(`/user/feed/${userId}`);
  };


  const manejarTeclaEnter = (event) => {
    if (event.key === 'Enter') {
      enviarMensaje();
    }
  };

  const seleccionarReceptor = useCallback((id) => {
    if (!amigos.find(amigo => amigo._id === id)) {
      alert('Solo puedes chatear con tus amigos.');
      return;
    }
    console.log(amigos)
    setReceptor(amigos.find(amigo => amigo._id === id))
    setReceptorId(id);
    setEsChatGrupal(false);
    setMostrarChat(true);
    socket.emit('cargarHistorial', { receptorId: id });
  }, [amigos]);

  // Función para regresar a la lista de amigos
  const handleBack = () => {
    setMostrarChat(false);  // Oculta el chat y muestra la lista de amigos
  };

  const cambiarAChatGrupal = useCallback(() => {
    if (!parroquiaId) {
      alert('No estás asignado a ninguna parroquia.');
      return;
    }

    setReceptor(parroquia);
    setEsChatGrupal(true);
    setMostrarChat(true);
    setReceptorId(parroquiaId);
    socket.emit('cargarHistorialGrupal', { receptorId: parroquiaId });
  }, [parroquiaId]);

  const esAmigo = (id) => {
    return amigos.some(amigo => amigo._id === id);
  };

  const solicitudEnviada = (id) => {
    return solicitudesEnviadas.some(solicitud => solicitud.receptor === id);
  };

  const amigosFiltrados = amigos.filter((amigo) =>
    `${amigo.nombre} ${amigo.apellido}`.toLowerCase().includes(buscarTermino.toLowerCase())
  );

  useEffect(() => {
    if (receptorId && !esChatGrupal) {
      socket.emit('cargarHistorial', { receptorId });
    }
  }, [receptorId, esChatGrupal]);

  return (
    <div className="chat-container">
      {!mostrarChat ? (
        <div className="lista-amigos">
          <h3 className="titulo-chat">Chats</h3>
          <h5 className="titulo-chat">{user.nombre} {user.apellido}</h5>
          <div className='cabecera'>
            <div className='user-info'>

              {user._id === userId ? (

                <img src={user.foto} alt={user.nombre} className='cover' />
              ) : (
                <span>{user.nombre && user.apellido ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}` : 'NA'}</span>
              )}

            </div>
            <ul className="nav_icons">
              <li className="nav_icons-lista" onClick={abrirModal}>  <FontAwesomeIcon icon={faUser} /></li>

            </ul>

          </div>
          <div className="search_chat">
            <div className='search_chat_contenedor'>
              <input type="text" placeholder='Search or start new chat' className='inputSearch' onChange={(e) => setBuscarTermino(e.target.value)} />
              <IoSearch className='IoSearch' />
            </div>

          </div>
          <div className="chatlist">
            {parroquiaId && (
              <div className="block" onClick={cambiarAChatGrupal}>
                <div >
                  {/* Mostrar iniciales de la parroquia o un ícono */}
                  <span className='iniciales-receptor' >{parroquia && parroquia.nombre ? parroquia.nombre.slice(0, 2).toUpperCase() : 'PA'}</span>
                </div>
                <div className="detalles">
                  <div className="listHead">
                    <h4 className="nombreDetalles">{parroquia.nombre || 'Nombre no disponible'}</h4>
                    <p className="tiempo">En línea</p>
                  </div>
                </div>
              </div>
            )}
            {amigosFiltrados.length > 0 ? (
              amigosFiltrados.map((amigo) => (

                <div
                  key={amigo._id}
                  className="block"
                  onClick={() => seleccionarReceptor(amigo._id)}
                >
                  <div >
                    {amigo.foto ? (
                      <img className='cover' src={amigo.foto} alt={amigo.nombre} />
                    ) : (
                      <span className='iniciales-receptor'>{amigo.nombre && amigo.apellido ? `${amigo.nombre.charAt(0)}${amigo.apellido.charAt(0)}` : 'NA'}</span>
                    )}
                  </div>
                  <div className="detalles">
                    <div className="listHead">
                      <h4 className="nombreDetalles">
                        {amigo?.nombre
                          ? `${amigo.nombre} ${amigo.apellido}`
                          : 'Nombre no disponible'}
                      </h4>
                      <p className="tiempo">
                      {verificarAmigoEnLinea(amigo._id) ? '🟢' : '⚪️'}
                      </p>
                    </div>  
                  </div>
                </div>
              ))
            ) : (
              <li>No se encontraron amigos.</li>
            )}
          </div>
        </div>
      ) : (
        <div className="chat">
          {mostrarEmojis && (
            <div className="emoji"> <Picker className='emojis'
              data={data}
              custom={custom}
              onEmojiSelect={agregarEmoji}
            /></div>

          )}
          {receptorId || esChatGrupal ? (
            <>
              <div className="chat-encabezado">
                <button onClick={handleBack} className="btn-volver">
                  <FontAwesomeIcon icon={faArrowLeft} size={20} />
                </button>
                {receptor.imagen ? (
                  <img
                    src={receptor.foto}
                    alt={`Imagen de ${receptor.nombre}`}
                    className="imagen-receptor"
                  />
                ) : (
                  <div className="iniciales-receptor">
                    {receptor.nombre ? receptor.nombre[0] : "P"}
                    {receptor.apellido ? receptor.apellido[0] : "A"}
                  </div>
                )}
                <span className="nombre-receptor">
                  {receptor.nombre} {receptor.apellido}
                </span>
              </div>
              {/* Historial de mensajes */}

              <div className="historial-mensajes" ref={mensajesRef}>
                {Object.entries(agruparMensajesPorFecha(mensajes)).map(([fecha, mensajesDelDia]) => (
                  <div key={fecha} className="grupo-mensajes">
                    {/* Título con la fecha */}
                    <div className="contenedorfechamensaj">
                      <div className="fecha-mensajes">{fecha}</div>
                    </div>

                    {/* Lista de mensajes para esa fecha */}
                    {mensajesDelDia.map((mensaje, index) => (
                      <div key={index} className={String(mensaje.emisor) === String(userId) ? 'texto-mensaje texto-mensaje-emisor' : 'texto-mensaje texto-mensaje-receptor'}>
                        <p className='mensaje-usaurio'>{mensaje.mensaje}</p>
                        <span className='fecha-emitida'>{new Date(mensaje.fechaEnvio).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </>
          ) : (
            <p>Selecciona un amigo o un grupo para chatear.</p>
          )}
          {/* Componente para enviar mensajes */}
          {receptorId || esChatGrupal ? (
            <div className="input-mensaje">
              <button className="btn-enviar" onClick={() => setMostrarEmojis(!mostrarEmojis)}>
                <span role="img" aria-label="emoji">😀</span>
              </button>
              <input
                className="mensaje"
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={manejarTeclaEnter}
                placeholder="Escribe tu mensaje aquí..."
              />
              <FontAwesomeIcon
                icon={faPaperPlane}
                className="btn-enviar"
                onClick={enviarMensaje}

              />
            </div>
          ) : null
          }
        </div>
      )}
      {mostrarModal && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={cerrarModal}>Cerrar</button>

            <div className="user-list">
              <h3 className="user-list__title">Usuarios:</h3>
              <ul className="user-list__container">
                {usuarios.filter(usuario => usuario._id !== userId).map((usuario) => (
                  <li key={usuario._id} className="user-list__item">
                    <div className="user-list__item-info">
                      <p className="user-list__item-name">{usuario.nombre} {usuario.apellido}</p>
                    </div>
                    <div className="user-list__item-actions">
                      {esAmigo(usuario._id) ? (
                        <div className="user-list__item-friend">
                          <button className="button button--secondary" onClick={() => VerPerfil(usuario._id)}>Perfil</button>
                          <span className="user-list__item-friend-indicator"></span>
                        </div>
                      ) : solicitudEnviada(usuario._id) ? (
                        <div className="user-list__item-request-sent">
                          <button className="button button--secondary" onClick={() => VerPerfil(usuario._id)}>Perfil</button>
                          <button className="button button--disabled" disabled>Solicitud enviada</button>
                        </div>
                      ) : (
                        <div className="user-list__item-actions-container">
                          <button className="button button--secondary" onClick={() => VerPerfil(usuario._id)}>Perfil</button>
                          <button className="button button--primary" onClick={() => enviarSolicitudAmistad(usuario._id)}>Solicitud</button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div >
  );
};

export default Chat;
