import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Permitir la conexión desde tu celular vía WiFi
  // @ts-ignore
  allowedDevOrigins: ["192.168.1.9"]
};

export default nextConfig;
