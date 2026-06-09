import userModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { OK, Created } from '../core/success.response.js';
import { BadRequestError, NotFoundError } from '../core/error.response.js';

export class AdminUserController {

  // GET /api/v1/admin/users — List all users, with optional role/status filter
  static getAllUsers = async (req, res, next) => {
    const { role, status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      userModel.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      userModel.countDocuments(filter),
    ]);

    new OK({
      message: 'Users fetched successfully',
      metadata: { users, total, page: parseInt(page), limit: parseInt(limit) },
    }).send(res);
  };

  // GET /api/v1/admin/users/:id — Get single user details
  static getUserById = async (req, res, next) => {
    const user = await userModel.findById(req.params.id).select('-password').lean();
    if (!user) throw new NotFoundError('User not found');

    new OK({ message: 'User fetched successfully', metadata: user }).send(res);
  };

  // POST /api/v1/admin/users — Create a new user (admin-created, any role)
  static createUser = async (req, res, next) => {
    const { username, email, password, fullName, role = 'STUDENT', birthday = '', phone = '', identityNumber = '' } = req.body;

    if (!username || !email || !password || !fullName) {
      throw new BadRequestError('username, email, password and fullName are required');
    }

    const existingEmail = await userModel.findOne({ email }).lean();
    if (existingEmail) throw new BadRequestError('Email already registered');

    const existingUsername = await userModel.findOne({ username }).lean();
    if (existingUsername) throw new BadRequestError('Username already taken');

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      username,
      email,
      password: hashedPassword,
      fullName,
      role,
      birthday,
      phone,
      identityNumber,
      status: 'active',
      verify: true, // Admin-created users are auto-verified
    });

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    new Created({
      message: 'User created successfully',
      metadata: userWithoutPassword,
    }).send(res);
  };

  // PATCH /api/v1/admin/users/:id — Update user fields
  static updateUser = async (req, res, next) => {
    const { fullName, email, username, role, status, birthday, phone, identityNumber, password } = req.body;

    const user = await userModel.findById(req.params.id);
    if (!user) throw new NotFoundError('User not found');

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const existing = await userModel.findOne({ email }).lean();
      if (existing) throw new BadRequestError('Email already in use by another account');
    }

    // Check username uniqueness if changing
    if (username && username !== user.username) {
      const existing = await userModel.findOne({ username }).lean();
      if (existing) throw new BadRequestError('Username already in use');
    }

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (username !== undefined) user.username = username;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (birthday !== undefined) user.birthday = birthday;
    if (phone !== undefined) user.phone = phone;
    if (identityNumber !== undefined) user.identityNumber = identityNumber;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    new OK({ message: 'User updated successfully', metadata: userWithoutPassword }).send(res);
  };

  // DELETE /api/v1/admin/users/:id — Permanently delete a user
  static deleteUser = async (req, res, next) => {
    const user = await userModel.findById(req.params.id);
    if (!user) throw new NotFoundError('User not found');

    // Prevent deleting own account or another ADMIN
    if (user.role === 'ADMIN') {
      throw new BadRequestError('Cannot delete an Admin account via this endpoint');
    }

    await userModel.findByIdAndDelete(req.params.id);
    new OK({ message: 'User deleted successfully', metadata: { id: req.params.id } }).send(res);
  };

  // PATCH /api/v1/admin/users/:id/status — Toggle active/inactive
  static toggleUserStatus = async (req, res, next) => {
    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      throw new BadRequestError('Status must be "active" or "inactive"');
    }

    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, select: '-password' }
    );
    if (!user) throw new NotFoundError('User not found');

    new OK({ message: `User ${status === 'active' ? 'activated' : 'suspended'} successfully`, metadata: user }).send(res);
  };

  // PATCH /api/v1/admin/users/:id/approve-mentor — Approve a mentor profile
  static approveMentor = async (req, res, next) => {
    const user = await userModel.findById(req.params.id);
    if (!user) throw new NotFoundError('User not found');
    if (user.role !== 'MENTOR') throw new BadRequestError('User is not a Mentor');

    user.status = 'active';
    user.verify = true;
    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    new OK({ message: 'Mentor approved successfully', metadata: userWithoutPassword }).send(res);
  };
}
