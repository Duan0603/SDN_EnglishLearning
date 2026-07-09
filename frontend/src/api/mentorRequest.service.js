import client from './client';

const mentorRequestService = {
  /**
   * Submit an upgrade request containing base64 certificates, bio, and expertise.
   */
  submitRequest: (data) => client.post('/users/me/mentor-request', data),

  /**
   * Fetch the latest request of the authenticated user.
   */
  getMyRequest: () => client.get('/users/me/mentor-request'),
};

export default mentorRequestService;
