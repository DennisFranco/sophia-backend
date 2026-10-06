# SOPHIA — diagnóstico/fix Gemini

Este patch hace cuatro cosas:

1. Mantiene `gemini-3.1-flash-lite` como modelo estable.
2. Elimina `temperature` de la llamada a Gemini para usar el valor por defecto del modelo.
3. Añade diagnóstico seguro del error (`name`, `status`, `message`) cuando `AI_DEBUG=true`.
4. Añade `scripts/test-gemini.mjs` y `npm run ai:smoke` para probar Gemini sin pasar por Tutor/MongoDB.

## Render

Environment:

```env
GEMINI_MODEL=gemini-3.1-flash-lite
AI_DEBUG=true
LOG_LEVEL=debug
```

No compartas `GEMINI_API_KEY`.

Build Command recomendado:

```bash
npm ci && npm run build
```

Start Command:

```bash
npm run start:prod
```

Después del deploy, repite POST Tutor. Con `AI_DEBUG=true`, si Gemini falla la respuesta incluirá temporalmente:

```json
"providerError": {
  "name": "ApiError",
  "status": 403,
  "message": "..."
}
```

Desactiva `AI_DEBUG` cuando termines el diagnóstico.

## Prueba aislada

Con las variables de entorno cargadas:

```bash
npm run ai:smoke
```

Éxito esperado:

```text
[Gemini smoke] success { text: 'OK', ... }
```

Si falla, el problema está en API key / acceso / cuota / red / modelo, no en TutorService.
