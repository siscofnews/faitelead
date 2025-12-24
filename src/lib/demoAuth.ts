const LS_USER = "demoUser"
const LS_ROLES = "demoRoles"

type DemoUser = { id: string; email: string }

export async function getUser(): Promise<{ user: DemoUser | null }> {
  const raw = localStorage.getItem(LS_USER)
  return { user: raw ? JSON.parse(raw) as DemoUser : null }
}

export async function signIn(email: string, password: string): Promise<{ user: DemoUser } | { error: { message: string } }> {
  const allowed: Record<string, { password: string; roles: string[] }> = {
    "admin@faitelead.com": { password: "admin@123", roles: ["super_admin", "admin"] },
    "faiteloficial@gmail.com": { password: "P26192920m", roles: ["super_admin"] }, // SUA SENHA REAL
  }
  const account = allowed[email]
  if (!account || account.password !== password) {
    return { error: { message: "Invalid login credentials" } }
  }
  const user: DemoUser = { id: "5e9541ca-ce6e-4301-958f-b7c93f56e356", email } // ID FIXO DO BANCO
  localStorage.setItem(LS_USER, JSON.stringify(user))
  localStorage.setItem(LS_ROLES, JSON.stringify(account.roles))
  return { user }
}

export async function signOut(): Promise<void> {
  localStorage.removeItem(LS_USER)
  localStorage.removeItem(LS_ROLES)
}

export function getRoles(): string[] {
  const raw = localStorage.getItem(LS_ROLES)
  return raw ? JSON.parse(raw) as string[] : []
}
