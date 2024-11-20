import axios from 'axios';

const instance = axios.create({
    baseURL: '',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
    }
});

// Add CSRF token to all requests
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token) {
    instance.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

export default instance;
