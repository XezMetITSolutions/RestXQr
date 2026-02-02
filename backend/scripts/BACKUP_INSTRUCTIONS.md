# Database Backup Instructions

To backup your database to JSON files (which preserves all your data in a readable format), follow these steps:

1. **Open a terminal** in the `backend` directory.
   ```bash
   cd backend
   ```

2. **Run the backup script**:
   ```bash
   node scripts/backup_db_to_json.js
   ```

3. **Check the output**:
   - The script will create a folder `backend/backups/backup-YYYY-MM-DD-HH-mm-ss`.
   - Inside, you will find a `.json` file for every table (Orders, Restaurants, MenuItems, etc.).

## Troubleshooting
- If you see `DATABASE_URL not found` or connection errors:
  - Ensure you have a `.env` file in the `backend` folder.
  - The `.env` file should contain:
    ```
    DATABASE_URL=postgresql://user:password@host:5432/dbname
    ```
  - Ask your system administrator for the correct connection string if you don't have it.

## Restore
To restore data, you would need a custom script to read these JSON files and insert them back into the database using `Model.bulkCreate()`. This backup is primarily for safekeeping and manual inspection.
