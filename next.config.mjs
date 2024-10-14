import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
    dest: 'public', // Where the service worker will be generated
    register: true, // Automatically register the service worker
    skipWaiting: true, // Skip waiting phase for service worker updates
});

export default nextConfig;
