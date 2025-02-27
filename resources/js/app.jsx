import './bootstrap';
import '../css/app.css';
import './axiosConfig';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { PendingCountProvider } from './Contexts/PendingCountContext';
import { WarningProvider } from "@/Contexts/WarningContext"; // Ensure it's correctly imported

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

axios.defaults.headers.common['X-CSRF-TOKEN'] = document.querySelector('meta[name="csrf-token"]').content;
axios.defaults.withCredentials = true;

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <WarningProvider>  {/* Wrap App inside WarningProvider */}
                <PendingCountProvider> 
                    <App {...props} />
                </PendingCountProvider>
            </WarningProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
