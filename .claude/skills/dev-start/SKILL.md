---
name: dev-start
description: Start all Orchestra services locally (API + Admin + Expo web on host, MongoDB on Docker). Skips already-running services.
user-invocable: true
---

Start the Orchestra dev environment by running the startup script:

```
node scripts/dev-start.mjs
```

This script is idempotent — it checks each service and only starts what's not already running:
- MongoDB on Docker (port 27017)
- API server (port 3001)
- Admin dashboard (port 5173)
- Expo web preview (port 8081)

Run the script and report the output to the user.
