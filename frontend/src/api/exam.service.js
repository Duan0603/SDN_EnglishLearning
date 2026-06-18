import client from './client';

const EXAMS = '/exams';

const examService = {
  // GET /exams — list all exams (paginated, filtered)
  getAll: (params = {}) => client.get(EXAMS, { params }),

  // GET /exams/:id — get full exam details
  getById: (id) => client.get(`${EXAMS}/${id}`),

  // POST /exams/:id/submit — submit answers for grading
  submit: (id, answers, timeTaken) => client.post(`${EXAMS}/${id}/submit`, { answers, timeTaken }),

  // POST /exams — create a new exam (Admin)
  create: (data) => client.post(EXAMS, data),

  // PUT /exams/:id — fully update/replace an exam (Admin)
  update: (id, data) => client.put(`${EXAMS}/${id}`, data),

  // DELETE /exams/:id — delete an exam (Admin)
  remove: (id) => client.delete(`${EXAMS}/${id}`),
};

export default examService;
