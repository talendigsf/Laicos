import React, { useEffect, useRef} from 'react';

const AudioPeer = ({ peer, isSelf = false }) => {
    const audioRef = useRef();
    const userStream = useRef(null);
    useEffect(() => {
        if (isSelf && userStream.current) {
            audioRef.current.srcObject = userStream.current;
        } else {
            peer.on('stream', (stream) => {
                audioRef.current.srcObject = stream;
            });
        }
    }, [peer, isSelf]);

    return <audio ref={audioRef} autoPlay />;
};
export default AudioPeer;
