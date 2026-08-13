/**
 * Zod request-body validator.
 * On failure: 400 + French message (matches existing route style).
 */
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const issue = result.error.issues[0];
      const path = issue?.path?.length ? issue.path.join('.') : '';
      const detail = issue?.message || 'données invalides';
      const msg = path ? `${path}: ${detail}` : detail;
      return res.status(400).json({ error: msg });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
