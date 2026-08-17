type NameSource = {
  name?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
};

/** Build a display name from common API field shapes (camelCase + snake_case). */
export function formatPersonName(source?: NameSource | null, fallback = 'Student'): string {
  if (!source) return fallback;

  const rawName = source.name?.trim();
  if (rawName && rawName !== 'undefined' && rawName !== 'null') {
    return rawName;
  }

  const first = String(source.firstName || source.first_name || '')
    .replace(/^undefined$/i, '')
    .trim();
  const last = String(source.lastName || source.last_name || '')
    .replace(/^undefined$/i, '')
    .trim();
  const full = [first, last].filter(Boolean).join(' ').trim();

  return full || fallback;
}

/** First word of a full name, with safe fallback when missing or invalid. */
export function getFirstName(fullName: string | undefined | null, fallback = 'Parent'): string {
  const trimmed = fullName?.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed.startsWith('undefined ')) {
    return fallback;
  }
  return trimmed.split(/\s+/)[0] || fallback;
}

function resolveClassInfo(student: Record<string, unknown>) {
  const classInfo = student.class as { id?: string; _id?: string; name?: string; section?: string } | string | null | undefined;

  const classId =
    (student.classId as string | undefined) ||
    (student.class_id as string | undefined) ||
    (typeof classInfo === 'object' && classInfo ? classInfo.id || classInfo._id : undefined) ||
    '';

  const className =
    (student.className as string | undefined) ||
    (typeof classInfo === 'object' && classInfo ? classInfo.name : undefined) ||
    'Unknown Class';

  return { classId, className };
}

/** Map a backend student record to the child store shape. */
export function mapStudentToChild(student: Record<string, unknown>): {
  _id: string;
  name: string;
  admissionNo: string;
  classId: string;
  className: string;
  avatarUrl?: string;
} {
  const { classId, className } = resolveClassInfo(student);

  return {
    _id: String(student._id || student.id || ''),
    name: formatPersonName(student as NameSource, 'Student'),
    admissionNo: String(student.admissionNo || student.admission_no || ''),
    classId: String(classId || ''),
    className: String(className || 'Unknown Class'),
    avatarUrl: (student.profilePicture || student.profile_picture) as string | undefined,
  };
}
