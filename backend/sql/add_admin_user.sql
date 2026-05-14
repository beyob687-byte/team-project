BEGIN;

ALTER TABLE users
DROP CONSTRAINT IF EXISTS users_user_type_check;

ALTER TABLE users
ADD CONSTRAINT users_user_type_check
CHECK (user_type IN ('student', 'faculty', 'staff', 'admin'));

WITH target_university AS (
  SELECT id
  FROM universities
  WHERE domain = 'aau.edu.et'
  LIMIT 1
)
INSERT INTO users (
  id,
  university_id,
  password_hash,
  email,
  first_name,
  last_name,
  student_id,
  external_auth_id,
  user_type,
  major,
  department,
  enrollment_status,
  profile_image_url,
  bio,
  interests,
  privacy_profile_visible,
  privacy_roster_visible,
  allow_ai_recommend,
  notification_preferences,
  is_active,
  created_at,
  last_login
)
SELECT
  'b0b0b0b0-1111-4111-1111-111111111111',
  target_university.id,
  '$2a$12$MmzdLHx0bB/Z4K7Pa/ZOIeSMZ0tI54ojZ1OBSHEatC9Ybepn1QKRi',
  'admin@aau.edu.et',
  'Alem',
  'Tsegaye',
  NULL,
  'aau-admin-001',
  'admin',
  NULL,
  'Student Affairs',
  'active',
  NULL,
  'University admin account for UniClubs.',
  ARRAY['administration', 'student life', 'policy']::text[],
  TRUE,
  TRUE,
  TRUE,
  '{"email": true, "in_app": true, "digest": "daily"}'::jsonb,
  TRUE,
  TIMESTAMP '2023-01-15 00:00:00+03',
  TIMESTAMP '2025-05-14 00:00:00+03'
FROM target_university
ON CONFLICT (university_id, email)
DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  external_auth_id = EXCLUDED.external_auth_id,
  user_type = EXCLUDED.user_type,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  department = EXCLUDED.department,
  major = EXCLUDED.major,
  enrollment_status = EXCLUDED.enrollment_status,
  profile_image_url = EXCLUDED.profile_image_url,
  bio = EXCLUDED.bio,
  interests = EXCLUDED.interests,
  privacy_profile_visible = EXCLUDED.privacy_profile_visible,
  privacy_roster_visible = EXCLUDED.privacy_roster_visible,
  allow_ai_recommend = EXCLUDED.allow_ai_recommend,
  notification_preferences = EXCLUDED.notification_preferences,
  is_active = EXCLUDED.is_active,
  created_at = EXCLUDED.created_at,
  last_login = EXCLUDED.last_login;

COMMIT;
