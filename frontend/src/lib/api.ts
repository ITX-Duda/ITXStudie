import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
});

export const startSession = async (userId: string, categoryId?: string, topicId?: string) => {
  const { data } = await api.post('/sessions/start', { userId, categoryId, topicId });
  return data;
};

export const stopSession = async (
  sessionId: string,
  opts?: { notes?: string; rating?: string },
) => {
  const { data } = await api.patch(`/sessions/${sessionId}/stop`, opts ?? {});
  return data;
};

export const getSessions = async (userId: string) => {
  const { data } = await api.get(`/sessions/user/${userId}`);
  return data;
};

export const deleteSession = async (sessionId: string) => {
  const { data } = await api.delete(`/sessions/${sessionId}`);
  return data;
};

export const getCategories = async (userId: string) => {
  const { data } = await api.get(`/categories/user/${userId}`);
  return data;
};

export const createCategory = async (userId: string, name: string) => {
  const { data } = await api.post('/categories', { userId, name });
  return data;
};

export const getTopics = async (userId: string, categoryId?: string) => {
  const { data } = await api.get(`/topics/user/${userId}${categoryId ? `?categoryId=${categoryId}` : ''}`);
  return data;
};

export const createTopic = async (userId: string, categoryId: string, name: string) => {
  const { data } = await api.post('/topics', { userId, categoryId, name });
  return data;
};

// ─── Circles ──────────────────────────────────────────────────────────────────

export const createCircle = async (
  userId: string,
  name: string,
  description: string | undefined,
  phases: {
    order: number;
    type: 'study' | 'break';
    durationMins: number;
    label?: string;
    categoryId?: string;
    topicId?: string;
  }[],
) => {
  const { data } = await api.post('/circles', { userId, name, description, phases });
  return data;
};

export const getCircles = async (userId: string) => {
  const { data } = await api.get(`/circles/user/${userId}`);
  return data;
};

export const getCircle = async (id: string) => {
  const { data } = await api.get(`/circles/${id}`);
  return data;
};

export const deleteCircle = async (id: string) => {
  const { data } = await api.delete(`/circles/${id}`);
  return data;
};

export const startCircleRun = async (circleId: string, userId: string) => {
  const { data } = await api.post(`/circles/${circleId}/run`, { userId });
  return data;
};

export const getRun = async (runId: string) => {
  const { data } = await api.get(`/circles/runs/${runId}`);
  return data;
};

export const advancePhase = async (runId: string) => {
  const { data } = await api.patch(`/circles/runs/${runId}/next`);
  return data;
};

export const abandonRun = async (runId: string) => {
  const { data } = await api.patch(`/circles/runs/${runId}/abandon`);
  return data;
};

// ─── Quarter Plans ─────────────────────────────────────────────────────────────

export const createQuarterPlan = async (userId: string, name: string) => {
  const { data } = await api.post('/quarter-plans', { userId, name });
  return data;
};

export const getQuarterPlans = async (userId: string) => {
  const { data } = await api.get(`/quarter-plans/user/${userId}`);
  return data;
};

export const addTopicToPlan = async (planId: string, topicId: string, order?: number) => {
  const { data } = await api.post(`/quarter-plans/${planId}/topics`, { topicId, order });
  return data;
};

export const removeTopicFromPlan = async (planId: string, topicId: string) => {
  const { data } = await api.delete(`/quarter-plans/${planId}/topics/${topicId}`);
  return data;
};

export const deleteQuarterPlan = async (planId: string) => {
  const { data } = await api.delete(`/quarter-plans/${planId}`);
  return data;
};

export default api;
