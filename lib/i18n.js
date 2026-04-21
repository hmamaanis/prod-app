// PROD App — Internationalization strings
// Supports: 'en' (English, LTR) and 'ar' (Arabic, RTL)

export const LANGUAGES = {
  en: { label: 'English', dir: 'ltr', font: '"Inter", system-ui, sans-serif', mono: '"IBM Plex Mono", monospace' },
  ar: { label: 'العربية', dir: 'rtl', font: '"Cairo", "Inter", system-ui, sans-serif', mono: '"Cairo", "IBM Plex Mono", monospace' },
};

export const translations = {
  en: {
    // App
    appName: 'PROD',
    tagline: 'Production Coordination',

    // Hub
    workspace: 'WORKSPACE',
    yourProjects: 'Your projects',
    productions: (n) => `${n} production${n !== 1 ? 's' : ''}`,
    newProject: 'New project',
    searchProjects: 'Search projects...',
    sortRecent: 'Recent',
    sortAZ: 'A – Z',
    sortStatus: 'Status',
    openProject: 'Open project',
    live: 'LIVE',

    // Phases
    preProduction: 'Pre-production',
    inProduction: 'In production',
    postProduction: 'Post-production',
    phaseLabel: 'Phase',

    // Nav tabs
    today: 'Today',
    shotList: 'Shot list',
    castCrew: 'Cast & crew',
    lighting: 'Lighting',
    location: 'Location',
    liveTracker: 'Live tracker',
    script: 'Script',
    activity: 'Activity',
    budget: 'Budget',
    aiFeed: 'AI feed',
    viewAccess: 'View access',
    breakdown: 'Script',
    stripboard: 'Stripboard',
    callSheet: 'Call sheet',
    scriptImport: 'Script import',

    // Short labels (mobile bottom bar)
    short: {
      dashboard:    'Today',
      shotlist:     'Shots',
      cast:         'Cast',
      lighting:     'Lights',
      location:     'Map',
      tracker:      'Track',
      breakdown:    'Script',
      activity:     'Log',
      budget:       'Budget',
      ai:           'AI',
      settings:     'Access',
      script:       'Script',
      stripboard:   'Board',
      callsheet:    'Call',
      casting:      'Casting',
      scriptreader: 'Reader',
      postprod:     'Post',
      notepad:      'Notes',
    },

    // Dashboard
    shootingToday: 'SHOOTING TODAY',
    dayOf: (cur, tot) => `DAY ${cur} / ${tot}`,
    call: 'Call',
    wrap: 'Wrap',
    scenes: 'SCENES',
    shotsPlanned: 'SHOTS PLANNED',
    castOnSet: 'CAST ON SET',
    dayEst: 'DAY EST.',
    todayTimeline: "TODAY'S TIMELINE",
    liveLocations: 'LIVE LOCATIONS',
    aiInsight: 'AI INSIGHT',
    active: 'ACTIVE',
    openPlan: 'Open plan',
    allPresent: 'All present',
    aheadOfSchedule: 'Ahead of schedule',

    // Shot list
    addShot: 'Add shot',
    askAiReorder: 'Ask AI to reorder',
    reorderMsg: 'Reorder proposal submitted — results will appear in AI feed.',
    noShotsView: 'No shots for this view. Try "All scenes" or add a new shot.',
    tabToday: 'Today',
    tabTomorrow: 'Tomorrow',
    tabAllScenes: 'All scenes',
    shotId: 'SHOT ID',
    scene: 'SCENE',
    lens: 'LENS',
    time: 'TIME',
    setupDescription: 'SETUP DESCRIPTION',
    recording: '● RECORDING',
    storyboard: 'storyboard',
    statusDone: 'Done',
    statusCurrent: 'Current',
    statusNext: 'Up next',
    statusPlanned: 'Planned',

    // Cast & Crew
    cast: 'Cast',
    crew: 'Crew — heads of department',
    addCast: 'Add cast',
    addCrew: 'Add crew',
    noCast: 'No cast members yet.',
    noCrew: 'No crew members yet.',
    name: 'Name',
    role: 'Role',

    // Status
    statusOnSet: 'On set',
    statusTravel: 'ETA',
    statusHolding: 'Holding',
    statusWrapped: 'Wrapped',
    statusNotCalled: 'Not called',
    statusAtBase: 'Base camp',

    // Lighting
    newSetup: 'New setup',
    noLighting: 'No lighting setups yet. Click "New setup" to add one.',
    units: 'Units',
    colorTemp: 'COLOR TEMP',
    setupTime: 'SETUP TIME',
    label: 'LABEL',
    id: 'ID',
    newLightingSetup: 'New lighting setup',
    saveSetup: 'Save setup',
    addUnit: 'Add unit, press Enter',
    noUnits: 'No units listed.',

    // Breakdown
    aiRebreakdown: 'AI re-breakdown',
    rebreakdownMsg: 'Re-breakdown requested — results appear in AI feed.',
    tabThisWeek: 'This week',
    tabFullScript: 'Full script',

    // Script screen
    pasteScript: 'Paste script',
    importFile: 'Import file',
    extractScenes: 'Extract scenes',
    analysing: 'Analysing script…',
    saveAll: 'Save all scenes',
    saveToBreakdown: 'Save to breakdown',
    scenesInBreakdown: (n) => `${n} scene${n !== 1 ? 's' : ''} in breakdown`,
    noScript: 'Paste your script above and click "Extract scenes" to get started.',
    scriptPlaceholder: 'Paste your screenplay here...\n\nExample:\nINT. WAREHOUSE - DAY\n\nThe camera pans across dusty shelves.\n\nEXT. ROOFTOP - NIGHT\n\nRain begins to fall.',
    extractedScenes: 'Extracted scenes',
    intExt: 'INT/EXT',
    dayNight: 'D/N',
    pages: 'Pages',
    synopsis: 'Synopsis',
    saved: '✓ Saved',
    importComingSoon: 'File import coming soon. Paste your script in the text tab for now.',

    // Stripboard
    unscheduledScenes: 'Unscheduled scenes',
    shootingDays: 'Shooting days',
    addDay: 'Add day',
    noUnscheduled: 'All scenes are scheduled.',
    noDays: 'No shooting days yet. Click "Add day" to start scheduling.',
    assignToDay: 'Assign to day',
    totalPages: (n) => `${n} pages`,
    heavyDay: '⚠ Heavy day',
    removeScene: 'Remove',
    dayN: (n) => `Day ${n}`,
    callTime: 'Call',
    wrapTime: 'Wrap',

    // Call sheet
    shootingDay: 'SHOOTING DAY',
    shareLink: 'Share link',
    printPdf: 'Print / PDF',
    callSheet: 'CALL SHEET',
    generalCall: 'GENERAL CALL',
    estimatedWrap: 'ESTIMATED WRAP',
    scenesToday: 'SCENES TODAY',
    sceneSchedule: 'Scene Schedule',
    castCallTimes: 'Cast Call Times',
    hodsSection: 'Heads of Department',
    productionNotes: 'Production Notes',
    noScenesScheduled: 'No scenes assigned to this day.',
    noCastScheduled: 'No cast assigned to scenes for this day.',
    noDaysScheduled: 'No shooting days scheduled yet.',
    goToStripboard: 'Go to Stripboard to create your shooting schedule first.',
    shareComingSoon: 'PDF sharing coming soon — use Print to save as PDF.',

    // View settings
    rolePresets: 'Role presets',
    crewAccessLinks: 'Crew access links',
    copyAllLinks: 'Copy all links',
    shareAll: 'Copy all links as list',
    generateLink: 'Generate link',
    regenerate: 'Regenerate',
    copy: 'Copy',
    copied: 'Copied!',
    tabsVisible: 'Visible tabs',
    noTokenYet: 'No link yet',
    allCastCrew: 'All cast & crew',
    applyToAll: (role) => `Apply to all ${role}`,

    // Hub extras
    production: 'production',
    noProjects: 'No projects yet',
    noProjectsHint: 'Set up your first production in under 2 minutes.',
    clearSearch: 'Clear search',
    noResultsFor: (q) => `No projects match "${q}"`,

    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    back: 'Back',
    loading: 'Loading…',
    allProjects: '← All projects',
    keyTeam: 'KEY TEAM',
    day: 'Day',
    more: 'More',
    viewAs: 'View as',
    searchPlaceholder: 'Search scenes, people, notes...',
    noResults: 'No results for',
    results: (n) => `${n} result${n !== 1 ? 's' : ''} · click to navigate`,
    shots: 'Shots',
    people: 'People',
    startTyping: 'Start typing to search shots, people, and activity.',
    loadingData: 'Loading data…',

    // New screens — Phase 3
    casting:      'Casting',
    scriptReader: 'Script reader',
    postProd:     'Coverage notes',
    notepad:      'Notepad',

    // Budget Phase 3
    editBudget:  'Edit budget',
    addLine:     'Add line',
    exportCsv:   'Export CSV',
    budgetTotal: 'Budget total',
    actualToDate:'Actual to date',
    pace:        'Pace',
    daysComplete:'Days complete',
    onTrack:     'On track',
    overBudget:  'Over budget',
    deleteLine:  'Delete line',
    categoryName:'Category name',

    // Post-production connection
    planned:     'Planned',
    actual:      'Actual',
    coverageGap: 'Coverage gap',
    needsPickup: 'Needs pickup',
    pickupDays:  (n) => `~${n} pickup day${n !== 1 ? 's' : ''} estimated`,
    viewPrePlan: '← View pre-production plan',
    plannedShots:'Planned shots',
    actualCoverage: 'Actual coverage',
    coveragePct: (n) => `${n}% covered`,
    aiCoverageAlert: 'AI Coverage Analysis',
    noScenesPost:'No scenes found. Add scenes in pre-production first.',

    // Notion nav groups
    navGroupProduction:  'Production',
    navGroupScript:      'Script & breakdown',
    navGroupManagement:  'Management',
    navGroupSettings:    'Settings',

    // Replay
    replayAI: 'Replay AI alert',
  },

  ar: {
    // App
    appName: 'برود',
    tagline: 'إدارة الإنتاج',

    // Hub
    workspace: 'مساحة العمل',
    yourProjects: 'مشاريعك',
    productions: (n) => `${n} ${n === 1 ? 'إنتاج' : 'إنتاجات'}`,
    newProject: 'مشروع جديد',
    searchProjects: 'ابحث عن مشروع...',
    sortRecent: 'الأحدث',
    sortAZ: 'أ – ي',
    sortStatus: 'الحالة',
    openProject: 'فتح المشروع',
    live: 'مباشر',

    // Phases
    preProduction: 'ما قبل الإنتاج',
    inProduction: 'في الإنتاج',
    postProduction: 'ما بعد الإنتاج',
    phaseLabel: 'المرحلة',

    // Nav tabs
    today: 'اليوم',
    shotList: 'قائمة المشاهد',
    castCrew: 'الممثلون والطاقم',
    lighting: 'الإضاءة',
    location: 'الموقع',
    liveTracker: 'التتبع المباشر',
    script: 'النص',
    activity: 'النشاط',
    budget: 'الميزانية',
    aiFeed: 'تغذية الذكاء',
    viewAccess: 'إدارة الوصول',
    breakdown: 'تفصيل النص',
    stripboard: 'لوح التصوير',
    callSheet: 'ورقة الاستدعاء',
    scriptImport: 'استيراد النص',

    // Short labels (mobile bottom bar)
    short: {
      dashboard:    'اليوم',
      shotlist:     'مشاهد',
      cast:         'طاقم',
      lighting:     'إضاءة',
      location:     'خريطة',
      tracker:      'تتبع',
      breakdown:    'نص',
      activity:     'سجل',
      budget:       'ميزانية',
      ai:           'ذكاء',
      settings:     'وصول',
      script:       'نص',
      stripboard:   'لوح',
      callsheet:    'استدعاء',
      casting:      'تمثيل',
      scriptreader: 'قراءة',
      postprod:     'بوست',
      notepad:      'ملاحظات',
    },

    // Dashboard
    shootingToday: 'التصوير اليوم',
    dayOf: (cur, tot) => `اليوم ${cur} من ${tot}`,
    call: 'الاستدعاء',
    wrap: 'الانتهاء',
    scenes: 'المشاهد',
    shotsPlanned: 'اللقطات المخططة',
    castOnSet: 'الممثلون في الموقع',
    dayEst: 'تقدير اليوم',
    todayTimeline: 'جدول اليوم',
    liveLocations: 'المواقع المباشرة',
    aiInsight: 'تنبيه الذكاء',
    active: 'نشط',
    openPlan: 'فتح الخطة',
    allPresent: 'الجميع حاضر',
    aheadOfSchedule: 'متقدم على الجدول',

    // Shot list
    addShot: 'إضافة لقطة',
    askAiReorder: 'اطلب من الذكاء إعادة الترتيب',
    reorderMsg: 'تم إرسال طلب إعادة الترتيب — ستظهر النتائج في تغذية الذكاء.',
    noShotsView: 'لا توجد لقطات لهذا العرض. جرب "جميع المشاهد" أو أضف لقطة جديدة.',
    tabToday: 'اليوم',
    tabTomorrow: 'الغد',
    tabAllScenes: 'جميع المشاهد',
    shotId: 'رقم اللقطة',
    scene: 'المشهد',
    lens: 'العدسة',
    time: 'الوقت',
    setupDescription: 'وصف الإعداد',
    recording: '● جاري التصوير',
    storyboard: 'ستوري بورد',
    statusDone: 'منتهي',
    statusCurrent: 'الحالي',
    statusNext: 'التالي',
    statusPlanned: 'مخطط',

    // Cast & Crew
    cast: 'الممثلون',
    crew: 'رؤساء الأقسام',
    addCast: 'إضافة ممثل',
    addCrew: 'إضافة طاقم',
    noCast: 'لا يوجد ممثلون بعد.',
    noCrew: 'لا يوجد طاقم بعد.',
    name: 'الاسم',
    role: 'الدور',

    // Status
    statusOnSet: 'في الموقع',
    statusTravel: 'وقت الوصول',
    statusHolding: 'في الانتظار',
    statusWrapped: 'انتهى',
    statusNotCalled: 'لم يُستدعَ',
    statusAtBase: 'في القاعدة',

    // Lighting
    newSetup: 'إعداد جديد',
    noLighting: 'لا توجد إعدادات إضاءة بعد. انقر على "إعداد جديد" للإضافة.',
    units: 'الوحدات',
    colorTemp: 'درجة اللون',
    setupTime: 'وقت الإعداد',
    label: 'الاسم',
    id: 'الرمز',
    newLightingSetup: 'إعداد إضاءة جديد',
    saveSetup: 'حفظ الإعداد',
    addUnit: 'أضف وحدة، اضغط Enter',
    noUnits: 'لا توجد وحدات.',

    // Breakdown
    aiRebreakdown: 'إعادة تفصيل بالذكاء',
    rebreakdownMsg: 'تم إرسال طلب إعادة التفصيل — ستظهر النتائج في تغذية الذكاء.',
    tabThisWeek: 'هذا الأسبوع',
    tabFullScript: 'النص الكامل',

    // Script screen
    pasteScript: 'لصق النص',
    importFile: 'استيراد ملف',
    extractScenes: 'استخراج المشاهد',
    analysing: 'جارٍ تحليل النص…',
    saveAll: 'حفظ جميع المشاهد',
    saveToBreakdown: 'حفظ في التفصيل',
    scenesInBreakdown: (n) => `${n} ${n === 1 ? 'مشهد' : 'مشاهد'} في التفصيل`,
    noScript: 'الصق النص أعلاه وانقر على "استخراج المشاهد" للبدء.',
    scriptPlaceholder: 'الصق السيناريو هنا...\n\nمثال:\nداخلي. المستودع - نهاراً\n\nتنتقل الكاميرا عبر الرفوف المغبرة.\n\nخارجي. السطح - ليلاً\n\nتبدأ الأمطار في السقوط.',
    extractedScenes: 'المشاهد المستخرجة',
    intExt: 'داخلي/خارجي',
    dayNight: 'نهار/ليل',
    pages: 'الصفحات',
    synopsis: 'الملخص',
    saved: '✓ محفوظ',
    importComingSoon: 'استيراد الملفات قريباً. في الوقت الحالي، الصق النص في تبويب النص.',

    // Stripboard
    unscheduledScenes: 'مشاهد غير مجدولة',
    shootingDays: 'أيام التصوير',
    addDay: 'إضافة يوم',
    noUnscheduled: 'جميع المشاهد مجدولة.',
    noDays: 'لا توجد أيام تصوير بعد. انقر على "إضافة يوم" للبدء.',
    assignToDay: 'تعيين ليوم',
    totalPages: (n) => `${n} صفحات`,
    heavyDay: '⚠ يوم ثقيل',
    removeScene: 'إزالة',
    dayN: (n) => `اليوم ${n}`,
    callTime: 'الاستدعاء',
    wrapTime: 'الانتهاء',

    // Call sheet
    shootingDay: 'يوم التصوير',
    shareLink: 'مشاركة الرابط',
    printPdf: 'طباعة / PDF',
    callSheet: 'ورقة الاستدعاء',
    generalCall: 'الاستدعاء العام',
    estimatedWrap: 'الانتهاء المتوقع',
    scenesToday: 'مشاهد اليوم',
    sceneSchedule: 'جدول المشاهد',
    castCallTimes: 'مواعيد استدعاء الممثلين',
    hodsSection: 'رؤساء الأقسام',
    productionNotes: 'ملاحظات الإنتاج',
    noScenesScheduled: 'لا توجد مشاهد معينة لهذا اليوم.',
    noCastScheduled: 'لا يوجد ممثلون معينون لمشاهد هذا اليوم.',
    noDaysScheduled: 'لا توجد أيام تصوير مجدولة بعد.',
    goToStripboard: 'انتقل إلى لوح التصوير لإنشاء جدول التصوير أولاً.',
    shareComingSoon: 'مشاركة PDF قريباً — استخدم الطباعة للحفظ بصيغة PDF.',

    // View settings
    rolePresets: 'إعدادات الأدوار',
    crewAccessLinks: 'روابط الوصول للطاقم',
    copyAllLinks: 'نسخ جميع الروابط',
    shareAll: 'نسخ جميع الروابط كقائمة',
    generateLink: 'توليد رابط',
    regenerate: 'إعادة التوليد',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    tabsVisible: 'التبويبات المرئية',
    noTokenYet: 'لا يوجد رابط بعد',
    allCastCrew: 'جميع الممثلين والطاقم',
    applyToAll: (role) => `تطبيق على كل ${role}`,

    // Hub extras
    production: 'إنتاج',
    noProjects: 'لا توجد مشاريع بعد',
    noProjectsHint: 'أنشئ إنتاجك الأول في أقل من دقيقتين.',
    clearSearch: 'مسح البحث',
    noResultsFor: (q) => `لا توجد مشاريع تطابق "${q}"`,

    // Common
    save: 'حفظ',
    cancel: 'إلغاء',
    edit: 'تعديل',
    delete: 'حذف',
    add: 'إضافة',
    back: 'رجوع',
    loading: 'جارٍ التحميل…',
    allProjects: '→ جميع المشاريع',
    keyTeam: 'الفريق الأساسي',
    day: 'اليوم',
    more: 'المزيد',
    viewAs: 'عرض كـ',
    searchPlaceholder: 'ابحث عن مشاهد، أشخاص، ملاحظات...',
    noResults: 'لا نتائج لـ',
    results: (n) => `${n} ${n === 1 ? 'نتيجة' : 'نتائج'} · انقر للتنقل`,
    shots: 'اللقطات',
    people: 'الأشخاص',
    startTyping: 'ابدأ الكتابة للبحث في اللقطات والأشخاص والنشاط.',
    loadingData: 'جارٍ تحميل البيانات…',

    // New screens — Phase 3
    casting:      'اختيار الممثلين',
    scriptReader: 'قارئ النص',
    postProd:     'ملاحظات التغطية',
    notepad:      'المفكرة',

    // Budget Phase 3
    editBudget:  'تعديل الميزانية',
    addLine:     'إضافة بند',
    exportCsv:   'تصدير CSV',
    budgetTotal: 'إجمالي الميزانية',
    actualToDate:'الإنفاق الفعلي',
    pace:        'الوتيرة',
    daysComplete:'الأيام المنجزة',
    onTrack:     'على المسار',
    overBudget:  'تجاوز الميزانية',
    deleteLine:  'حذف البند',
    categoryName:'اسم الفئة',

    // Post-production connection
    planned:     'المخطط',
    actual:      'الفعلي',
    coverageGap: 'فجوة التغطية',
    needsPickup: 'يحتاج تصوير إضافي',
    pickupDays:  (n) => `~${n} ${n === 1 ? 'يوم تصوير إضافي' : 'أيام تصوير إضافية'} تقديراً`,
    viewPrePlan: '→ عرض خطة ما قبل الإنتاج',
    plannedShots:'اللقطات المخططة',
    actualCoverage: 'التغطية الفعلية',
    coveragePct: (n) => `${n}% مُغطى`,
    aiCoverageAlert: 'تحليل التغطية بالذكاء',
    noScenesPost:'لا توجد مشاهد. أضف مشاهد في مرحلة ما قبل الإنتاج أولاً.',

    // Notion nav groups
    navGroupProduction:  'الإنتاج',
    navGroupScript:      'النص والتفصيل',
    navGroupManagement:  'الإدارة',
    navGroupSettings:    'الإعدادات',

    // Replay
    replayAI: 'إعادة تنبيه الذكاء',
  },
};

export function t(lang, key, ...args) {
  const strings = translations[lang] || translations.en;
  // Support dot-path access e.g. t(lang, 'short.dashboard')
  if (key.includes('.')) {
    const parts = key.split('.');
    let val = strings;
    for (const p of parts) val = val?.[p];
    if (val === undefined) {
      let fallback = translations.en;
      for (const p of parts) fallback = fallback?.[p];
      val = fallback;
    }
    if (typeof val === 'function') return val(...args);
    return val ?? key;
  }
  const val = strings[key] ?? translations.en[key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}
