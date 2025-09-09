import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';

// MUI Components & Icons
import {
    Button, Container, Typography, Box, Paper,
    FormControl, InputLabel, Select, MenuItem, Chip
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const SkillsPage = () => {
    const { authTokens } = useContext(AuthContext);
    const [mySkills, setMySkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [selectedProficiency, setSelectedProficiency] = useState('Beginner');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetch both user's skills and all available skills
    const fetchData = async () => {
        setLoading(true);
        try {
            const mySkillsResponse = await axios.get('http://localhost:8000/api/user-skills/', {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            setMySkills(mySkillsResponse.data);

            const allSkillsResponse = await axios.get('http://localhost:8000/api/skills/', {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            setAllSkills(allSkillsResponse.data);
        } catch (err) {
            setError('Failed to fetch skills data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authTokens) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [authTokens]);

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!selectedSkill) {
            setError('Please select a skill.');
            return;
        }

        // Prevent adding a skill the user already has
        if (mySkills.some(skill => skill.skill === selectedSkill)) {
            setError('You have already added this skill.');
            return;
        }

        try {
            await axios.post('http://localhost:8000/api/user-skills/', {
                skill: selectedSkill,
                proficiency: selectedProficiency
            }, {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            // Reset form and refresh list
            setSelectedSkill('');
            setSelectedProficiency('Beginner');
            setError('');
            fetchData();
        } catch (err) {
            setError('Failed to add skill.');
            console.error(err);
        }
    };

    const handleDeleteSkill = async (id) => {
        try {
            await axios.delete(`http://localhost:8000/api/user-skills/${id}/`, {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            fetchData(); // Refresh the list
        } catch (err) {
            setError('Failed to delete skill.');
            console.error(err);
        }
    };

    if (loading) return <Typography sx={{ mt: 4, textAlign: 'center' }}>Loading skills...</Typography>;

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>Skill Tracker</Typography>

                {/* Add Skill Form */}
                <Box component="form" onSubmit={handleAddSkill} sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel id="skill-select-label">Skill</InputLabel>
                        <Select
                            labelId="skill-select-label"
                            value={selectedSkill}
                            label="Skill"
                            onChange={(e) => setSelectedSkill(e.target.value)}
                        >
                            {allSkills.map((skill) => (
                                <MenuItem key={skill.id} value={skill.id}>{skill.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControl style={{minWidth: 150}}>
                        <InputLabel id="proficiency-select-label">Proficiency</InputLabel>
                        <Select
                            labelId="proficiency-select-label"
                            value={selectedProficiency}
                            label="Proficiency"
                            onChange={(e) => setSelectedProficiency(e.target.value)}
                        >
                            <MenuItem value="Beginner">Beginner</MenuItem>
                            <MenuItem value="Intermediate">Intermediate</MenuItem>
                            <MenuItem value="Advanced">Advanced</MenuItem>
                            <MenuItem value="Expert">Expert</MenuItem>
                        </Select>
                    </FormControl>
                    <Button type="submit" variant="contained" startIcon={<AddCircleOutlineIcon />}>
                        Add
                    </Button>
                </Box>
                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

                {/* My Skills List */}
                <Typography variant="h5" gutterBottom>My Skills</Typography>
                {mySkills.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {mySkills.map(userSkill => (
                            <Chip
                                key={userSkill.id}
                                label={`${userSkill.skill_name} (${userSkill.proficiency})`}
                                onDelete={() => handleDeleteSkill(userSkill.id)}
                                color="primary"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                ) : (
                    <Typography>You haven't added any skills yet. Use the form above to get started.</Typography>
                )}
            </Paper>
        </Container>
    );
};

export default SkillsPage;