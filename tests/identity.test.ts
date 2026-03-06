/**
 * Sample test file for the identity service
 * This demonstrates how tests can be structured
 * Run with: npm test
 */

import { ContactModel } from '../src/models/Contact';
import { IdentityService } from '../src/services/identityService';

// Mock the ContactModel
jest.mock('../src/models/Contact');

describe('IdentityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('identify - New Customer', () => {
    it('should create a new primary contact when no existing contact found', async () => {
      // Mock: No existing contacts
      (ContactModel.findByEmailOrPhone as jest.Mock).mockResolvedValue([]);
      
      // Mock: Create returns new contact
      const mockNewContact = {
        id: 1,
        email: 'test@example.com',
        phoneNumber: '123456',
        linkedId: null,
        linkPrecedence: 'primary',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      (ContactModel.create as jest.Mock).mockResolvedValue(mockNewContact);

      const result = await IdentityService.identify({
        email: 'test@example.com',
        phoneNumber: '123456',
      });

      expect(result.contact.primaryContactId).toBe(1);
      expect(result.contact.emails).toEqual(['test@example.com']);
      expect(result.contact.phoneNumbers).toEqual(['123456']);
      expect(result.contact.secondaryContactIds).toEqual([]);
    });
  });

  describe('identify - Existing Customer', () => {
    it('should return consolidated contact for existing customer', async () => {
      const mockPrimary = {
        id: 1,
        email: 'primary@example.com',
        phoneNumber: '123456',
        linkedId: null,
        linkPrecedence: 'primary' as const,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
        deletedAt: null,
      };

      const mockSecondary = {
        id: 2,
        email: 'secondary@example.com',
        phoneNumber: '123456',
        linkedId: 1,
        linkPrecedence: 'secondary' as const,
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
        deletedAt: null,
      };

      (ContactModel.findByEmailOrPhone as jest.Mock).mockResolvedValue([mockPrimary]);
      (ContactModel.findAllInChain as jest.Mock).mockResolvedValue([mockPrimary, mockSecondary]);

      const result = await IdentityService.identify({
        email: 'primary@example.com',
        phoneNumber: '123456',
      });

      expect(result.contact.primaryContactId).toBe(1);
      expect(result.contact.emails).toContain('primary@example.com');
      expect(result.contact.emails).toContain('secondary@example.com');
      expect(result.contact.secondaryContactIds).toContain(2);
    });
  });
});

describe('ContactModel', () => {
  // These are integration tests that require actual database
  // For now, we'll skip them in the basic setup
  it.skip('should find contacts by email', async () => {
    // Integration test - requires database
  });

  it.skip('should create new contact', async () => {
    // Integration test - requires database
  });
});
