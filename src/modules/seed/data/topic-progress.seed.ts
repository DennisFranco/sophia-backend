import { TopicProgressStatus } from '../../../common/enums/topic-progress-status.enum';

export const topicProgressSeedByOrder = [
  {
    order: 1,
    status: TopicProgressStatus.COMPLETED,
    progressPercent: 100,
    completedExercises: 8,
    totalExercises: 8,
    correctAnswers: 7,
    totalAnswered: 8,
    timeStudiedSeconds: 3600,
  },
  {
    order: 2,
    status: TopicProgressStatus.IN_PROGRESS,
    progressPercent: 45,
    completedExercises: 4,
    totalExercises: 8,
    correctAnswers: 3,
    totalAnswered: 4,
    timeStudiedSeconds: 1800,
  },
  {
    order: 3,
    status: TopicProgressStatus.NOT_STARTED,
    progressPercent: 0,
    completedExercises: 0,
    totalExercises: 8,
    correctAnswers: 0,
    totalAnswered: 0,
    timeStudiedSeconds: 0,
  },
];
