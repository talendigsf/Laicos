import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import Cookies from 'js-cookie';
const URL = process.env.REACT_APP_DOMINIO;

const socket = io(`${URL}`, {
    auth: { token: Cookies.get('authToken') },
    transports: ['websocket']
});

const CanalVideo = ({ canalId }) => {
    const [peers, setPeers] = useState([]);
    const userStream = useRef(null); // Referencia al stream de la cámara local del usuario
    const peersRef = useRef([]);
    const [micEnabled, setMicEnabled] = useState(true);
    const [camEnabled, setCamEnabled] = useState(true);
    const userId = Cookies.get('IdUser');

    const obtenerStreamConVideoONombre = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: camEnabled });
            return { stream, isCameraAvailable: true };
        } catch (error) {
            console.error('No se pudo acceder a la cámara', error);
            return { isCameraAvailable: false };
        }
    };

    const createPeer = (userToSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream, // Aquí solo enviamos el stream local a otros peers
        });

        peer.on('signal', (signal) => {
            socket.emit('sending-signal', { userToSignal, callerID, signal });
        });

        return peer;
    };

    useEffect(() => {
        socket.on('user-joined', async ({ userName, userId: joiningUserId, socketId }) => {
            if (joiningUserId !== userId && !peersRef.current.some(peer => peer.peerID === joiningUserId)) {
                const { stream, isCameraAvailable } = await obtenerStreamConVideoONombre();
                const newPeer = isCameraAvailable ? createPeer(joiningUserId, socketId, userStream.current) : null;

                const newPeerData = { peerID: joiningUserId, peer: newPeer, nombre: userName, hasVideo: isCameraAvailable };

                peersRef.current.push(newPeerData);
                setPeers(prevPeers => [...prevPeers, newPeerData]);
            }
        });

        socket.on('user-left', (userId) => {
            peersRef.current = peersRef.current.filter(peer => peer.peerID !== userId);
            setPeers(peers => peers.filter(peer => peer.peerID !== userId));
        });

        return () => {
            socket.off('user-joined');
            socket.off('user-left');
            socket.emit('leave-channel', canalId);
        };
    }, [canalId, userId]);

    useEffect(() => {
        const fetchData = async () => {
            const { stream } = await obtenerStreamConVideoONombre();
            userStream.current = stream;

            socket.emit('join-channel', canalId);

            socket.on('users-in-channel', (usuarios) => {
                const filteredUsers = usuarios.filter(user => user.userId !== userId);
                filteredUsers.forEach((user) => {
                    if (!peersRef.current.some(peer => peer.peerID === user.userId)) {
                        const peer = createPeer(user.userId, user.socketId, userStream.current);
                        const peerData = { peerID: user.userId, peer, nombre: user.nombreUsuario, hasVideo: true };

                        peersRef.current.push(peerData);
                        setPeers(prevPeers => [...prevPeers, peerData]);
                    }
                });
            });
        };

        fetchData();

        return () => {
            if (userStream.current) {
                userStream.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [canalId, userId]);

    const toggleMic = () => {
        if (userStream.current) {
            userStream.current.getAudioTracks()[0].enabled = !micEnabled;
            setMicEnabled(!micEnabled);
        }
    };

    const toggleCamera = async () => {
        setCamEnabled(!camEnabled);
        
        if (userStream.current) {
            userStream.current.getVideoTracks().forEach(track => track.stop());
        }
        
        const { stream } = await obtenerStreamConVideoONombre();
        userStream.current = stream;
        
        peersRef.current.forEach(peerObj => {
            if (peerObj.peer && peerObj.peer.streams[0]?.getVideoTracks().length > 0) {
                const localVideoTrack = stream.getVideoTracks()[0];
                if (localVideoTrack) {
                    peerObj.peer.replaceTrack(peerObj.peer.streams[0].getVideoTracks()[0], localVideoTrack, stream);
                }
            }
        });
    };

    return (
        <div>
            <h4>Canal de Video</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                {/* Contenedor de video para cada usuario remoto (excluye al propio usuario) */}
                {peers.map((peerData) => (
                    <div
                        key={peerData.peerID}
                        style={{ width: '200px', height: '300px', border: '2px solid #ccc', padding: '5px' }}
                    >
                        <p>{peerData.nombre}</p>
                        <video
                            ref={(video) => {
                                if (video) {
                                    peerData.peer.on('stream', (stream) => {
                                        video.srcObject = stream;
                                    });
                                }
                            }}
                            autoPlay
                            style={{ width: '100%' }}
                        />
                    </div>
                ))}
                {/* Contenedor de video para el usuario actual */}
                <div style={{ width: '200px', height: '300px', border: '2px solid #ccc', padding: '5px' }}>
                    <p>Tú</p>
                    <video
                        ref={(video) => {
                            if (video && userStream.current) {
                                video.srcObject = userStream.current;
                            }
                        }}
                        autoPlay
                        muted
                        style={{ width: '100%' }}
                    />
                    <button onClick={toggleMic}>{micEnabled ? 'Silenciar' : 'Activar Micrófono'}</button>
                    <button onClick={toggleCamera}>{camEnabled ? 'Apagar Cámara' : 'Encender Cámara'}</button>
                </div>
            </div>
        </div>
    );
};

export default CanalVideo;
