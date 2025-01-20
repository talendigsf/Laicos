import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { getDioesis } from '../../services/diocesisService';
import Swal from 'sweetalert2';
import '../../css/ParroquiaForm.css';

// Asegúrate de que el modal esté vinculado a un elemento principal
Modal.setAppElement('#root');

const ParroquiaForm = ({ isOpen, onClose, onSubmit, parroquia }) => {
    const [nombre, setNombre] = useState('');
    const [dioesisId, setDioesisId] = useState('');
    const [dioesisList, setDioesisList] = useState([]);

    useEffect(() => {
        const fetchDioesis = async () => {
            const data = await getDioesis();
            setDioesisList(data);
        };
        fetchDioesis();
    }, []);

    useEffect(() => {
        if (parroquia) {
            setNombre(parroquia.nombre);
            setDioesisId(parroquia.dioesis._id);
        } else {
            setNombre('');
            setDioesisId('');
        }
    }, [parroquia]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ nombre, dioesis: dioesisId });

        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Registro Exitoso!',
            text: 'La parroquia se ha registrado correctamente.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        });

        setNombre('');
        setDioesisId('');
        onClose(); // Cierra el modal después de enviar el formulario
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            contentLabel="Formulario de Parroquia"
            className="modal"
            overlayClassName="overlay"
        >
            <h2>{parroquia ? 'Editar Parroquia' : 'Nueva Parroquia'}</h2>
            <form onSubmit={handleSubmit}>
                <input className='textoParroquia'
                    type="text"
                    placeholder="Nombre de la Parroquia"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                />
                <select className='selectParroquia'
                    value={dioesisId}
                    onChange={(e) => setDioesisId(e.target.value)}
                    required
                >
                    <option value="">Selecciona una Diócesis</option>
                    {dioesisList.map((dioesis) => (
                        <option key={dioesis._id} value={dioesis._id}>
                            {dioesis.nombre}
                        </option>
                    ))}
                </select>
                <button className='selectParroquia' type="submit">
                    {parroquia ? 'Actualizar' : 'Crear'}
                </button>
            </form>
            <button onClick={onClose} className="close-button">Cerrar</button>
        </Modal>
    );
};

export default ParroquiaForm;
