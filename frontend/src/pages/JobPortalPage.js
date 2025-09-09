import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';

// MUI Components & Icons
import { 
    Container, Typography, Box, Paper, Grid, TextField, Card, CardContent, 
    CardActions, Button, Chip, CircularProgress, Alert 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const JobPortalPage = () => {
    const { authTokens } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/job-listings/', {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                setJobs(response.data);
                setFilteredJobs(response.data); 
            } catch (err) {
                setError('Failed to load job listings.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (authTokens) {
            fetchJobs();
        }
    }, [authTokens]);

    // Effect to filter jobs based on search term
    useEffect(() => {
        const results = jobs.filter(job =>
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredJobs(results);
    }, [searchTerm, jobs]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom>Internship & Job Portal</Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <SearchIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
                    <TextField
                        fullWidth
                        label="Search by title, company, or location..."
                        variant="standard"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Box>
            </Paper>

            <Grid container spacing={3}>
                {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                        <Grid item key={job.id} xs={12} sm={6} md={4}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6" component="div">
                                        {job.title}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', my: 1}}>
                                        <ApartmentIcon fontSize="small" sx={{ mr: 1}}/>
                                        <Typography variant="body2">{job.company_name}</Typography>
                                    </Box>
                                     <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1.5}}>
                                        <LocationOnIcon fontSize="small" sx={{ mr: 1}}/>
                                        <Typography variant="body2">{job.location}</Typography>
                                    </Box>
                                    <Chip label={job.job_type} color="primary" size="small" />
                                    <Typography variant="body2" sx={{ mt: 2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical' }}>
                                        {job.description}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" variant="contained" href={job.application_url} target="_blank" rel="noopener noreferrer">
                                        Apply Now
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography sx={{textAlign: 'center', mt: 4}}>No job listings match your search.</Typography>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default JobPortalPage;