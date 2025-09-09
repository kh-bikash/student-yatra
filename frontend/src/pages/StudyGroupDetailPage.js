import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    Container,
    Typography,
    Box,
    Paper,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Avatar,
    CircularProgress,
    Alert
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const StudyGroupDetailPage = () => {
    const { group_id } = useParams();
    const { authTokens, user } = useContext(AuthContext);

    const [group, setGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const chatSocket = useRef(null);
    const messagesEndRef = useRef(null);

    // Helper function to format ISO timestamps
   const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};


    useEffect(() => {
        // Fetch group details from API
        const fetchGroupData = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:8000/api/study-groups/${group_id}/`,
                    { headers: { Authorization: `Bearer ${authTokens.access}` } }
                );
                setGroup(res.data);
            } catch (err) {
                console.error('Failed to fetch group data:', err);
                setError('Failed to load group data.');
            } finally {
                setLoading(false);
            }
        };
        fetchGroupData();

        // Setup WebSocket connection
        const socket = new WebSocket(
            `ws://localhost:8000/ws/chat/${group_id}/?token=${authTokens.access}`
        );

        socket.onopen = () => console.log('WebSocket connected successfully!');
        socket.onclose = () => console.log('WebSocket disconnected');
        socket.onerror = (err) => {
            console.error('WebSocket error:', err);
            setError('WebSocket connection failed.');
        };
        socket.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages((prev) => [...prev, data]);
        };

        chatSocket.current = socket;

        // Cleanup socket on unmount
        return () => {
            socket.close();
        };
    }, [group_id, authTokens.access]);

    // Scroll to the latest message automatically
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && chatSocket.current) {
            chatSocket.current.send(JSON.stringify({ message: newMessage.trim() }));
            setNewMessage('');
        }
    };

    if (loading)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );

    if (!group)
        return (
            <Alert severity="error" sx={{ mt: 5 }}>
                Group not found or you are not a member.
            </Alert>
        );

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                {group.name}
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ height: '70vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f5f5' }}>
                <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                    {messages.map((msg, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                justifyContent: msg.username === user.username ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    flexDirection: msg.username === user.username ? 'row-reverse' : 'row'
                                }}
                            >
                                <Avatar sx={{ bgcolor: 'primary.main', mx: 1 }}>
                                    {msg.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <Paper
                                    elevation={1}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 4,
                                        bgcolor: msg.username === user.username ? '#e3f2fd' : '#ffffff'
                                    }}
                                >
                                    <ListItemText
                                        primary={msg.message}
                                        secondary={`${msg.username} • ${formatTimestamp(msg.timestamp)}`}
                                        sx={{ m: 0 }}
                                        secondaryTypographyProps={{ textAlign: 'right', pt: 1 }}
                                    />
                                </Paper>
                            </Box>
                        </ListItem>
                    ))}
                    <div ref={messagesEndRef} />
                </List>

                <Box
                    component="form"
                    onSubmit={handleSendMessage}
                    sx={{ p: 2, display: 'flex', gap: 1, borderTop: '1px solid #ddd', bgcolor: 'white' }}
                >
                    <TextField
                        fullWidth
                        size="small"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        autoComplete="off"
                    />
                    <Button type="submit" variant="contained" endIcon={<SendIcon />}>
                        Send
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default StudyGroupDetailPage;
