import react from "@vitejs/plugin-react";
export default { plugins:[react()], build:{cssTarget:"chrome123"}, server:{port:4320,strictPort:true,host:"127.0.0.1"} };
