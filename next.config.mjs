/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wtoorllowkblufayzowc.supabase.co",
        pathname: "/storage/v1/object/public/images/**",
      },
      {
        protocol: "https",
        hostname: "wtoorllowkblufayzowc.supabase.co",
        pathname: "/storage/v1/object/sign/images/**",
      },
    ],
  },
};

export default nextConfig;
