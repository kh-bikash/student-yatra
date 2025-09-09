import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

// Import Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import CertificatesPage from './pages/CertificatesPage';
import SkillsPage from './pages/SkillsPage';
import JobPortalPage from './pages/JobPortalPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import CareerGuidancePage from './pages/CareerGuidancePage';
import FaceRegistrationPage from './pages/FaceRegistrationPage';
import StudyGroupsPage from './pages/StudyGroupsPage';
import StudyGroupDetailPage from './pages/StudyGroupDetailPage';

// MUI Components
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Layout />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

const Layout = () => {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    // --- THIS IS THE CHANGE: Adding the background texture ---
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      // A subtle, embedded SVG background pattern for a textured feel
      backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23e0e0e0" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
    }}>
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}>
            Student Yatra
          </Typography>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
              <Button color="inherit" component={Link} to="/study-groups">Study Groups</Button>
              <Button color="inherit" component={Link} to="/career-guidance">AI Advisor</Button>
              <Button color="inherit" component={Link} to="/job-portal">Job Portal</Button>
              <Button color="inherit" component={Link} to="/interview-prep">Interview Prep</Button>
              <Button color="inherit" component={Link} to="/resume-builder">Resume Builder</Button>
              <Button color="inherit" component={Link} to="/certificates">Certificates</Button>
              <Button color="inherit" component={Link} to="/skills">Skills</Button>
              <Button color="inherit" component={Link} to="/face-register">Register Face</Button>
              <Button color="inherit" onClick={logoutUser}>Logout</Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/resume-builder" element={<PrivateRoute><ResumeBuilderPage /></PrivateRoute>} />
          <Route path="/certificates" element={<PrivateRoute><CertificatesPage /></PrivateRoute>} />
          <Route path="/skills" element={<PrivateRoute><SkillsPage /></PrivateRoute>} />
          <Route path="/job-portal" element={<PrivateRoute><JobPortalPage /></PrivateRoute>} />
          <Route path="/interview-prep" element={<PrivateRoute><InterviewPrepPage /></PrivateRoute>} />
          <Route path="/career-guidance" element={<PrivateRoute><CareerGuidancePage /></PrivateRoute>} />
          <Route path="/face-register" element={<PrivateRoute><FaceRegistrationPage /></PrivateRoute>} />
          <Route path="/study-groups" element={<PrivateRoute><StudyGroupsPage /></PrivateRoute>} />
          <Route path="/study-groups/:group_id" element={<PrivateRoute><StudyGroupDetailPage /></PrivateRoute>} />
          <Route path="/" element={user ? <DashboardPage /> : <LoginPage />} />
        </Routes>
      </Container>
    </Box>
  );
};

export default App;