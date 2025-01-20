
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../css/ActividadDetalle.css'; // Importar el CSS

const ActividadDetalle = () => {
  const { id } = useParams(); // Obtén el ID de la actividad de los parámetros de la URL
  const [actividad, setActividad] = useState(null);
  const [error, setError] = useState(null);
  const authToken = Cookies.get('authToken');
  const userId = Cookies.get('IdUser');
  const isInscrito = (actividad) => {
    return actividad.inscritos.some(inscrito => inscrito === userId);
  };
  const URL = process.env.REACT_APP_DOMINIO;

  useEffect(() => {
    obtenerActividad();
  }, [id]);

  const obtenerActividad = async () => {
    try {
      const response = await axios.get(`${URL}/api/actividades/actividades/${id}`);
      setActividad(response.data);
    } catch (error) {
      setError('Error al obtener la actividad');
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (!actividad) {
    return <p>Cargando detalles de la actividad...</p>;
  }

  const handleInscribirse = async (idActividad) => {
    try {
      await axios.post(`${URL}/api/actividades/${idActividad}/inscribir`, {
        miembroId: userId, // El ID del miembro que se inscribe
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      Swal.fire('Éxito', 'Te has inscrito en la actividad.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo inscribir en la actividad.', 'error');
    }
    obtenerActividad();
  };

  const handleCancelarInscripcion = async (idActividad) => {
    try {
      await axios.post(`${URL}/api/actividades/${idActividad}/cancelar-inscripcion`, {
        miembroId: userId, // El ID del miembro que se desinscribe
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`, // Añadir el token de autenticación en los headers
        },
      });

      Swal.fire('Éxito', 'Te has desinscrito de la actividad.', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo desinscribir de la actividad.', 'error');
    }
    obtenerActividad();
  };

  return (
    <div className="actividad-detalle-container">
      <h1 className="actividad-detalle-title">Detalles de la Actividad: {actividad.nombre}</h1>
      <div className="actividad-detalle-cuadro">
        <p className="actividad-detalle-descripcion">Descripción: {actividad.descripcion}</p>
        <div className="actividad-info">
          <p className="actividad-fecha">Fecha: {new Date(actividad.fecha).toISOString().split('T')[0]}</p>
          <p className="actividad-estado">Estado: {actividad.estado}</p>
          <p className="actividad-ubicacion">Lugar: {actividad.ubicacion}</p>
          <p className="actividad-participantes">Inscritos: {actividad.inscritos.length} / {actividad.maxParticipantes}</p>
        </div>
      </div>
      {!isInscrito(actividad) ? (
        <button
          className="btn-inscribir"
          onClick={() => handleInscribirse(actividad._id)}
          disabled={actividad.inscritos.length >= actividad.maxParticipantes}
        >
          Inscribirse
        </button>
      ) : (
        <button
          className="btn-cancelar-inscripcion"
          onClick={() => handleCancelarInscripcion(actividad._id)}
        >
          Cancelar Inscripción
        </button>
      )}
    </div>
  );
};

export default ActividadDetalle;
