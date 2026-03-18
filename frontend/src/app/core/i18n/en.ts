export const en = {
  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    admin: 'Admin',
    users: 'Users',
    changePassword: 'Change password',
    signOut: 'Sign out',
    language: 'Language',
    projects: 'Projects',
  },

  // ── Login ───────────────────────────────────────────────────────────────────
  login: {
    title: 'hlrattor',
    subtitle: 'Sign in to continue',
    username: 'Username',
    password: 'Password',
    signIn: 'Sign In',
    usernameRequired: 'Username is required',
    passwordRequired: 'Password is required',
    invalidCredentials: 'Invalid username or password.',
  },

  // ── Home ────────────────────────────────────────────────────────────────────
  home: {
    hello: 'Hello,',
    welcomeBack: 'Welcome back to your dashboard',
  },

  // ── Change Password ─────────────────────────────────────────────────────────
  changePassword: {
    title: 'Change Password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    submit: 'Change password',
    success: 'Password changed successfully.',
    error: 'Unable to change password. Check your current password and try again.',
  },

  // ── User List ───────────────────────────────────────────────────────────────
  userList: {
    title: 'Users',
    newUser: 'New user',
    username: 'Username',
    password: 'Password',
    roles: 'Roles',
    status: 'Status',
    actions: 'Actions',
    enabled: 'Enabled',
    disabled: 'Disabled',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create',
    disable: 'Disable',
    edit: 'Edit',
    noUsers: 'No users found.',
    errorLoad: 'Unable to load users',
    errorCreate: 'Unable to create user',
    errorUpdate: 'Unable to update user',
    errorDisable: 'Unable to disable user',
  },

  // ── User Form ───────────────────────────────────────────────────────────────
  userForm: {
    createUser: 'Create user',
    editUser: 'Edit user',
  },

  // ── Languages ───────────────────────────────────────────────────────────────
  languages: {
    en: 'English',
    fr: 'French',
  },
};

export type TranslationKeys = typeof en;
