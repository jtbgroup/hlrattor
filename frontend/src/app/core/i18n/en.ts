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

  // ── Project List ─────────────────────────────────────────────────────────────
  projectList: {
    title: 'Projects',
    newProject: 'New project',
    filterStatus: 'Status',
    filterStatusAll: 'All',
    filterPm: 'Project Manager',
    filterPmPlaceholder: 'Filter by PM',
    colReference: 'Reference',
    colName: 'Name',
    colStatus: 'Status',
    colProjectManager: 'Project Manager',
    colDueDate: 'Due Date',
    colTotalBudget: 'Total Budget',
    noProjects: 'No projects found.',
    errorLoad: 'Failed to load projects.',
    viewDetail: 'View detail',
  },

  // ── Project Detail ───────────────────────────────────────────────────────────
  projectDetail: {
    loading: 'Loading…',
    edit: 'Edit',
    readonlyBanner: 'This project is {{status}}. Change its status to edit it.',
    // Panels
    panelGeneral: 'General',
    panelCurrentState: 'Current State',
    panelBudget: 'Budget',
    panelHistory: 'History',
    // Fields
    fieldReference: 'Reference',
    fieldName: 'Name',
    fieldSciformaCode: 'Sciforma Code',
    fieldPordBia: 'PORD BIA',
    fieldPordProject: 'PORD Project',
    fieldStatus: 'Status',
    fieldProjectManager: 'Project Manager',
    fieldDueDate: 'Due Date',
    fieldTotalBudget: 'Total Budget',
    // Budget table
    budgetColType: 'Type',
    budgetColAmount: 'Amount (€)',
    budgetColComment: 'Comment',
    budgetEmpty: 'No budget lines yet.',
    addBudgetLine: 'Add budget line',
    // History
    historyStatus: 'Status',
    historyPm: 'Project Manager',
    historyDueDate: 'Due Date',
    historyColStatus: 'Status',
    historyColDate: 'Date',
    historyColBy: 'By',
    historyColName: 'Name',
    historyColFrom: 'From',
    historyColTo: 'To',
    historyColDueDate: 'Due Date',
    historyCurrent: 'Current',
    historyEmpty: 'No history.',
    // Tooltips / buttons
    tooltipChangeStatus: 'Change status',
    tooltipChangePm: 'Change project manager',
    tooltipSetDueDate: 'Set due date',
    tooltipEdit: 'Edit',
    tooltipDelete: 'Delete',
    // Snackbars
    statusUpdated: 'Status updated',
    pmUpdated: 'Project manager updated',
    dueDateUpdated: 'Due date updated',
    budgetLineAdded: 'Budget line added',
    budgetLineUpdated: 'Budget line updated',
    budgetLineDeleted: 'Budget line deleted',
    historyDeleteNotSupported: 'History deletion not yet supported by the API',
    // Confirms
    confirmDeleteBudget: 'Delete budget line of {{amount}} €?',
    confirmDeleteStatus: 'Delete status entry "{{status}}" ({{date}})?',
    confirmDeletePm: 'Delete PM entry "{{pm}}"?',
    confirmDeleteDueDate: 'Delete due date entry "{{date}}"?',
    close: 'Close',
    error: 'Error',
  },

  // ── Project Form ─────────────────────────────────────────────────────────────
  projectForm: {
    titleCreate: 'New Project',
    titleEdit: 'Edit Project',
    draftNotice: 'Every new project starts with status DRAFT, dated today.',
    fieldName: 'Name',
    fieldSciformaCode: 'Sciforma Code',
    fieldPordBia: 'PORD BIA',
    fieldPordProject: 'PORD Project',
    fieldProjectManager: 'Project Manager',
    errorNameRequired: 'Name is required',
    errorPmRequired: 'Project manager is required',
    errorLoad: 'Failed to load projects.',
    cancel: 'Cancel',
    save: 'Save',
    create: 'Create project',
    saving: 'Saving…',
    loading: 'Loading…',
  },

  // ── Languages ───────────────────────────────────────────────────────────────
  languages: {
    en: 'English',
    fr: 'French',
  },
};

export type TranslationKeys = typeof en;