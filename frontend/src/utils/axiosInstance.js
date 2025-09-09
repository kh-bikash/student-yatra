import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import dayjs from 'dayjs';

// Dynamically determine the backend URL
const baseURL = `http://${window.location.hostname}:8000/api`;

// Initialize authTokens from localStorage
let authTokens = localStorage.getItem('authTokens') 
    ? JSON.parse(localStorage.getItem('authTokens')) 
    : null;

const axiosInstance = axios.create({
    baseURL,
    headers: { Authorization: `Bearer ${authTokens?.access}` }
});

axiosInstance.interceptors.request.use(async req => {
    authTokens = localStorage.getItem('authTokens') 
        ? JSON.parse(localStorage.getItem('authTokens')) 
        : null;

    if (!authTokens) {
        req.headers.Authorization = null;
        return req;
    }

    const user = jwtDecode(authTokens.access);
    const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

    if (!isExpired) {
        req.headers.Authorization = `Bearer ${authTokens.access}`;
        return req;
    }

    try {
        const response = await axios.post(`${baseURL}/token/refresh/`, {
            refresh: authTokens.refresh
        });

        localStorage.setItem('authTokens', JSON.stringify(response.data));
        req.headers.Authorization = `Bearer ${response.data.access}`;
    } catch (error) {
        console.error('Token refresh failed:', error);
        localStorage.removeItem('authTokens');
        req.headers.Authorization = null;
    }

    return req;
});

export default axiosInstance;
