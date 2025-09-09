import React from 'react';
import { Typography, Box, Paper, Divider, Grid } from '@mui/material';

const ResumePreview = React.forwardRef(({ resumeData }, ref) => {
    return (
        <Paper ref={ref} sx={{ p: 4, width: '210mm', minHeight: '297mm', boxSizing: 'border-box' }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    {resumeData.full_name || 'Your Name'}
                </Typography>
                <Typography variant="subtitle1">
                    {resumeData.email} {resumeData.phone_number && `| ${resumeData.phone_number}`}
                </Typography>
                <Typography variant="subtitle1">
                    {resumeData.linkedin_url}
                </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Summary */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'grey.300', mb: 1 }}>
                    PROFESSIONAL SUMMARY
                </Typography>
                <Typography variant="body1">
                    {resumeData.summary}
                </Typography>
            </Box>

            {/* Work Experience */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'grey.300', mb: 1 }}>
                    WORK EXPERIENCE
                </Typography>
                {resumeData.experience.map((exp, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                        <Grid container justifyContent="space-between">
                            <Grid item>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{exp.position}</Typography>
                            </Grid>
                            <Grid item>
                                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>{exp.start_date} - {exp.end_date}</Typography>
                            </Grid>
                        </Grid>
                        <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 1 }}>{exp.company}</Typography>
                        <Typography variant="body2">{exp.description}</Typography>
                    </Box>
                ))}
            </Box>
            
            {/* Education */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'grey.300', mb: 1 }}>
                    EDUCATION
                </Typography>
                {resumeData.education.map((edu, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                         <Grid container justifyContent="space-between">
                            <Grid item>
                               <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{edu.school}</Typography>
                            </Grid>
                             <Grid item>
                                <Typography variant="body1" sx={{ fontStyle: 'italic' }}>{edu.start_date} - {edu.end_date}</Typography>
                            </Grid>
                        </Grid>
                        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>{edu.degree}</Typography>
                    </Box>
                ))}
            </Box>

            {/* Skills */}
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', borderBottom: 1, borderColor: 'grey.300', mb: 1 }}>
                    SKILLS
                </Typography>
                <Typography variant="body1">
                    {resumeData.skills.map(skill => skill.name).join(', ')}
                </Typography>
            </Box>
        </Paper>
    );
});

export default ResumePreview;
