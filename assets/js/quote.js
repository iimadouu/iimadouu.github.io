/* ============================================================
   IIMADOUU — QUOTE BUILDER
   Language gate -> service -> contact -> 16 plain-language
   dropdown questions -> prompt -> AI Studio -> proforma invoice.
   ============================================================ */
(function () {
  "use strict";

  var cfg = window.QUOTE_CONFIG || {};

  /* ---------------- interface copy ---------------- */
  var T = {
    en: {
      back: "← Back to pricing",
      kicker: "Instant quote",
      h1: "Tell me what you want to build. I'll price it.",
      lede: "No technical words, no forms that assume you already know the answer. Pick your language, answer a few simple questions — most of them are dropdowns — and you'll get a proforma invoice in Algerian dinar, ready to print.",
      chooseLang: "Choose your language",
      qService: "What do you want to build?",
      qWho: "Who is this invoice for?",
      fName: "Your name", fCompany: "Company (optional)", fEmail: "Email", fPhone: "Phone / WhatsApp",
      nextQuestions: "Continue to the questions",
      backStep: "Back",
      qDetails: "A few questions about the project",
      generate: "Generate my proforma invoice",
      working: "Writing your proforma invoice…",
      print: "Print / Save as PDF",
      again: "Start over",
      keepNote: "Keep this page — the proforma is valid 15 days.",
      errContact: "Please give a name and either an email or a phone number.",
      errAll: "Please answer every question — pick “Not sure” if you don't know.",
      errApi: "The invoice could not be generated. Check your connection and try again.",
      choose: "— choose an answer —",
      answered: "answered",
      from: "From",
      proforma: "Proforma invoice",
      billedTo: "Billed to", issuedBy: "Issued by",
      desc: "Description", qty: "Qty", price: "Unit price", amount: "Amount",
      subtotal: "Subtotal", discount: "Discount", total: "Total", currency: "DZD",
      date: "Date", validUntil: "Valid until", number: "No.",
      timeline: "Estimated timeline", terms: "Payment terms", notes: "Notes",
      retry: "Try again", footer: "Thank you — this proforma is not a final invoice."
    },
    fr: {
      back: "← Retour aux tarifs",
      kicker: "Devis instantané",
      h1: "Dites-moi ce que vous voulez créer. Je le chiffre.",
      lede: "Pas de jargon, pas de formulaire qui suppose que vous connaissez déjà la réponse. Choisissez votre langue, répondez à quelques questions simples — surtout des listes déroulantes — et vous recevrez une facture proforma en dinars algériens, prête à imprimer.",
      chooseLang: "Choisissez votre langue",
      qService: "Que voulez-vous créer ?",
      qWho: "À quel nom établir la facture ?",
      fName: "Votre nom", fCompany: "Entreprise (facultatif)", fEmail: "E-mail", fPhone: "Téléphone / WhatsApp",
      nextQuestions: "Passer aux questions",
      backStep: "Retour",
      qDetails: "Quelques questions sur le projet",
      generate: "Générer ma facture proforma",
      working: "Rédaction de votre facture proforma…",
      print: "Imprimer / Enregistrer en PDF",
      again: "Recommencer",
      keepNote: "Conservez cette page — la proforma est valable 15 jours.",
      errContact: "Indiquez un nom et soit un e-mail soit un téléphone.",
      errAll: "Merci de répondre à toutes les questions — choisissez « Je ne sais pas » au besoin.",
      errApi: "La facture n'a pas pu être générée. Vérifiez votre connexion et réessayez.",
      choose: "— choisissez une réponse —",
      answered: "répondu",
      from: "À partir de",
      proforma: "Facture proforma",
      billedTo: "Facturé à", issuedBy: "Émis par",
      desc: "Désignation", qty: "Qté", price: "Prix unitaire", amount: "Montant",
      subtotal: "Sous-total", discount: "Remise", total: "Total", currency: "DA",
      date: "Date", validUntil: "Valable jusqu'au", number: "N°",
      timeline: "Délai estimé", terms: "Conditions de paiement", notes: "Notes",
      retry: "Réessayer", footer: "Merci — cette proforma n'est pas une facture définitive."
    },
    ar: {
      back: "← العودة إلى الأسعار",
      kicker: "عرض سعر فوري",
      h1: "قل لي ماذا تريد أن تبني. وأنا أحدد السعر.",
      lede: "بدون مصطلحات تقنية وبدون استمارة تفترض أنك تعرف الجواب. اختر لغتك، أجب على أسئلة بسيطة — معظمها قوائم منسدلة — وستحصل على فاتورة أولية بالدينار الجزائري جاهزة للطباعة.",
      chooseLang: "اختر لغتك",
      qService: "ماذا تريد أن تبني؟",
      qWho: "باسم من تُحرَّر الفاتورة؟",
      fName: "اسمك", fCompany: "الشركة (اختياري)", fEmail: "البريد الإلكتروني", fPhone: "الهاتف / واتساب",
      nextQuestions: "الانتقال إلى الأسئلة",
      backStep: "رجوع",
      qDetails: "بعض الأسئلة حول المشروع",
      generate: "إنشاء الفاتورة الأولية",
      working: "جارٍ كتابة فاتورتك الأولية…",
      print: "طباعة / حفظ PDF",
      again: "البدء من جديد",
      keepNote: "احتفظ بهذه الصفحة — الفاتورة صالحة لمدة 15 يوماً.",
      errContact: "يرجى إدخال الاسم وبريد إلكتروني أو رقم هاتف.",
      errAll: "يرجى الإجابة على كل الأسئلة — اختر «لا أعرف» إن لم تكن متأكداً.",
      errApi: "تعذّر إنشاء الفاتورة. تحقق من الاتصال وحاول مرة أخرى.",
      choose: "— اختر إجابة —",
      answered: "تمت الإجابة",
      from: "ابتداءً من",
      proforma: "فاتورة أولية",
      billedTo: "الفاتورة إلى", issuedBy: "صادرة من",
      desc: "البيان", qty: "الكمية", price: "سعر الوحدة", amount: "المبلغ",
      subtotal: "المجموع الفرعي", discount: "التخفيض", total: "المجموع", currency: "دج",
      date: "التاريخ", validUntil: "صالحة حتى", number: "رقم",
      timeline: "المدة التقديرية", terms: "شروط الدفع", notes: "ملاحظات",
      retry: "حاول مرة أخرى", footer: "شكراً — هذه فاتورة أولية وليست نهائية."
    }
  };

  /* ---------------- dropdown answer sets ---------------- */
  var O = {
    yesno: {
      en: ["Yes", "No", "Not sure"],
      fr: ["Oui", "Non", "Je ne sais pas"],
      ar: ["نعم", "لا", "لا أعرف"]
    },
    sizeSite: {
      en: ["1 single page", "2–5 pages", "6–10 pages", "11–20 pages", "More than 20", "Not sure"],
      fr: ["1 seule page", "2 à 5 pages", "6 à 10 pages", "11 à 20 pages", "Plus de 20", "Je ne sais pas"],
      ar: ["صفحة واحدة", "2 إلى 5 صفحات", "6 إلى 10 صفحات", "11 إلى 20 صفحة", "أكثر من 20", "لا أعرف"]
    },
    langs: {
      en: ["One language", "Two languages", "Three or more", "Not sure"],
      fr: ["Une langue", "Deux langues", "Trois ou plus", "Je ne sais pas"],
      ar: ["لغة واحدة", "لغتان", "ثلاث أو أكثر", "لا أعرف"]
    },
    content: {
      en: ["Everything is ready", "I have some of it", "I need help writing it", "Nothing yet"],
      fr: ["Tout est prêt", "J'ai une partie", "J'ai besoin d'aide pour rédiger", "Rien pour le moment"],
      ar: ["كل شيء جاهز", "لدي جزء منه", "أحتاج مساعدة في الكتابة", "لا شيء بعد"]
    },
    contactCh: {
      en: ["WhatsApp", "Email", "Phone call", "A contact form", "Instagram / Facebook", "Several of these"],
      fr: ["WhatsApp", "E-mail", "Appel téléphonique", "Un formulaire", "Instagram / Facebook", "Plusieurs de ces options"],
      ar: ["واتساب", "البريد الإلكتروني", "اتصال هاتفي", "استمارة", "إنستغرام / فيسبوك", "عدة خيارات"]
    },
    seo: {
      en: ["Not important", "Basic is enough", "Important", "Very important"],
      fr: ["Pas important", "Le basique suffit", "Important", "Très important"],
      ar: ["غير مهم", "الأساسي يكفي", "مهم", "مهم جداً"]
    },
    design: {
      en: ["Modern and minimal", "Bold and colourful", "Dark and cinematic", "Luxury and elegant", "Fun and playful", "Not sure"],
      fr: ["Moderne et épuré", "Audacieux et coloré", "Sombre et cinématographique", "Luxe et élégant", "Ludique", "Je ne sais pas"],
      ar: ["عصري وبسيط", "جريء وملون", "داكن وسينمائي", "فاخر وأنيق", "مرح", "لا أعرف"]
    },
    host: {
      en: ["I have domain and hosting", "Domain name only", "Neither", "Not sure"],
      fr: ["J'ai le domaine et l'hébergement", "Le nom de domaine seulement", "Ni l'un ni l'autre", "Je ne sais pas"],
      ar: ["لدي النطاق والاستضافة", "اسم النطاق فقط", "لا شيء", "لا أعرف"]
    },
    when: {
      en: ["As soon as possible", "Within 2 weeks", "Within a month", "In 2–3 months", "No deadline"],
      fr: ["Dès que possible", "Sous 2 semaines", "Sous un mois", "Dans 2–3 mois", "Pas de délai"],
      ar: ["في أقرب وقت", "خلال أسبوعين", "خلال شهر", "خلال 2–3 أشهر", "بدون أجل"]
    },
    budget: {
      en: ["Under 10 000 DZD", "10 000 – 25 000 DZD", "25 000 – 50 000 DZD", "50 000 – 100 000 DZD", "Over 100 000 DZD", "Not sure"],
      fr: ["Moins de 10 000 DA", "10 000 – 25 000 DA", "25 000 – 50 000 DA", "50 000 – 100 000 DA", "Plus de 100 000 DA", "Je ne sais pas"],
      ar: ["أقل من 10 000 دج", "10 000 – 25 000 دج", "25 000 – 50 000 دج", "50 000 – 100 000 دج", "أكثر من 100 000 دج", "لا أعرف"]
    },
    maint: {
      en: ["Yes, monthly", "Yes, now and then", "No", "Not sure"],
      fr: ["Oui, chaque mois", "Oui, de temps en temps", "Non", "Je ne sais pas"],
      ar: ["نعم، شهرياً", "نعم، من وقت لآخر", "لا", "لا أعرف"]
    },
    users: {
      en: ["A mobile app", "A website", "Both", "Internal software", "Other services", "Not sure"],
      fr: ["Une application mobile", "Un site web", "Les deux", "Un logiciel interne", "D'autres services", "Je ne sais pas"],
      ar: ["تطبيق موبايل", "موقع إلكتروني", "كلاهما", "برنامج داخلي", "خدمات أخرى", "لا أعرف"]
    },
    apiType: {
      en: ["Store data", "Accounts and login", "Payments", "Emails / notifications", "Connect other services", "All of these"],
      fr: ["Stocker des données", "Comptes et connexion", "Paiements", "E-mails / notifications", "Relier d'autres services", "Tout cela"],
      ar: ["تخزين البيانات", "حسابات وتسجيل دخول", "مدفوعات", "رسائل وتنبيهات", "ربط خدمات أخرى", "كل ذلك"]
    },
    scale: {
      en: ["Under 100", "100 – 1 000", "1 000 – 10 000", "More than 10 000", "Not sure"],
      fr: ["Moins de 100", "100 – 1 000", "1 000 – 10 000", "Plus de 10 000", "Je ne sais pas"],
      ar: ["أقل من 100", "100 – 1 000", "1 000 – 10 000", "أكثر من 10 000", "لا أعرف"]
    },
    risk: {
      en: ["Not sensitive", "Personal data", "Money / payments", "Health or legal"],
      fr: ["Pas sensible", "Données personnelles", "Argent / paiements", "Santé ou juridique"],
      ar: ["غير حساسة", "بيانات شخصية", "أموال / مدفوعات", "صحية أو قانونية"]
    },
    host2: {
      en: ["You choose for me", "I already have a server", "Free cloud tier", "Not sure"],
      fr: ["Choisissez pour moi", "J'ai déjà un serveur", "Offre cloud gratuite", "Je ne sais pas"],
      ar: ["اختر أنت", "لدي خادم بالفعل", "خدمة سحابية مجانية", "لا أعرف"]
    },
    plat: {
      en: ["Android", "iPhone", "Both", "Not sure"],
      fr: ["Android", "iPhone", "Les deux", "Je ne sais pas"],
      ar: ["أندرويد", "آيفون", "كلاهما", "لا أعرف"]
    },
    appType: {
      en: ["Online shop", "Booking", "Delivery", "Social / community", "Learning", "Internal tool", "Something else"],
      fr: ["Boutique en ligne", "Réservation", "Livraison", "Réseau / communauté", "Apprentissage", "Outil interne", "Autre chose"],
      ar: ["متجر إلكتروني", "حجوزات", "توصيل", "شبكة اجتماعية", "تعليم", "أداة داخلية", "شيء آخر"]
    },
    screens: {
      en: ["1–3 screens", "4–8 screens", "9–15 screens", "More than 15", "Not sure"],
      fr: ["1 à 3 écrans", "4 à 8 écrans", "9 à 15 écrans", "Plus de 15", "Je ne sais pas"],
      ar: ["1–3 شاشات", "4–8 شاشات", "9–15 شاشة", "أكثر من 15", "لا أعرف"]
    },
    publish: {
      en: ["Both stores", "Android only", "iPhone only", "Just the files"],
      fr: ["Les deux stores", "Android seulement", "iPhone seulement", "Juste les fichiers"],
      ar: ["المتجرين معاً", "أندرويد فقط", "آيفون فقط", "الملفات فقط"]
    },
    softType: {
      en: ["Stock / inventory", "Billing and invoices", "School or clinic records", "Bookings", "Reports and Excel", "Something else"],
      fr: ["Stock / inventaire", "Facturation et devis", "École ou cabinet médical", "Réservations", "Rapports et Excel", "Autre chose"],
      ar: ["المخزون", "الفواتير والوصولات", "سجلات مدرسة أو عيادة", "الحجوزات", "تقارير وإكسل", "شيء آخر"]
    },
    who: {
      en: ["Just me", "2–5 people", "5–20 people", "More than 20"],
      fr: ["Moi seulement", "2 à 5 personnes", "5 à 20 personnes", "Plus de 20"],
      ar: ["أنا فقط", "2–5 أشخاص", "5–20 شخصاً", "أكثر من 20"]
    },
    os: {
      en: ["Windows", "Mac", "Both", "Runs in a browser", "Not sure"],
      fr: ["Windows", "Mac", "Les deux", "Dans un navigateur", "Je ne sais pas"],
      ar: ["ويندوز", "ماك", "كلاهما", "داخل المتصفح", "لا أعرف"]
    },
    refs: {
      en: ["No", "Yes, I will send them", "Not sure"],
      fr: ["Non", "Oui, je les enverrai", "Je ne sais pas"],
      ar: ["لا", "نعم، سأرسلها", "لا أعرف"]
    }
  };

  /* ---------------- services and their questions ---------------- */
  var SERVICES = [
    {
      id: "website", from: "9 000",
      name: { en: "A website", fr: "Un site web", ar: "موقع إلكتروني" },
      blurb: {
        en: "Show your work, your company or sell online.",
        fr: "Présentez votre travail, votre entreprise ou vendez en ligne.",
        ar: "اعرض أعمالك أو شركتك أو بِع عبر الإنترنت."
      },
      questions: [
        { id: "purpose", o: "appType_w", q: { en: "What is the website for?", fr: "À quoi sert le site ?", ar: "ما الغرض من الموقع؟" } },
        { id: "pages", o: "sizeSite", q: { en: "How many pages do you roughly need?", fr: "Combien de pages environ ?", ar: "كم عدد الصفحات تقريباً؟" } },
        { id: "languages", o: "langs", q: { en: "How many languages should it speak?", fr: "Combien de langues ?", ar: "كم لغة يحتاجها الموقع؟" } },
        { id: "brand", o: "yesno", q: { en: "Do you already have a name and a logo?", fr: "Avez-vous déjà un nom et un logo ?", ar: "هل لديك اسم وشعار؟" } },
        { id: "content", o: "content", q: { en: "Are the texts and photos ready?", fr: "Les textes et photos sont-ils prêts ?", ar: "هل النصوص والصور جاهزة؟" } },
        { id: "contact", o: "contactCh", q: { en: "How should visitors contact you?", fr: "Comment les visiteurs doivent-ils vous contacter ?", ar: "كيف يتواصل معك الزوار؟" } },
        { id: "sell", o: "yesno", q: { en: "Do you want to sell products and take payment?", fr: "Voulez-vous vendre des produits et encaisser en ligne ?", ar: "هل تريد بيع منتجات وتحصيل الدفع؟" } },
        { id: "accounts", o: "yesno", q: { en: "Should customers create an account?", fr: "Les clients doivent-ils créer un compte ?", ar: "هل يجب أن ينشئ العملاء حساباً؟" } },
        { id: "cms", o: "yesno", q: { en: "Do you want to edit the content yourself later?", fr: "Voulez-vous modifier le contenu vous-même ensuite ?", ar: "هل تريد تعديل المحتوى بنفسك لاحقاً؟" } },
        { id: "seo", o: "seo", q: { en: "How important is being found on Google?", fr: "Être trouvé sur Google, c'est important ?", ar: "ما مدى أهمية الظهور على جوجل؟" } },
        { id: "style", o: "design", q: { en: "What look do you want?", fr: "Quel style voulez-vous ?", ar: "أي طابع تريد؟" } },
        { id: "refs", o: "refs", q: { en: "Do you have example sites you like?", fr: "Avez-vous des sites exemples que vous aimez ?", ar: "هل لديك مواقع تعجبك كأمثلة؟" } },
        { id: "hosting", o: "host", q: { en: "Do you own a domain name and hosting?", fr: "Possédez-vous un nom de domaine et un hébergement ?", ar: "هل تملك نطاقاً واستضافة؟" } },
        { id: "deadline", o: "when", q: { en: "When do you need it online?", fr: "Quand doit-il être en ligne ?", ar: "متى يجب أن يكون جاهزاً؟" } },
        { id: "budget", o: "budget", q: { en: "What budget feels comfortable?", fr: "Quel budget vous semble correct ?", ar: "ما الميزانية المناسبة لك؟" } },
        { id: "maintenance", o: "maint", q: { en: "Do you want maintenance after launch?", fr: "Voulez-vous un suivi après la mise en ligne ?", ar: "هل تريد صيانة بعد الإطلاق؟" } }
      ]
    },
    {
      id: "backend", from: "15 000",
      name: { en: "A backend / API", fr: "Un backend / API", ar: "خادم / واجهة برمجية" },
      blurb: {
        en: "Accounts, data, payments — the engine behind an app.",
        fr: "Comptes, données, paiements — le moteur derrière une app.",
        ar: "حسابات وبيانات ومدفوعات — المحرّك خلف التطبيق."
      },
      questions: [
        { id: "consumers", o: "users", q: { en: "Who will use this backend?", fr: "Qui utilisera ce backend ?", ar: "من سيستخدم هذا الخادم؟" } },
        { id: "job", o: "apiType", q: { en: "What is its main job?", fr: "Quelle est sa fonction principale ?", ar: "ما وظيفته الأساسية؟" } },
        { id: "scale", o: "scale", q: { en: "Roughly how many users in the first year?", fr: "Combien d'utilisateurs la première année ?", ar: "كم عدد المستخدمين في السنة الأولى تقريباً؟" } },
        { id: "accounts", o: "yesno", q: { en: "Do users need accounts and passwords?", fr: "Les utilisateurs ont-ils besoin de comptes ?", ar: "هل يحتاج المستخدمون حسابات وكلمات مرور؟" } },
        { id: "personal", o: "yesno", q: { en: "Will you store personal information?", fr: "Allez-vous stocker des données personnelles ?", ar: "هل ستخزن بيانات شخصية؟" } },
        { id: "payments", o: "yesno", q: { en: "Do you need online payments?", fr: "Avez-vous besoin de paiements en ligne ?", ar: "هل تحتاج مدفوعات إلكترونية؟" } },
        { id: "notify", o: "yesno", q: { en: "Should it send emails or SMS?", fr: "Doit-il envoyer des e-mails ou des SMS ?", ar: "هل يجب أن يرسل بريداً أو رسائل SMS؟" } },
        { id: "admin", o: "yesno", q: { en: "Do you need a screen to manage the data?", fr: "Voulez-vous un écran pour gérer les données ?", ar: "هل تحتاج شاشة لإدارة البيانات؟" } },
        { id: "integrations", o: "yesno", q: { en: "Must it talk to other apps (WhatsApp, Sheets, …)?", fr: "Doit-il dialoguer avec d'autres applications ?", ar: "هل يجب أن يتصل بتطبيقات أخرى؟" } },
        { id: "existing", o: "yesno", q: { en: "Do you already have an app or site that will use it?", fr: "Avez-vous déjà une app ou un site qui l'utilisera ?", ar: "هل لديك تطبيق أو موقع سيستخدمه؟" } },
        { id: "reports", o: "yesno", q: { en: "Do you need reports and statistics?", fr: "Avez-vous besoin de rapports et statistiques ?", ar: "هل تحتاج تقارير وإحصاءات؟" } },
        { id: "sensitivity", o: "risk", q: { en: "How sensitive is the data?", fr: "Quelle est la sensibilité des données ?", ar: "ما مدى حساسية البيانات؟" } },
        { id: "offline", o: "yesno", q: { en: "Must it cope with a weak connection?", fr: "Doit-il fonctionner avec une connexion faible ?", ar: "هل يجب أن يعمل مع اتصال ضعيف؟" } },
        { id: "where", o: "host2", q: { en: "Where should it run?", fr: "Où doit-il tourner ?", ar: "أين يجب أن يعمل؟" } },
        { id: "deadline", o: "when", q: { en: "When do you need it?", fr: "Quand en avez-vous besoin ?", ar: "متى تحتاجه؟" } },
        { id: "budget", o: "budget", q: { en: "What budget feels comfortable?", fr: "Quel budget vous semble correct ?", ar: "ما الميزانية المناسبة لك؟" } }
      ]
    },
    {
      id: "mobile", from: "25 000",
      name: { en: "A mobile app", fr: "Une application mobile", ar: "تطبيق موبايل" },
      blurb: {
        en: "Android, iPhone, or both — published to the stores.",
        fr: "Android, iPhone ou les deux — publiée sur les stores.",
        ar: "أندرويد أو آيفون أو كلاهما — مع النشر في المتاجر."
      },
      questions: [
        { id: "platform", o: "plat", q: { en: "Which phones should it run on?", fr: "Sur quels téléphones ?", ar: "على أي هواتف؟" } },
        { id: "kind", o: "appType", q: { en: "What kind of app is it?", fr: "Quel type d'application ?", ar: "ما نوع التطبيق؟" } },
        { id: "screens", o: "screens", q: { en: "How many screens roughly?", fr: "Combien d'écrans environ ?", ar: "كم عدد الشاشات تقريباً؟" } },
        { id: "accounts", o: "yesno", q: { en: "Do users sign up and log in?", fr: "Les utilisateurs s'inscrivent-ils ?", ar: "هل يسجّل المستخدمون الدخول؟" } },
        { id: "push", o: "yesno", q: { en: "Do you want push notifications?", fr: "Voulez-vous des notifications push ?", ar: "هل تريد إشعارات؟" } },
        { id: "payments", o: "yesno", q: { en: "Should people pay inside the app?", fr: "Les gens doivent-ils payer dans l'app ?", ar: "هل يدفع المستخدمون داخل التطبيق؟" } },
        { id: "offline", o: "yesno", q: { en: "Must it work without internet?", fr: "Doit-elle fonctionner hors ligne ?", ar: "هل يجب أن يعمل دون إنترنت؟" } },
        { id: "maps", o: "yesno", q: { en: "Do you need maps, GPS or location?", fr: "Besoin de cartes, GPS ou localisation ?", ar: "هل تحتاج خرائط أو تحديد موقع؟" } },
        { id: "camera", o: "yesno", q: { en: "Camera, photos or QR scanning?", fr: "Caméra, photos ou scan de QR ?", ar: "كاميرا أو صور أو مسح QR؟" } },
        { id: "dashboard", o: "yesno", q: { en: "Do you need a web dashboard to manage it?", fr: "Besoin d'un tableau de bord web ?", ar: "هل تحتاج لوحة تحكم على الويب؟" } },
        { id: "design", o: "yesno", q: { en: "Do you already have designs or screens?", fr: "Avez-vous déjà des maquettes ?", ar: "هل لديك تصاميم جاهزة؟" } },
        { id: "publish", o: "publish", q: { en: "Where should it be published?", fr: "Où doit-elle être publiée ?", ar: "أين يجب نشرها؟" } },
        { id: "developerAccounts", o: "yesno", q: { en: "Do you have Google Play / App Store accounts?", fr: "Avez-vous des comptes Google Play / App Store ?", ar: "هل لديك حسابات المتاجر؟" } },
        { id: "languages", o: "langs", q: { en: "How many languages inside the app?", fr: "Combien de langues dans l'app ?", ar: "كم لغة داخل التطبيق؟" } },
        { id: "deadline", o: "when", q: { en: "When do you need it?", fr: "Quand en avez-vous besoin ?", ar: "متى تحتاجه؟" } },
        { id: "budget", o: "budget", q: { en: "What budget feels comfortable?", fr: "Quel budget vous semble correct ?", ar: "ما الميزانية المناسبة لك؟" } }
      ]
    },
    {
      id: "software", from: "20 000",
      name: { en: "Software for your business", fr: "Un logiciel pour votre activité", ar: "برنامج لعملك" },
      blurb: {
        en: "Stock, invoices, records — a tool your team actually uses.",
        fr: "Stock, factures, dossiers — un outil que votre équipe utilise vraiment.",
        ar: "مخزون وفواتير وسجلات — أداة يستخدمها فريقك فعلاً."
      },
      questions: [
        { id: "kind", o: "softType", q: { en: "What should it manage?", fr: "Que doit-il gérer ?", ar: "ماذا يجب أن يدير؟" } },
        { id: "team", o: "who", q: { en: "How many people will use it?", fr: "Combien de personnes l'utiliseront ?", ar: "كم شخصاً سيستخدمه؟" } },
        { id: "platform", o: "os", q: { en: "Where should it run?", fr: "Sur quel système ?", ar: "على أي نظام؟" } },
        { id: "offline", o: "yesno", q: { en: "Must it work without internet?", fr: "Doit-il fonctionner sans internet ?", ar: "هل يجب أن يعمل دون إنترنت؟" } },
        { id: "printing", o: "yesno", q: { en: "Should it print receipts or invoices?", fr: "Doit-il imprimer reçus ou factures ?", ar: "هل يجب أن يطبع وصولات أو فواتير؟" } },
        { id: "barcode", o: "yesno", q: { en: "Do you scan barcodes or QR codes?", fr: "Scannez-vous des codes-barres ?", ar: "هل تمسح رموز باركود؟" } },
        { id: "roles", o: "yesno", q: { en: "Should each user have different permissions?", fr: "Chaque utilisateur a-t-il des droits différents ?", ar: "هل لكل مستخدم صلاحيات مختلفة؟" } },
        { id: "import", o: "yesno", q: { en: "Is your data in Excel today?", fr: "Vos données sont-elles sur Excel aujourd'hui ?", ar: "هل بياناتك حالياً على إكسل؟" } },
        { id: "backup", o: "yesno", q: { en: "Do you want automatic backups?", fr: "Voulez-vous des sauvegardes automatiques ?", ar: "هل تريد نسخاً احتياطياً تلقائياً؟" } },
        { id: "connect", o: "yesno", q: { en: "Should it connect to your website or app?", fr: "Doit-il se relier à votre site ou app ?", ar: "هل يجب أن يتصل بموقعك أو تطبيقك؟" } },
        { id: "reports", o: "yesno", q: { en: "Do you need reports and statistics?", fr: "Besoin de rapports et statistiques ?", ar: "هل تحتاج تقارير وإحصاءات؟" } },
        { id: "multibranch", o: "yesno", q: { en: "Do you have several branches or companies?", fr: "Avez-vous plusieurs points de vente ?", ar: "هل لديك عدة فروع أو شركات؟" } },
        { id: "paperwork", o: "yesno", q: { en: "Do you have papers or forms to copy exactly?", fr: "Avez-vous des documents à reproduire ?", ar: "هل لديك وثائق يجب تقليدها؟" } },
        { id: "training", o: "yesno", q: { en: "Do you need installation and training?", fr: "Besoin d'installation et de formation ?", ar: "هل تحتاج تركيباً وتدريباً؟" } },
        { id: "deadline", o: "when", q: { en: "When do you need it?", fr: "Quand en avez-vous besoin ?", ar: "متى تحتاجه؟" } },
        { id: "budget", o: "budget", q: { en: "What budget feels comfortable?", fr: "Quel budget vous semble correct ?", ar: "ما الميزانية المناسبة لك؟" } }
      ]
    }
  ];

  /* website has its own "purpose" set */
  O.appType_w = {
    en: ["Show my work / portfolio", "Present my company", "Sell products online", "Blog or news", "Booking or appointments", "A landing page for ads", "Not sure"],
    fr: ["Présenter mon travail", "Présenter mon entreprise", "Vendre des produits", "Blog ou actualités", "Réservations / rendez-vous", "Une page pour mes publicités", "Je ne sais pas"],
    ar: ["عرض أعمالي", "تعريف بشركتي", "بيع منتجات", "مدونة أو أخبار", "حجوزات أو مواعيد", "صفحة لإعلاناتي", "لا أعرف"]
  };

  /* ---------------- state + helpers ---------------- */
  var state = { lang: "en", service: null, answers: {} };
  var lastPrompt = "";

  function $(s) { return document.querySelector(s); }
  function all(s) { return Array.prototype.slice.call(document.querySelectorAll(s)); }
  function t(k) { return (T[state.lang] && T[state.lang][k]) || T.en[k] || k; }
  function pick(o) { return (o && (o[state.lang] || o.en)) || ""; }
  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) {
    var v = Math.round(Number(n) || 0);
    /* narrow no-break spaces keep the digits together in Arabic (RTL) */
    return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, "\u202F") + "\u00A0" + t("currency");
  }
  function show(id) {
    all(".step, .busy, .result").forEach(function (el) { el.classList.remove("on"); });
    var el = $(id);
    if (el) el.classList.add("on");
    /* the language gate and the intro belong to the start of the flow only */
    document.body.classList.toggle("is-flow", id !== "#gate");
  }

  function isoDay(offset) {
    var d = new Date();
    d.setDate(d.getDate() + (offset || 0));
    return d.toISOString().slice(0, 10);
  }

  /* ---------------- language gate ---------------- */
  all(".lang").forEach(function (b) {
    b.addEventListener("click", function () {
      state.lang = b.getAttribute("data-lang");
      document.documentElement.lang = state.lang;
      document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
      applyCopy();
      buildServices();
      show("#step-service");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  function applyCopy() {
    all("[data-i18n]").forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (el.tagName === "H1") {
        var parts = t("h1").split(". ");
        el.innerHTML = esc(parts[0]) + ".<br><em>" + esc(parts.slice(1).join(". ") || "") + "</em>";
      } else {
        el.textContent = t(k);
      }
    });
    var g = $("#gate");
    if (g) g.querySelector("h2").textContent = t("chooseLang");
    var cn = $("#c-count");
    if (cn) cn.textContent = state.service ? t("from") + " " + state.service.from + " " + t("currency") : "";
  }

  /* ---------------- services ---------------- */
  function buildServices() {
    var host = $("#services");
    host.innerHTML = "";
    SERVICES.forEach(function (s) {
      var b = document.createElement("button");
      b.className = "service";
      b.type = "button";
      b.innerHTML =
        "<b>" + esc(pick(s.name)) + "</b>" +
        "<p>" + esc(pick(s.blurb)) + "</p>" +
        '<span class="from">' + esc(t("from")) + " " + s.from + " " + esc(t("currency")) + "</span>";
      b.addEventListener("click", function () {
        state.service = s;
        show("#step-contact");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      host.appendChild(b);
    });
  }

  /* ---------------- contact ---------------- */
  $("#to-questions").addEventListener("click", function () {
    var name = $("#c-name").value.trim();
    var mail = $("#c-email").value.trim();
    var tel = $("#c-phone").value.trim();
    if (!name || (!mail && !tel)) {
      $("#contact-err").classList.add("on");
      return;
    }
    $("#contact-err").classList.remove("on");
    buildQuestions();
    show("#step-questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  all("[data-back]").forEach(function (b) {
    b.addEventListener("click", function () {
      show(state.service && $("#step-questions").classList.contains("on") ? "#step-contact" : "#step-service");
    });
  });

  /* ---------------- questions ---------------- */
  function buildQuestions() {
    var s = state.service;
    var grid = $("#qgrid");
    grid.innerHTML = "";
    state.answers = {};
    $("#questions-title").textContent = t("qDetails") + " — " + pick(s.name);
    s.questions.forEach(function (q, i) {
      var wrap = document.createElement("div");
      wrap.className = "q";
      var id = "q-" + q.id;
      var opts = O[q.o] || O.yesno;
      var html = '<label for="' + id + '"><i>' + String(i + 1).padStart(2, "0") + "</i>" + esc(pick(q.q)) + "</label>";
      html += '<select id="' + id + '" data-qid="' + esc(q.id) + '"><option value="">' + esc(t("choose")) + "</option>";
      pick(opts).forEach(function (o) {
        html += '<option value="' + esc(o) + '">' + esc(o) + "</option>";
      });
      html += "</select>";
      wrap.innerHTML = html;
      grid.appendChild(wrap);
    });
    grid.onchange = countAnswers;
    countAnswers();
  }

  function countAnswers() {
    var total = state.service.questions.length;
    var done = all("#qgrid select").filter(function (s) { return s.value; }).length;
    $("#q-count").textContent = done + " / " + total + " " + t("answered");
  }

  /* ---------------- prompt ---------------- */
  var LANGS = { en: "English", fr: "French", ar: "Arabic" };

  function buildPrompt() {
    var s = state.service;
    var contact = {
      name: $("#c-name").value.trim(),
      company: $("#c-company").value.trim(),
      email: $("#c-email").value.trim(),
      phone: $("#c-phone").value.trim()
    };
    var rows = s.questions.map(function (q, i) {
      return (i + 1) + ". " + pick(q.q) + " => " + (state.answers[q.id] || "(no answer)");
    }).join("\n");

    return [
      "You are writing a proforma invoice (facture proforma) for a young Algerian freelance developer.",
      "Brand: IIMADOUU — Imad Eddine Aris, Chebli, Blida, Algeria. Email: imadedar98@gmail.com.",
      "Write every human-readable string in " + LANGS[state.lang] + ".",
      "",
      "CLIENT",
      "Name: " + contact.name,
      "Company: " + (contact.company || "individual"),
      "Email: " + contact.email,
      "Phone: " + contact.phone,
      "",
      "PROJECT TYPE: " + pick(s.name),
      "CLIENT ANSWERS:",
      rows,
      "",
      "PRICING RULES (strict)",
      "- Currency is Algerian dinar (DZD). Amounts are integers, no decimals, no currency symbols.",
      "- Prices must be extremely cheap and honest for Algeria — a fraction of agency prices, because this is a solo freelancer.",
      "- Ceilings: simple website <= 20000; fuller website <= 45000; backend/API <= 60000; mobile app <= 70000; business software <= 55000.",
      "- The grand total must be between 8000 and 75000 DZD. Aim for the lower half when the answers describe something small.",
      "- Split the work into 3 to 6 line items the client understands (design, build, content, hosting setup, training, store publishing…).",
      "- qty is the number of units (pages, screens, languages…); unitPrice * qty must equal total for each line.",
      "- Add a discount only if it makes the total rounder or friendlier.",
      "- Payment terms: 50% deposit to start, 50% on delivery, unless the answers suggest otherwise.",
      "- Estimated timeline must be realistic and match the deadline answer.",
      "- The proforma is valid for 15 days. Never write 30 days or any other validity period.",
      "",
      "Return ONLY a JSON object with this exact shape:",
      '{"number":"PF-2026-001","issueDate":"YYYY-MM-DD","validUntil":"YYYY-MM-DD",',
      '"items":[{"label":"...","detail":"...","qty":1,"unitPrice":0,"total":0}],',
      '"discount":0,"timeline":"...","paymentTerms":"...",',
      '"notes":["..."],"footer":"..."}',
      "Do not wrap it in markdown. Every field is required."
    ].join("\n");
  }

  /* ---------------- call AI Studio ---------------- */
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function ask(prompt, attempt) {
    attempt = attempt || 0;
    return fetch(cfg.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt })
    }).then(function (res) {
      return res.json().then(function (j) {
        if (!res.ok || !j.text) {
          var e = new Error((j && j.error) || "API error");
          e.status = res.status;
          throw e;
        }
        return j.text;
      });
    }).catch(function (err) {
      var retryable = !err.status || err.status === 429 || err.status === 500 || err.status === 502 || err.status === 503;
      if (retryable && attempt < 2) {
        return wait(1200 + 900 * attempt).then(function () { return ask(prompt, attempt + 1); });
      }
      throw err;
    });
  }

  function parseJson(text) {
    var clean = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try { return JSON.parse(clean); } catch (e) {}
    var a = clean.indexOf("{"), b = clean.lastIndexOf("}");
    if (a >= 0 && b > a) return JSON.parse(clean.slice(a, b + 1));
    throw new Error("bad json");
  }

  /* ---------------- invoice ---------------- */
  function renderInvoice(d) {
    var items = Array.isArray(d.items) ? d.items : [];
    var subtotal = 0;
    var rows = items.map(function (it) {
      var qty = Number(it.qty) || 1;
      var unit = Number(it.unitPrice) || 0;
      var total = Number(it.total);
      if (!total) total = qty * unit;
      subtotal += total;
      return "<tr><td><strong>" + esc(it.label || "—") + "</strong>" +
        (it.detail ? "<small>" + esc(it.detail) + "</small>" : "") + "</td>" +
        '<td class="num">' + qty + "</td>" +
        '<td class="num">' + money(unit) + "</td>" +
        '<td class="num">' + money(total) + "</td></tr>";
    }).join("");

    var discount = Number(d.discount) || 0;
    var grand = Math.max(0, subtotal - discount);
    var notes = Array.isArray(d.notes) ? d.notes : [];
    /* dates and reference are ours, not the model's */
    d.issueDate = isoDay(0);
    d.validUntil = isoDay(15);
    if (!d.number) d.number = "PF-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 899) + 100);

    var client = {
      name: $("#c-name").value.trim(),
      company: $("#c-company").value.trim(),
      email: $("#c-email").value.trim(),
      phone: $("#c-phone").value.trim()
    };

    $("#paper").innerHTML =
      '<article class="paper">' +
        '<div class="top">' +
          "<div><h3>IIMADOUU</h3>" +
            '<div class="sub">Imad Eddine Aris · Chebli, Blida, Algeria</div>' +
            '<div class="sub">imadedar98@gmail.com</div></div>' +
          '<div class="doc"><b>' + esc(t("proforma")) + "</b>" +
            "<span>" + esc(d.number || "PF-2026-001") + "</span>" +
            '<div class="sub">' + esc(t("date")) + " " + esc(d.issueDate || "") + "</div></div>" +
        "</div>" +
        '<div class="parties">' +
          "<div><h4>" + esc(t("billedTo")) + "</h4><p>" +
            esc(client.name) + "\n" + esc(client.company || "") +
            (client.email ? "\n" + esc(client.email) : "") +
            (client.phone ? "\n" + esc(client.phone) : "") + "</p></div>" +
          "<div><h4>" + esc(t("validUntil")) + "</h4><p>" + esc(d.validUntil || "") + "</p></div>" +
        "</div>" +
        "<table><thead><tr><th>" + esc(t("desc")) + "</th><th>" + esc(t("qty")) +
          '</th><th class="num">' + esc(t("price")) + '</th><th class="num">' + esc(t("amount")) + "</th></tr></thead><tbody>" +
          rows +
        "</tbody></table>" +
        '<div class="totals">' +
          "<div><span>" + esc(t("subtotal")) + "</span><b>" + money(subtotal) + "</b></div>" +
          (discount ? "<div><span>" + esc(t("discount")) + "</span><b>−" + money(discount) + "</b></div>" : "") +
          '<div class="grand"><span>' + esc(t("total")) + "</span><b>" + money(grand) + "</b></div>" +
        "</div>" +
        '<div class="meta">' +
          "<div><h4>" + esc(t("timeline")) + "</h4><p>" + esc(d.timeline || "—") + "</p></div>" +
          "<div><h4>" + esc(t("terms")) + "</h4><p>" + esc(d.paymentTerms || "—") + "</p></div>" +
          (notes.length ? "<div><h4>" + esc(t("notes")) + "</h4><ul>" + notes.map(function (n) {
            return "<li>" + esc(n) + "</li>";
          }).join("") + "</ul></div>" : "") +
        "</div>" +
        '<div class="foot">' + esc(d.footer || t("footer")) + "</div>" +
      "</article>";
  }

  /* ---------------- generate ---------------- */
  $("#generate").addEventListener("click", function () {
    var missing = all("#qgrid select").filter(function (s) { return !s.value; });
    var err = $("#gen-err");
    if (missing.length) {
      err.textContent = t("errAll");
      err.classList.add("on");
      missing[0].focus();
      return;
    }
    err.classList.remove("on");
    all("#qgrid select").forEach(function (s) { state.answers[s.getAttribute("data-qid")] = s.value; });

    lastPrompt = buildPrompt();
    show("#busy");
    window.scrollTo({ top: 0, behavior: "smooth" });

    ask(lastPrompt).then(function (text) {
      renderInvoice(parseJson(text));
      show("#result");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }).catch(function (e) {
      show("#step-questions");
      err.textContent = t("errApi") + (e && e.message ? " (" + e.message + ")" : "");
      err.classList.add("on");
    });
  });

  $("#print").addEventListener("click", function () { window.print(); });
  $("#again").addEventListener("click", function () {
    state.answers = {};
    $("#paper").innerHTML = "";
    show("#gate");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* keyboard: Enter on step contact advances */
  ["c-name", "c-company", "c-email", "c-phone"].forEach(function (id) {
    $("#" + id).addEventListener("keydown", function (e) {
      if (e.key === "Enter") $("#to-questions").click();
    });
  });

  applyCopy();
  buildServices();
})();
