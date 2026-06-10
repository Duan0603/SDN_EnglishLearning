import client from './client';

// Base path for admin user operations
const ADMIN_USERS = '/admin/users';

const adminUserService = {
  // GET /admin/users — list all users (with optional filters)
  getAll: (params = {}) => client.get(ADMIN_USERS, { params }),

  // GET /admin/users/:id — get single user
  getById: (id) => client.get(`${ADMIN_USERS}/${id}`),

  // POST /admin/users — create new user
  create: (data) => client.post(ADMIN_USERS, data),

  // PATCH /admin/users/:id — update user fields
  update: (id, data) => client.patch(`${ADMIN_USERS}/${id}`, data),

  // DELETE /admin/users/:id — delete user
  remove: (id) => client.delete(`${ADMIN_USERS}/${id}`),

  // PATCH /admin/users/:id/status — toggle active/inactive
  toggleStatus: (id, status) => client.patch(`${ADMIN_USERS}/${id}/status`, { status }),

  // PATCH /admin/users/:id/approve-mentor — approve a mentor
  approveMentor: (id) => client.patch(`${ADMIN_USERS}/${id}/approve-mentor`),
};

export default adminUserService;
