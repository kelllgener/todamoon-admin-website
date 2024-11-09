/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "storage.googleapis.com", // Add this line for the other storage
                port: "",
                pathname: "/**",
            }
        ]
    }
};

export default nextConfig;
