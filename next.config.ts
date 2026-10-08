import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure Next.js and Vercel don't attempt to bundle optional OpenTelemetry native/exporter packages
  serverExternalPackages: [
    'genkit',
    '@genkit-ai/core',
    '@genkit-ai/google-genai',
    '@genkit-ai/next',
    '@opentelemetry/sdk-node',
    '@opentelemetry/exporter-jaeger',
    '@opentelemetry/exporter-trace-otlp-http',
    '@opentelemetry/exporter-trace-otlp-grpc',
  ],
  webpack: (config, { isServer }) => {
    // Provide aliases or fallbacks for optional Jaeger and OpenTelemetry exporters
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@opentelemetry/exporter-jaeger': false,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@opentelemetry/exporter-jaeger': false,
    };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;

