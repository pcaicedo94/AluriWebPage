
/** @type {import('next').NextConfig} */
const staticPages = [
  'index',
  'inversionistas',
  'propietarios',
  'nosotros',
  'politica-privacidad',
  'terminos-condiciones',
  'login-inversionistas',
  'login-propietarios',
  'ty',
  'formulario-gohighlevel-test',
];

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/index.html',
        destination: '/',
        permanent: true,
      },
      ...staticPages
        .filter((page) => page !== 'index')
        .map((page) => ({
          source: `/${page}.html`,
          destination: `/${page}`,
          permanent: true,
        })),
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
      ...staticPages
        .filter((page) => page !== 'index')
        .map((page) => ({
          source: `/${page}`,
          destination: `/${page}.html`,
        })),
    ];
  },
};

module.exports = nextConfig;
