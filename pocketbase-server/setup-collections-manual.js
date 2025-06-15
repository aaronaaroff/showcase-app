#!/usr/bin/env node

// Manual setup instructions for PocketBase collections
// Since the API has issues with select fields, here are the manual steps

console.log(`
PocketBase Manual Collection Setup
==================================

Please create the following collections manually in PocketBase Admin:

1. Go to http://127.0.0.1:8090/_/#/collections

2. Create "chat_sessions" collection:
   - Click "New collection"
   - Name: chat_sessions
   - Type: Base
   - Add fields:
     * title (text, required, min: 1, max: 200)
     * userId (text, required, min: 1, max: 100)
     * lastMessage (text, optional, max: 1000)
   - Save

3. Create "chat_messages" collection:
   - Click "New collection"
   - Name: chat_messages
   - Type: Base
   - Add fields:
     * content (text, required, min: 1, max: 10000)
     * sender (select, required, single, values: user, critic)
     * timestamp (text, required, min: 1, max: 100)
     * sessionId (text, required, min: 1, max: 100)
     * personalityId (text, optional, max: 50)
     * personalityName (text, optional, max: 100)
     * personalityAvatar (text, optional, max: 10)
     * personalityColor (text, optional, max: 50)
     * imageUrl (text, optional, max: 10000)
   - Save

4. For both collections, set API rules:
   - List rule: (leave empty for public access)
   - View rule: (leave empty for public access)
   - Create rule: (leave empty for public access)
   - Update rule: (leave empty for public access)
   - Delete rule: (leave empty for public access)

That's it! Your collections are ready.
`);