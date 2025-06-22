import mongoose from "mongoose";

const localizedStringSchema = {
  en: { type: String, trim: true },
  fr: { type: String, trim: true },
  ar: { type: String, trim: true },
};

const landingContentSchema = new mongoose.Schema(
  {
    // Hero Section
    hero_title: localizedStringSchema,
    hero_subtitle: localizedStringSchema,
    hero_cta_button: localizedStringSchema,
    hero_image_url: { type: String, trim: true, default: "https://images.unsplash.com/photo-1557734864-c78b6dfef1b1?q=80&w=1934&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }, // Default image

    // Navbar
    navbar_logo_text: localizedStringSchema, // Renamed from navbar_logo to be specific
    navbar_logo_image_url: { type: String, trim: true, default: "" },
    navbar_logo_image_alt: localizedStringSchema,
    nav_features: localizedStringSchema,
    nav_pricing: localizedStringSchema,
    nav_about: localizedStringSchema,
    nav_teachers: localizedStringSchema,
    nav_contact: localizedStringSchema,
    navbar_signin: localizedStringSchema,
    navbar_signup: localizedStringSchema,
    language_english: localizedStringSchema,
    language_french: localizedStringSchema,
    language_arabic: localizedStringSchema,

    // Features Section
    features_title: localizedStringSchema,
    feature1_title: localizedStringSchema,
    feature1_desc: localizedStringSchema,
    feature1_icon_url: { type: String, trim: true, default: "/assets/icons/interactive.gif" },
    feature2_title: localizedStringSchema,
    feature2_desc: localizedStringSchema,
    feature2_icon_url: { type: String, trim: true, default: "/assets/icons/experience.gif" },
    feature3_title: localizedStringSchema,
    feature3_desc: localizedStringSchema,
    feature3_icon_url: { type: String, trim: true, default: "/assets/icons/support.gif" },

    // About Us Section
    about_us_title: localizedStringSchema,
    about_us_description1: localizedStringSchema,
    about_us_description2: localizedStringSchema,
    about_us_description3: localizedStringSchema,
    about_us_image_url: { type: String, trim: true, default: "https://images.unsplash.com/photo-1581929430054-760e30fe5c3b?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    about_us_image_alt: localizedStringSchema,

    // Nos Objectifs Section
    objectives_title: localizedStringSchema,
    objective1_text: localizedStringSchema,
    objective2_text: localizedStringSchema,
    objective3_text: localizedStringSchema,
    objective4_text: localizedStringSchema,
    objective5_text: localizedStringSchema,

    // Teachers Section
    teachers_title: localizedStringSchema,
    teachers_section_description: localizedStringSchema,
    teacher1_avatar_url: { type: String, trim: true, default: "https://images.unsplash.com/photo-1700156246325-65bbb9e1dc0d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    teacher1_avatar_alt: localizedStringSchema,
    teacher1_name: localizedStringSchema,
    teacher1_title: localizedStringSchema,
    teacher1_bio: localizedStringSchema,
    // Add fields for teacher2, teacher3, teacher4 similarly if they are dynamic
    // For now, assuming one example teacher, can be expanded.
    // To keep it manageable, I'll include structure for one teacher. The admin UI would allow adding more.
    // However, the request was to make the *landing page content* dynamic, not necessarily the number of teachers.
    // So, I will define fields for the existing 4 teachers from Landing.jsx
    teacher2_avatar_url: { type: String, trim: true, default: "https://images.unsplash.com/flagged/photo-1559475555-b26777ed3ab4?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    teacher2_avatar_alt: localizedStringSchema,
    teacher2_name: localizedStringSchema,
    teacher2_title: localizedStringSchema,
    teacher2_bio: localizedStringSchema,

    teacher3_avatar_url: { type: String, trim: true, default: "https://images.unsplash.com/photo-1664382953518-4a664ab8a8c9?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    teacher3_avatar_alt: localizedStringSchema,
    teacher3_name: localizedStringSchema,
    teacher3_title: localizedStringSchema,
    teacher3_bio: localizedStringSchema,

    teacher4_avatar_url: { type: String, trim: true, default: "https://images.unsplash.com/flagged/photo-1574110906643-8311b0ce29d3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    teacher4_avatar_alt: localizedStringSchema,
    teacher4_name: localizedStringSchema,
    teacher4_title: localizedStringSchema,
    teacher4_bio: localizedStringSchema,


    // Testimonials Section
    testimonials_title: localizedStringSchema,
    // For testimonials, the original code has an array and cycles through them.
    // We'll store content for 3 testimonials as per the original hardcoded data.
    testimonial1_quote: localizedStringSchema,
    testimonial1_avatar_url: { type: String, trim: true, default: "https://images.unsplash.com/photo-1552873816-636e43209957?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    testimonial1_avatar_alt: localizedStringSchema,
    testimonial1_name: localizedStringSchema,
    testimonial1_role: localizedStringSchema,

    testimonial2_quote: localizedStringSchema,
    testimonial2_avatar_url: { type: String, trim: true, default: "https://images.unsplash.com/photo-1514355315815-2b64b0216b14?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    testimonial2_avatar_alt: localizedStringSchema,
    testimonial2_name: localizedStringSchema,
    testimonial2_role: localizedStringSchema,

    testimonial3_quote: localizedStringSchema,
    testimonial3_avatar_url: { type: String, trim: true, default: "https://images.unsplash.com/photo-1526662092594-e98c1e356d6a?q=80&w=2071&auto=format&fit=crop&ixlib-rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    testimonial3_avatar_alt: localizedStringSchema,
    testimonial3_name: localizedStringSchema,
    testimonial3_role: localizedStringSchema,

    prev_testimonial_aria: localizedStringSchema,
    next_testimonial_aria: localizedStringSchema,


    // Contact Section
    contact_title: localizedStringSchema,
    form_field_name: localizedStringSchema,
    form_field_name_placeholder: localizedStringSchema,
    form_field_email: localizedStringSchema,
    form_field_email_placeholder: localizedStringSchema,
    form_field_message: localizedStringSchema,
    form_field_message_placeholder: localizedStringSchema,
    form_submit_button: localizedStringSchema,

    // Footer
    footer_social_twitter_aria: localizedStringSchema,
    footer_social_facebook_aria: localizedStringSchema,
    footer_social_linkedin_aria: localizedStringSchema,
    footer_social_github_aria: localizedStringSchema, // Assuming this was meant to be YouTube or a generic social link
    footer_copyright: localizedStringSchema,
    back_to_top_aria: localizedStringSchema,

    // A field to ensure there's only one document.
    // Can be used to query for the single landing page content document.
    singleton: {
      type: Boolean,
      default: true,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure there's only one document in the collection
landingContentSchema.pre('save', async function (next) {
  const count = await mongoose.model('LandingContent', landingContentSchema).countDocuments({});
  if (this.isNew && count > 0) {
    return next(new Error('Only one LandingContent document is allowed.'));
  }
  next();
});


export default mongoose.model("LandingContent", landingContentSchema);
