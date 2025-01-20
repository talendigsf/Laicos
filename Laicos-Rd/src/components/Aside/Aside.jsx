import '../../css/Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { faUser, faClipboardList, faChartPie, faChartArea, faCog, faBars } from '@fortawesome/free-solid-svg-icons';

const Aside = ({handleComponentChange, userRole})=>{
const [isHovered, setIsHovered] = useState(false);
return(
  <div className={`sidebar ${isHovered ? 'expanded' : 'collapsed'}`}
  onMouseEnter={() => setIsHovered(true)}
  onMouseLeave={() => setIsHovered(false)} >
  {/* Icono del menú visible solo en modo colapsado */}
  
  <FontAwesomeIcon
    icon={faBars}
    className="menu-icon"
    onClick={() => setIsHovered(!isHovered)}
  />
  {isHovered && <h2 className='tituloSider'>{userRole}</h2>}

  <div className='options' >
    {isHovered && <a className='options' href="#" onClick={() => handleComponentChange('feed')}>
      <FontAwesomeIcon icon={faClipboardList} /> Feed
    </a>
    }
  </div>

  <div className='options'>
    {isHovered && <a className='options' href="#" onClick={() => handleComponentChange('Actividades')}>
      <FontAwesomeIcon icon={faChartPie} />{isHovered && ' Actividades'}
    </a>}
  </div>
  <div className='options'>
    {isHovered && <a className='options' href="#" onClick={() => handleComponentChange('Comunidades')}>
      <FontAwesomeIcon icon={faChartPie} />{isHovered && 'Comunidades'}
    </a>}
  </div>

  <div className='options'>
    {isHovered && <a className='options' href="#" onClick={() => handleComponentChange('Chat')}>
      <FontAwesomeIcon icon={faChartPie} /> {isHovered && 'Chat'}

    </a>}
  </div>
  {/* Renderizar opciones de administración solo si el rol es Administrador */}
  {(userRole === 'Administrador' || userRole === 'clero') && (
    <>
      {isHovered && <a href="#" onClick={() => handleComponentChange('Administradores')}>
        <FontAwesomeIcon icon={faUser} /> {isHovered && ' Administrador'}
      </a>}
      {isHovered && <a href="#" onClick={() => handleComponentChange('Parroquias')}>
        <FontAwesomeIcon icon={faChartArea} />  {isHovered && ' Parroquias'}
      </a>}
      {isHovered && <a href="#" onClick={() => handleComponentChange('Diocesis')}>
        <FontAwesomeIcon icon={faChartArea} />{isHovered && ' Diocesis'}
      </a>}
    </>
  )}

  {/* Siempre mostrar la configuración de seguridad */}
  {isHovered && <a href="#" onClick={() => handleComponentChange('security')}>
    <FontAwesomeIcon icon={faCog} />{isHovered && ' Seguridad'}
  </a>}
</div>
)

}

export default Aside;