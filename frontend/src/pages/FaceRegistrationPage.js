import React, { useState, useRef, useCallback, useContext } from 'react';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';
import Webcam from "react-webcam";
import { Container, Typography, Box, Paper, Button, CircularProgress, Alert } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const FaceRegistrationPage = () => {
    const { authTokens } = useContext(AuthContext);
    const webcamRef = useRef(null);
    const [imgSrc, setImgSrc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type:mime});
    }

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);
    }, [webcamRef, setImgSrc]);

    const handleRegister = async () => {
        if (!imgSrc) {
            setError("Please capture a photo first.");
            return;
        }
        setLoading(true);
        setError('');
        setMessage('');

        const file = dataURLtoFile(imgSrc, 'face-capture.jpg');
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await axios.post('http://localhost:8000/api/face-register/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authTokens.access}`
                }
            });
            setMessage(response.data.message);
            setImgSrc(null); // Clear image after successful registration
        } catch (err) {
            setError(err.response?.data?.error || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>Face Registration</Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Capture a clear, forward-facing photo to enable facial recognition login.
                </Typography>
                <Box sx={{ my: 2, position: 'relative', width: '100%', maxWidth: 400, mx: 'auto' }}>
                    {imgSrc ? (
                        <img src={imgSrc} alt="capture" style={{ width: '100%', height: 'auto', borderRadius: '8px' }} />
                    ) : (
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
                        />
                    )}
                </Box>
                {message && <Alert severity="success" sx={{ my: 2 }}><CheckCircleIcon fontSize="inherit" /> {message}</Alert>}
                {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
                
                {imgSrc ? (
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button variant="contained" onClick={handleRegister} disabled={loading}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : "Register This Face"}
                        </Button>
                        <Button variant="outlined" onClick={() => setImgSrc(null)}>Retake Photo</Button>
                    </Box>
                ) : (
                    <Button variant="contained" startIcon={<CameraAltIcon />} onClick={capture}>
                        Capture Photo
                    </Button>
                )}
            </Paper>
        </Container>
    );
};

export default FaceRegistrationPage;