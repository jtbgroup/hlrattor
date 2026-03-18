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

  // ── Languages ───────────────────────────────────────────────────────────────
  languages: {
    en: 'Anglais',
    fr: 'Français',
  },
};
