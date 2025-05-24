const translations = {
  en: {
    parents: "Parents",
    parentsList: "Parents List", // From Parents.jsx (Heading)
    parentsTitle: "Manage Parents",
    createParent: "Create Parent", // From Parents.jsx (Button) & CreateParentModal.jsx (Title)
    edit: "Edit", // From Parents.jsx (Button)
    delete: "Delete", // From Parents.jsx (Button) & Delete Dialog
    searchByName: "Search by name...", // From Parents.jsx (Input Placeholder)
    fullName: "Full Name", // From Parents.jsx (Table Header) & Modals (Label)
    email: "Email", // From Parents.jsx (Table Header) & Modals (Label)
    mobileNumber: "Mobile Number", // From Parents.jsx (Table Header) & Modals (Label)
    numberOfStudents: "No. of Students", // From Parents.jsx (Table Header)
    coordinator: "Coordinator", // From Parents.jsx (Table Header) & Modals (Label)
    actions: "Actions", // From Parents.jsx (Table Header)
    page: "Page", // From Parents.jsx (Pagination)
    of: "of", // From Parents.jsx (Pagination)
    previous: "Previous", // From Parents.jsx (Pagination Button)
    next: "Next", // From Parents.jsx (Pagination Button)
    perPage: "per page", // From Parents.jsx (Pagination Select)
    deleteParentTitle: "Delete Parent", // From Parents.jsx (AlertDialog Header)
    deleteParentConfirmation: "Are you sure you want to delete", // From Parents.jsx (AlertDialog Body)
    cancel: "Cancel", // From Parents.jsx (AlertDialog Button)
    parentDeletedSuccessTitle: "Parent Deleted", // From Parents.jsx (Toast)
    parentDeletedSuccessDesc: "Parent has been successfully deleted.",
    errorDeletingParentTitle: "Error Deleting Parent", // From Parents.jsx (Toast)
    errorDeletingParentDesc: "An error occurred while deleting the parent.",
    errorFetchingParents: "Error fetching parents data.", // From Parents.jsx (Error Text)
    noParentsFoundSearch: "No parents found matching your search.", // From Parents.jsx
    noParentsAvailable: "No parents available to display.", // From Parents.jsx
    notAssigned: "N/A", // For coordinator if not assigned

    // CreateParentModal & EditParentModal
    editParent: "Edit Parent", // From EditParentModal.jsx (Title)
    update: "Update", // From EditParentModal.jsx (Button)
    fullNameRequired: "Full name is required.",
    emailRequired: "Email is required.",
    invalidEmailFormat: "Invalid email format.",
    mobileNumberRequired: "Mobile number is required.",
    coordinatorRequiredForAdmin: "Coordinator selection is required for Admin.",
    validationErrorTitle: "Validation Error",
    fillRequiredFields: "Please fill in all required fields correctly.",
    addStudent: "Add Student",
    selectStudents: "Select Students",
    selectStudentPlaceholder: "Select a student...",
    selectCoordinator: "Select Coordinator",
    selectCoordinatorPlaceholder: "Select a coordinator...",
    parentCreatedSuccessTitle: "Parent Created",
    errorCreatingParentTitle: "Error Creating Parent",
    errorCreatingParentDesc: "An error occurred while creating the parent.",
    parentUpdatedSuccessTitle: "Parent Updated",
    errorUpdatingParentTitle: "Error Updating Parent",
    errorUpdatingParentDesc: "An error occurred while updating the parent.",
    loadingStudents: "Loading students...",
    loadingCoordinators: "Loading coordinators...",
    noOptions: "No options",
    loading: "Loading...",
    // Keys from the initial request that might have been missed above or are general
    submitBtn: "Submit",
    closeBtn: "Close",
    isAssigned: "Assigned",
  },
  fr: {
    parents: "Parents",
    parentsList: "Liste des Parents",
    parentsTitle: "Gérer les Parents",
    createParent: "Créer un Parent",
    edit: "Modifier",
    delete: "Supprimer",
    searchByName: "Rechercher par nom...",
    fullName: "Nom Complet",
    email: "Email",
    mobileNumber: "Numéro de Mobile",
    numberOfStudents: "Nb. d'Étudiants",
    coordinator: "Coordinateur",
    actions: "Actions",
    page: "Page",
    of: "de",
    previous: "Précédent",
    next: "Suivant",
    perPage: "par page",
    deleteParentTitle: "Supprimer le Parent",
    deleteParentConfirmation: "Êtes-vous sûr de vouloir supprimer",
    cancel: "Annuler",
    parentDeletedSuccessTitle: "Parent Supprimé",
    parentDeletedSuccessDesc: "Le parent a été supprimé avec succès.",
    errorDeletingParentTitle: "Erreur de Suppression du Parent",
    errorDeletingParentDesc:
      "Une erreur s'est produite lors de la suppression du parent.",
    errorFetchingParents:
      "Erreur lors de la récupération des données des parents.",
    noParentsFoundSearch:
      "Aucun parent trouvé correspondant à votre recherche.",
    noParentsAvailable: "Aucun parent disponible à afficher.",
    notAssigned: "N/A",
    isAssigned: "Assigned",
    editParent: "Modifier le Parent",
    update: "Mettre à jour",
    fullNameRequired: "Le nom complet est requis.",
    emailRequired: "L'email est requis.",
    invalidEmailFormat: "Format d'email invalide.",
    mobileNumberRequired: "Le numéro de mobile est requis.",
    coordinatorRequiredForAdmin:
      "La sélection du coordinateur est requise pour l'administrateur.",
    validationErrorTitle: "Erreur de Validation",
    fillRequiredFields:
      "Veuillez remplir correctement tous les champs obligatoires.",
    addStudent: "Ajouter Étudiant",
    selectStudents: "Sélectionner Étudiants",
    selectStudentPlaceholder: "Sélectionnez un étudiant...",
    selectCoordinator: "Sélectionner Coordinateur",
    selectCoordinatorPlaceholder: "Sélectionnez un coordinateur...",
    parentCreatedSuccessTitle: "Parent Créé",
    errorCreatingParentTitle: "Erreur de Création du Parent",
    errorCreatingParentDesc:
      "Une erreur s'est produite lors de la création du parent.",
    parentUpdatedSuccessTitle: "Parent Mis à Jour",
    errorUpdatingParentTitle: "Erreur de Mise à Jour du Parent",
    errorUpdatingParentDesc:
      "Une erreur s'est produite lors de la mise à jour du parent.",
    loadingStudents: "Chargement des étudiants...",
    loadingCoordinators: "Chargement des coordinateurs...",
    noOptions: "Aucune option",
    loading: "Chargement...",
    submitBtn: "Soumettre",
    closeBtn: "Fermer",
  },
  ar: {
    parents: "أولياء الأمور",
    isAssigned: "Assigned",
    parentsList: "قائمة أولياء الأمور",
    parentsTitle: "إدارة أولياء الأمور",
    createParent: "إنشاء ولي أمر",
    edit: "تعديل",
    delete: "حذف",
    searchByName: "البحث بالاسم...",
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    mobileNumber: "رقم الجوال",
    numberOfStudents: "عدد الطلاب",
    coordinator: "المنسق",
    actions: "الإجراءات",
    page: "صفحة",
    of: "من",
    previous: "السابق",
    next: "التالي",
    perPage: "لكل صفحة",
    deleteParentTitle: "حذف ولي الأمر",
    deleteParentConfirmation: "هل أنت متأكد أنك تريد حذف",
    cancel: "إلغاء",
    parentDeletedSuccessTitle: "تم حذف ولي الأمر",
    parentDeletedSuccessDesc: "تم حذف ولي الأمر بنجاح.",
    errorDeletingParentTitle: "خطأ في حذف ولي الأمر",
    errorDeletingParentDesc: "حدث خطأ أثناء حذف ولي الأمر.",
    errorFetchingParents: "خطأ في جلب بيانات أولياء الأمور.",
    noParentsFoundSearch: "لم يتم العثور على أولياء أمور مطابقين لبحثك.",
    noParentsAvailable: "لا يوجد أولياء أمور لعرضهم.",
    notAssigned: "غير محدد",

    editParent: "تعديل ولي الأمر",
    update: "تحديث",
    fullNameRequired: "الاسم الكامل مطلوب.",
    emailRequired: "البريد الإلكتروني مطلوب.",
    invalidEmailFormat: "صيغة بريد إلكتروني غير صالحة.",
    mobileNumberRequired: "رقم الجوال مطلوب.",
    coordinatorRequiredForAdmin: "اختيار المنسق مطلوب للمسؤول.",
    validationErrorTitle: "خطأ في التحقق",
    fillRequiredFields: "يرجى ملء جميع الحقول المطلوبة بشكل صحيح.",
    addStudent: "إضافة طالب",
    selectStudents: "اختر الطلاب",
    selectStudentPlaceholder: "اختر طالبًا...",
    selectCoordinator: "اختر المنسق",
    selectCoordinatorPlaceholder: "اختر منسقًا...",
    parentCreatedSuccessTitle: "تم إنشاء ولي الأمر",
    errorCreatingParentTitle: "خطأ في إنشاء ولي الأمر",
    errorCreatingParentDesc: "حدث خطأ أثناء إنشاء ولي الأمر.",
    parentUpdatedSuccessTitle: "تم تحديث ولي الأمر",
    errorUpdatingParentTitle: "خطأ في تحديث ولي الأمر",
    errorUpdatingParentDesc: "حدث خطأ أثناء تحديث ولي الأمر.",
    loadingStudents: "جار تحميل الطلاب...",
    loadingCoordinators: "جار تحميل المنسقين...",
    noOptions: "لا توجد خيارات",
    loading: "جار التحميل...",
    submitBtn: "إرسال",
    closeBtn: "إغلاق",
  },
};

const t = (key, language, fallbackLanguage = "en") => {
  if (translations[language] && translations[language][key] !== undefined) {
    return translations[language][key];
  }
  if (
    translations[fallbackLanguage] &&
    translations[fallbackLanguage][key] !== undefined
  ) {
    return translations[fallbackLanguage][key];
  }
  return key; // Return the key itself as a last resort
};

export { t, translations }; // Exporting translations object as well for potential direct use or extension
