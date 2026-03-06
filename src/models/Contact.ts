import { query } from '../config/database';
import { Contact, ContactInput } from '../types';

export class ContactModel {
  /**
   * Find contact by email and/or phone number
   */
  static async findByEmailOrPhone(
    email: string | null | undefined,
    phoneNumber: string | null | undefined
  ): Promise<Contact[]> {
    if (!email && !phoneNumber) {
      return [];
    }

    let queryText = `
      SELECT 
        id, 
        phone_number as "phoneNumber", 
        email, 
        linked_id as "linkedId", 
        link_precedence as "linkPrecedence", 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        deleted_at as "deletedAt"
      FROM contacts 
      WHERE deleted_at IS NULL
    `;
    const params: any[] = [];

    if (email && phoneNumber) {
      queryText += ' AND (email = $1 OR phone_number = $2)';
      params.push(email, phoneNumber);
    } else if (email) {
      queryText += ' AND email = $1';
      params.push(email);
    } else if (phoneNumber) {
      queryText += ' AND phone_number = $1';
      params.push(phoneNumber);
    }

    queryText += ' ORDER BY created_at ASC';

    const result = await query(queryText, params);
    return result.rows;
  }

  /**
   * Get all contacts linked to a primary contact (including the primary itself)
   */
  static async findLinkedContacts(primaryId: number): Promise<Contact[]> {
    const queryText = `
      SELECT 
        id, 
        phone_number as "phoneNumber", 
        email, 
        linked_id as "linkedId", 
        link_precedence as "linkPrecedence", 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        deleted_at as "deletedAt"
      FROM contacts 
      WHERE deleted_at IS NULL 
        AND (id = $1 OR linked_id = $1)
      ORDER BY created_at ASC
    `;

    const result = await query(queryText, [primaryId]);
    return result.rows;
  }

  /**
   * Get all contacts in a contact chain (handles multiple levels of linking)
   */
  static async findAllInChain(contactIds: number[]): Promise<Contact[]> {
    if (contactIds.length === 0) return [];

    const queryText = `
      WITH RECURSIVE contact_chain AS (
        -- Base case: start with given IDs
        SELECT 
          id, 
          phone_number as "phoneNumber", 
          email, 
          linked_id as "linkedId", 
          link_precedence as "linkPrecedence", 
          created_at as "createdAt", 
          updated_at as "updatedAt", 
          deleted_at as "deletedAt"
        FROM contacts
        WHERE id = ANY($1) AND deleted_at IS NULL
        
        UNION
        
        -- Recursive case: find linked contacts
        SELECT 
          c.id, 
          c.phone_number as "phoneNumber", 
          c.email, 
          c.linked_id as "linkedId", 
          c.link_precedence as "linkPrecedence", 
          c.created_at as "createdAt", 
          c.updated_at as "updatedAt", 
          c.deleted_at as "deletedAt"
        FROM contacts c
        INNER JOIN contact_chain cc ON (c.linked_id = cc.id OR c.id = cc."linkedId")
        WHERE c.deleted_at IS NULL
      )
      SELECT * FROM contact_chain
      ORDER BY "createdAt" ASC
    `;

    const result = await query(queryText, [contactIds]);
    return result.rows;
  }

  /**
   * Create a new contact
   */
  static async create(contactData: ContactInput): Promise<Contact> {
    const queryText = `
      INSERT INTO contacts (email, phone_number, linked_id, link_precedence)
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id, 
        phone_number as "phoneNumber", 
        email, 
        linked_id as "linkedId", 
        link_precedence as "linkPrecedence", 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        deleted_at as "deletedAt"
    `;

    const result = await query(queryText, [
      contactData.email || null,
      contactData.phoneNumber || null,
      contactData.linkedId || null,
      contactData.linkPrecedence,
    ]);

    return result.rows[0];
  }

  /**
   * Update a contact to make it secondary and link it to a primary
   */
  static async updateToPrimaryLink(contactId: number, primaryId: number): Promise<Contact> {
    const queryText = `
      UPDATE contacts 
      SET 
        linked_id = $1, 
        link_precedence = 'secondary',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING 
        id, 
        phone_number as "phoneNumber", 
        email, 
        linked_id as "linkedId", 
        link_precedence as "linkPrecedence", 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        deleted_at as "deletedAt"
    `;

    const result = await query(queryText, [primaryId, contactId]);
    return result.rows[0];
  }

  /**
   * Update all secondary contacts linked to oldPrimaryId to link to newPrimaryId
   */
  static async relinkSecondaryContacts(
    oldPrimaryId: number,
    newPrimaryId: number
  ): Promise<void> {
    const queryText = `
      UPDATE contacts 
      SET 
        linked_id = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE linked_id = $2 AND deleted_at IS NULL
    `;

    await query(queryText, [newPrimaryId, oldPrimaryId]);
  }

  /**
   * Check if exact match exists (same email and phone)
   */
  static async findExactMatch(
    email: string | null | undefined,
    phoneNumber: string | null | undefined
  ): Promise<Contact | null> {
    if (!email && !phoneNumber) {
      return null;
    }

    let queryText = `
      SELECT 
        id, 
        phone_number as "phoneNumber", 
        email, 
        linked_id as "linkedId", 
        link_precedence as "linkPrecedence", 
        created_at as "createdAt", 
        updated_at as "updatedAt", 
        deleted_at as "deletedAt"
      FROM contacts 
      WHERE deleted_at IS NULL
    `;
    const params: any[] = [];

    if (email && phoneNumber) {
      queryText += ' AND email = $1 AND phone_number = $2';
      params.push(email, phoneNumber);
    } else if (email) {
      queryText += ' AND email = $1 AND phone_number IS NULL';
      params.push(email);
    } else if (phoneNumber) {
      queryText += ' AND phone_number = $1 AND email IS NULL';
      params.push(phoneNumber);
    }

    queryText += ' LIMIT 1';

    const result = await query(queryText, params);
    return result.rows[0] || null;
  }
}
