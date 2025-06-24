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
        // Add more stories for punctuation here
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
        }
        // Add more stories for verb tenses here
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
