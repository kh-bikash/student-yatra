import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// MUI Components & Icons
import {
    Button,
    TextField,
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Link
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const CertificatesPage = () => {
    const { authTokens } = useContext(AuthContext);
    const [certificates, setCertificates] = useState([]);
    const [title, setTitle] = useState('');
    const [organization, setOrganization] = useState('');
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch certificates
    const fetchCertificates = async () => {
        if (!authTokens?.access) {
            setError('You must be logged in.');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.get('http://localhost:8000/api/certificates/', {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            setCertificates(response.data);
        } catch (err) {
            setError('Failed to fetch certificates.');
            console.error(err.response ? err.response.data : err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCertificates();
    }, [authTokens]);

    // Handle file selection
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle certificate upload
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('issuer', organization); // Make sure matches Django model field
        formData.append('certificate_file', file); // Make sure matches Django model field

        try {
            await axios.post('http://localhost:8000/api/certificates/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authTokens.access}`
                }
            });

            // Reset form and refresh list
            setTitle('');
            setOrganization('');
            setFile(null);
            setError('');
            document.getElementById('file-input').value = '';
            fetchCertificates();
        } catch (err) {
            setError('Failed to upload certificate.');
            console.error(err.response ? err.response.data : err);
        }
    };

    // Handle delete certificate
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/certificates/${id}/`, {
                headers: { Authorization: `Bearer ${authTokens.access}` }
            });
            fetchCertificates();
        } catch (err) {
            setError('Failed to delete certificate.');
            console.error(err.response ? err.response.data : err);
        }
    };

    if (loading) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Loading certificates...</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
                {/* Upload Form */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>Upload Certificate</Typography>
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                label="Certificate Title"
                                fullWidth
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                label="Issuing Organization"
                                fullWidth
                                required
                                value={organization}
                                onChange={(e) => setOrganization(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Button
                                variant="contained"
                                component="label"
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                Choose File
                                <input
                                    type="file"
                                    id="file-input"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </Button>
                            {file && <Typography sx={{ mb: 2, fontStyle: 'italic' }}>Selected: {file.name}</Typography>}
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                startIcon={<CloudUploadIcon />}
                            >
                                Upload
                            </Button>
                            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                        </Box>
                    </Paper>
                </Grid>

                {/* Certificate List */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>My Certificates</Typography>
                        <List>
                            {certificates.length > 0 ? (
                                certificates.map(cert => (
                                    <ListItem key={cert.id} divider>
                                        <InsertDriveFileIcon sx={{ mr: 2, color: 'primary.main' }} />
                                        <ListItemText
                                            primary={<Link href={cert.certificate_file} target="_blank" rel="noopener noreferrer">{cert.title}</Link>}
                                            secondary={`Issued by: ${cert.issuer}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(cert.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))
                            ) : (
                                <Typography>You have not uploaded any certificates yet.</Typography>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default CertificatesPage;
