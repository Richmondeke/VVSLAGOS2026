# Overview & Architectural Approach

## 1. What VVS Members Is

VVS Members is a referral-only professional network and creative services marketplace. Members showcase work, offer verified services, hire trusted talent, and transact through built-in escrow. Reputation is earned through paid transactions, not followers.

This document specifies the complete technical architecture and technology stack for building it.

---

## 2. Architectural Approach

VVS Members is a modular monolith. One deployable application, one database instance, strict internal boundaries between business domains.

Modules talk to each other through typed interfaces — direct function calls inside the same process. When something happens that other modules might care about but the originator doesn't need a response, it publishes an event through a transactional outbox. That's it. Two communication patterns, clearly separated by intent.

The system is designed to be split into independent services later if needed. The module boundaries are the seams. But splitting is a scaling decision, not a launch decision.
