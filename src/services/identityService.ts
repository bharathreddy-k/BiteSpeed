import { ContactModel } from '../models/Contact';
import { Contact, IdentifyRequest, IdentifyResponse } from '../types';

export class IdentityService {
  /**
   * Main identity reconciliation logic
   */
  static async identify(request: IdentifyRequest): Promise<IdentifyResponse> {
    const { email, phoneNumber } = request;

    // Find existing contacts matching email or phone
    const matchingContacts = await ContactModel.findByEmailOrPhone(email, phoneNumber);

    if (matchingContacts.length === 0) {
      // Case 1: No existing contacts - create new primary contact
      return this.handleNewContact(email, phoneNumber);
    }

    // Get all contacts in the contact chain(s)
    const allContacts = await this.getAllRelatedContacts(matchingContacts);

    // Check if we need to create a new secondary contact
    const needsNewContact = this.shouldCreateNewContact(allContacts, email, phoneNumber);

    if (needsNewContact) {
      // Case 2: Existing contact found but with new information
      const primaryContact = this.findPrimaryContact(allContacts);
      await ContactModel.create({
        email: email || null,
        phoneNumber: phoneNumber || null,
        linkedId: primaryContact.id,
        linkPrecedence: 'secondary',
      });

      // Refresh contacts after creating new one
      const updatedContacts = await ContactModel.findLinkedContacts(primaryContact.id);
      return this.buildResponse(updatedContacts);
    }

    // Check if we have multiple primary contacts (need to merge)
    const primaryContacts = allContacts.filter((c) => c.linkPrecedence === 'primary');

    if (primaryContacts.length > 1) {
      // Case 3: Multiple primary contacts - merge them
      return this.handleMergePrimaryContacts(primaryContacts, allContacts);
    }

    // Case 4: Single contact chain - return consolidated info
    return this.buildResponse(allContacts);
  }

  /**
   * Handle new contact creation (no existing contacts found)
   */
  private static async handleNewContact(
    email: string | null | undefined,
    phoneNumber: string | null | undefined
  ): Promise<IdentifyResponse> {
    const newContact = await ContactModel.create({
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkedId: null,
      linkPrecedence: 'primary',
    });

    return {
      contact: {
        primaryContactId: newContact.id,
        emails: newContact.email ? [newContact.email] : [],
        phoneNumbers: newContact.phoneNumber ? [newContact.phoneNumber] : [],
        secondaryContactIds: [],
      },
    };
  }

  /**
   * Get all related contacts including contacts from multiple chains
   */
  private static async getAllRelatedContacts(contacts: Contact[]): Promise<Contact[]> {
    const allRelatedIds = new Set<number>();

    // Add all direct IDs
    contacts.forEach((c) => allRelatedIds.add(c.id));

    // Add all linked IDs (primary contacts they're linked to)
    contacts.forEach((c) => {
      if (c.linkedId) {
        allRelatedIds.add(c.linkedId);
      }
    });

    // Get all contacts in these chains
    const allContacts = await ContactModel.findAllInChain(Array.from(allRelatedIds));

    // Deduplicate by ID
    const uniqueContacts = Array.from(
      new Map(allContacts.map((c) => [c.id, c])).values()
    );

    return uniqueContacts.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeA - timeB;
    });
  }

  /**
   * Check if we need to create a new secondary contact
   */
  private static shouldCreateNewContact(
    existingContacts: Contact[],
    email: string | null | undefined,
    phoneNumber: string | null | undefined
  ): boolean {
    // Check if exact combination already exists
    for (const contact of existingContacts) {
      const emailMatch = email ? contact.email === email : !contact.email;
      const phoneMatch = phoneNumber
        ? contact.phoneNumber === phoneNumber
        : !contact.phoneNumber;

      if (emailMatch && phoneMatch) {
        return false; // Exact match found, no need for new contact
      }
    }

    // Check if we have new information
    if (email) {
      const emailExists = existingContacts.some((c) => c.email === email);
      if (!emailExists) {
        return true; // New email found
      }
    }

    if (phoneNumber) {
      const phoneExists = existingContacts.some((c) => c.phoneNumber === phoneNumber);
      if (!phoneExists) {
        return true; // New phone found
      }
    }

    return false;
  }

  /**
   * Find the primary contact from a list of contacts
   */
  private static findPrimaryContact(contacts: Contact[]): Contact {
    const primary = contacts.find((c) => c.linkPrecedence === 'primary');
    if (!primary) {
      throw new Error('No primary contact found in the chain');
    }
    return primary;
  }

  /**
   * Handle merging of multiple primary contacts
   */
  private static async handleMergePrimaryContacts(
    primaryContacts: Contact[],
    _allContacts: Contact[]
  ): Promise<IdentifyResponse> {
    // Sort by creation time - oldest becomes the primary
    primaryContacts.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeA - timeB;
    });

    const oldestPrimary = primaryContacts[0];
    const otherPrimaries = primaryContacts.slice(1);

    // Convert other primaries to secondary and link to oldest
    for (const primary of otherPrimaries) {
      await ContactModel.updateToPrimaryLink(primary.id, oldestPrimary.id);

      // Relink any secondary contacts that were linked to this primary
      await ContactModel.relinkSecondaryContacts(primary.id, oldestPrimary.id);
    }

    // Get updated contact list
    const updatedContacts = await ContactModel.findLinkedContacts(oldestPrimary.id);
    return this.buildResponse(updatedContacts);
  }

  /**
   * Build the response object from a list of contacts
   */
  private static buildResponse(contacts: Contact[]): IdentifyResponse {
    const primary = this.findPrimaryContact(contacts);
    const secondaryContacts = contacts.filter((c) => c.linkPrecedence === 'secondary');

    // Collect unique emails and phone numbers while preserving order
    const emails: string[] = [];
    const phoneNumbers: string[] = [];
    const emailSet = new Set<string>();
    const phoneSet = new Set<string>();

    // Add primary contact's info first
    if (primary.email && !emailSet.has(primary.email)) {
      emails.push(primary.email);
      emailSet.add(primary.email);
    }
    if (primary.phoneNumber && !phoneSet.has(primary.phoneNumber)) {
      phoneNumbers.push(primary.phoneNumber);
      phoneSet.add(primary.phoneNumber);
    }

    // Add secondary contacts' info
    secondaryContacts.forEach((contact) => {
      if (contact.email && !emailSet.has(contact.email)) {
        emails.push(contact.email);
        emailSet.add(contact.email);
      }
      if (contact.phoneNumber && !phoneSet.has(contact.phoneNumber)) {
        phoneNumbers.push(contact.phoneNumber);
        phoneSet.add(contact.phoneNumber);
      }
    });

    return {
      contact: {
        primaryContactId: primary.id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryContacts.map((c) => c.id),
      },
    };
  }
}
