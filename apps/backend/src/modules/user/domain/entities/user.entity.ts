export interface User {
  id: string
  fullName: string
  email: string
  createdAt: Date
}

export interface UserCredentials extends User {
  passwordHash: string
}
