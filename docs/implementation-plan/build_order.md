# Implementation Plan — Build Order Summary

| Order | Module | Depends On | Key Risk |
|-------|--------|------------|----------|
| 1 | Shared Infrastructure | Nothing | Everything depends on this — get it right first |
| 2 | Auth | Shared | No business deps; the platform door |
| 3 | Finance | Shared, Auth events | Money handling — stress test early |
| 4 | Members | Shared, Auth events | Light; fast to build |
| 5 | Marketplace | Finance + Auth interfaces | Saga complexity; highest-risk module |
| 6 | Social | Members events | Can parallel with Marketplace |
| 7 | Platform | All events | Fan-in point; build last |
| 8 | Web Client | All API modules | SSR + auth flows |
| 9 | Admin Dashboard | All API modules + Reporting | Operational tooling |
