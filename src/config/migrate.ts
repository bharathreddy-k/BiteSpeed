import { pool } from './database';

const createContactsTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      phone_number VARCHAR(20),
      email VARCHAR(255),
      linked_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      link_precedence VARCHAR(10) NOT NULL CHECK (link_precedence IN ('primary', 'secondary')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP WITH TIME ZONE
    );
  `;

  const createIndexesQuery = `
    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_contacts_phone_number ON contacts(phone_number) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_contacts_linked_id ON contacts(linked_id) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_contacts_precedence ON contacts(link_precedence) WHERE deleted_at IS NULL;
  `;

  try {
    console.log('Running database migrations...');
    await pool.query(createTableQuery);
    await pool.query(createIndexesQuery);
    console.log('✓ Database migrations completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    throw error;
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  createContactsTable()
    .then(() => {
      console.log('Database setup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

export { createContactsTable };
