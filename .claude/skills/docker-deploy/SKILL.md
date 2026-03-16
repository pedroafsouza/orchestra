---
name: docker-deploy
description: Deploy all Orchestra services (MongoDB, API, Admin in Docker + Expo web on host). Kills any existing processes on the required ports and removes old containers first.
user-invocable: true
---

Deploy the full Orchestra stack in Docker by running:

```
node scripts/docker-deploy.mjs
```

This builds Docker images for API and Admin, starts all containers on an `orchestra-net` network, and runs Expo web on the host. Run the script and report the output to the user.
