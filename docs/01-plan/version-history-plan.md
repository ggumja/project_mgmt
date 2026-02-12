---
description: Automatically increments spec version and logs modification history when saving specs.
---
# Version Increment and Modification History

## Objective
Enable automatic version increment (by 0.1) and modification history logging when a Functional Spec is updated.

## Implementation Steps

### 1. Database Schema Update
- Create a new table `spec_histories` to store history logs.
  - `id`: UUID (Primary Key)
  - `spec_id`: UUID (Foreign Key to `functional_specs`)
  - `previous_version`: TEXT
  - `new_version`: TEXT
  - `changed_at`: TIMESTAMPTZ (Default NOW())
  - `changed_by`: UUID (Nullable, User ID)
  - `change_summary`: TEXT (Optional, user input for reason)

### 2. Service Logic Update (`specService.ts`)
- Add `gethistory` method to fetch history for a spec.
- Modify `upsertSpec` (or create `updateSpecWithHistory`):
  - IF updating an existing spec:
    - Get current version.
    - Calculate `newVersion` = `(parseFloat(currentVersion) + 0.1).toFixed(1)`.
    - Update the spec with new version.
    - Insert a record into `spec_histories`.

### 3. UI Updates (`SpecEditor.tsx`)
- **Add "Change Summary" Input**: When editing an existing spec, add an optional text field for "Change Summary" before saving.
- **Display History**: Add a "Modification History" section at the bottom of the editor.
  - Fetch history using `specService.getHistory(specId)`.
  - Display table: Date | Version | Summary.

### 4. Migration Script
- Create `scripts/update_schema_v4_history.sql` with the new table definition.
- Instruct user to run it.

## Verification
- Edit a spec -> Save -> Check version incremented by 0.1.
- Check history table at bottom -> Should show new entry.
