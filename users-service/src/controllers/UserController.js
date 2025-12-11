const userService = require('../services/UserService');
const { UnauthorizedError, NotFoundError } = require('../errors');

class UserController {
  /**
   * Creates a new user
   * POST /users
   */
  async createUser(req, res, next) {
    try {
      const { first_name, last_name, email, password } = req.body;

      const user = await userService.createUser(
        first_name,
        last_name,
        email,
        password
      );

      res.status(200).json({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Lists all users
   * GET /users
   */
  async getAllUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();

      const formattedUsers = users.map(user => ({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      }));

      res.status(200).json(formattedUsers);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Gets a user by ID
   * GET /users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      if(req.user.userId !== id) {
        return next(new UnauthorizedError());
      }

      const user = await userService.getUserById(id);

      if (!user) {
        return next(new NotFoundError('User not found'));
      }

      res.status(200).json({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Updates a user
   * PATCH /users/:id
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;

      if(req.user.userId !== id) {
        return next(new UnauthorizedError());
      }

      const { first_name, last_name, email, password } = req.body;

      const updateData = {};
      if (first_name) updateData.firstName = first_name;
      if (last_name) updateData.lastName = last_name;
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      const user = await userService.updateUser(id, updateData);

      res.status(200).json({
        id: user.id,
        first_name: user.firstName,
        last_name: user.lastName,
        email: user.email,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Deletes a user
   * DELETE /users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if(req.user.userId !== id) {
        return next(new UnauthorizedError());
      }

      await userService.deleteUser(id);

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new UserController();

