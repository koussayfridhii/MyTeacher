import LandingContent from "../models/LandingContent.js";
import mongoose from "mongoose";

// Helper function to extract localized fields
const getLocalizedData = (doc, lang, defaultLang = "en") => {
  const localized = {};
  const rawDoc = doc.toObject ? doc.toObject() : doc; // Ensure it's a plain object

  for (const key in rawDoc) {
    if (rawDoc[key] && typeof rawDoc[key] === "object" && rawDoc[key].hasOwnProperty(lang)) {
      localized[key.replace(/_en$|_fr$|_ar$/, "")] = rawDoc[key][lang] || rawDoc[key][defaultLang] || "";
    } else if (rawDoc[key] && typeof rawDoc[key] === "object" && rawDoc[key].hasOwnProperty("en")) {
      // Fallback for top-level localizedStringSchema objects if lang specific is not present
      localized[key] = rawDoc[key][lang] || rawDoc[key][defaultLang] || "";
    } else if (key.endsWith(`_${lang}`)) {
      localized[key.replace(`_${lang}`, "")] = rawDoc[key] || (rawDoc[`${key.replace(`_${lang}`, `_${defaultLang}`)}`]) || "";
    } else if (!key.match(/_(en|fr|ar)$/) && typeof rawDoc[key] !== "object") {
      // Include non-localized fields directly (like image URLs, singleton, _id, etc.)
      localized[key] = rawDoc[key];
    }
  }
  return localized;
};

// Helper function to transform flat request body to structured schema
const structureData = (flatData) => {
    const structured = {};
    for (const key in flatData) {
        const parts = key.split('_');
        const lang = parts.pop(); // get 'en', 'fr', or 'ar'
        const fieldName = parts.join('_');

        if (['en', 'fr', 'ar'].includes(lang) && fieldName) {
            if (!structured[fieldName]) {
                structured[fieldName] = {};
            }
            structured[fieldName][lang] = flatData[key];
        } else {
            // For non-localized fields like image URLs
            structured[key] = flatData[key];
        }
    }
    return structured;
};


export const getLandingContent = async (req, res) => {
  try {
    let content = await LandingContent.findOne({ singleton: true });

    if (!content) {
      // Create a default content document if it doesn't exist
      const defaultLocalizedText = { en: '', fr: '', ar: '' };
      const initialContentData = {
        singleton: true,
        hero_title: { en: "Welcome to Our Platform!", fr: "Bienvenue sur Notre Plateforme!", ar: "!مرحبا بكم في منصتنا" },
        hero_subtitle: { en: "Discover amazing features.", fr: "Découvrez des fonctionnalités étonnantes.", ar: ".اكتشف ميزات مذهلة" },
        hero_cta_button: { en: "Get Started", fr: "Commencer", ar: "ابدأ" },
        navbar_logo_text: { en: "Be First Learning", fr: "Be First Learning", ar: "Be First Learning" },
        navbar_logo_image_alt: { ...defaultLocalizedText },
        nav_features: { en: "Features", fr: "Fonctionnalités", ar: "الميزات" },
        nav_pricing: { en: "Pricing", fr: "Tarifs", ar: "الأسعار" },
        nav_about: { en: "About Us", fr: "À Propos", ar: "من نحن" },
        nav_teachers: { en: "Teachers", fr: "Enseignants", ar: "المدرسون" },
        nav_contact: { en: "Contact", fr: "Contact", ar: "اتصل بنا" },
        navbar_signin: { en: "Sign In", fr: "Se Connecter", ar: "تسجيل الدخول" },
        navbar_signup: { en: "Sign Up", fr: "S'inscrire", ar: "إنشاء حساب" },
        language_english: { en: "English", fr: "Anglais", ar: "الإنجليزية" },
        language_french: { en: "French", fr: "Français", ar: "الفرنسية" },
        language_arabic: { en: "Arabic", fr: "Arabe", ar: "العربية" },
        features_title: { ...defaultLocalizedText, en: "Our Features" },
        // Initialize other localized fields to ensure structure
      };

      // Auto-initialize all other localizedStringSchema fields if not explicitly set above
      const schema = LandingContent.schema;
      for (const path in schema.paths) {
        if (schema.paths[path].schema && schema.paths[path].schema.paths && schema.paths[path].schema.paths.en) { // Check for localizedStringSchema structure
          if (!initialContentData[path]) { // If not already set by specific defaults
            initialContentData[path] = { en: '', fr: '', ar: '' };
          }
        }
      }
      content = new LandingContent(initialContentData);
      await content.save();
    }

    const contentObj = content.toObject();

    if (req.query.lang) { // Public page request: process for a specific language
      const lang = req.query.lang;
      const localizedResponse = {};
      for (const key in contentObj) {
        if (key === "singleton" || key === "_id" || key === "createdAt" || key === "updatedAt" || key === "__v") {
          localizedResponse[key] = contentObj[key];
          continue;
        }
        // Check if the field is a localized object (has en, fr, ar properties)
        if (contentObj[key] && typeof contentObj[key] === 'object' &&
            (contentObj[key].hasOwnProperty('en') || contentObj[key].hasOwnProperty('fr') || contentObj[key].hasOwnProperty('ar'))) {
          localizedResponse[key] = contentObj[key][lang] || contentObj[key]['en'] || ""; // Fallback to 'en'
        } else {
          // Non-localized field (e.g., image URL, social media URL)
          localizedResponse[key] = contentObj[key];
        }
      }
      return res.status(200).json(localizedResponse);
    } else { // Admin panel request: return the full raw object for editing
      return res.status(200).json(contentObj);
    }

  } catch (error) {
    console.error("Error fetching landing content:", error);
    res.status(500).json({ message: "Error fetching landing content", error: error.message });
  }
};

export const updateLandingContent = async (req, res) => {
  try {
    const updates = req.body; // Expects structured data now

    // Data from client might be flat like: { hero_title_en: "Hello", hero_title_fr: "Bonjour", hero_image_url: "..." }
    // We need to restructure it for the schema: { hero_title: { en: "Hello", fr: "Bonjour" }, hero_image_url: "..." }
    const structuredUpdates = {};
    for (const key in updates) {
        if (key.includes('_en') || key.includes('_fr') || key.includes('_ar')) {
            const baseKey = key.substring(0, key.lastIndexOf('_'));
            const lang = key.substring(key.lastIndexOf('_') + 1);

            // More robust check: ensure baseKey is an object before assigning lang property
            if (typeof structuredUpdates[baseKey] !== 'object' || structuredUpdates[baseKey] === null) {
                structuredUpdates[baseKey] = {};
            }
            structuredUpdates[baseKey][lang] = updates[key];
        } else {
            // For non-localized fields (e.g., image URLs, singleton flag)
            structuredUpdates[key] = updates[key];
        }
    }

    const content = await LandingContent.findOneAndUpdate(
      { singleton: true },
      { $set: structuredUpdates },
      { new: true, upsert: true, runValidators: true } // upsert: true will create if not found
    );

    // If upserted, ensure singleton is set (though default should handle it)
    if (!content.singleton) {
        content.singleton = true;
        await content.save();
    }

    res.status(200).json({ message: "Landing content updated successfully", data: content });
  } catch (error)
  {
    console.error("Error updating landing content:", error);
    if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).json({ message: "Validation Error", errors: error.errors });
    }
    if (error.message.includes("Only one LandingContent document is allowed")) {
        return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Error updating landing content", error: error.message });
  }
};
