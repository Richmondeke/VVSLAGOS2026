# Module 5: Social (Feed & Messaging)

## Messaging — P0

Messaging is P0. Feed is P1. They're in the same module architecturally but have different launch priorities.

### 5.1 Messages Inbox Page — P0
- **Route:** `/messages`
- **Content:** List of 1:1 conversations
- **Architecture (REVISED):** One conversation per user pair. All messages between two members live in a single thread, regardless of how many orders they have. Orders are referenced within messages via inline order cards/links — not separate conversations
- **Key Elements:** Conversation list: counterparty name + avatar, last message preview, timestamp, unread indicator. Search conversations
- **Error States:** Load failure → retry. Empty state: "No conversations yet. Start one by contacting a provider from their listing."

### 5.2 Conversation Detail Page — P0
- **Route:** `/messages/{conversationId}`
- **Content:** Real-time chat thread with message input, attachments, and order reference cards
- **Key Elements:** Messages with timestamps, read receipts, attachment previews, quick reply shortcuts (e.g., "I just paid"), and order status badges
- **Error States:** Send failure → retry. Connection loss → fallback to polling with "Connection lost. Reconnecting..." banner.

## Feed — P1

The feed is a work-focused activity stream showing completed projects, case studies, and verified activity. It is built on the same event stream as the rest of the platform.

### 5.3 Feed Page — P1
- **Route:** `/feed`
- **Content:** Ranked stream of posts (completed projects, featured listings, community announcements)
- **Key Features:** Like/bookmark, comment, filter by type, and "Show me more from people I follow" / "Show me trending" toggles
- **Error States:** Load failure → retry. Empty state: "No activity yet. Create a post or check back soon."

### 5.4 Create Post Modal — P1
- **Trigger:** "Post" CTA in header
- **Content:** Post type selector, text input, optional media upload, tagging of collaborators or listings
- **Error States:** Upload failure → retry. Content policy violation → inline explanation and required edits
