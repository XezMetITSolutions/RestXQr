const { sequelize } = require('./src/models');

async function fixCampaignColumns() {
    console.log('🚀 Starting Campaign Columns Fix...');
    try {
        // menu_items columns
        await sequelize.query(`
      DO $$
      BEGIN
        BEGIN
          ALTER TABLE menu_items ADD COLUMN discount_percentage INTEGER DEFAULT NULL;
        EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; END;

        BEGIN
          ALTER TABLE menu_items ADD COLUMN discounted_price DECIMAL(10,2) DEFAULT NULL;
        EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; END;

        BEGIN
          ALTER TABLE menu_items ADD COLUMN discount_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; END;

        BEGIN
          ALTER TABLE menu_items ADD COLUMN discount_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; END;
      END $$;
    `);
        console.log('✅ menu_items columns checked/added.');

        // menu_categories columns
        await sequelize.query(`
      DO $$
      BEGIN
        BEGIN
          ALTER TABLE menu_categories ADD COLUMN discount_percentage INTEGER DEFAULT NULL;
        EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; END;

        BEGIN
          ALTER TABLE menu_categories ADD COLUMN discount_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; END;

        BEGIN
          ALTER TABLE menu_categories ADD COLUMN discount_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;
        EXCEPTION WHEN duplicate_column THEN RAISE NOTICE 'column already exists'; END;
      END $$;
    `);
        console.log('✅ menu_categories columns checked/added.');

        console.log('🎉 Campaign columns fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing campaign columns:', error);
        process.exit(1);
    }
}

fixCampaignColumns();
