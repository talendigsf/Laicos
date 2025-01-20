import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2'; // Utilizar SweetAlert para alertas personalizadas
import '../css/ActividadesList.css'; // Importar el CSS




const ActividadesList = () => {
  const [actividades, setActividades] = useState([]);
  const userRole = Cookies.get('userRole');
  const userId = Cookies.get('IdUser');
  const authToken = Cookies.get('authToken');
  const [nuevoEnlace, setNuevoEnlace] = useState('');
  const isInscrito = (actividad) => {
    return actividad.inscritos.some(inscrito => inscrito === userId);
  };
  const URL = process.env.REACT_APP_DOMINIO;
  useEffect(() => {

    const fetchActividades = async () => {
      try {
        const response = await axios.get(`${URL}/api/actividades/`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setActividades(response.data);

      } catch (error) {
        console.error('Error al obtener actividades:', error);
      }
    };

    fetchActividades();

  }, [authToken]);



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
      // Refrescar la lista de actividades si es necesario
      const response = await axios.get(`${URL}/api/actividades`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setActividades(response.data);
    } catch (error) {
      Swal.fire('Error', 'No se pudo inscribir en la actividad.', 'error');
    }
  };
  // Añadir nueva actividad usando SweetAlert
  const handleAddActividad = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Añadir Nueva Actividad',
      html: `
      <input id="swal-input1" class="swal2-input" placeholder="Nombre de la actividad">
      <input id="swal-input2" class="swal2-input" placeholder="Descripción">
      <input id="swal-input3" class="swal2-input" type="date" placeholder="Fecha">
      <input id="swal-input4" class="swal2-input" placeholder="Ubicación">
      <input id="swal-input5" class="swal2-input" placeholder="Número máximo de participantes" type="number">
      <select id="swal-input6" class="swal2-input">
        <option value="Pendiente">Pendiente</option>
        <option value="En Curso">En Curso</option>
        <option value="Finalizado">Finalizado</option>
      </select>
    `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value,
          document.getElementById('swal-input3').value,
          document.getElementById('swal-input4').value,
          document.getElementById('swal-input5').value, // Nuevo campo
          document.getElementById('swal-input6').value,
        ];
      },
    });

    if (formValues) {
      console.log(formValues)
      const [nombre, descripcion, fecha, ubicacion, maxParticipantes, estado, AdminId = userId] = formValues;
      try {
        const valor = await axios.post(`${URL}/api/actividades`, {
          nombre,
          descripcion,
          fecha,
          ubicacion,
          maxParticipantes: maxParticipantes || 0, // Asegúrate de que tenga un valor predeterminado
          estado,
          AdminId

        }, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        Swal.fire('Guardado', 'La actividad ha sido añadida.', 'success');



        // Refrescar la lista de actividades
        const response = await axios.get(`${URL}/api/actividades`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setActividades(response.data);
      } catch (error) {
        Swal.fire('Error', 'No se pudo añadir la actividad.', 'error');
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(nuevoEnlace)
      .then(() => {
        Swal.fire('Copiado', 'El enlace ha sido copiado al portapapeles.', 'success');
      })
      .catch(err => {
        Swal.fire('Error', 'No se pudo copiar el enlace.', 'error');
      });
  };

  const handleEditActividad = async (id) => {
    const actividadToUpdate = actividades.find((actividad) => actividad._id === id);

    // Verificar si el usuario es el creador o administrador
    if (actividadToUpdate.AdminId !== userId && userRole !== 'Administrador') {
      Swal.fire('Error', 'No tienes permisos para editar esta actividad.', 'error');
      return;
    }

    // Continuar con la lógica de edición si la verificación pasa...
    const localDate = new Date(actividadToUpdate.fecha);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

    const { value: formValues } = await Swal.fire({
      title: 'Editar Actividad',
      html: `
        <input id="swal-input1" class="swal2-input" value="${actividadToUpdate.nombre}" placeholder="Nombre de la actividad">
        <input id="swal-input2" class="swal2-input" value="${actividadToUpdate.descripcion}" placeholder="Descripción">
        <input id="swal-input3" class="swal2-input" type="date" value="${new Date(actividadToUpdate.fecha).toISOString().split('T')[0]}" placeholder="Fecha">
        <input id="swal-input4" class="swal2-input" value="${actividadToUpdate.ubicacion}" placeholder="Ubicación">
        <input id="swal-input5" class="swal2-input" value="${actividadToUpdate.maxParticipantes}" placeholder="Número máximo de participantes" type="number">
        <select id="swal-input6" class="swal2-input">
          <option value="Pendiente" ${actividadToUpdate.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="En Curso" ${actividadToUpdate.estado === 'En Curso' ? 'selected' : ''}>En Curso</option>
          <option value="Finalizado" ${actividadToUpdate.estado === 'Finalizado' ? 'selected' : ''}>Finalizado</option>
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value,
          document.getElementById('swal-input3').value,
          document.getElementById('swal-input4').value,
          document.getElementById('swal-input5').value,
          document.getElementById('swal-input6').value,
        ];
      },
    });

    if (formValues) {
      try {
        await axios.patch(`${URL}/api/actividades/actividades/${id}`, {
          nombre: formValues[0],
          descripcion: formValues[1],
          fecha: formValues[2],
          ubicacion: formValues[3],
          maxParticipantes: formValues[4],
          estado: formValues[5],
        }, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        Swal.fire('Editado', 'La actividad ha sido actualizada.', 'success');
        const response = await axios.get(`${URL}/api/actividades`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setActividades(response.data);
      } catch (error) {
        Swal.fire('Error', 'No se pudo editar la actividad.', 'error');
      }
    }
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

      // Actualizar la lista de actividades
      const response = await axios.get(`${URL}/api/actividades`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setActividades(response.data);
    } catch (error) {
      Swal.fire('Error', 'No se pudo desinscribir de la actividad.', 'error');
    }
  };




  // Eliminar actividad (sin cambios en esta parte)
  const handleDeleteActividad = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminarlo',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${URL}/api/actividades/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        Swal.fire('Eliminado', 'La actividad ha sido eliminada.', 'success');
        setActividades(actividades.filter((actividad) => actividad._id !== id));
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la actividad.', 'error');
      }
    }
  };


  return (
    <div className="actividades-list-container">
      <h1 className="actividades-list-title">Actividades Comunitarias</h1>
      {userRole === 'Administrador' || userRole === 'clero' ? ( // Condicionar la visualización del botón
        <button className="btn-add-actividad" onClick={handleAddActividad}>Añadir Actividad</button>
      ) : null}


      <ul className="actividades-list">
        {actividades.map((actividad) => (
          <li key={actividad._id} className="actividad-item">
            <h2 className="actividad-title">{actividad.nombre}</h2>
            <p className="actividad-descripcion">{actividad.descripcion}</p>
            <p className="actividad-fecha">
              Fecha: {new Date(actividad.fecha).toISOString().split('T')[0]}
            </p>
            <p className="actividad-estado">Estado: {actividad.estado}</p>
            <p className="actividad-ubicacion">Lugar: {actividad.ubicacion}</p>
            <div className="nuevo-enlace-container">
              
              {/*Estoy aqui para modificar lisandro*/ }

              <p className='newLink-p' ><a className='newLink' href={actividad.enlace} target="_blank" rel="noopener noreferrer">{actividad.enlace}</a></p>
               {/*No me modifique */ }
              <button onClick={() => {
                setNuevoEnlace(actividad.enlace); // Establece el nuevo enlace al hacer clic
                handleCopyLink(); // Copia el enlace
              }}>Copiar Enlace</button>
            </div>
            <p className="actividad-participantes">Inscritos: {actividad.inscritos.length} / {actividad.maxParticipantes}</p>
            {userRole === 'Administrador' || userRole === 'clero' && actividad.AdminId === userId ? ( // Condicionar la visualización de botones de editar y eliminar
              <div className='contenedor-botones-actividades'>
                <button className="btn-edit-actividad" onClick={() => handleEditActividad(actividad._id)}>Editar</button>
                <button className="btn-delete-actividad" onClick={() => handleDeleteActividad(actividad._id)}>Eliminar</button>
              </div>
            ) : null}
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
          </li>
        ))}
      </ul>
    </div>
  );
}
export default ActividadesList;
