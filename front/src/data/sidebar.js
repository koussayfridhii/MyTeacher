export const sidebarLinks = [
  {
    imgURL: "/assets/icons/Home.svg",
    route: "/",
    label: {
      ar: "الصفحة الرئيسية",
      en: "Home",
      fr: "Accueil",
    },
    authorizedRoles: ["admin", "coordinator", "teacher", "student"],
  },
  {
    imgURL: "/assets/icons/student.svg",
    route: "/calendar",
    label: {
      ar: "اليومية",
      en: "Calendar",
      fr: "Calendrier",
    },

    authorizedRoles: ["coordinator", "admin", "teacher", "student"],
  },
  {
    imgURL: "/assets/icons/upcoming.svg",
    route: "/meeting/upcoming",
    label: {
      ar: "القادمة",
      en: "Upcoming",
      fr: "À venir",
    },
    authorizedRoles: ["admin", "coordinator", "teacher", "student"],
  },
  {
    imgURL: "/assets/icons/previous.svg",
    route: "/meeting/previous",
    label: {
      ar: "السابقة",
      en: "Previous",
      fr: "Précédent",
    },
    authorizedRoles: ["admin", "coordinator", "teacher", "student"],
  },
  {
    imgURL: "/assets/icons/Video.svg",
    route: "/meeting/recordings",
    label: {
      ar: "التسجيلات",
      en: "Recordings",
      fr: "Enregistrements",
    },
    authorizedRoles: ["admin", "coordinator"],
  },
  {
    imgURL: "/assets/icons/topup.svg",
    route: "/topup",
    label: {
      ar: " شحن",
      en: "Top Up",
      fr: "Recharger",
    },

    authorizedRoles: ["admin", "coordinator "],
  },
  {
    imgURL: "/assets/icons/teacher.svg",
    route: "/teachers",

    label: {
      ar: "المعلمين",
      en: "Teachers",
      fr: "Enseignants",
    },
    authorizedRoles: ["coordinator", "admin"],
  },
  {
    imgURL: "/assets/icons/student.svg",
    route: "/students",
    label: {
      ar: "الطلاب",
      en: "Students",
      fr: "Étudiants",
    },

    authorizedRoles: ["coordinator", "admin"],
  },

  // {
  //   imgURL: "/assets/icons/teacher.svg",
  //   route: "/myteachers",
  //   label: {
  //     ar: "معلميني",
  //     en: "My Teachers",
  //     fr: "Mes Enseignants",
  //   },

  //   authorizedRoles: ["coordinator"],
  // },
  {
    imgURL: "/assets/icons/student.svg",
    route: "/mystudents",
    label: {
      ar: "طلابي",
      en: "My Students",
      fr: "Mes Étudiants",
    },

    authorizedRoles: ["coordinator"],
  },
];

export const avatarImages = [
  "/assets/images/avatar-1.jpeg",
  "/assets/images/avatar-2.jpeg",
  "/assets/images/avatar-3.png",
  "/assets/images/avatar-4.png",
  "/assets/images/avatar-5.png",
];
