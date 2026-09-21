import type { Session } from "./workshop";
export function persistSession(
  storage: Pick<Storage, "setItem">,
  key: string,
  session: Session,
) {
  const data = JSON.stringify(session);
  storage.setItem(key, data);
  return data;
}
