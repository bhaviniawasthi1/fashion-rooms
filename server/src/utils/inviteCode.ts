import { v4 as uuidv4 } from 'uuid';

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateInviteCode(): string {
  const uuid = uuidv4().replace(/-/g, '');
  let code = '';
  for (let i = 0; i < 8; i++) {
    const hexVal = parseInt(uuid.substring(i * 2, i * 2 + 2), 16);
    code += CHARSET[hexVal % CHARSET.length];
  }
  return code;
}


