"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_path_1 = require("node:path");
const drizzle_kit_1 = require("drizzle-kit");
try {
    process.loadEnvFile((0, node_path_1.resolve)(process.cwd(), '../../.env'));
}
catch {
}
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for Drizzle commands');
}
exports.default = (0, drizzle_kit_1.defineConfig)({
    dialect: 'postgresql',
    schema: './src/database/schema.ts',
    out: './drizzle',
    dbCredentials: { url: process.env.DATABASE_URL },
    strict: true,
    verbose: true,
});
//# sourceMappingURL=drizzle.config.js.map