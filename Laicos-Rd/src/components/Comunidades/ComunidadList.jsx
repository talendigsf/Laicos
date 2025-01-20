
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarComunidades, eliminarComunidad, editarComunidad } from '../../services/comunidadService';
import ComunidadForm from '../Comunidades/ComunidadForm';
import AgregarMiembroForm from '../Comunidades/AgregarMiembroForm';
import ComunidadDetalle from '../Comunidades/ComunidadDetalle';
import Modal from '../Modal/Modal';
import Swal from 'sweetalert2';
import EditarComunidadForm from '../Comunidades/EditForm';
import '../../css/ComunidadList.css';

const ComunidadList = ({ token, userId }) => {
    const [comunidades, setComunidades] = useState([]);
    const [selectedComunidad, setSelectedComunidad] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchComunidades = async () => {
            try {
                const response = await listarComunidades(token);
                setComunidades(response.data);
            } catch (error) {
                console.log('Error al listar las comunidades:', error);
            }
        };
        fetchComunidades();
    }, [token]);

    // Función de actualización de comunidades
    const ActualizacionComunidades = async () => {
        try {
            const response = await listarComunidades(token);
            setComunidades(response.data);
        } catch (error) {
            console.log('Error al listar las comunidades:', error);
        }
    };

    // Guardar cambios en la comunidad
    const handleSave = async (datosActualizados) => {
        try {
            await editarComunidad(token, selectedComunidad._id, datosActualizados);
            setModalType(null);
            ActualizacionComunidades();
            Swal.fire('Actualizado', 'La comunidad se ha actualizado con éxito', 'success');
        } catch (error) {
            Swal.fire('Error', 'Hubo un problema al actualizar la comunidad', 'error');
        }
    };

    // Eliminar comunidad
    const handleDelete = async (comunidadId) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await eliminarComunidad(token, comunidadId);
                    Swal.fire('Eliminada', 'La comunidad ha sido eliminada con éxito.', 'success');
                    ActualizacionComunidades();
                } catch (error) {
                    Swal.fire('Error', 'Hubo un problema al eliminar la comunidad.', 'error');
                }
            }
        });
    };

    // Función para actualizar la lista de miembros
    const actualizarMiembros = async () => {
        try {
            const response = await listarComunidades(token);
            const comunidadActualizada = response.data.find(c => c._id === selectedComunidad._id);
            setSelectedComunidad(comunidadActualizada);
        } catch (error) {
            console.log('Error al actualizar la comunidad:', error);
        }
    };

    // Abrir el modal de acuerdo al tipo
    const handleOpenModal = (type, comunidad = null) => {
        setSelectedComunidad(comunidad);
        setModalType(type);
        setIsModalOpen(true);
    };

    // Cerrar el modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalType(null);
        setSelectedComunidad(null);
    };

    // Alternar el formulario de creación
    const toggleForm = () => {
        setShowForm(!showForm);
    };

    // Filtrado de comunidades visibles
    const comunidadesVisibles = comunidades.filter(comunidad =>
        comunidad.visibilidad === 'publica' ||
        comunidad.administradores.some(admin => admin.administrador === userId)
    );

    // Verifica si el usuario es admin
    const esAdmin = selectedComunidad ? selectedComunidad.administradores.some(admin => String(admin.administrador) === userId && admin.rol === 'admin') : false;

    return (
        <div className="comunidad-list">
            <div className="contenedorCrearComunidad">
                <button className="toggle-form-button" onClick={toggleForm}>
                    {showForm ? 'Cerrar Formulario' : 'Crear Comunidad'}
                </button>
                {showForm && <ComunidadForm token={token} actualizarComunidad={ActualizacionComunidades} />}
            </div>

            <h2 className="titulo-comunidad">Lista de Comunidades</h2>
            <ul className="lista-comunidad">
                {comunidadesVisibles.map((comunidad) => {
                    const esMiembro = comunidad.administradores.some(admin => String(admin.administrador) === userId);
                    const esCreador = comunidad.administradores.some(admin => String(admin.administrador) === userId && admin.rol === 'admin');
                    return (
                        <li
                            className="lista-comunidad-li"
                            key={comunidad._id}
                            onClick={() => setSelectedComunidad(comunidad)}
                        >
                            <div className="comunidad-card">
                                <h3>{comunidad.nombre}</h3>
                                <p>{comunidad.descripcion}</p>
                                <span className={`comunidad-tipo ${comunidad.visibilidad}`}>
                                    {comunidad.visibilidad === 'publica' ? 'Pública' : 'Privada'}
                                </span>
                                <div className='contenedor-botones'>
                                    {esCreador && (
                                        <>
                                            <button className='contenedor-botones-tamano' onClick={() => handleOpenModal('editar', comunidad)}>Editar</button>
                                            <button className='contenedor-botones-tamano' onClick={() => handleDelete(comunidad._id)}>Eliminar</button>
                                        </>
                                    )}
                                    {comunidad.visibilidad === 'publica' && !esMiembro && (
                                        <button onClick={() => handleOpenModal('agregarMiembro', comunidad)}>
                                            Unirme a la Comunidad
                                        </button>
                                    )}
                                    {esCreador && (
                                        <button className='contenedor-botones-tamano' onClick={() => handleOpenModal('agregarMiembro', comunidad)}>
                                            Agregar Miembro
                                        </button>
                                    )}
                                    <button onClick={() => navigate(`/detalle/${comunidad._id}`)}>Ver Detalle</button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                {modalType === 'agregarMiembro' && (
                    <AgregarMiembroForm
                        token={token}
                        comunidadId={selectedComunidad?._id}
                        esAdmin={esAdmin}
                        Iduser={userId}
                        esPublica={selectedComunidad?.visibilidad === 'publica'}
                        miembros={selectedComunidad?.administradores || []}
                        actualizarMiembros={actualizarMiembros}
                    />
                )}
                {modalType === 'editar' && (
                    <EditarComunidadForm
                        comunidad={selectedComunidad}
                        onGuardar={handleSave}
                        onCancelar={handleCloseModal}
                    />
                )}
            </Modal>
        </div>
    );
};

export default ComunidadList;
