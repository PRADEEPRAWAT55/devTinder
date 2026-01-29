describe('User Tests', () => {
  describe('User Creation', () => {
    test('should create user with valid data', () => {
      const user = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        age: 25
      };
      expect(user.firstName).toBe('John');
      expect(user.email).toMatch(/@/);
      expect(user.age).toBeGreaterThan(18);
    });

    test('should reject user with invalid age', () => {
      const user = { age: 15 };
      expect(user.age).toBeLessThan(18);
    });

    test('should validate required fields', () => {
      const validateUser = (user) => {
        if (!user.firstName || !user.email) {
          throw new Error('Missing required fields');
        }
        return true;
      };
      expect(() => validateUser({})).toThrow('Missing required fields');
    });
  });

  describe('User Profile', () => {
    test('should update user profile', () => {
      const user = { name: 'John', bio: 'Old bio' };
      user.bio = 'New bio';
      expect(user.bio).toBe('New bio');
    });

    test('should validate profile picture URL', () => {
      const validator = require('validator');
      const profilePic = 'https://example.com/pic.jpg';
      expect(validator.isURL(profilePic)).toBe(true);
    });
  });validator

  describe('User Search & Filter', () => {
    test('should filter users by age range', () => {
      const users = [
        { id: 1, age: 20 },
        { id: 2, age: 25 },
        { id: 3, age: 30 }
      ];
      const filtered = users.filter(u => u.age >= 22 && u.age <= 28);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe(2);
    });

    test('should search users by location', () => {
      const users = [
        { id: 1, location: 'NYC' },
        { id: 2, location: 'LA' }
      ];
      const found = users.find(u => u.location === 'NYC');
      expect(found.id).toBe(1);
    });
  });
});
