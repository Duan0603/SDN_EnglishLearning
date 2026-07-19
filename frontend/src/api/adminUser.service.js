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

  // GET /admin/mentor-requests — list all mentor requests
  getMentorRequests: (status) => client.get('/admin/mentor-requests', { params: { status } }),

  // PATCH /admin/mentor-requests/:id/approve — approve a mentor request
  approveMentorRequest: (id) => client.patch(`/admin/mentor-requests/${id}/approve`),

  // PATCH /admin/mentor-requests/:id/reject — reject a mentor request
  rejectMentorRequest: (id, reason) => client.patch(`/admin/mentor-requests/${id}/reject`, { reason }),

  // GET /admin/submissions — list all student submissions
  getSubmissions: (params = {}) => client.get('/admin/submissions', { params }),

  // DELETE /admin/submissions/:id — delete a student's result/submission
  deleteSubmission: (id, type) => client.delete(`/admin/submissions/${id}`, { params: { type } }),

  // GET /admin/bookings — list all mentor/student bookings
  getAllBookings: (params = {}) => client.get('/admin/bookings', { params }),

  // PATCH /admin/bookings/:id/confirm — confirm booking
  confirmBooking: (id) => client.patch(`/admin/bookings/${id}/confirm`),

  // PATCH /admin/bookings/:id/cancel — cancel booking
  cancelBooking: (id) => client.patch(`/admin/bookings/${id}/cancel`),
};

export default adminUserService;
