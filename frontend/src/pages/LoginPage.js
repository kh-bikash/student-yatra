import React, { useContext, useState, useRef, useCallback } from 'react';
import {AuthContext} from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import { TextField, Button, Typography, Box, Paper, Grid, Divider, CircularProgress, Alert } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const webcamRef = useRef(null);

    const dataURLtoFile = (dataurl, filename) => {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){ u8arr[n] = bstr.charCodeAt(n); }
        return new File([u8arr], filename, {type:mime});
    }

    const handleFaceLogin = useCallback(async () => {
        setLoading(true);
        setError('');
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
            setError("Could not capture image from webcam.");
            setLoading(false);
            return;
        }
        const file = dataURLtoFile(imageSrc, 'face-login.jpg');
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await fetch('http://localhost:8000/api/face-login/', { method: 'POST', body: formData });
            const data = await response.json();
            if (response.ok) {
                loginUser(null, null, data); 
            } else {
                setError(data.error || "Face login failed.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [webcamRef, loginUser]);

    const handleSubmit = e => {
        e.preventDefault();
        const username = e.target.username.value;
        const password = e.target.password.value;
        loginUser(username, password, null); 
    };

    return (
        // --- THIS IS THE FIX ---
        // A Grid container that fills the entire screen below the app bar.
        <Grid container component="main" sx={{ height: 'calc(100vh - 64px)' }}>
            
            {/* Left Branding Panel with a background image */}
            <Grid item xs={false} sm={4} md={7}
                sx={{
                    backgroundImage: 'url(https://source.unsplash.com/random?university,campus,library)',
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Right Form Panel */}
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square 
                  // Use flexbox to perfectly center all the content vertically and horizontally
                  sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <SchoolIcon sx={{ m: 1, bgcolor: 'primary.main', color: 'white', borderRadius: '50%', p: 1, fontSize: '40px' }} />
                    <Typography component="h1" variant="h5">
                        Welcome to Student Yatra
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField margin="normal" required fullWidth id="username" label="Username" name="username" autoComplete="username" autoFocus />
                        <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="current-password" />
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                            Sign In
                        </Button>
                        <Box textAlign='center'>
                            <Link to="/register" style={{color: 'inherit'}}>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Box>
                    </Box>
                    <Divider sx={{ my: 2, width: '100%' }}>OR</Divider>
                    <Typography variant="body1" align="center" gutterBottom>
                        Login with your Face
                    </Typography>
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
                    <Button fullWidth variant="contained" color="secondary" onClick={handleFaceLogin} disabled={loading}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Scan Face & Login'}
                    </Button>
                    {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
                </Box>
            </Grid>
        </Grid>
    );
};

export default LoginPage;