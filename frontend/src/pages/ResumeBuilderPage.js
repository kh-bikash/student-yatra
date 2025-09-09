import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// MUI Components & Icons
import { 
    Button, TextField, Container, Typography, Box, Paper, Grid, IconButton, Divider 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';

// Import ResumePreview Component
import ResumePreview from '../components/ResumePreview';

const ResumeBuilderPage = () => {
    const { authTokens } = useContext(AuthContext);
    const [resumeData, setResumeData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        linkedin_url: '',
        summary: '',
        education: [],
        experience: [],
        skills: [],
        certificates: [],
        projects: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const previewRef = useRef(null);

    useEffect(() => {
        const fetchResume = async () => {
            if (!authTokens) return setLoading(false);
            try {
                const response = await axios.get('http://localhost:8000/api/resume/', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + String(authTokens.access)
                    }
                });

                if (response.data && response.data.length > 0) {
                    const data = response.data[0];
                    // Ensure all sections are arrays
                    ['education', 'experience', 'skills', 'certificates', 'projects'].forEach(
                        section => {
                            if (!Array.isArray(data[section])) data[section] = [];
                        }
                    );
                    setResumeData(data);
                }
            } catch (err) {
                setError('Failed to fetch resume data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchResume();
    }, [authTokens]);

    const handleChange = (e) => {
        setResumeData({ ...resumeData, [e.target.name]: e.target.value });
    };

    const handleSectionChange = (section, index, event) => {
        const newSection = [...(resumeData[section] || [])];
        newSection[index][event.target.name] = event.target.value;
        setResumeData({ ...resumeData, [section]: newSection });
    };

    const addSectionItem = (section) => {
        let newItem = {};
        switch (section) {
            case 'education':
                newItem = { school: '', degree: '', start_date: '', end_date: '' };
                break;
            case 'experience':
                newItem = { company: '', position: '', start_date: '', end_date: '', description: '' };
                break;
            case 'skills':
                newItem = { name: '', proficiency: 'Beginner' };
                break;
            case 'certificates':
                newItem = { title: '', issuer: '', issue_date: '', file_url: '' };
                break;
            case 'projects':
                newItem = { title: '', description: '', link: '' };
                break;
            default:
                return;
        }
        setResumeData({ ...resumeData, [section]: [...(resumeData[section] || []), newItem] });
    };

    const removeSectionItem = (section, index) => {
        const newSection = [...(resumeData[section] || [])];
        newSection.splice(index, 1);
        setResumeData({ ...resumeData, [section]: newSection });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/resume/', resumeData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + String(authTokens.access)
                }
            });
            alert('Resume saved successfully!');
        } catch (err) {
            setError('Failed to save resume.');
            console.error(err.response ? err.response.data : err);
        }
    };

    const handleDownloadPdf = async () => {
        const input = previewRef.current;
        if (!input) return;
        const canvas = await html2canvas(input, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${resumeData.full_name || 'resume'}.pdf`);
    };

    if (loading) return <Typography sx={{ mt: 4 }}>Loading your resume...</Typography>;

    return (
        <Container maxWidth="md">
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <ResumePreview ref={previewRef} resumeData={resumeData} />
            </div>

            <Paper sx={{ p: 4, mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography component="h1" variant="h4" gutterBottom>
                        Resume Builder
                    </Typography>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadPdf}>
                        Download PDF
                    </Button>
                </Box>
                {error && <Typography color="error">{error}</Typography>}

                <Box component="form" onSubmit={handleSubmit}>
                    {/* --- Personal Details --- */}
                    <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>Personal Details</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}><TextField name="full_name" label="Full Name" fullWidth value={resumeData.full_name} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="email" label="Email" type="email" fullWidth value={resumeData.email} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="phone_number" label="Phone Number" fullWidth value={resumeData.phone_number} onChange={handleChange} /></Grid>
                        <Grid item xs={12} sm={6}><TextField name="linkedin_url" label="LinkedIn URL" fullWidth value={resumeData.linkedin_url} onChange={handleChange} /></Grid>
                        <Grid item xs={12}><TextField name="summary" label="Professional Summary" multiline rows={4} fullWidth value={resumeData.summary} onChange={handleChange} /></Grid>
                    </Grid>

                    {/* --- Dynamic Sections --- */}
                    {['education','experience','skills','certificates','projects'].map(section => (
                        <Box key={section}>
                            <Divider sx={{ my: 4 }} />
                            <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                                {section.charAt(0).toUpperCase() + section.slice(1)}
                            </Typography>
                            {(resumeData[section] || []).map((item, idx) => (
                                <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: '4px' }}>
                                    <Grid container spacing={2} alignItems="center">
                                        {Object.keys(item).map((field, fIdx) => (
                                            <Grid item xs={12} sm={field === 'description' || field === 'summary' ? 12 : 6} key={fIdx}>
                                                <TextField
                                                    name={field}
                                                    label={field.replace('_', ' ').toUpperCase()}
                                                    fullWidth
                                                    multiline={field === 'description'}
                                                    rows={field === 'description' ? 3 : 1}
                                                    value={item[field]}
                                                    onChange={(e) => handleSectionChange(section, idx, e)}
                                                />
                                            </Grid>
                                        ))}
                                        <Grid item xs={12}>
                                            <IconButton color="error" onClick={() => removeSectionItem(section, idx)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Box>
                            ))}
                            <Button startIcon={<AddCircleOutlineIcon />} onClick={() => addSectionItem(section)}>
                                Add {section.charAt(0).toUpperCase() + section.slice(1)}
                            </Button>
                        </Box>
                    ))}

                    <Divider sx={{ my: 4 }} />
                    <Button type="submit" variant="contained" size="large" sx={{ mt: 3 }}>Save Resume</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ResumeBuilderPage;
