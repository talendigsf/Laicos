import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import '../../css/UserFeed.css';
import { useNavigate, useParams } from 'react-router-dom';

const UserFeed = () => {
    const { userId } = useParams();
    const [userData, setUserData] = useState([]);
    const [adminData, setAdminData] = useState(null);
    const [error, setError] = useState(null);
    const URL = process.env.REACT_APP_DOMINIO;
    const authToken = Cookies.get('authToken');
    const navigate = useNavigate();

    useEffect(() => {
        const loadUserData = async () => {
            try {
                // Cargar las publicaciones del usuario
                const response = await fetch(`${URL}/api/post/feed/user/${userId}`, {
                    headers: { Authorization: `Bearer ${authToken}` },
                });

                // Verificar si la respuesta fue exitosa
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error al cargar publicaciones');
                }

                const data = await response.json();

                // Si no hay publicaciones, obtener los datos del administrador
                if (!data || data.length === 0) {
                    const adminResponse = await fetch(`${URL}/api/administradores/${userId}`, {
                        headers: { Authorization: `Bearer ${authToken}` },
                    });

                    if (!adminResponse.ok) {
                        const adminError = await adminResponse.json();
                        throw new Error(adminError.message || 'Error al cargar los datos del administrador');
                    }

                    const adminData = await adminResponse.json();
                    console.log(adminData); // Para depuración
                    setAdminData(adminData.admin); // Establecer los datos del administrador
                } else {
                    const postsArray = Object.values(data);
                    setUserData(postsArray); // Establecer las publicaciones del usuario
                }
            } catch (err) {
                setError(err.message || 'Error al cargar los datos del usuario');
            }
        };

        loadUserData();
    }, [userId, URL, authToken]);


    if (error) return <div className="error">{error}</div>;

    // Obtén los datos del primer administrador
    const firstAdmin = userData[0]?.AdminId;

    return (
        <div className="user-feed">
            <header className="user-header">
                <button className='button-back' onClick={() => navigate(-1)}>Volver</button>
                {firstAdmin && (
                    <>
                        {firstAdmin.foto ? (
                            <img src={firstAdmin.foto} alt={firstAdmin.nombre} className="profile-picture" />
                        ) : (
                            <div className="profile-initial">
                                {firstAdmin.nombre.charAt(0)}{firstAdmin.apellido.charAt(0)}
                            </div>
                        )}
                        <div className="user-inf">
                            <h1 className="user-title-h1">{firstAdmin.nombre}</h1>
                            <p className="user-title">{firstAdmin.apellido}</p>
                        </div>
                    </>
                )}
            </header>
            {userData.length > 0 ? (
                <div className="post-grid">
                    {userData.map((post) => (
                        <div key={post._id} className="post-conte">
                            {post.media && (
                                post.media.match(/\.(mp4|webm|ogg)$/) ? (
                                    <video className="post-image" controls>
                                        <source src={`${URL}${post.media}`} type="video/mp4" />
                                        Tu navegador no soporta la reproducción de este video.
                                    </video>
                                ) : (
                                    <img src={`${URL}${post.media}`} alt="Post media" className="post-image" />
                                )
                            )}
                            <div className="post-overlay">
                                <div className="post-info">
                                    <span>❤️ {post.likes.length}</span>
                                    <span>💬 {post.comments.length}</span>
                                </div>
                            </div>
                            <p className="post-caption">{post.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-posts">
                    <p>Este usuario no tiene publicaciones.</p>
                </div>
            )}
        </div>
    );
};

export default UserFeed;