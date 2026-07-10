/**
 * Nạp env cho script tsx TRƯỚC mọi import khác (ESM hoisting: import chạy trước code body).
 * Import file này ĐẦU TIÊN: `import "./load-env";` rồi mới import db/client.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config(); // .env fallback
