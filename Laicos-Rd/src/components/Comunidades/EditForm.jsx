import React, { useState } from 'react';

const EditarComunidadForm = ({ comunidad, onGuardar, onCancelar }) => {
    const [nombre, setNombre] = useState(comunidad.nombre);
    const [descripcion, setDescripcion] = useState(comunidad.descripcion);

    const handleSubmit = (e) => {
        e.preventDefault();
        onGuardar({ nombre, descripcion });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Editar Comunidad</h2>
            <label>Nombre</label>
            <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
            />
            <label>Descripción</label>
            <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
            />
            <button type="submit">Guardar</button>
            <button type="button" onClick={onCancelar}>Cancelar</button>
        </form>
    );
};

export default EditarComunidadForm;
