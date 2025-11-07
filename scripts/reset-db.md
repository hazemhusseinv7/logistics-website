# Database Reset Instructions

## Method 1: Delete Database File (Easiest)

1. **Stop the Next.js dev server** (if running)

2. **Delete the database file:**
   - Windows: Delete `logistics.db` from the project root
   - Or run in terminal:
     ```bash
     cd "C:\Users\Hazem\Documents\Projects\Projects\AI\logistics-website"
     del logistics.db
     ```

3. **Recreate the database:**
   ```bash
   pnpm db:push
   ```

4. **Restart the dev server:**
   ```bash
   pnpm dev
   ```

The database will be recreated with empty tables.

## Method 2: Using PowerShell (Quick Reset)

```powershell
cd "C:\Users\Hazem\Documents\Projects\Projects\AI\logistics-website"
Remove-Item -Path "logistics.db" -ErrorAction SilentlyContinue
pnpm db:push
```

## Method 3: Create a Reset Script

See `scripts/reset-db.ts` for a programmatic reset script.



