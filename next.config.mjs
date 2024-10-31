/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.clerk.com",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            }
        ]
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3000/api/:path*', // Pontosítsd az URL-t, ha szükséges
            },
        ]
    },
};

export default nextConfig;
