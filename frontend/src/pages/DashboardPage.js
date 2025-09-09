import React, { useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance'; // Using the new instance
import {AuthContext} from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Grid, Paper, Box, CircularProgress, Alert, Link, useTheme } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import BarChartIcon from '@mui/icons-material/BarChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// The StatCard component remains the same
const StatCard = ({ title, value, link, linkText, icon, gradient }) => (
    <Paper sx={{ p: 3, color: 'white', background: gradient, height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <Box>
                <Typography variant="h6">{title}</Typography>
                <Typography component="p" variant="h3">
                    {value}
                </Typography>
            </Box>
            {icon}
        </Box>
        <Link component={RouterLink} to={link} sx={{ color: 'white', alignSelf: 'start', fontWeight: 'bold' }}>{linkText}</Link>
    </Paper>
);

const DashboardPage = () => {
    const { authTokens } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const theme = useTheme();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Use the new axiosInstance
                const response = await axiosInstance.get('/dashboard/');
                setDashboardData(response.data);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        if (authTokens) {
            fetchDashboardData();
        }
    }, [authTokens]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>;

    const proficiencyToValue = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
    const chartData = dashboardData.skills_proficiency.map(skill => ({
        name: skill.skill_name,
        Proficiency: proficiencyToValue[skill.proficiency] || 0,
    }));

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                Welcome back, {dashboardData.welcome_name || 'Student'}!
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <StatCard 
                        title="Certificates" 
                        value={dashboardData.certificate_count} 
                        link="/certificates"
                        linkText="Manage Certificates"
                        icon={<WorkspacePremiumIcon sx={{ fontSize: 60, opacity: 0.5 }} />}
                        gradient={theme.palette.custom.gradient1}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <StatCard 
                        title="Skills Tracked" 
                        value={dashboardData.skill_count} 
                        link="/skills"
                        linkText="Manage Skills"
                        icon={<SchoolIcon sx={{ fontSize: 60, opacity: 0.5 }} />}
                        gradient={theme.palette.custom.gradient2}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}> {/* Increased height slightly */}
                        <Typography variant="h6" color="primary" gutterBottom>
                           <BarChartIcon sx={{verticalAlign: 'middle', mr: 1}}/> Skill Proficiency
                        </Typography>
                        {chartData.length > 0 ? (
                             <ResponsiveContainer>
                                <BarChart 
                                    data={chartData} 
                                    // --- THIS IS THE FIX ---
                                    // Add margins to give the labels space on the left and bottom
                                    margin={{ top: 5, right: 20, left: 30, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    {/* --- THIS IS THE FIX --- */}
                                    {/* Angle the text and anchor it at the end to prevent overlap */}
                                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} />
                                    <YAxis 
                                        tickFormatter={(value) => ['','Beginner', 'Intermediate', 'Advanced', 'Expert'][value]} 
                                        domain={[0, 4]}
                                        // Allow more ticks if needed
                                        tickCount={5}
                                    />
                                    <Tooltip formatter={(value) => ['N/A', 'Beginner', 'Intermediate', 'Advanced', 'Expert'][value]}/>
                                    <Legend />
                                    <Bar dataKey="Proficiency" fill={theme.palette.primary.main} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                                <Typography color="text.secondary">No skills added yet. Go to the <Link component={RouterLink} to="/skills">Skills</Link> page to add some.</Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default DashboardPage;