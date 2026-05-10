import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Permitir la conexión desde tu celular vía WiFi o túneles
  // @ts-ignore
  allowedDevOrigins: ["192.168.1.9", "srvpu-190-252-45-77.run.pinggy-free.link"]
};

export default nextConfig;
