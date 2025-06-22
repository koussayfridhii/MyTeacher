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
    const lang = req.query.lang || "en"; // Default to English
    let content = await LandingContent.findOne({ singleton: true });

    if (!content) {
      // Create a default content document if it doesn't exist
      content = new LandingContent({
        // Initialize with some default english values or leave empty
        // This ensures the admin panel has something to edit from the start
        singleton: true,
        hero_title: { en: "Welcome to Our Platform!" },
        hero_subtitle: { en: "Discover amazing features." },
        // ... other fields can be initialized here
      });
      await content.save();
    }

    const localizedContent = {};
    const contentObj = content.toObject();

    for (const key in contentObj) {
        if (key === "singleton" || key === "_id" || key === "createdAt" || key === "updatedAt" || key === "__v") {
            localizedContent[key] = contentObj[key];
            continue;
        }

        if (typeof contentObj[key] === 'object' && contentObj[key] !== null && (contentObj[key].hasOwnProperty('en') || contentObj[key].hasOwnProperty('fr') || contentObj[key].hasOwnProperty('ar'))) {
            localizedContent[key.replace(/_(en|fr|ar)$/, '')] = contentObj[key][lang] || contentObj[key]['en'] || "";
        } else {
            // Direct assignment for non-localized fields (like image URLs)
            localizedContent[key] = contentObj[key];
        }
    }

    res.status(200).json(localizedContent);
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
            if (!structuredUpdates[baseKey]) {
                structuredUpdates[baseKey] = {};
            }
            structuredUpdates[baseKey][lang] = updates[key];
        } else {
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
