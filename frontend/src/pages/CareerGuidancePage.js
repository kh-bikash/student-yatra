import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Container, Typography, Box, Paper, Button, CircularProgress, Alert,
    Accordion, AccordionSummary, AccordionDetails, List, ListItem,
    ListItemIcon, ListItemText, Link
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkIcon from '@mui/icons-material/Link';

const CareerGuidancePage = () => {
    const { authTokens } = useContext(AuthContext);
    const [guidance, setGuidance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateGuidance = async () => {
        setLoading(true);
        setError('');
        setGuidance(null);
        try {
            const response = await axios.get('http://localhost:8000/api/career-guidance/', {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            setGuidance(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'An unexpected error occurred while fetching guidance.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // This smart function finds the main array in the AI's response,
    // regardless of what the key is named.
    const getCareerDetailsArray = (guidanceData) => {
        if (!guidanceData || typeof guidanceData !== 'object') return [];
        const arrayKey = Object.keys(guidanceData).find(key => Array.isArray(guidanceData[key]));
        return arrayKey ? guidanceData[arrayKey] : [];
    };

    const careerDetails = getCareerDetailsArray(guidance);

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
                <ModelTrainingIcon sx={{ fontSize: '3rem', color: 'primary.main' }} />
                <Typography variant="h4" gutterBottom>
                    AI Career Advisor
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Get personalized career suggestions, identify skill gaps, and discover learning resources based on the skills you've tracked.
                </Typography>
                <Button 
                    variant="contained" 
                    size="large" 
                    onClick={handleGenerateGuidance} 
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate My Career Path'}
                </Button>
            </Paper>

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            
            {/* Display the results only if we have them */}
            {careerDetails.length > 0 && (
                <Box>
                    {careerDetails.map((career, index) => (
                        <Accordion key={index} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">{career.careerTitle || career.career_title || 'Unnamed Career Path'}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom><LightbulbIcon fontSize="small" sx={{verticalAlign: 'middle', mr: 1}}/>Why It's a Good Fit</Typography>
                                    <Typography variant="body2">{career.reasoning || 'No reasoning provided.'}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom><CheckCircleIcon fontSize="small" sx={{verticalAlign: 'middle', mr: 1}}/>Skills to Develop</Typography>
                                    {Array.isArray(career.skillsToDevelop || career.skills_to_develop) && (career.skillsToDevelop || career.skills_to_develop).length > 0 ? (
                                        <List dense>
                                            {(career.skillsToDevelop || career.skills_to_develop).map((skill, i) => (
                                                <ListItem key={i}><ListItemText primary={skill} /></ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2">No specific skills listed.</Typography>
                                    )}
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom><LinkIcon fontSize="small" sx={{verticalAlign: 'middle', mr: 1}}/>Learning Resources</Typography>
                                    {Array.isArray(career.learningResources || career.learning_resources) && (career.learningResources || career.learning_resources).length > 0 ? (
                                        <List dense>
                                            {(career.learningResources || career.learning_resources).map((resource, i) => (
                                                <ListItem key={i}>
                                                    <ListItemIcon><LinkIcon /></ListItemIcon>
                                                    <ListItemText primary={<Link href={resource.url} target="_blank" rel="noopener noreferrer">{resource.title || 'Untitled Resource'}</Link>} />
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2">No resources available.</Typography>
                                    )}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            )}
        </Container>
    );
};

export default CareerGuidancePage;