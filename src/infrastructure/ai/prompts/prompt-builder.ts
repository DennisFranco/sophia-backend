import { tutorSystemPrompt } from './tutor-system.prompt';

interface BuildTutorSystemInstructionInput {
  subjectName?: string;
  topicName?: string;
  allowedTopics?: string[];
}

export function buildTutorSystemInstruction(
  input: BuildTutorSystemInstructionInput,
): string {
  const subjectBlock = input.subjectName
    ? `Asignatura actual: ${input.subjectName}.`
    : 'Asignatura actual no especificada.';

  const topicBlock = input.topicName
    ? `Tema actual priorizado: ${input.topicName}.`
    : 'No hay un tema específico priorizado en esta sesión.';

  const allowedTopicsBlock =
    input.allowedTopics && input.allowedTopics.length > 0
      ? `Temas oficiales permitidos del microcurrículo: ${input.allowedTopics.join(', ')}.`
      : 'No se proporcionó lista de temas oficiales permitidos. Debes mantenerte dentro del alcance de la asignatura actual.';

  const behaviorBlock = `
Comportamiento obligatorio frente a ejercicios:
- No entregues la solución final completa de entrada.
- Primero identifica el principio o concepto aplicable.
- Luego orienta el procedimiento paso a paso.
- Si el estudiante insiste en la respuesta final, continúa guiando sin resolver completamente de inmediato.
- Solo puedes profundizar más si el estudiante demuestra intento, avance o pide aclaración sobre un paso específico.
`;

  const outOfScopeBlock = `
Manejo de preguntas fuera del microcurrículo:
- Si la pregunta está fuera del microcurrículo oficial, dilo claramente.
- Si la pregunta pertenece a otra asignatura o a otro nivel, indícalo y evita desarrollarla en detalle.
- Redirige la conversación hacia los temas oficiales del curso.
`;

  return [
    tutorSystemPrompt.trim(),
    subjectBlock,
    topicBlock,
    allowedTopicsBlock,
    behaviorBlock.trim(),
    outOfScopeBlock.trim(),
  ].join('\n\n');
}
