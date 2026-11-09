import jwt from 'jsonwebtoken';

/**
 * Generate a JSON Web Token (JWT)
 * Embeds user identity (id) and role into a cryptographically signed stateless token.
 *
 * @param {string} userId - MongoDB _id of the authenticated user
 * @param {string} role - User authorization role ('customer' or 'admin')
 * @returns {string} Signed JWT token string
 */
export const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  if (!secret) {
    throw new Error('JWT_SECRET is not configured in backend environment variables.');
  }

  return jwt.sign(
    {
      id: userId,
      role: role,
    },
    secret,
    {
      expiresIn: expiresIn,
    }
  );
};

export default generateToken;
