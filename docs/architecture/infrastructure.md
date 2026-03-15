# Infrastructure at Launch

```
┌─────────────────────────────────────────────────────────┐
│              VPS / Managed Container Platform            │
│           (Railway, Render, or DigitalOcean)             │
│                                                          │
│  ┌───────────┐  ┌────────────┐  ┌──────────────────┐    │
│  │   API     │  │  Workers   │  │  Web + Admin      │    │
│  │ (Fastify) │  │  (BullMQ)  │  │  (Next.js SSR)    │    │
│  └─────┬─────┘  └─────┬──────┘  └────────┬─────────┘    │
│        │               │                  │              │
└────────┼───────────────┼──────────────────┼──────────────┘
         │               │                  │
    ┌────┴─────┐   ┌─────┴─────┐    ┌──────┴──────┐
    │PostgreSQL│   │   Redis   │    │  CDN / R2   │
    │ 16       │   │  (managed)│    │  (files +   │
    │ (managed)│   │           │    │   media)    │
    └──────────┘   └───────────┘    └─────────────┘
```

Managed PostgreSQL and Redis from the hosting provider. CDN-backed object storage for media uploads. Expo EAS handles mobile builds and OTA updates. That's the entire infrastructure footprint.

**Total infrastructure:** 3 services (API, workers, web/admin) + 2 data stores (PostgreSQL, Redis) + 1 object storage bucket. No Kubernetes, no Kafka, no Elasticsearch.
