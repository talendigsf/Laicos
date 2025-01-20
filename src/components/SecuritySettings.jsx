import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import '../css/seguridad.css'

const SecuritySettings = () => {
  const [isTwoFaEnabled, setIsTwoFaEnabled] = useState(false); // Estado por defecto es deshabilitado
  const authToken = Cookies.get('authToken');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const URL = process.env.REACT_APP_DOMINIO;

  useEffect(() => {
    const TwoFaEnabled = Cookies.get('isTwoFaEnabled');
    if(TwoFaEnabled==='true'){
      setIsTwoFaEnabled(TwoFaEnabled);
    }
  
       
       
  }, []);

  const handleToggleTwoFa = async () => {
    setSuccess('');
    setError('');
    const newValue = !isTwoFaEnabled;
    setIsTwoFaEnabled(newValue);

    // Guardar el nuevo estado en las cookies
    Cookies.set('isTwoFaEnabled', newValue, { expires: 7, secure: true, sameSite: 'Strict' });

    try {
      // Enviar la configuración actualizada al servidor
      await axios.post(`${URL}/api/administradores/config`, 
        {
          isTwoFaEnabled: newValue
        }, 
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          }
        }
      );
      setSuccess('Configuración de 2FA actualizada con éxito');
    } catch (error) {
      console.error('Error al actualizar la configuración de seguridad:', error);

      setError('No se pudo actualizar la configuración de 2FA. Por favor, intente de nuevo.');
    }finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="security-settings">
     <h2 className="security-settings__title">Configuración de Seguridad</h2>
     {error && <div className="security-settings__alert security-settings__alert--error">{error}</div>}
      {success && <div className="security-settings__alert security-settings__alert--success">{success}</div>}
      <div className="security-settings__option">
        <label className="security-settings__label">
          <span className="security-settings__label-text">Autenticación de dos factores (2FA)</span>
          <div className="security-settings__toggle">
            <input
              type="checkbox"
              checked={isTwoFaEnabled}
              onChange={handleToggleTwoFa}
              disabled={isLoading}
              className="security-settings__toggle-input"
            />
            <span className="security-settings__toggle-slider"></span>
          </div>
        </label>
      </div>
    </div>
  );
};

export default SecuritySettings;
