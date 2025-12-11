const userService = require('../services/UserService');
const { generateToken } = require('../middleware/auth');

class AuthController {
  /**
   * Authenticates a user and returns JWT token
   * POST /auth
   */
  async authenticate(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await userService.authenticateUser(email, password);

      // Generate JWT token
      const token = generateToken({ 
        userId: user.id,
        email: user.email 
      });

      res.status(200).json({
        user: {
          id: user.id,
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
        },
        access_token: token,
      });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new AuthController();

