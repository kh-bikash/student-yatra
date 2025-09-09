import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';

// MUI Components & Icons
import {
    Container, Typography, Box, Paper, Chip, CircularProgress, Alert,
    Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PsychologyIcon from '@mui/icons-material/Psychology';

const InterviewPrepPage = () => {
    const { authTokens } = useContext(AuthContext);
    const [questions, setQuestions] = useState([]);
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/skills/', {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                setSkills(response.data);
            } catch (err) {
                setError('Failed to load skill categories.');
                console.error(err);
            }
        };

        if (authTokens) {
            fetchSkills();
        }
    }, [authTokens]);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            let url = 'http://localhost:8000/api/interview-questions/';
            if (selectedSkill) {
                url += `?skill=${selectedSkill}`;
            }

            try {
                const response = await axios.get(url, {
                    headers: { 'Authorization': `Bearer ${authTokens.access}` }
                });
                setQuestions(response.data);
            } catch (err) {
                setError('Failed to load interview questions.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (authTokens) {
            fetchQuestions();
        }
    }, [authTokens, selectedSkill]);
    
    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    <PsychologyIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '2rem' }} />
                    Interview Preparation Hub
                </Typography>
                <Typography color="text.secondary">
                    Select a skill to see common interview questions and answers.
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                        label="All Questions"
                        onClick={() => setSelectedSkill(null)}
                        color={!selectedSkill ? 'primary' : 'default'}
                    />
                    {skills.map(skill => (
                        <Chip
                            key={skill.id}
                            label={skill.name}
                            onClick={() => setSelectedSkill(skill.id)}
                            color={selectedSkill === skill.id ? 'primary' : 'default'}
                            variant="outlined"
                        />
                    ))}
                </Box>
            </Paper>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <Box>
                    {questions.length > 0 ? (
                        questions.map(q => (
                            <Accordion key={q.id}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{q.question_text}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{q.answer_text}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    ) : (
                        <Typography sx={{ textAlign: 'center', mt: 4 }}>
                            No interview questions found for this category.
                        </Typography>
                    )}
                </Box>
            )}
        </Container>
    );
};

export default InterviewPrepPage;