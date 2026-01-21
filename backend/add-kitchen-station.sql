-- Migration to add kitchen_station column to menu_items table
-- Run this SQL on your production database

-- Check if column exists (PostgreSQL)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='menu_items' 
        AND column_name='kitchen_station'
    ) THEN
        -- Add the column
        ALTER TABLE menu_items 
        ADD COLUMN kitchen_station VARCHAR(50) NULL;
        
        -- Add comment
        COMMENT ON COLUMN menu_items.kitchen_station IS 'Kitchen station: izgara, makarna, soguk, tatli';
        
        RAISE NOTICE 'kitchen_station column added successfully';
    ELSE
        RAISE NOTICE 'kitchen_station column already exists';
    END IF;
END $$;
