import Modal from 'react-modal';
import '../../css/Modal.css';

const Administrador = ({isOpen, onRequestClose , currentAdmin, userRole, handleInputChange, onSubmit})=>{


    return(
        <Modal  isOpen={isOpen} onRequestClose={onRequestClose}>
        <h2>{currentAdmin._id ? 'Editar Administrador' : 'Añadir Administrador'}</h2>
        <form onSubmit={onSubmit}>
          <label>
            Nombre:
            <input
              type="text"
              name="nombre"
              value={currentAdmin.nombre}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Apellido:
            <input
              type="text"
              name="apellido"
              value={currentAdmin.apellido}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={currentAdmin.email}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Sexo:
            <select
              name="sexo"
              value={currentAdmin.sexo}
              onChange={handleInputChange}
            >
              <option value="Seleccionar">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </label>
          <label>
            Celular:
            <input
              type="tel"
              name="celular"
              value={currentAdmin.celular}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Fecha de Nacimiento:
            <input
              type="date"
              name="nacimiento"
              value={currentAdmin.nacimiento}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Rol de Usuario:
            <select
              name="rolUsuario"
              value={currentAdmin.rolUsuario}
              onChange={handleInputChange}

            >
              <option value="miembro">Miembro</option>
              {userRole !== 'clero' && <option value="Administrador">Administrador</option>} {/* Solo mostrar si no es clero */}
              <option value="clero">Clero</option>
            </select>
          </label>
          <label>
            Contraseña:
            <input
              type="password"
              name="password"
              value={currentAdmin.password}
              onChange={handleInputChange}
              required
            />
          </label>
          <button type="submit">{currentAdmin._id ? 'Actualizar' : 'Crear'}</button>
          <button type="button" onClick={onRequestClose}>Cancelar</button>
        </form>
      </Modal>
    );
}
export default Administrador;