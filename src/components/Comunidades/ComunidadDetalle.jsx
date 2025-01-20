import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import {
    listarCanales,
    listarComunidadesporId,
    crearCanal,
    actualizarCanal,
    eliminarCanal,
    enviarMensaje,
    listarMensajes
} from '../../services/comunidadService';
import CanalVoz from '../canal/canaldevoz';
import '../../css/ComunidadDetalle.css';
import io from 'socket.io-client';

const URL = process.env.REACT_APP_DOMINIO;
const socket = io(`${URL}`, {
    auth: {
        token: Cookies.get('authToken')
    },
    transports: ['websocket']
});



const ComunidadDetalle = () => {
    const authToken = Cookies.get('authToken');
    const { comunidadId } = useParams();
    const [canales, setCanales] = useState([]);
    const [comunidad, setComunidad] = useState(null);
    const [nuevoCanal, setNuevoCanal] = useState({ nombre: '', tipo: 'texto' });
    const [canalEditando, setCanalEditando] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [canalActivo, setCanalActivo] = useState(null);
    const [mostrarCrearCanal, setMostrarCrearCanal] = useState(false);
    const [mostrarMiembros, setMostrarMiembros] = useState(false);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState("");
    const userId = Cookies.get('IdUser');
    const [usuariosConectados, setUsuariosConectados] = useState(new Set());

    useEffect(() => {
        if (!socket) return;
        socket.on('actualizarUsuariosConectados', (usuarios) => {
            const usuariosConectadosSet = new Set(usuarios.map((u) => u.userInfo._id));
            setUsuariosConectados(usuariosConectadosSet);
        });
        socket.on('mensajeRecibido', (mensaje) => {
            setMensajes((prevMensajes) => [...prevMensajes, mensaje]);
        });


        return () => {
            socket.off('mensajeRecibido');
        };
    }, [socket]);

    const isUserConnected = (miembroId) => usuariosConectados.has(miembroId);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await listarComunidadesporId(authToken, comunidadId);
                setComunidad(response.data);
                const canalesResponse = await listarCanales(comunidadId, authToken);
                setCanales(canalesResponse.data);
                setMiembros(response.data.administradores);

                if (canalActivo && canalesResponse.data.find(canal => canal._id === canalActivo)) {
                    const mensajesResponse = await listarMensajes(authToken, canalActivo);
                    setMensajes(mensajesResponse.data);
                } else {
                    setCanalActivo(null); // Reset canalActivo if it doesn't exist
                }
            } catch (error) {
                console.error('Error al obtener los datos de la comunidad:', error);
            }
        };
        fetchData();
    }, [comunidadId, authToken, canalActivo]);
    const handleEnviarMensaje = async () => {
        if (nuevoMensaje.trim() === "" || !canalActivo) return;
        const mensaje = {
            emisor: userId,
            receptor: comunidadId,
            mensaje: nuevoMensaje,
        };

        try {
            const response = await enviarMensaje(authToken, canalActivo, mensaje);
            socket.emit('nuevoMensaje', response.data);
            setMensajes([...mensajes, response.data]);
            setNuevoMensaje("");
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
        }
    };

    const handleCreateChannel = async () => {
        try {
            const response = canalEditando
                ? await actualizarCanal(authToken, canalEditando._id, nuevoCanal)
                : await crearCanal(authToken, comunidadId, nuevoCanal);

            setCanales((prev) =>
                canalEditando
                    ? prev.map((canal) => canal._id === canalEditando._id ? response.data : canal)
                    : [...prev, response.data]
            );

            setNuevoCanal({ nombre: '', tipo: 'texto' });
            setMostrarCrearCanal(false);
            setCanalEditando(null); 
        } catch (error) {
            console.error('Error al crear o actualizar el canal:', error);
        }
    };

    const handleEditChannel = (canal) => {
        setNuevoCanal({ nombre: canal.nombre, tipo: canal.tipo });
        setCanalEditando(canal);
        setMostrarCrearCanal(true);
    };

    const handleDeleteChannel = async (canalId) => {
        try {
            const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este canal?");
            if (!confirmDelete) return;

            await eliminarCanal(authToken, canalId);
            setCanales(canales.filter(canal => canal._id !== canalId));
            if (canalId === canalActivo) setCanalActivo(null);
        } catch (error) {
            console.error('Error al eliminar el canal:', error);
        }
    };

    if (!comunidad) return <div className="loading">Cargando...</div>;

    return (
        <div className="comunidad-detalle">
            <div className="sidebar-contenedor">
                <div className="comunidad-info">
                    <h2>{comunidad.nombre}</h2>
                    <button onClick={() => {
                        setNuevoCanal({ nombre: '', tipo: 'texto' });
                        setMostrarCrearCanal(true);
                        setCanalEditando(null);
                    }}>
                        Crear Canal
                    </button>
                </div>
                <ul className="lista-canales">
                    {canales.map(canal => (
                        <li key={canal._id} className={`canal ${canalActivo === canal._id ? 'activo' : ''}`}>
                            <button onClick={() => {
                                setCanalActivo(canal._id);
                                listarMensajes(authToken, canal._id).then(res => setMensajes(res.data));
                            }} className="btn-canal">
                                <span className={`icono-canal ${canal.tipo}`}></span>
                                {canal.nombre}
                            </button>
                            <div className="acciones-canal">
                                <button onClick={() => handleEditChannel(canal)}>Editar</button>
                                <button onClick={() => handleDeleteChannel(canal._id)} className="btn-eliminar">Eliminar</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="contenido-principal">
                <div className="encabezado-comunidad">
                    <h1>{comunidad.nombre}</h1>
                    <button onClick={() => setMostrarMiembros(!mostrarMiembros)} className="btn-miembros">
                        {mostrarMiembros ? 'Ocultar Miembros' : 'Mostrar Miembros'}
                    </button>
                </div>
                {canalActivo && canales.find(canal => canal._id === canalActivo)?.tipo === 'voz' ? (
                    <CanalVoz canalId={canalActivo} />
                ) : (
                    canalActivo && (
                        <div className="chat">
                            <ul className="lista-mensajes">
                                {mensajes.map(mensaje => (
                                    <li key={mensaje._id}>
                                        <strong>{mensaje.emisor.nombre}: </strong>{mensaje.mensaje}
                                    </li>
                                ))}
                            </ul>
                            <div className="mensaje-input">
                                <input
                                    type="text"
                                    placeholder="Escribe un mensaje"
                                    value={nuevoMensaje}
                                    onChange={(e) => setNuevoMensaje(e.target.value)}
                                />
                                <button onClick={handleEnviarMensaje}>Enviar</button>
                            </div>
                        </div>
                    )
                )}
            </div>
            {mostrarMiembros && (
                <div className="panel-miembros">
                    <h3>Miembros</h3>
                    <ul className="lista-miembros">
                        {miembros.map(miembro => (
                            <li key={miembro.administrador._id} className="miembro">
                                <span className={`estado ${isUserConnected(miembro.administrador._id) ? 'conectado' : 'desconectado'}`}>
                                    {isUserConnected(miembro.administrador._id) ? '🟢' : '⚪️'}
                                </span>
                                {miembro.administrador.nombre}  {miembro.administrador.apellido}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {mostrarCrearCanal && (
                <div className="modal">
                    <div className="modal-contenido">
                        <h3>{canalEditando ? "Editar Canal" : "Crear Nuevo Canal"}</h3>
                        <input
                            type="text"
                            placeholder="Nombre del canal"
                            value={nuevoCanal.nombre}
                            onChange={(e) => setNuevoCanal({ ...nuevoCanal, nombre: e.target.value })}
                        />
                        <select
                            value={nuevoCanal.tipo}
                            onChange={(e) => setNuevoCanal({ ...nuevoCanal, tipo: e.target.value })}
                        >
                            <option value="texto">Texto</option>
                            <option value="voz">Voz</option>
                        </select>
                        <button onClick={handleCreateChannel}>
                            {canalEditando ? "Actualizar Canal" : "Crear Canal"}
                        </button>
                        <button onClick={() => setMostrarCrearCanal(false)}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComunidadDetalle;
