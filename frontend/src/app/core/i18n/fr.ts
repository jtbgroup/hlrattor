import { TranslationKeys } from './en';

export const fr: TranslationKeys = {
  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    admin: 'Admin',
    users: 'Utilisateurs',
    changePassword: 'Changer le mot de passe',
    signOut: 'Se déconnecter',
    language: 'Langue',
    projects: 'Projets',
  },

  // ── Login ───────────────────────────────────────────────────────────────────
  login: {
    title: 'hlrattor',
    subtitle: 'Connectez-vous pour continuer',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    signIn: 'Se connecter',
    usernameRequired: "Le nom d'utilisateur est requis",
    passwordRequired: 'Le mot de passe est requis',
    invalidCredentials: "Nom d'utilisateur ou mot de passe invalide.",
  },

  // ── Home ────────────────────────────────────────────────────────────────────
  home: {
    hello: 'Bonjour,',
    welcomeBack: 'Bienvenue sur votre tableau de bord',
  },

  // ── Change Password ─────────────────────────────────────────────────────────
  changePassword: {
    title: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    submit: 'Changer le mot de passe',
    success: 'Mot de passe changé avec succès.',
    error: 'Impossible de changer le mot de passe. Vérifiez votre mot de passe actuel et réessayez.',
  },

  // ── User List ───────────────────────────────────────────────────────────────
  userList: {
    title: 'Utilisateurs',
    newUser: 'Nouvel utilisateur',
    username: "Nom d'utilisateur",
    password: 'Mot de passe',
    roles: 'Rôles',
    status: 'Statut',
    actions: 'Actions',
    enabled: 'Actif',
    disabled: 'Inactif',
    cancel: 'Annuler',
    save: 'Enregistrer',
    create: 'Créer',
    disable: 'Désactiver',
    edit: 'Modifier',
    noUsers: 'Aucun utilisateur trouvé.',
    errorLoad: 'Impossible de charger les utilisateurs',
    errorCreate: "Impossible de créer l'utilisateur",
    errorUpdate: "Impossible de mettre à jour l'utilisateur",
    errorDisable: "Impossible de désactiver l'utilisateur",
  },

  // ── User Form ───────────────────────────────────────────────────────────────
  userForm: {
    createUser: 'Créer un utilisateur',
    editUser: "Modifier l'utilisateur",
  },

  // ── Project List ─────────────────────────────────────────────────────────────
  projectList: {
    title: 'Projets',
    newProject: 'Nouveau projet',
    filterStatus: 'Statut',
    filterStatusAll: 'Tous',
    filterPm: 'Chef de projet',
    filterPmPlaceholder: 'Filtrer par chef de projet',
    colReference: 'Référence',
    colName: 'Nom',
    colStatus: 'Statut',
    colProjectManager: 'Chef de projet',
    colDueDate: 'Échéance',
    colTotalBudget: 'Budget total',
    noProjects: 'Aucun projet trouvé.',
    errorLoad: 'Impossible de charger les projets.',
    viewDetail: 'Voir le détail',
  },

  // ── Project Form (création / édition) ────────────────────────────────────
  projectForm: {
    titleCreate: 'Nouveau projet',
    titleEdit: 'Modifier le projet',
    draftNotice: "Tout nouveau projet démarre avec le statut BROUILLON, daté d'aujourd'hui.",
    fieldName: 'Nom',
    fieldSciformaCode: 'Code Sciforma',
    fieldPordBia: 'PORD BIA',
    fieldPordProject: 'PORD Projet',
    fieldProjectManager: 'Chef de projet',
    errorNameRequired: 'Le nom est requis',
    errorPmRequired: 'Le chef de projet est requis',
    errorLoad: "Impossible d'enregistrer le projet. Veuillez réessayer.",
    cancel: 'Annuler',
    save: 'Enregistrer',
    create: 'Créer le projet',
    saving: 'Enregistrement…',
    loading: 'Chargement…',
  },

  // ── Project Detail ───────────────────────────────────────────────────────────
  projectDetail: {
    loading: 'Chargement…',
    edit: 'Modifier',
    readonlyBanner: 'Ce projet est clôturé. Changez son statut pour le modifier.',
    // Panels
    panelGeneral: 'Général',
    panelCurrentState: 'État courant',
    panelBudget: 'Budget',
    panelHistory: 'Historique',
    // Fields
    fieldReference: 'Référence',
    fieldName: 'Nom',
    fieldSciformaCode: 'Code Sciforma',
    fieldPordBia: 'PORD BIA',
    fieldPordProject: 'PORD Projet',
    fieldStatus: 'Statut',
    fieldProjectManager: 'Chef de projet',
    fieldDueDate: 'Échéance',
    fieldTotalBudget: 'Budget total',
    // Budget table
    budgetColType: 'Type',
    budgetColAmount: 'Montant (€)',
    budgetColComment: 'Commentaire',
    budgetEmpty: 'Aucune ligne budgétaire.',
    addBudgetLine: 'Ajouter une ligne',
    // History
    historyStatus: 'Statut',
    historyPm: 'Chef de projet',
    historyDueDate: 'Échéance',
    historyColStatus: 'Statut',
    historyColDate: 'Date',
    historyColBy: 'Par',
    historyColName: 'Nom',
    historyColFrom: 'Depuis',
    historyColTo: "Jusqu'à",
    historyColDueDate: 'Échéance',
    historyCurrent: 'En cours',
    historyEmpty: 'Aucun historique.',
    // Tooltips / buttons
    tooltipChangeStatus: 'Changer le statut',
    tooltipChangePm: 'Changer le chef de projet',
    tooltipSetDueDate: "Définir l'échéance",
    tooltipEdit: 'Modifier',
    tooltipDelete: 'Supprimer',
    // Snackbars
    statusUpdated: 'Statut mis à jour',
    pmUpdated: 'Chef de projet mis à jour',
    dueDateUpdated: 'Échéance mise à jour',
    budgetLineAdded: 'Ligne budgétaire ajoutée',
    budgetLineUpdated: 'Ligne budgétaire mise à jour',
    budgetLineDeleted: 'Ligne budgétaire supprimée',
    historyDeleteNotSupported: "La suppression d'historique n'est pas encore supportée par l'API",
    // Confirms
    confirmDeleteBudget: 'Supprimer la ligne de {{amount}} € ?',
    confirmDeleteStatus: 'Supprimer l\'entrée "{{status}}" ({{date}}) ?',
    confirmDeletePm: 'Supprimer l\'entrée chef de projet "{{pm}}" ?',
    confirmDeleteDueDate: 'Supprimer l\'entrée échéance "{{date}}" ?',
    close: 'Fermer',
    error: 'Erreur',
  },

  // ── Languages ───────────────────────────────────────────────────────────────
  languages: {
    en: 'Anglais',
    fr: 'Français',
  },
};