import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { getParroquiasByDiocesis, getParroquiasById } from '../services/parroquiaService';
import '../css/Perfil.css';

const EditProfile = () => {
    const [admin, setAdmin] = useState({
        nombre: '',
        apellido: '',
        email: '',
        celular: '',
        sexo: '',
        nacimiento: '',
        foto: '',
    });
    const [miembro, setMiembro] = useState({
        direccion: '',
        estadoCivil: '',
        cargo: '',
        nacionalidad: '',
        Parroquia: '',
    });
    const [diocesis, setDiocesis] = useState([]);
    const [inputParroquia, setInputParroquia] = useState('');
    const [parroquias, setParroquias] = useState([]);
    const [selectedDiocesis, setSelectedDiocesis] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const authToken = Cookies.get('authToken');
    const userId = Cookies.get('IdUser');
    const userRole = Cookies.get('userRole');
    const navigate = useNavigate();
    const URL = process.env.REACT_APP_DOMINIO;

    useEffect(() => {
        const fetchProfileData = async () => {
            if (userId) {
                try {
                    const [adminResponse, miembroResponse, diocesisResponse] = await Promise.all([
                        axios.get(`${URL}/api/administradores/${userId}`, {
                            headers: { Authorization: `Bearer ${authToken}` },
                        }),
                        axios.get(`${URL}/api/miembros/${userId}`, {
                            headers: { Authorization: `Bearer ${authToken}` },
                        }),
                        axios.get(`${URL}/api/diocesis`, {
                            headers: { Authorization: `Bearer ${authToken}` },
                        })
                    ]);

                    setAdmin(adminResponse.data);
                    if (miembroResponse.data) {
                        setMiembro(miembroResponse.data);
                        setSelectedDiocesis(miembroResponse.data.Parroquia?.diocesis || '');
                        if (miembroResponse.data.Parroquia) {
                            const parroquiasData = await getParroquiasById(miembroResponse.data.Parroquia._id);
                            setInputParroquia(parroquiasData.nombre);
                            setParroquias([parroquiasData]);
                        }
                    }
                    setDiocesis(diocesisResponse.data);
                } catch (error) {
                    console.error('Error al obtener los datos:', error);
                    setError('Error al cargar los datos del perfil. Por favor, intente de nuevo.');
                }
            } else {
                setError('No se encontró el ID de usuario en las cookies.');
            }
            setLoading(false);
        };

        fetchProfileData();
    }, [userId, URL, authToken]);

    const handleAdminChange = (e) => {
        setAdmin({ ...admin, [e.target.name]: e.target.value });
    };

    const handleMiembroChange = (e) => {
        setMiembro({ ...miembro, [e.target.name]: e.target.value });
    };

    const handleDiocesisChange = async (e) => {
        const selectedDiocesisId = e.target.value;
        setSelectedDiocesis(selectedDiocesisId);

        if (selectedDiocesisId) {
            try {
                const parroquiasData = await getParroquiasByDiocesis(selectedDiocesisId);
                setParroquias(parroquiasData || []);
                setMiembro({ ...miembro, Parroquia: '' });
            } catch (error) {
                console.error('Error al obtener las parroquias:', error);
                setParroquias([]);
                setError('Error al obtener las parroquias. Por favor, intente de nuevo.');
            }
        } else {
            setParroquias([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await axios.patch(`${URL}/api/administradores/${admin._id}`, admin, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            if (miembro._id) {
                await axios.patch(`${URL}/api/miembros/${miembro._id}`, miembro, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
            } else {
                await axios.post(`${URL}/api/miembros`, { ...miembro, _id: admin._id }, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });
            }

            setSuccess('Perfil actualizado correctamente');
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            setError('Error al actualizar el perfil. Por favor, intente de nuevo.');
        }
    };

    if (loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="edit-profile">
            <div className="navigation">
                <button className="backs-button" onClick={() => navigate(-1)}>
                    ← Volver
                </button>
                <button className="next-button" onClick={() => navigate('/sessions')}>
                    Sesiones →
                </button>
            </div>

            <div className="profile-header">
                {admin.foto ? (
                    <div className="profile-imagen">
                        <img src={admin.foto} alt="Foto de perfil" className="profile-image" />
                    </div>
                ) : (
                    <div className="profile-initials">
                        {admin.nombre.charAt(0)}{admin.apellido.charAt(0)}
                    </div>
                )}
                <h2 className="user-role">{userRole}</h2>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="edit-profile-form">
                <div className="form-section">
                    <h2>Datos Generales</h2>
                    <input
                        type="text"
                        name="nombre"
                        value={admin.nombre}
                        onChange={handleAdminChange}
                        placeholder="Nombre"
                    />
                    <input
                        type="text"
                        name="apellido"
                        value={admin.apellido}
                        onChange={handleAdminChange}
                        placeholder="Apellido"
                    />
                    <input
                        type="email"
                        name="email"
                        value={admin.email}
                        onChange={handleAdminChange}
                        placeholder="Email"
                    />
                    <input
                        type="tel"
                        name="celular"
                        value={admin.celular}
                        onChange={handleAdminChange}
                        placeholder="Teléfono"
                    />
                    <input
                        type="date"
                        name="nacimiento"
                        value={admin.nacimiento ? new Date(admin.nacimiento).toISOString().split('T')[0] : ''}
                        onChange={handleAdminChange}
                    />
                    <input
                        type="text"
                        name="foto"
                        value={admin.foto}
                        onChange={handleAdminChange}
                        placeholder="URL de la foto"
                    />
                    <select name="sexo" value={admin.sexo} onChange={handleAdminChange}>
                        <option value="">Seleccione sexo</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div className="form-section">
                    <h2>Miembro</h2>
                    <input
                        type="text"
                        name="direccion"
                        value={miembro.direccion}
                        onChange={handleMiembroChange}
                        placeholder="Dirección"
                    />
                    <input
                        type="text"
                        name="estadoCivil"
                        value={miembro.estadoCivil}
                        onChange={handleMiembroChange}
                        placeholder="Estado Civil"
                    />
                    <input
                        type="text"
                        name="cargo"
                        value={miembro.cargo}
                        onChange={handleMiembroChange}
                        placeholder="Cargo"
                    />
                    <input
                        type="text"
                        name="nacionalidad"
                        value={miembro.nacionalidad}
                        onChange={handleMiembroChange}
                        placeholder="Nacionalidad"
                    />
                    <input
                        type="text"
                        name="parroquiaNombre"
                        value={inputParroquia}
                        readOnly
                        placeholder="Parroquia seleccionada"
                    />

                    <h3>Cambio Parroquia</h3>
                    <select value={selectedDiocesis} onChange={handleDiocesisChange}>
                        <option value="">Seleccione una diócesis</option>
                        {diocesis.map(d => (
                            <option key={d._id} value={d._id}>{d.nombre}</option>
                        ))}
                    </select>
                    <select name="Parroquia" value={miembro.Parroquia} onChange={handleMiembroChange}>
                        <option value="">Seleccione una parroquia</option>
                        {parroquias.map(p => (
                            <option key={p._id} value={p._id}>{p.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button">Guardar Cambios</button>
                    <button type="button" className="sessions-button" onClick={() => navigate('/sessions')}>
                        Ver todas las sesiones iniciadas
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;