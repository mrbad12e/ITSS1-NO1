// src/services/api.js
import axios from 'axios';
import { API_URL } from '@/utils/constants';

const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;

const axiosConfig = {
    baseURL: API_URL.trim(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    
};

if (isNode) {
    const https = require('https');
    axiosConfig.httpsAgent = new https.Agent({
        rejectUnauthorized: false,
    });
}

const axiosInstance = axios.create(axiosConfig);

export default axiosInstance;