import path from "node:path";

export default {
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@payload-config": path.resolve(
        import.meta.dirname,
        "./src/payload.config.ts"
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
  },
};
