const { z } = require('zod');

const loginSchema = z.object({
  username: z
    .string({ required_error: 'Identifiant requis' })
    .trim()
    .min(1, 'Identifiant requis')
    .max(64, 'Identifiant trop long (max 64)'),
  password: z
    .string({ required_error: 'Mot de passe requis' })
    .min(1, 'Mot de passe requis')
    .max(128, 'Mot de passe trop long (max 128)'),
});

const changePasswordSchema = z.object({
  oldPassword: z
    .string({ required_error: 'Ancien mot de passe requis' })
    .min(1, 'Ancien mot de passe requis')
    .max(128),
  newPassword: z
    .string({ required_error: 'Nouveau mot de passe requis' })
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .max(128, 'Nouveau mot de passe trop long (max 128)'),
});

const createUserSchema = z.object({
  username: z
    .string({ required_error: 'Identifiant requis' })
    .trim()
    .min(2, 'Identifiant trop court (min 2)')
    .max(64, 'Identifiant trop long (max 64)')
    .regex(/^[A-Za-z0-9._-]+$/, 'Identifiant: lettres, chiffres, . _ - uniquement'),
  password: z
    .string({ required_error: 'Mot de passe requis' })
    .min(8, 'Mot de passe: minimum 8 caractères')
    .max(128),
  role: z.enum(['root', 'dsa']).optional().default('dsa'),
  dsa_region: z.string().trim().max(120).nullable().optional(),
  permissions: z
    .object({
      pages: z.array(z.string().min(1).max(40)).max(20),
    })
    .nullable()
    .optional(),
});

const permissionsSchema = z.object({
  permissions: z
    .object({
      pages: z.array(z.string().min(1).max(40)).max(20),
    })
    .nullable(),
});

const logCreateSchema = z.object({
  date: z
    .string({ required_error: 'Date requise' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format AAAA-MM-JJ)'),
  time: z
    .string({ required_error: 'Heure requise' })
    .regex(/^\d{2}:\d{2}$/, 'Heure invalide (format HH:MM)'),
  site: z
    .string({ required_error: 'Site requis' })
    .trim()
    .min(1, 'Site requis')
    .max(120),
  equip: z
    .string({ required_error: 'Équipement requis' })
    .trim()
    .min(1, 'Équipement requis')
    .max(64),
  status: z.enum(['ON', 'OFF', 'Degradee'], {
    errorMap: () => ({ message: 'Statut invalide (ON, OFF ou Degradee)' }),
  }),
  start_time: z
    .union([
      z.string().regex(/^\d{2}:\d{2}$/, 'Début invalide (HH:MM)'),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  end_time: z
    .union([
      z.string().regex(/^\d{2}:\d{2}$/, 'Fin invalide (HH:MM)'),
      z.literal(''),
      z.null(),
    ])
    .optional(),
  why: z.string().max(500).optional().default(''),
});

const trafficImportSchema = z
  .object({
    csv: z.string().optional(),
    text: z.string().optional(),
  })
  .refine((d) => typeof (d.csv || d.text) === 'string' && String(d.csv || d.text).length > 0, {
    message: 'Corps attendu: { "csv": "month,label,movements\\n..." }',
  });

module.exports = {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  permissionsSchema,
  logCreateSchema,
  trafficImportSchema,
};
