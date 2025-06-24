export const grammarGameData = {
  categories: [
    {
      id: 'punctuation',
      title: {
        en: 'Punctuation',
        fr: 'Ponctuation',
        ar: 'علامات الترقيم',
      },
      stories: [
        {
          id: 'story1_punctuation',
          content: {
            en: [
              { text: 'Hello ' },
              { text: 'mr', isError: true, errorId: 'err1_punc_s1' },
              { text: ' Watson' },
              { text: ' how are you today', isError: true, errorId: 'err2_punc_s1' },
              { text: '?' }
            ],
            fr: [
              { text: 'Bonjour ' },
              { text: 'mr', isError: true, errorId: 'err1_punc_s1_fr' },
              { text: ' Watson' },
              { text: ' comment allez-vous aujourdhui', isError: true, errorId: 'err2_punc_s1_fr' },
              { text: ' ?' }
            ],
            ar: [
              { text: 'مرحباً ' },
              { text: 'سيد', isError: true, errorId: 'err1_punc_s1_ar' },
              { text: ' واتسون' },
              { text: ' كيف حالك اليوم', isError: true, errorId: 'err2_punc_s1_ar' },
              { text: '؟' }
            ],
          },
          errors: [
            {
              id: 'err1_punc_s1',
              incorrectPhrase: { en: 'mr' },
              correctPhrase: { en: 'Mr.' },
              explanation: { en: '"Mr." is an abbreviation and requires a period.' },
            },
            {
              id: 'err2_punc_s1',
              incorrectPhrase: { en: 'how are you today' },
              correctPhrase: { en: 'How are you today' },
              explanation: { en: 'Sentences should begin with a capital letter.' },
            },
            {
              id: 'err1_punc_s1_fr',
              incorrectPhrase: { fr: 'mr' },
              correctPhrase: { fr: 'M.' },
              explanation: { fr: '"M." est une abréviation et nécessite un point.' },
            },
            {
              id: 'err2_punc_s1_fr',
              incorrectPhrase: { fr: 'comment allez-vous aujourdhui' },
              correctPhrase: { fr: 'Comment allez-vous aujourd\'hui' },
              explanation: { fr: 'Les phrases doivent commencer par une majuscule et "aujourd\'hui" nécessite une apostrophe.' },
            },
            {
              id: 'err1_punc_s1_ar',
              incorrectPhrase: { ar: 'سيد' },
              correctPhrase: { ar: 'السيد' },
              explanation: { ar: 'كلمة "سيد" كلقب تحتاج إلى تعريف أو معاملة خاصة في بداية الجملة.' },
            },
            {
              id: 'err2_punc_s1_ar',
              incorrectPhrase: { ar: 'كيف حالك اليوم' }, // In Arabic, capitalization isn't the primary issue here.
              correctPhrase: { ar: 'كيف حالك اليوم؟' }, // The error could be the missing question mark if implied by context, or sentence structure.
              explanation: { ar: 'الجمل الاستفهامية يجب أن تنتهي بعلامة استفهام. بداية الجملة بحرف كبير ليست قاعدة في العربية بنفس طريقة الإنجليزية.' },
            },
          ],
        },
        {
          id: 'story2_punctuation',
          content: {
            en: [
              { text: 'this is a sentence' },
              { text: ' it needs a capital letter and a period', isError: true, errorId: 'err1_punc_s2' }
            ],
            fr: [
              { text: 'ceci est une phrase' },
              { text: ' elle nécessite une majuscule et un point', isError: true, errorId: 'err1_punc_s2_fr' }
            ],
            ar: [
              { text: 'هذه جملة' },
              { text: ' إنها تحتاج إلى حرف كبير ونقطة', isError: true, errorId: 'err1_punc_s2_ar' }
            ],
          },
          errors: [
            {
              id: 'err1_punc_s2',
              incorrectPhrase: { en: 'it needs a capital letter and a period' },
              correctPhrase: { en: 'It needs a capital letter and a period.' },
              explanation: { en: 'Sentences start with a capital and end with a period.' },
            },
            {
              id: 'err1_punc_s2_fr',
              incorrectPhrase: { fr: 'elle nécessite une majuscule et un point' },
              correctPhrase: { fr: 'Elle nécessite une majuscule et un point.' },
              explanation: { fr: 'Les phrases commencent par une majuscule et se terminent par un point.' },
            },
            {
              id: 'err1_punc_s2_ar',
              incorrectPhrase: { ar: 'إنها تحتاج إلى حرف كبير ونقطة' },
              correctPhrase: { ar: 'إنها تحتاج إلى حرف كبير ونقطة.' }, // Arabic capitalization rules differ, focus on period.
              explanation: { ar: 'الجمل يجب أن تنتهي بعلامة ترقيم مناسبة مثل النقطة.' },
            },
          ],
        }
      ],
    },
    {
      id: 'verbTenses',
      title: {
        en: 'Verb Tenses',
        fr: 'Temps des Verbes',
        ar: 'أزمنة الفعل',
      },
      stories: [
        {
          id: 'story1_verb',
          content: {
            en: [
              { text: 'Yesterday, I ' },
              { text: 'go', isError: true, errorId: 'err1_verb_s1' },
              { text: ' to the park.' }
            ],
            fr: [
              { text: 'Hier, je ' },
              { text: 'vais', isError: true, errorId: 'err1_verb_s1_fr' },
              { text: ' au parc.' }
            ],
            ar: [
              { text: 'بالأمس، أنا ' },
              { text: 'أذهب', isError: true, errorId: 'err1_verb_s1_ar' },
              { text: ' إلى الحديقة.' }
            ],
          },
          errors: [
            {
              id: 'err1_verb_s1',
              incorrectPhrase: { en: 'go' },
              correctPhrase: { en: 'went' },
              explanation: { en: '"Yesterday" indicates past tense, so "went" should be used.' },
            },
            {
              id: 'err1_verb_s1_fr',
              incorrectPhrase: { fr: 'vais' },
              correctPhrase: { fr: 'suis allé' },
              explanation: { fr: '"Hier" indique le passé composé, donc "suis allé" doit être utilisé.' },
            },
            {
              id: 'err1_verb_s1_ar',
              incorrectPhrase: { ar: 'أذهب' },
              correctPhrase: { ar: 'ذهبت' },
              explanation: { ar: 'كلمة "بالأمس" تدل على الزمن الماضي، لذا يجب استخدام "ذهبت".' },
            },
          ]
        },
        {
          id: 'story2_verb',
          content: {
            en: [
              { text: 'Tomorrow, she ' },
              { text: 'visited', isError: true, errorId: 'err1_verb_s2' },
              { text: ' her grandparents.' }
            ],
            fr: [
              { text: 'Demain, elle ' },
              { text: 'a visité', isError: true, errorId: 'err1_verb_s2_fr' },
              { text: ' ses grands-parents.' }
            ],
            ar: [
              { text: 'غداً، هي ' },
              { text: 'زارت', isError: true, errorId: 'err1_verb_s2_ar' },
              { text: ' أجدادها.' }
            ],
          },
          errors: [
            {
              id: 'err1_verb_s2',
              incorrectPhrase: { en: 'visited' },
              correctPhrase: { en: 'will visit' },
              explanation: { en: '"Tomorrow" indicates future tense.' },
            },
            {
              id: 'err1_verb_s2_fr',
              incorrectPhrase: { fr: 'a visité' },
              correctPhrase: { fr: 'visitera' },
              explanation: { fr: '"Demain" indique le futur simple.' },
            },
            {
              id: 'err1_verb_s2_ar',
              incorrectPhrase: { ar: 'زارت' },
              correctPhrase: { ar: 'ستزور' },
              explanation: { ar: 'كلمة "غداً" تدل على الزمن المستقبل.' },
            },
          ]
        }
      ],
    },
    {
      id: 'passiveVoice',
      title: {
        en: 'Passive Voice',
        fr: 'Voix Passive',
        ar: 'المبني للمجهول',
      },
      stories: [
        // Stories for passive voice - Example (EN only for brevity)
        {
          id: 'story1_passive',
          content: {
            en: [
              { text: 'The cake ' },
              { text: 'was ate', isError: true, errorId: 'err1_pass_s1' },
              { text: ' by the boy.' }
            ],
            fr: [], // Add French content
            ar: [], // Add Arabic content
          },
          errors: [
            {
              id: 'err1_pass_s1',
              incorrectPhrase: { en: 'was ate' },
              correctPhrase: { en: 'was eaten' },
              explanation: { en: 'The past participle "eaten" should be used in passive voice constructions with "was".' },
            },
            // Add FR and AR errors
          ]
        },
        {
          id: 'story2_passive',
          content: {
            en: [
              { text: 'The window ' },
              { text: 'was break by the wind', isError: true, errorId: 'err1_pass_s2' },
              { text: '.' }
            ],
            fr: [
              { text: 'La fenêtre ' },
              { text: 'a été casse par le vent', isError: true, errorId: 'err1_pass_s2_fr' },
              { text: '.' }
            ],
            ar: [
              { text: 'النافذة ' },
              { text: 'كسرت بواسطة الرياح', isError: true, errorId: 'err1_pass_s2_ar' },
              { text: '.' }
            ],
          },
          errors: [
            {
              id: 'err1_pass_s2',
              incorrectPhrase: { en: 'was break by the wind' },
              correctPhrase: { en: 'was broken by the wind' },
              explanation: { en: 'Use the past participle "broken" in passive voice.' },
            },
            {
              id: 'err1_pass_s2_fr',
              incorrectPhrase: { fr: 'a été casse par le vent' },
              correctPhrase: { fr: 'a été cassée par le vent' },
              explanation: { fr: 'Utilisez le participe passé "cassée" (accord avec fenêtre).' },
            },
            {
              id: 'err1_pass_s2_ar',
              incorrectPhrase: { ar: 'كسرت بواسطة الرياح' }, // Assuming error is lack of passive voice marker or form
              correctPhrase: { ar: 'كُسِرَتْ بواسطة الرياح' },
              explanation: { ar: 'الفعل "كُسِرَتْ" يجب أن يكون في صيغة المبني للمجهول الصحيحة.' },
            },
          ]
        },
        {
          id: 'story2_sva',
          content: {
            en: [
              { text: 'The team ' },
              { text: 'are playing well', isError: true, errorId: 'err1_sva_s2' },
              { text: '.' }
            ],
            fr: [
              { text: "L'équipe " },
              { text: 'jouent bien', isError: true, errorId: 'err1_sva_s2_fr' },
              { text: '.' }
            ],
            ar: [
              { text: 'الفريق ' },
              { text: 'يلعبون بشكل جيد', isError: true, errorId: 'err1_sva_s2_ar' },
              { text: '.' }
            ],
          },
          errors: [
            {
              id: 'err1_sva_s2',
              incorrectPhrase: { en: 'are playing well' },
              correctPhrase: { en: 'is playing well' },
              explanation: { en: '"Team" is a singular collective noun here.' },
            },
            {
              id: 'err1_sva_s2_fr',
              incorrectPhrase: { fr: 'jouent bien' },
              correctPhrase: { fr: 'joue bien' },
              explanation: { fr: '"L\'équipe" est un nom collectif singulier.' },
            },
            {
              id: 'err1_sva_s2_ar',
              incorrectPhrase: { ar: 'يلعبون بشكل جيد' },
              correctPhrase: { ar: 'يلعب بشكل جيد' },
              explanation: { ar: 'الفعل يجب أن يتوافق مع الفاعل المفرد "الفريق".' },
            },
          ]
        },
        {
          id: 'story2_art',
          content: {
            en: [
              { text: 'He saw ' },
              { text: 'a elephant', isError: true, errorId: 'err1_art_s2' },
              { text: ' at the zoo.' }
            ],
            fr: [ // Corrected French content for a clear error
              { text: 'Elle a vu ' },
              { text: 'le grande éléphant', isError: true, errorId: 'err1_art_s2_fr' },
              { text: ' au zoo.' }
            ],
            ar: [
              { text: 'هو رأى ' },
              { text: 'الفيل', isError: true, errorId: 'err1_art_s2_ar' }, // Assuming error is definite article where indefinite might be better for a first mention
              { text: ' في حديقة الحيوان.' }
            ],
          },
          errors: [
            {
              id: 'err1_art_s2',
              incorrectPhrase: { en: 'a elephant' },
              correctPhrase: { en: 'an elephant' },
              explanation: { en: 'Use "an" before a vowel sound.' },
            },
            {
              id: 'err1_art_s2_fr',
              incorrectPhrase: { fr: 'le grande éléphant' }, // Corrected to match new content.fr
              correctPhrase: { fr: 'le grand éléphant' },
              explanation: { fr: 'Accord de l\'adjectif: "grand" avec éléphant (masculin).' },
            },
            {
              id: 'err1_art_s2_ar',
              incorrectPhrase: { ar: 'الفيل' },
              correctPhrase: { ar: 'فيلاً' },
              explanation: { ar: 'عند ذكر شيء لأول مرة بشكل غير محدد، يُستخدم التنوين (فيلاً) بدلاً من أل التعريف.' },
            },
          ]
        }
      ],
    },
    {
      id: 'subjectVerbAgreement',
      title: {
        en: 'Subject-Verb Agreement',
        fr: 'Accord Sujet-Verbe',
        ar: 'توافق الفعل مع الفاعل',
      },
      stories: [
        // Stories for subject-verb agreement - Example (EN only for brevity)
        {
          id: 'story1_sva',
          content: {
            en: [
              { text: 'The cats ' },
              { text: 'sleeps', isError: true, errorId: 'err1_sva_s1' },
              { text: ' on the mat.' }
            ],
            fr: [], // Add French content
            ar: [], // Add Arabic content
          },
          errors: [
            {
              id: 'err1_sva_s1',
              incorrectPhrase: { en: 'sleeps' },
              correctPhrase: { en: 'sleep' },
              explanation: { en: 'A plural subject "cats" requires a plural verb "sleep".' },
            },
            // Add FR and AR errors
          ]
        }
      ],
    },
    {
      id: 'articlesDeterminers',
      title: {
        en: 'Articles and Determiners',
        fr: 'Articles et Déterminants',
        ar: 'أدوات التعريف والتنكير والمحددات',
      },
      stories: [
        // Stories for articles and determiners - Example (EN only for brevity)
        {
          id: 'story1_art',
          content: {
            en: [
              { text: 'She has ' },
              { text: 'an apple and one orange', isError: true, errorId: 'err1_art_s1' },
              { text: '.' }
            ],
            fr: [], // Add French content
            ar: [], // Add Arabic content
          },
          errors: [
            {
              id: 'err1_art_s1',
              incorrectPhrase: { en: 'an apple and one orange' }, // Could be 'an orange' or 'a single orange' depending on intent
              correctPhrase: { en: 'an apple and an orange' },
              explanation: { en: 'Use "an" before vowel sounds. "One" is specific; "an" is general for a single item.' },
            },
            // Add FR and AR errors
          ]
        }
      ],
    },
  ],
};
