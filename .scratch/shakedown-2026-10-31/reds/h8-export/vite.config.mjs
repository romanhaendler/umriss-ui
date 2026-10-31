import react from "@vitejs/plugin-react";
export default { plugins: [react()], build: { cssTarget: "chrome123" }, server: { port: 4310, strictPort: true } };
