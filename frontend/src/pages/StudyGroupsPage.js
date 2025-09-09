import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {AuthContext} from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom'; // Make sure this is imported
import { Container, Typography, Box, Paper, Grid, TextField, Button, Card, CardContent, CardActions, Chip, CircularProgress, Alert } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PeopleIcon from '@mui/icons-material/People';

const StudyGroupsPage = () => {
    const { authTokens } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDesc, setNewGroupDesc] = useState('');

    const fetchGroups = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/study-groups/', {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            setGroups(response.data);
        } catch (err) {
            setError('Failed to fetch study groups.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/study-groups/', 
            { name: newGroupName, description: newGroupDesc }, 
            { headers: { 'Authorization': `Bearer ${authTokens.access}` } });
            setNewGroupName('');
            setNewGroupDesc('');
            fetchGroups();
        } catch (err) {
            setError('Failed to create group.');
        }
    };

    const handleJoinLeave = async (groupId, isMember) => {
        const action = isMember ? 'leave' : 'join';
        try {
            await axios.post(`http://localhost:8000/api/study-groups/${groupId}/${action}/`, {}, {
                headers: { 'Authorization': `Bearer ${authTokens.access}` }
            });
            fetchGroups();
        } catch (err) {
            setError(`Failed to ${action} group.`);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom><GroupAddIcon sx={{ verticalAlign: 'middle', mr: 1}} />Create a New Group</Typography>
                        <Box component="form" onSubmit={handleCreateGroup}>
                            <TextField label="Group Name" fullWidth required value={newGroupName} onChange={e => setNewGroupName(e.target.value)} sx={{ mb: 2 }} />
                            <TextField label="Description" fullWidth multiline rows={3} value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} sx={{ mb: 2 }} />
                            <Button type="submit" variant="contained" fullWidth>Create Group</Button>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" gutterBottom>Find Study Groups</Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={3}>
                        {groups.map(group => (
                            <Grid item key={group.id} xs={12} sm={6}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6">{group.name}</Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Created by: {group.creator_username}</Typography>
                                        <Chip icon={<PeopleIcon />} label={`${group.members_count} Members`} size="small" sx={{ mb: 1.5 }} />
                                        <Typography variant="body2">{group.description}</Typography>
                                    </CardContent>
                                    {/* --- THIS IS THE CORRECTED SECTION --- */}
                                    <CardActions>
                                        <Button 
                                            size="small"
                                            variant="text"
                                            component={RouterLink}
                                            to={`/study-groups/${group.id}`}
                                            disabled={!group.is_member}
                                        >
                                            Open Chat
                                        </Button>
                                        <Button 
                                            size="small" 
                                            variant={group.is_member ? "outlined" : "contained"} 
                                            onClick={() => handleJoinLeave(group.id, group.is_member)}
                                        >
                                            {group.is_member ? 'Leave Group' : 'Join Group'}
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default StudyGroupsPage;