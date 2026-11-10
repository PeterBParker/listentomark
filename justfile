# List available commands
default:
    @just --list

# Install dependencies (if missing or changed) and run the app locally at http://localhost:3000
start:
    @node -e 'const [a,b]=process.versions.node.split(".").map(Number); if (a<22||(a===22&&b<13)) { console.error("Listen To Mark needs Node 22.13 or newer (found " + process.version + ")."); process.exit(1) }'
    @[ node_modules/.package-lock.json -nt package-lock.json ] || npm install
    @[ -f data/sermons.db ] || npm run db:import
    npm run dev

# Rebuild data/sermons.db from data/sermons.json
import-db:
    npm run db:import

# Production build + server
serve:
    npm run build
    npm run start
