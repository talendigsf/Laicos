import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import '../css/feed.css';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faComments, faTrash, faThumbsUp, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import avatarDegault from '../img/avatar-default.png'

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState('');
  const [media, setMedia] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingPostMedia, setEditingPostMedia] = useState('');
  const [likedPosts, setLikedPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const navigate = useNavigate();

  const authToken = Cookies.get('authToken');
  const URL = process.env.REACT_APP_DOMINIO;

  const obtenerPosts = async () => {
    try {
      const response = await axios.get(`${URL}/api/post/feed`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setPosts(response.data);
      const userId = Cookies.get('IdUser');
      const likedPostIds = response.data
        .filter(post => post.likes.includes(userId))
        .map(post => post._id);
      setLikedPosts(likedPostIds);

    } catch (error) {
      console.error('Error al obtener las publicaciones:', error);
    }
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (postId) => {
    try {
      await axios.delete(`${URL}/api/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setPosts(posts.filter(post => post._id !== postId));
      obtenerPosts();
    } catch (error) {
      console.error('Error al borrar la publicación:', error);
    }
  };
  const handleMediaChange = (e) => {
    setMedia(e.target.files[0]);
  };

  const darLike = async (postId) => {
    try {
      await axios.post(`${URL}/api/post/like/${postId}`, {}, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (likedPosts.includes(postId)) {
        setLikedPosts(likedPosts.filter((id) => id !== postId));
      } else {
        setLikedPosts([...likedPosts, postId]);
      }
      obtenerPosts();
    } catch (error) {
      console.error('Error al dar like a la publicación:', error);
    }
  };

  const crearPost = async () => {

    if (!newPostContent.trim()) {
      alert("El contenido del post no puede estar vacío");
      return;
    }
    const formData = new FormData();

    formData.append('content', newPostContent);
    if (media) {
      formData.append('media', media);
    }

    try {
      const response = await axios.post(`${URL}/api/post`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${authToken}`,
        },
      });
      setPosts([response.data, ...posts]);
      setNewPostContent('');
      setNewPostMedia('');
      setMedia(null);
    } catch (error) {
      console.error(error);
    }
    obtenerPosts();
  };



  const handleCommentSubmit = async (postId) => {
    if (!newComment.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }
  
    try {
      const response = await axios.post(
        `${URL}/api/post/comentar/${postId}`,
        { comment: newComment },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
  
      const updatedComment = response.data;
  
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, updatedComment] }
            : post
        )
      );
  
      if (selectedPost?._id === postId) {
        setSelectedPost((prevSelectedPost) => ({
          ...prevSelectedPost,
          comments: [...prevSelectedPost.comments, updatedComment],
        }));
      }
  
      setNewComment('');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
    }
  };
  
  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setEditingContent(post.content);
    setEditingPostMedia(post.media);
  };

  const saveEdit = async (postId) => {
    try {
      await axios.put(
        `${URL}/api/post/${postId}`,
        { content: editingContent, media: editingPostMedia },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      setPosts(
        posts.map(post =>
          post._id === postId ? { ...post, content: editingContent, media: editingPostMedia } : post
        )
      );
      setEditingPostId(null);
      setEditingContent('');
      setEditingPostMedia('');
    } catch (error) {
      console.error('Error al editar la publicación:', error);
    }
  };
  const handleUserClick = (userId) => {

    navigate(`/user/feed/${userId}`);
  };
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden'; // Desactiva el scroll del body
    } else {
      document.body.style.overflow = 'auto'; // Restaura el scroll del body
    }

    return () => {
      document.body.style.overflow = 'auto'; // Limpieza al desmontar
    };
  }, [isModalOpen]);

  useEffect(() => {
    obtenerPosts();
  }, [authToken]);

  const getAvatar = (foto, nombre, apellido, avatarDefault) => {
    if (foto) {
      return <img className='avatar-admin' src={foto} alt={nombre} />;
    } else if (nombre && apellido) {
      return <span className='avatar-initial'>{nombre.charAt(0)}{apellido.charAt(0)}</span>;
    } else {
      return <img className='avatar-admin' src={avatarDefault} alt="Avatar por defecto" />;
    }
  };

  return (

    <div className="feed">
      <div className="new-post">
        <div className='contenedortextarea'>
          <textarea
            className="inputTextarea "
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="¿Qué estás pensando?"
          />
        </div>
        <div className='contenedorinputfile'>
          <input
            className="inputfile"
            type="file"
            onChange={handleMediaChange}
            accept="image/*,video/*"
          />
          <button className="btnNewpost" onClick={crearPost}>
            Publicar
          </button>
        </div>
      </div>
      <div className="posts">
        {posts.map((post) => (
          <div key={post._id} className="post">
            <div className="cabecera" onClick={() => handleUserClick(post.AdminId._id)}>
              <div className="contenedorcabecera" >
                {getAvatar(post.AdminId.foto, post.AdminId.nombre, post.AdminId.apellido, avatarDegault)}
              </div>
              <div className="contenedorcabecera-sub">
                <h3 className='cabeceraNombre'>{post.AdminId ? `${post.AdminId.nombre} ${post.AdminId.apellido}` : 'Usuario desconocido'}</h3>
                <span className='cabeceraNombre'>{new Date(post.createdAt).toLocaleString()}</span>
              </div>
            </div>
            {editingPostId === post._id ? (
              <>
                <textarea
                  className="inputpost"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                />
                <input
                  className="inputpost"
                  type="text"
                  value={editingPostMedia}
                  onChange={(e) => setEditingPostMedia(e.target.value)}
                  placeholder="URL de la imagen o video"
                />
                <button className="btnpost" onClick={() => saveEdit(post._id)}>
                  Guardar
                </button>
              </>
            ) : (
              <>

                {post.media && (
                  post.media.match(/\.(mp4|webm|ogg)$/) ? (
                    <video className="postmedia" controls>
                      <source src={`${URL}${post.media}`} type="video/mp4" />
                      Tu navegador no soporta la reproducción de este video.
                    </video>
                  ) : (
                    <img src={`${URL}${post.media}`} alt="Post media" className="postmedia" />
                  )
                )}
                <p>{post.content}</p>
                <div className="post-footer">
                  <div className="contenedorlikes">
                    <FontAwesomeIcon className={`btnposts ${likedPosts.includes(post._id) ? 'liked' : ''}`} icon={faHeart} onClick={() => darLike(post._id)} /><span className='span-btn'>{post.likes.length}</span>
                  </div>
                  <div className="contenedorcomentarios">
                    <FontAwesomeIcon className='btnposts' icon={faComments} onClick={() => openModal(post)} /><span className='span-btn'>{post.comments.length}</span>
                  </div>


                  {post.AdminId._id === Cookies.get('IdUser') && (
                    <div className="contendor-administradores">
                      <div className="contendorEditar">
                        <FontAwesomeIcon className='btnposts' icon={faEdit} onClick={() => handleEdit(post)} />
                      </div>
                      <div className="contedorEliminar">
                        <FontAwesomeIcon className='btnposts' icon={faTrash} onClick={() => handleDelete(post._id)} />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="modal-instagram">
        {selectedPost && (
          <div className="contenedor-comentarios">
            <div className="contenedor-media">
              {selectedPost.media && (
                selectedPost.media.match(/\.(mp4|webm|ogg)$/) ? (
                  <video className="postmedia" controls>
                    <source src={`${URL}${selectedPost.media}`} type="video/mp4" />
                    Tu navegador no soporta la reproducción de este video.
                  </video>
                ) : (
                  <img src={`${URL}${selectedPost.media}`} alt="Post media" className="postmedia" />
                )
              )}
            </div>
            <div className="contenedor-comm">
              <div className="contendepost">
                <div>
                  {selectedPost.AdminId.foto ? (
                    <img className='avatar-admin' src={selectedPost.AdminId.foto} alt={selectedPost.AdminId.nombre} />
                  ) : (
                    <span>{selectedPost.AdminId.nombre.charAt(0)}{selectedPost.AdminId.apellido.charAt(0)}</span>
                  )}
                  <span className="nombre-admin">{selectedPost.AdminId.nombre} {selectedPost.AdminId.apellido}</span>
                </div>
              </div>
              <div className="contenedor-infomacion">
                <div className="contenedor-inf">
                  <span className="nombre-admin">{selectedPost.AdminId.nombre} {selectedPost.AdminId.apellido} </span><p className="contenido-post">{selectedPost.content}</p>
                  {selectedPost.comments?.length > 0 ? (
                    selectedPost.comments.map((comment, index) => (
                      <div className="contenedordecomentarios" key={index}>
                        <div>
                          {comment.AdminId?.foto ? (
                            <img className='avatar-admin' src={comment.AdminId.foto} alt={`${comment.AdminId?.nombre}`} />
                          ) : (
                            <span>{comment.AdminId ? comment.AdminId.nombre.charAt(0) + comment.AdminId.apellido.charAt(0) : ''}</span>
                          )}
                        </div>
                        <span className="nombre-admin">
                          {comment.AdminId?.nombre} {comment.AdminId?.apellido}:
                          <p className="texto-comentario">{comment.comment}</p>
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>No hay comentarios aún.</p> // Muestra un mensaje si no hay comentarios
                  )}

                </div>

                <FontAwesomeIcon className='btnposts color' icon={faHeart} onClick={() => darLike(selectedPost._id)} /><span className='span-btn'>{selectedPost.likes.length}</span>
                <div className="input-comentario">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario"
                  />
                  <button onClick={() => handleCommentSubmit(selectedPost._id)}>Comentar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Feed;
