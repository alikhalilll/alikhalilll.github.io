const PLAN_LOCALE = '/en-us';

export const plansPath = () => `${PLAN_LOCALE}/plans`;

export const roadmapPath = (planId: string) => `${plansPath()}/roadmap/${planId}`;

export const topicPath = (planId: string, topicId: string) =>
  `${roadmapPath(planId)}/topics/${topicId}`;

export const phasePath = (planId: string, phaseKey: string) =>
  `${roadmapPath(planId)}/phase/${phaseKey}`;
