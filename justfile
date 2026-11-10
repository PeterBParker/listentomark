# List available commands
default:
    @just --list

# Install dependencies (if needed) and run the app locally at http://localhost:3000
start:
    @[ -d node_modules ] || npm install
    @[ -f data/sermons.db ] || npm run db:import
    npm run dev

# Rebuild data/sermons.db from data/sermons.json
import-db:
    npm run db:import

# Production build + server
serve:
    npm run build
    npm run start
