import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faComments, faTrash, faHeart } from '@fortawesome/free-solid-svg-icons';
import Cookies from 'js-cookie';

const PostCard = ({
  post,
  URL,
  handleUserClick,
  darLike,
  openModal,
  handleEdit,
  handleDelete,
  editingPostId,
  editingContent,
  editingPostMedia,
  saveEdit,
  setEditingContent,
  setEditingPostMedia,
}) => {
  const isEditing = editingPostId === post._id;

  return (
    <div className="post">
      <div className="cabecera">
        <div
          className="contenedorcabecera"
          onClick={() => handleUserClick(post.AdminId._id)}
        >
          {post.AdminId.foto ? (
            <img
              className="avatar-admin"
              src={post.AdminId.foto}
              alt={`${post.AdminId.nombre} ${post.AdminId.apellido}`}
            />
          ) : (
            <span>
              {post.AdminId.nombre.charAt(0)}
              {post.AdminId.apellido.charAt(0)}
            </span>
          )}
          <div className="contenedorcabecera-sub">
            <h3 className="cabeceraNombre">
              {post.AdminId
                ? `${post.AdminId.nombre} ${post.AdminId.apellido}`
                : 'Usuario desconocido'}
            </h3>
            <span className="cabeceraNombre">
              {new Date(post.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      {isEditing ? (
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
          <button
            className="btnpost"
            onClick={() => saveEdit(post._id)}
          >
            Guardar
          </button>
        </>
      ) : (
        <>
          {post.media &&
            (post.media.match(/\.(mp4|webm|ogg)$/) ? (
              <video className="postmedia" controls>
                <source src={`${URL}${post.media}`} type="video/mp4" />
                Tu navegador no soporta la reproducción de este video.
              </video>
            ) : (
              <img
                src={`${URL}${post.media}`}
                alt="Post media"
                className="postmedia"
              />
            ))}
          <p>{post.content}</p>
          <div className="post-footer">
            <FontAwesomeIcon
              className="btnposts"
              icon={faHeart}
              onClick={() => darLike(post._id)}
            />
            <span className="span-btn">{post.likes.length}</span>
            <FontAwesomeIcon
              className="btnposts"
              icon={faComments}
              onClick={() => openModal(post)}
            />
            <span className="span-btn">{post.comments.length}</span>
            {post.AdminId._id === Cookies.get('IdUser') && (
              <div className="post-footer">
                <FontAwesomeIcon
                  className="btnposts"
                  icon={faEdit}
                  onClick={() => handleEdit(post)}
                />
                <FontAwesomeIcon
                  className="btnposts"
                  icon={faTrash}
                  onClick={() => handleDelete(post._id)}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PostCard;
