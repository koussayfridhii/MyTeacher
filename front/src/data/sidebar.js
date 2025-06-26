export const sidebarLinks = [
  {
    imgURL: "/assets/icons/Home.svg",
    route: "/dashboard",
    label: {
      ar: "الصفحة الرئيسية",
      en: "Home",
      fr: "Accueil",
    },
    authorizedRoles: ["admin", "coordinator", "teacher", "student"],
  },
  {
    imgURL: "/assets/icons/calendar.svg",
    route: "/dashboard/calendar",
    label: {
      ar: "اليومية",
      en: "Calendar",
      fr: "Calendrier",
    },

    authorizedRoles: ["coordinator", "admin", "teacher", "student"],
  },
  {
    imgURL: "/assets/icons/now.svg",
    route: "/dashboard/meeting/now",
    label: {
      ar: "القادمة",
      en: "Now",
      fr: "Maintenant",
    },
    authorizedRoles: ["admin", "coordinator", "teacher", "student"],
  },
  {
    imgURL: "/assets/icons/upcoming.svg",
    route: "/dashboard/meeting/upcoming",
    label: {
      ar: "القادمة",
      en: "Upcoming",
      fr: "À venir",
    },
    authorizedRoles: ["admin", "coordinator", "teacher", "student"],
  },
  {
    imgURL: "/assets/icons/previous.svg",
    route: "/dashboard/meeting/previous",
    label: {
      ar: "السابقة",
      en: "Previous",
      fr: "Précédent",
    },
    authorizedRoles: ["admin", "coordinator", "teacher", "student"],
  },
  {
    imgURL: "/assets/icons/Video.svg",
    route: "/dashboard/meeting/recordings",
    label: {
      ar: "التسجيلات",
      en: "Recordings",
      fr: "Enregistrements",
    },
    authorizedRoles: ["admin", "coordinator"],
  },
  {
    imgURL: "/assets/icons/users.svg", // Using a generic users icon for groups
    route: "/dashboard/groups",
    label: {
      ar: "المجموعات",
      en: "Groups",
      fr: "Groupes",
    },
    authorizedRoles: ["admin", "coordinator"],
  },
  {
    imgURL: "/assets/icons/topup.svg",
    route: "/dashboard/topup",
    label: {
      ar: " شحن",
      en: "Top Up",
      fr: "Recharger",
    },

    authorizedRoles: ["admin"],
  },
  {
    imgURL: "/assets/icons/coin.svg",
    route: "/dashboard/wallet-history",
    label: {
      ar: "سجل المحفظة",
      en: "Wallet History",
      fr: "Historique du portefeuille",
    },
    authorizedRoles: ["student", "teacher"],
  },
  {
    imgURL: "/assets/icons/teacher.svg",
    route: "/dashboard/teachers",

    label: {
      ar: "المعلمين",
      en: "Teachers",
      fr: "Enseignants",
    },
    authorizedRoles: ["coordinator", "admin"],
  },
  {
    imgURL: "/assets/icons/student.svg",
    route: "/dashboard/students",
    label: {
      ar: "الطلاب",
      en: "Students",
      fr: "Étudiants",
    },

    authorizedRoles: ["coordinator", "admin"],
  },
  {
    imgURL: "/assets/icons/student.svg",
    route: "/dashboard/mystudents",
    label: {
      ar: "طلابي",
      en: "My Students",
      fr: "Mes Étudiants",
    },

    authorizedRoles: ["coordinator"],
  },
  {
    imgURL: "/assets/icons/parent.svg", // Placeholder icon, consider a more specific one if available
    route: "/dashboard/parents",
    label: {
      ar: "أولياء الأمور",
      en: "Parents",
      fr: "Parents",
    },
    authorizedRoles: ["admin", "coordinator"],
  },
  // {
  //   imgURL: "/assets/icons/teacher.svg",
  //   route: "/dashboard/myteachers",
  //   label: {
  //     ar: "معلميني",
  //     en: "My Teachers",
  //     fr: "Mes Enseignants",
  //   },

  //   authorizedRoles: ["coordinator"],
  // },

  {
    imgURL: "/assets/icons/coordinators.svg",
    route: "/dashboard/coordinators",
    label: {
      ar: "المنسقين",
      en: "Coordinators",
      fr: "cordinateurs",
    },

    authorizedRoles: ["admin"],
  },
  {
    imgURL: "/assets/icons/plan.svg",
    route: "/dashboard/plan",
    label: {
      ar: "الخطط",
      en: "Plans",
      fr: "Plans",
    },

    authorizedRoles: ["admin", "coordinator"],
  },
  {
    imgURL: "/assets/icons/potential_client.svg", // Using a more distinct icon if available, otherwise a generic one
    route: "/dashboard/potential-clients",
    label: {
      ar: "العملاء المحتملين",
      en: "Potential Clients",
      fr: "Clients Potentiels",
    },
    authorizedRoles: ["admin", "coordinator"],
  },
  {
    imgURL: "/assets/icons/coin.svg", // Using a more distinct icon if available, otherwise a generic one
    route: "/dashboard/payment-proof",
    label: {
      ar: "اثبات الدفع",
      en: "Payment Proof",
      fr: "Pruves de paiement",
    },
    authorizedRoles: ["admin", "coordinator"],
  },
  {
    imgURL: "/assets/icons/comments.svg", // Placeholder icon, update if a better one exists
    route: "/dashboard/comments",
    label: {
      ar: "التعليقات", // Arabic for "Comments"
      en: "Comments",
      fr: "Commentaires", // French for "Comments"
    },
    authorizedRoles: ["admin", "coordinator"],
  },
  {
    imgURL: "/assets/icons/content.svg", // Placeholder icon, update if a better one exists
    route: "/dashboard/landing-content",
    label: {
      ar: "المحتوى", // Arabic for "Content"
      en: "Content",
      fr: "Contenu", // French for "Content"
    },
    authorizedRoles: ["admin"],
  },
  {
    imgURL: "/assets/icons/comments.svg", // Placeholder: consider messages.svg or inbox.svg
    route: "/dashboard/messages",
    label: {
      ar: "رسائل الاتصال",
      en: "Contact Messages",
      fr: "Messages de Contact",
    },
    authorizedRoles: ["admin", "coordinator"],
  },
];

export const avatarImages = [
  "/assets/images/avatar-1.jpeg",
  "/assets/images/avatar-2.jpeg",
  "/assets/images/avatar-3.png",
  "/assets/images/avatar-4.png",
  "/assets/images/avatar-5.png",
];
