import { Role } from '../../../common/enums/role.enum';
import { UserStatus } from '../../auth/infrastructure/persistence/schemas/user.schema';

export const studentUserSeed = {
  institutionalEmail: 'dennis@unicatolica.edu.co',
  internalCode: '2024123456',
  role: Role.STUDENT,
  status: UserStatus.ACTIVE,
};

export const studentProfileSeed = {
  firstName: 'Dennis',
  lastName: 'Franco',
  fullName: 'Dennis Franco',
  universityCode: '2024123456',
  faculty: 'Ingeniería',
  program: 'Ingeniería de Sistemas',
  semester: 6,
  avatarUrl: '',
  preferences: {
    preferredDifficulty: 'MEDIUM' as const,
  },
};
