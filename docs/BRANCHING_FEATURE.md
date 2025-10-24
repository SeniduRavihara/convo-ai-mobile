# 🌿 Branching Conversations Feature

## Overview

The mobile app now includes the **conversation branching system** from the Next.js web app! This allows users to:

- **View multiple conversation branches** within a single chat
- **Switch between branches** to explore different conversation paths
- **See inherited messages** from parent branches
- **Create new branches** from any point in a conversation (coming soon)

---

## What's Been Added

### 1. **Branch Tree Service** (`services/branchTreeService.ts`)

Core logic for managing the branch tree data structure:

- `getBranchPath()` - Get the path from root to a specific branch
- `getBranchMessages()` - Get all messages including inherited ones
- `isMessageFromBranch()` - Check if a message belongs to a branch
- `getMessageBranch()` - Find which branch contains a message
- `getChildBranches()` - Get all child branches of a parent
- `getBranchDepth()` - Calculate branch depth in the tree

### 2. **Branch Picker Component** (`components/BranchPicker.tsx`)

A modal UI component that shows:

- All available branches in the current chat
- Branch hierarchy with visual indentation
- Message count for each branch
- Active branch highlighting
- Branch depth indicators

### 3. **Updated Chat Screen** (`app/chat.tsx`)

Enhanced with branching features:

- **Branch button** in header showing current branch count
- **Branch picker modal** for switching between branches
- **Message inheritance** - Shows all messages from parent branches
- **Real-time branch switching** with smooth transitions

---

## How It Works

### Branch Inheritance

When you switch to a child branch, you see:

1. All messages from the root/parent branch up to the fork point
2. Plus all messages specific to that child branch

Example:

```
Main Branch (root):
  - Message 1 (user)
  - Message 2 (assistant)
  - Message 3 (user)  ← Fork point

Child Branch A:
  - Inherits Messages 1, 2, 3
  - Message 4A (different path)
  - Message 5A

Child Branch B:
  - Inherits Messages 1, 2, 3
  - Message 4B (alternative path)
  - Message 5B
```

### Branch Tree Structure

Branches form a linked list tree:

- Each branch has a `parentId` pointing to its parent branch
- Each branch has a `parentMessageId` indicating the fork point
- The root branch (usually "main") has `parentId: null`

---

## Usage Guide

### For Users

1. **Open any chat** with conversations
2. **Tap the branch button** in the top-right (shows "🌿 Main" or "🌿 X Branches")
3. **See all available branches** in the modal
4. **Tap a branch** to switch to it
5. **View the conversation** including inherited messages

### For Developers

#### Get Messages with Inheritance

```typescript
import { getBranchMessages } from "../services/branchTreeService";

const messages = getBranchMessages(activeBranchId, branchesData);
```

#### Check Branch Structure

```typescript
import {
  getBranchDepth,
  getChildBranches,
} from "../services/branchTreeService";

const depth = getBranchDepth("branch-id", branchesData);
const children = getChildBranches("main", branchesData);
```

#### Switch Branches

```typescript
const switchBranch = (branchId: string) => {
  setActiveBranchId(branchId);
  setShowBranchPicker(false);
};
```

---

## Features Comparison

| Feature               | Web App | Mobile App |
| --------------------- | ------- | ---------- |
| View branches         | ✅      | ✅         |
| Switch branches       | ✅      | ✅         |
| Message inheritance   | ✅      | ✅         |
| Visual tree diagram   | ✅      | 🚧 Coming  |
| Create branches       | ✅      | 🚧 Coming  |
| Branch from selection | ✅      | 🚧 Coming  |
| Real-time sync        | ✅      | ✅         |

---

## Coming Soon

### 1. **Branch Creation**

Long-press on any message to create a new branch from that point.

### 2. **Visual Tree View**

Display branches as a graphical tree structure (like the web app).

### 3. **Branch Management**

- Rename branches
- Delete branches
- Merge branches

### 4. **Branch Search**

Search within specific branches or across all branches.

---

## Technical Details

### Data Structure

```typescript
interface Branch {
  id: string;
  name: string;
  parentId: string | null; // Parent branch ID
  parentMessageId: string | null; // Fork point message
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}
```

### State Management

The `DataContext` manages branch data:

```typescript
const {
  branchesData, // All branches: Record<branchId, Branch>
  activeChatId, // Current active chat
  currentUserData, // User information
} = useData();
```

### Real-Time Sync

Firestore listeners in `DataContext` automatically update when:

- New branches are created
- Branch messages are added
- Branch names are changed
- Branches are deleted

---

## Testing Branching

1. **Create a chat** with some messages on the web app
2. **Create branches** from different points in the conversation
3. **Open the mobile app** and load the same chat
4. **Tap the branch button** to see all branches
5. **Switch between branches** to verify message inheritance works
6. **Verify real-time sync** by creating branches on web, switching on mobile

---

## Troubleshooting

### Branch Button Not Showing?

- Ensure you're in an active chat
- Check that `branchesData` is loaded
- Verify Firebase sync is working

### Messages Not Inheriting?

- Check `getBranchMessages()` is being used instead of `branch.messages`
- Verify branch `parentId` and `parentMessageId` are set correctly
- Check console logs for branch path errors

### Branch Picker Empty?

- Ensure branches exist in Firestore
- Verify `allBranches = Object.values(branchesData)` is populated
- Check DataContext listeners are active

---

## Architecture Notes

The branching system uses a **linked list tree structure**:

- O(n) time to traverse from root to leaf
- O(1) time to add new branches
- O(n) space for storing full message history
- Efficient for deep branches with inheritance

Message inheritance is calculated on-the-fly when switching branches, ensuring:

- No duplicate message storage
- Always consistent with parent branches
- Real-time updates propagate correctly

---

## Need Help?

See also:

- `IMPLEMENTATION_SUMMARY.md` - Full app architecture
- `QUICKSTART.md` - Setup guide
- `TROUBLESHOOTING.md` - Common issues
- Web app: `ai-root-chat/src/services/branchTreeService.ts` - Reference implementation
