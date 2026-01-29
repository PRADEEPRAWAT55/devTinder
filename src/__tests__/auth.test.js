describe('Authentication Tests', () => {
  test('should validate email format', () => {
    const validator = require('validator');
    expect(validator.isEmail('test@example.com')).toBe(true);
    expect(validator.isEmail('invalid-email')).toBe(false);
  });

  test('should hash password with bcrypt', async () => {
    const bcrypt = require('bcrypt');
    const password = 'testPassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });
});
