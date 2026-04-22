import { PracticeDifficulty } from '../../../common/enums/practice-difficulty.enum';

export const practiceSeedByTopicSlug = [
  {
    topicSlug: 'ley-de-coulomb',
    practiceSet: {
      title: 'Práctica guiada - Ley de Coulomb',
      description:
        'Ejercicios introductorios sobre interacción entre cargas puntuales.',
      difficulty: PracticeDifficulty.EASY,
      estimatedMinutes: 15,
      tags: ['electrostática', 'cargas', 'fuerza'],
    },
    questions: [
      {
        prompt:
          '¿Qué magnitud describe la Ley de Coulomb entre dos cargas puntuales?',
        options: [
          'Voltaje',
          'Fuerza eléctrica',
          'Campo magnético',
          'Capacitancia',
        ],
        correctAnswer: 'Fuerza eléctrica',
        explanation:
          'La Ley de Coulomb cuantifica la fuerza eléctrica entre cargas puntuales.',
        difficulty: PracticeDifficulty.EASY,
      },
      {
        prompt:
          'Si la distancia entre dos cargas aumenta, la fuerza eléctrica:',
        options: [
          'Aumenta linealmente',
          'Disminuye',
          'Permanece constante',
          'Se vuelve cero siempre',
        ],
        correctAnswer: 'Disminuye',
        explanation:
          'La fuerza es inversamente proporcional al cuadrado de la distancia.',
        difficulty: PracticeDifficulty.EASY,
      },
      {
        prompt: 'Dos cargas del mismo signo se:',
        options: ['Atraen', 'Repelen', 'Anulan', 'Ionizan'],
        correctAnswer: 'Repelen',
        explanation: 'Cargas del mismo signo se repelen.',
        difficulty: PracticeDifficulty.EASY,
      },
    ],
  },
  {
    topicSlug: 'campo-electrico',
    practiceSet: {
      title: 'Práctica guiada - Campo eléctrico',
      description:
        'Ejercicios básicos para interpretar y calcular campo eléctrico.',
      difficulty: PracticeDifficulty.EASY,
      estimatedMinutes: 15,
      tags: ['campo eléctrico', 'vectores', 'electrostática'],
    },
    questions: [
      {
        prompt: 'El campo eléctrico se define como:',
        options: [
          'Fuerza por unidad de carga',
          'Trabajo por unidad de masa',
          'Voltaje por unidad de tiempo',
          'Energía por unidad de corriente',
        ],
        correctAnswer: 'Fuerza por unidad de carga',
        explanation: 'E = F/q para una carga de prueba positiva.',
        difficulty: PracticeDifficulty.EASY,
      },
      {
        prompt:
          'La dirección del campo eléctrico se toma como la dirección de la fuerza sobre:',
        options: [
          'Una carga negativa de prueba',
          'Una carga positiva de prueba',
          'Una partícula neutra',
          'Un conductor',
        ],
        correctAnswer: 'Una carga positiva de prueba',
        explanation:
          'Por convención, la dirección del campo es la de la fuerza sobre una carga positiva.',
        difficulty: PracticeDifficulty.EASY,
      },
      {
        prompt: 'Las líneas de campo eléctrico salen de cargas:',
        options: ['Negativas', 'Positivas', 'Neutras', 'Variables'],
        correctAnswer: 'Positivas',
        explanation:
          'Las líneas de campo salen de cargas positivas y terminan en negativas.',
        difficulty: PracticeDifficulty.EASY,
      },
    ],
  },
];
