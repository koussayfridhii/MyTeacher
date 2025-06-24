export const grammarGameData = {
  categories: [
    {
      id: "punctuation",
      title: {
        en: "Punctuation",
        fr: "Ponctuation",
        ar: "علامات الترقيم",
      },
      stories: [
        {
          id: "story1_punctuation",
          content: {
            en: [
              { text: "Hello " },
              { text: "mr", isError: true, errorId: "err1_punc_s1" },
              { text: " Watson" },
              {
                text: " how are you today",
                isError: true,
                errorId: "err2_punc_s1",
              },
              { text: "?" },
            ],
            fr: [
              { text: "Bonjour " },
              { text: "mr", isError: true, errorId: "err1_punc_s1_fr" },
              { text: " Watson" },
              {
                text: " comment allez-vous aujourdhui",
                isError: true,
                errorId: "err2_punc_s1_fr",
              },
              { text: " ?" },
            ],
            ar: [
              { text: "مرحباً " },
              { text: "سيد", isError: true, errorId: "err1_punc_s1_ar" },
              { text: " واتسون" },
              {
                text: " كيف حالك اليوم",
                isError: true,
                errorId: "err2_punc_s1_ar",
              },
              { text: "؟" },
            ],
          },
          errors: [
            {
              id: "err1_punc_s1",
              incorrectPhrase: { en: "mr" },
              correctPhrase: { en: "Mr." },
              explanation: {
                en: '"Mr." is an abbreviation and requires a period.',
              },
            },
            {
              id: "err2_punc_s1",
              incorrectPhrase: { en: "how are you today" },
              correctPhrase: { en: "How are you today" },
              explanation: {
                en: "Sentences should begin with a capital letter.",
              },
            },
            {
              id: "err1_punc_s1_fr",
              incorrectPhrase: { fr: "mr" },
              correctPhrase: { fr: "M." },
              explanation: {
                fr: '"M." est une abréviation et nécessite un point.',
              },
            },
            {
              id: "err2_punc_s1_fr",
              incorrectPhrase: { fr: "comment allez-vous aujourdhui" },
              correctPhrase: { fr: "Comment allez-vous aujourd'hui" },
              explanation: {
                fr: 'Les phrases doivent commencer par une majuscule et "aujourd\'hui" nécessite une apostrophe.',
              },
            },
            {
              id: "err1_punc_s1_ar",
              incorrectPhrase: { ar: "سيد" },
              correctPhrase: { ar: "السيد" },
              explanation: {
                ar: 'كلمة "سيد" كلقب تحتاج إلى تعريف أو معاملة خاصة في بداية الجملة.',
              },
            },
            {
              id: "err2_punc_s1_ar",
              incorrectPhrase: { ar: "كيف حالك اليوم" }, // In Arabic, capitalization isn't the primary issue here.
              correctPhrase: { ar: "كيف حالك اليوم؟" }, // The error could be the missing question mark if implied by context, or sentence structure.
              explanation: {
                ar: "الجمل الاستفهامية يجب أن تنتهي بعلامة استفهام. بداية الجملة بحرف كبير ليست قاعدة في العربية بنفس طريقة الإنجليزية.",
              },
            },
          ],
        },
        {
          id: "story2_punctuation",
          content: {
            en: [
              { text: "this is a sentence" },
              {
                text: " it needs a capital letter and a period",
                isError: true,
                errorId: "err1_punc_s2",
              },
            ],
            fr: [
              { text: "ceci est une phrase" },
              {
                text: " elle nécessite une majuscule et un point",
                isError: true,
                errorId: "err1_punc_s2_fr",
              },
            ],
            ar: [
              { text: "هذه جملة" },
              {
                text: " إنها تحتاج إلى حرف كبير ونقطة",
                isError: true,
                errorId: "err1_punc_s2_ar",
              },
            ],
          },
          errors: [
            {
              id: "err1_punc_s2",
              incorrectPhrase: { en: "it needs a capital letter and a period" },
              correctPhrase: { en: "It needs a capital letter and a period." },
              explanation: {
                en: "Sentences start with a capital and end with a period.",
              },
            },
            {
              id: "err1_punc_s2_fr",
              incorrectPhrase: {
                fr: "elle nécessite une majuscule et un point",
              },
              correctPhrase: {
                fr: "Elle nécessite une majuscule et un point.",
              },
              explanation: {
                fr: "Les phrases commencent par une majuscule et se terminent par un point.",
              },
            },
            {
              id: "err1_punc_s2_ar",
              incorrectPhrase: { ar: "إنها تحتاج إلى حرف كبير ونقطة" },
              correctPhrase: { ar: "إنها تحتاج إلى حرف كبير ونقطة." }, // Arabic capitalization rules differ, focus on period.
              explanation: {
                ar: "الجمل يجب أن تنتهي بعلامة ترقيم مناسبة مثل النقطة.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "verbTenses",
      title: {
        en: "Verb Tenses",
        fr: "Temps des Verbes",
        ar: "أزمنة الفعل",
      },
      stories: [
        {
          id: "story1_verb",
          content: {
            en: [
              { text: "Yesterday, I " },
              { text: "go", isError: true, errorId: "err1_verb_s1" },
              { text: " to the park." },
            ],
            fr: [
              { text: "Hier, je " },
              { text: "vais", isError: true, errorId: "err1_verb_s1_fr" },
              { text: " au parc." },
            ],
            ar: [
              { text: "بالأمس، أنا " },
              { text: "أذهب", isError: true, errorId: "err1_verb_s1_ar" },
              { text: " إلى الحديقة." },
            ],
          },
          errors: [
            {
              id: "err1_verb_s1",
              incorrectPhrase: { en: "go" },
              correctPhrase: { en: "went" },
              explanation: {
                en: '"Yesterday" indicates past tense, so "went" should be used.',
              },
            },
            {
              id: "err1_verb_s1_fr",
              incorrectPhrase: { fr: "vais" },
              correctPhrase: { fr: "suis allé" },
              explanation: {
                fr: '"Hier" indique le passé composé, donc "suis allé" doit être utilisé.',
              },
            },
            {
              id: "err1_verb_s1_ar",
              incorrectPhrase: { ar: "أذهب" },
              correctPhrase: { ar: "ذهبت" },
              explanation: {
                ar: 'كلمة "بالأمس" تدل على الزمن الماضي، لذا يجب استخدام "ذهبت".',
              },
            },
          ],
        },
        {
          id: "story2_verb",
          content: {
            en: [
              { text: "Tomorrow, she " },
              { text: "visited", isError: true, errorId: "err1_verb_s2" },
              { text: " her grandparents." },
            ],
            fr: [
              { text: "Demain, elle " },
              { text: "a visité", isError: true, errorId: "err1_verb_s2_fr" },
              { text: " ses grands-parents." },
            ],
            ar: [
              { text: "غداً، هي " },
              { text: "زارت", isError: true, errorId: "err1_verb_s2_ar" },
              { text: " أجدادها." },
            ],
          },
          errors: [
            {
              id: "err1_verb_s2",
              incorrectPhrase: { en: "visited" },
              correctPhrase: { en: "will visit" },
              explanation: { en: '"Tomorrow" indicates future tense.' },
            },
            {
              id: "err1_verb_s2_fr",
              incorrectPhrase: { fr: "a visité" },
              correctPhrase: { fr: "visitera" },
              explanation: { fr: '"Demain" indique le futur simple.' },
            },
            {
              id: "err1_verb_s2_ar",
              incorrectPhrase: { ar: "زارت" },
              correctPhrase: { ar: "ستزور" },
              explanation: { ar: 'كلمة "غداً" تدل على الزمن المستقبل.' },
            },
          ],
        },
        {
          id: "story3_verb",
          content: {
            en: [
              { text: "He " },
              { text: "eat", isError: true, errorId: "err1_verb_s3" },
              { text: " lunch at noon every day." },
            ],
            fr: [
              { text: "Il " },
              { text: "mangeait", isError: true, errorId: "err1_verb_s3_fr" },
              { text: " le déjeuner à midi chaque jour." },
            ],
            ar: [
              { text: "هو " },
              { text: "أكل", isError: true, errorId: "err1_verb_s3_ar" },
              { text: " الغداء عند الظهر كل يوم." },
            ],
          },
          errors: [
            {
              id: "err1_verb_s3",
              incorrectPhrase: { en: "eat" },
              correctPhrase: { en: "eats" },
              explanation: {
                en: 'Third person singular present tense requires "-s".',
              },
            },
            {
              id: "err1_verb_s3_fr",
              incorrectPhrase: { fr: "mangeait" },
              correctPhrase: { fr: "mange" },
              explanation: {
                fr: 'Pour une habitude présente, utilisez le présent: "mange".',
              },
            },
            {
              id: "err1_verb_s3_ar",
              incorrectPhrase: { ar: "أكل" },
              correctPhrase: { ar: "يأكل" },
              explanation: {
                ar: 'الفعل المضارع "يأكل" يعبر عن العادة اليومية.',
              },
            },
          ],
        },
      ],
    },
    {
      id: "passiveVoice",
      title: {
        en: "Passive Voice",
        fr: "Voix Passive",
        ar: "المبني للمجهول",
      },
      stories: [
        {
          id: "story1_passive",
          content: {
            en: [
              { text: "The cake " },
              { text: "was ate", isError: true, errorId: "err1_pass_s1" },
              { text: " by the boy." },
            ],
            fr: [
              { text: "Le gâteau " },
              {
                text: "a été mangé",
                isError: true,
                errorId: "err1_pass_s1_fr",
              },
              { text: " par le garçon." },
            ],
            ar: [
              { text: "الكعكة " },
              { text: "أُكلت", isError: true, errorId: "err1_pass_s1_ar" },
              { text: " من قبل الولد." },
            ],
          },
          errors: [
            {
              id: "err1_pass_s1",
              incorrectPhrase: { en: "was ate" },
              correctPhrase: { en: "was eaten" },
              explanation: { en: 'The correct past participle is "eaten".' },
            },
            {
              id: "err1_pass_s1_fr",
              incorrectPhrase: { fr: "a été mangé" },
              correctPhrase: { fr: "a été mangé" },
              explanation: {
                fr: "Correct in this case; simulate error elsewhere if needed.",
              },
            },
            {
              id: "err1_pass_s1_ar",
              incorrectPhrase: { ar: "أُكلت" },
              correctPhrase: { ar: "كُليَت" },
              explanation: {
                ar: "تصحيح الخطأ النحوي في الفعل المبني للمجهول.",
              },
            },
          ],
        },
      ],
    },
    {
      id: "subjectVerbAgreement",
      title: {
        en: "Subject-Verb Agreement",
        fr: "Accord Sujet-Verbe",
        ar: "توافق الفعل مع الفاعل",
      },
      stories: [
        {
          id: "story1_sva",
          content: {
            en: [
              { text: "The cats " },
              { text: "sleeps", isError: true, errorId: "err1_sva_s1" },
              { text: " on the mat." },
            ],
            fr: [
              { text: "Les chats " },
              { text: "dort", isError: true, errorId: "err1_sva_s1_fr" },
              { text: " sur le tapis." },
            ],
            ar: [
              { text: "القطط " },
              { text: "ينام", isError: true, errorId: "err1_sva_s1_ar" },
              { text: " على السجادة." },
            ],
          },
          errors: [
            {
              id: "err1_sva_s1",
              incorrectPhrase: { en: "sleeps" },
              correctPhrase: { en: "sleep" },
              explanation: {
                en: 'Plural subject "cats" takes plural verb "sleep".',
              },
            },
            {
              id: "err1_sva_s1_fr",
              incorrectPhrase: { fr: "dort" },
              correctPhrase: { fr: "dorment" },
              explanation: {
                fr: '"Les chats" est pluriel, donc le verbe doit être "dorment".',
              },
            },
            {
              id: "err1_sva_s1_ar",
              incorrectPhrase: { ar: "ينام" },
              correctPhrase: { ar: "ينامون" },
              explanation: {
                ar: 'الفعل يجب أن يتوافق مع الفاعل الجمع "القطط".',
              },
            },
          ],
        },
      ],
    },
    {
      id: "articlesDeterminers",
      title: {
        en: "Articles and Determiners",
        fr: "Articles et Déterminants",
        ar: "أدوات التعريف والتنكير والمحددات",
      },
      stories: [
        {
          id: "story1_art",
          content: {
            en: [
              { text: "She has " },
              {
                text: "an apple and one orange",
                isError: true,
                errorId: "err1_art_s1",
              },
              { text: "." },
            ],
            fr: [
              { text: "Elle a " },
              {
                text: "une pomme et un orange",
                isError: true,
                errorId: "err1_art_s1_fr",
              },
              { text: "." },
            ],
            ar: [
              { text: "هي لديها " },
              {
                text: "تفاحة وبرتقالة واحدة",
                isError: true,
                errorId: "err1_art_s1_ar",
              },
              { text: "." },
            ],
          },
          errors: [
            {
              id: "err1_art_s1",
              incorrectPhrase: { en: "an apple and one orange" },
              correctPhrase: { en: "an apple and an orange" },
              explanation: { en: 'Use "an" before vowel sounds.' },
            },
            {
              id: "err1_art_s1_fr",
              incorrectPhrase: { fr: "une pomme et un orange" },
              correctPhrase: { fr: "une pomme et une orange" },
              explanation: { fr: '"Orange" est féminin donc il faut "une".' },
            },
            {
              id: "err1_art_s1_ar",
              incorrectPhrase: { ar: "تفاحة وبرتقالة واحدة" },
              correctPhrase: { ar: "تفاحة وبرتقالة" },
              explanation: {
                ar: 'كلمة "واحدة" زائدة في هذا السياق عند التعداد.',
              },
            },
          ],
        },
      ],
    },
  ],
};
