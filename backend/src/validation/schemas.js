const { z } = require('zod');

const loginSchema = z.object({
  username: z.string({ required_error: 'Identifiant requis' }).trim().min(1, 'Identifiant requis').max(64),
  password: z.string({ required_error: 'Mot de passe requis' }).min(1, 'Mot de passe requis').max(128),
});

const changePasswordSchema = z.object({
  oldPassword: z.string({ required_error: 'Ancien mot de passe requis' }).min(1).max(128),
  newPassword: z.string({ required_error: 'Nouveau mot de passe requis' }).min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères').max(128),
});

const createUserSchema = z.object({
  username: z.string({ required_error: 'Identifiant requis' }).trim().min(2).max(64)
    .regex(/^[A-Za-z0-9._-]+$/, 'Identifiant: lettres, chiffres, . _ - uniquement'),
  password: z.string({ required_error: 'Mot de passe requis' }).min(8).max(128),
  role: z.enum(['root', 'dsa']).optional().default('dsa'),
  dsa_region: z.string().trim().max(120).nullable().optional(),
  permissions: z.object({ pages: z.array(z.string().min(1).max(40)).max(20) }).nullable().optional(),
});

const permissionsSchema = z.object({
  permissions: z.object({ pages: z.array(z.string().min(1).max(40)).max(20) }).nullable(),
});

const logCreateSchema = z.object({
  date: z.string({ required_error: 'Date requise' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (format AAAA-MM-JJ)'),
  time: z.string({ required_error: 'Heure requise' }).regex(/^\d{2}:\d{2}$/, 'Heure invalide (format HH:MM)'),
  site: z.string({ required_error: 'Site requis' }).trim().min(1).max(120),
  equip: z.string({ required_error: 'Équipement requis' }).trim().min(1).max(64),
  equipment_id: z.number().int().positive().nullable().optional(),
  status: z.enum(['ON', 'OFF', 'Degradee'], { errorMap: () => ({ message: 'Statut invalide (ON, OFF ou Degradee)' }) }),
  start_time: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.literal(''), z.null()]).optional(),
  end_time: z.union([z.string().regex(/^\d{2}:\d{2}$/), z.literal(''), z.null()]).optional(),
  why: z.string().max(500).optional().default(''),
});

const trafficImportSchema = z.object({
  csv: z.string().optional(),
  text: z.string().optional(),
}).refine((d) => typeof (d.csv || d.text) === 'string' && String(d.csv || d.text).length > 0, {
  message: 'Corps attendu: { "csv": "month,label,movements\\n..." }',
});

const incidentCreateSchema = z.object({
  date: z.string({ required_error: 'Date requise' }).regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide (AAAA-MM-JJ)'),
  time: z.string({ required_error: 'Heure requise' }).regex(/^\d{2}:\d{2}$/, 'Heure invalide (HH:MM)'),
  site: z.string({ required_error: 'Site requis' }).trim().min(1).max(120),
  system: z.string().trim().max(80).optional().default(''),
  equipment_id: z.number().int().positive().nullable().optional(),
  description: z.string({ required_error: 'Description requise' }).trim().min(3, 'Description trop courte').max(2000),
  severity: z.enum(['minor', 'moderate', 'major'], {
    errorMap: () => ({ message: 'Sévérité invalide (minor, moderate, major)' }),
  }),
  status: z.enum(['open', 'in_review', 'closed']).optional().default('open'),
  resolution_notes: z.string().max(2000).optional().default(''),
});

const incidentUpdateSchema = z.object({
  status: z.enum(['open', 'in_review', 'closed']).optional(),
  resolution_notes: z.string().max(2000).optional(),
  description: z.string().trim().min(3).max(2000).optional(),
  severity: z.enum(['minor', 'moderate', 'major']).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'Aucun champ à mettre à jour' });

const equipmentCreateSchema = z.object({
  site: z.string({ required_error: 'Site requis' }).trim().min(1).max(120),
  system_family: z.string({ required_error: 'Famille système requise' }).trim().min(1).max(64),
  name: z.string({ required_error: 'Nom requis' }).trim().min(1).max(120),
  manufacturer: z.string().trim().max(80).optional().default(''),
  model: z.string().trim().max(80).optional().default(''),
  install_date: z.union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date installation invalide'),
    z.literal(''),
    z.null(),
  ]).optional(),
  status: z.enum(['operational', 'degraded', 'down']).optional().default('operational'),
  responsible_service: z.string().trim().max(120).optional().default(''),
  notes: z.string().max(1000).optional().default(''),
});

const equipmentUpdateSchema = z.object({
  site: z.string().trim().min(1).max(120).optional(),
  system_family: z.string().trim().min(1).max(64).optional(),
  name: z.string().trim().min(1).max(120).optional(),
  manufacturer: z.string().trim().max(80).optional(),
  model: z.string().trim().max(80).optional(),
  install_date: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal(''), z.null()]).optional(),
  status: z.enum(['operational', 'degraded', 'down']).optional(),
  responsible_service: z.string().trim().max(120).optional(),
  notes: z.string().max(1000).optional(),
}).refine((d) => Object.keys(d).length > 0, { message: 'Aucun champ à mettre à jour' });

module.exports = {
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  permissionsSchema,
  logCreateSchema,
  trafficImportSchema,
  incidentCreateSchema,
  incidentUpdateSchema,
  equipmentCreateSchema,
  equipmentUpdateSchema,
};
