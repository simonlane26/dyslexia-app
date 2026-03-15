'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Locale type ─────────────────────────────────────────────────────────────
export type Locale = 'en' | 'fr' | 'de' | 'es';

// ─── Translations ─────────────────────────────────────────────────────────────
const en = {
  // Header
  'header.signIn': 'Sign in',
  'header.upgradePro': '💎 Upgrade to Pro',
  'header.manageSubscription': 'Manage subscription',
  'header.proMember': '✨ Pro Member',
  'header.classDashboard': '📊 Class Dashboard',
  'header.joinSchool': '🏫 Join your school',

  // Toolbar groups
  'toolbar.group.writing': 'Writing Tools',
  'toolbar.group.reading': 'Reading Support',
  'toolbar.group.input': 'Input',
  'toolbar.group.document': 'Document',

  // Toolbar buttons
  'toolbar.rewrite': '✏️ Rewrite',
  'toolbar.simplify': '✨ Simplify',
  'toolbar.readAloud': '🔊 Read Aloud',
  'toolbar.highlight': '🔍 Highlight',
  'toolbar.guide': '📖 Guide',
  'toolbar.dictate': '🎤 Dictate',
  'toolbar.save': 'Save',
  'toolbar.saving': 'Saving...',
  'toolbar.export': 'Export',
  'toolbar.compare': 'Compare',
  'toolbar.mentor': '🤖 Mentor',

  // Word count
  'wordcount.start': 'Start writing...',
  'wordcount.great': 'Great start — {n} words written',
  'wordcount.going': 'Getting going — {n} words written',
  'wordcount.nice': 'Nice work — {n} words written',
  'wordcount.strong': 'Strong effort — {n} words written',
  'wordcount.keep': 'Keep it up — {n} words written',
  'wordcount.saved': 'Saved',

  // Editor
  'editor.placeholder': 'Start writing here...',
  'editor.untitled': 'Untitled Document',

  // Toasts
  'toast.cannotSaveEmpty': 'Cannot save empty document',
  'toast.saved': 'Document saved',
  'toast.saveFailed': 'Failed to save document',
  'toast.newDoc': 'New document created',
  'toast.noTextToSimplify': 'No text to simplify. Please write something first.',
  'toast.noTextToRead': 'No text to read.',
  'toast.noSimplifiedToRead': 'No simplified text to read. Click "Simplify" first.',
  'toast.selectSentenceFirst': 'Select a sentence first to rewrite it!',
  'toast.cantFindSelected': 'Could not find selected text. Please try selecting again.',
  'toast.appliedSuggestion': 'Applied suggestion!',
  'toast.appliedRewrite': 'Applied rewrite!',
  'toast.undo': 'Undo',
  'toast.redo': 'Redo',
  'toast.templateLoaded': 'Template loaded!',
  'toast.presetApplied': 'Preset applied successfully!',
  'toast.noSpeechSupport': "Your browser doesn't support speech recognition.",
  'toast.noSpeechSynth': 'Browser speech synthesis is not supported here.',

  // Confirms
  'confirm.newDoc': 'Create new document? Unsaved changes will be lost.',
  'confirm.clearText': 'Clear all text?',
  'confirm.loadTemplate': 'Load template? Current text will be replaced.',

  // Pro popover
  'pro.rewriteDesc': 'Rewrite lets you find new ways to say what you mean — try different tones until it feels right.',
  'pro.coachDesc': 'Pro helps you write with confidence and structure — gentle tips, no jargon, no red marks.',
  'pro.mentorDesc': 'Your personal writing guide. Helps you start, get unstuck, and build confidence — one question at a time.',
  'pro.unlock': 'Unlock with Pro →',
  'pro.later': 'Maybe later',

  // Feature tips
  'tip.simplify': 'Paste or type anything, then hit this to make it simpler and easier to read.',
  'tip.accessibility': 'Change font, colours, and text size here to make reading easier.',
  'tip.gotIt': 'Got it',

  // Language selector
  'language.label': 'Language',

  // Writing Mentor panel
  'mentor.title': 'Writing Mentor',
  'mentor.proFeatureTitle': 'Writing Mentor is a Pro feature',
  'mentor.subtitle': "Choose one and we'll make a start.",
  'mentor.whatWriting': 'What are you writing today?',
  'mentor.writeItUp': 'Write it up',
  'mentor.writeItUpDesc': "Turn what you've shared into a paragraph",
  'mentor.addToWriting': 'Add to my writing',
  'mentor.added': 'Added to your writing',
  'mentor.startOver': 'Start over',
  'mentor.typeOrSpeak': 'Type or speak your reply…',
  'mentor.listening': 'Listening…',
  'mentor.thinking': 'Thinking…',

  // Writing types
  'writingType.email': 'Email',
  'writingType.essay': 'Essay',
  'writingType.workMessage': 'Work message',
  'writingType.socialPost': 'Social post',
  'writingType.story': 'Story',
  'writingType.notes': 'Notes',
  'writingType.homework': 'Homework',
  'writingType.assignment': 'Assignment',

  // Assignment setup
  'assignment.setupTitle': "What are you working on?",
  'assignment.titlePlaceholder': 'e.g. My summer holiday, The water cycle…',
  'assignment.subtype': 'What type?',
  'assignment.start': 'Start →',
  'assignment.nextSection': 'Next section →',
  'assignment.section': 'Section',
  'assignment.of': 'of',

  // Accessibility drawer
  'a11y.title': '⚙️ Accessibility Settings',
  'a11y.quickActions': 'Quick Actions',
  'a11y.font': 'Font',
  'a11y.bgColor': 'Background Color',
  'a11y.displayMode': 'Display Mode',
  'a11y.ttsVoice': 'Text-to-Speech Voice',
  'a11y.fontSize': 'Font Size: {n}px',
  'a11y.light': '☀️ Light',
  'a11y.dark': '🌙 Dark',
  'a11y.highContrast': 'High Contrast Mode',
  'a11y.reset': 'Reset All Settings',
  'a11y.voice.britishFemale': 'British Female',
  'a11y.voice.britishMale': 'British Male',
  'a11y.voice.americanFemale': 'American Female',
  'a11y.voice.americanMale': 'American Male',
  'a11y.voice.australianFemale': 'Australian Female',
  'a11y.voice.australianMale': 'Australian Male',
};

const fr: typeof en = {
  'header.signIn': 'Se connecter',
  'header.upgradePro': '💎 Passer à Pro',
  'header.manageSubscription': "Gérer l'abonnement",
  'header.proMember': '✨ Membre Pro',
  'header.classDashboard': '📊 Tableau de classe',
  'header.joinSchool': '🏫 Rejoindre votre école',

  'toolbar.group.writing': "Outils d'écriture",
  'toolbar.group.reading': 'Aide à la lecture',
  'toolbar.group.input': 'Saisie',
  'toolbar.group.document': 'Document',

  'toolbar.rewrite': '✏️ Réécrire',
  'toolbar.simplify': '✨ Simplifier',
  'toolbar.readAloud': '🔊 Lire à voix haute',
  'toolbar.highlight': '🔍 Surligner',
  'toolbar.guide': '📖 Guide',
  'toolbar.dictate': '🎤 Dicter',
  'toolbar.save': 'Enregistrer',
  'toolbar.saving': 'Enregistrement…',
  'toolbar.export': 'Exporter',
  'toolbar.compare': 'Comparer',
  'toolbar.mentor': '🤖 Mentor',

  'wordcount.start': 'Commencez à écrire…',
  'wordcount.great': 'Bon début — {n} mots écrits',
  'wordcount.going': "C'est parti — {n} mots écrits",
  'wordcount.nice': 'Bon travail — {n} mots écrits',
  'wordcount.strong': 'Bel effort — {n} mots écrits',
  'wordcount.keep': 'Continuez — {n} mots écrits',
  'wordcount.saved': 'Enregistré',

  'editor.placeholder': 'Commencez à écrire ici…',
  'editor.untitled': 'Document sans titre',

  'toast.cannotSaveEmpty': 'Impossible d\'enregistrer un document vide',
  'toast.saved': 'Document enregistré',
  'toast.saveFailed': "Échec de l'enregistrement",
  'toast.newDoc': 'Nouveau document créé',
  'toast.noTextToSimplify': "Aucun texte à simplifier. Veuillez d'abord écrire quelque chose.",
  'toast.noTextToRead': 'Aucun texte à lire.',
  'toast.noSimplifiedToRead': "Pas de texte simplifié. Cliquez d'abord sur « Simplifier ».",
  'toast.selectSentenceFirst': 'Sélectionnez d\'abord une phrase à réécrire !',
  'toast.cantFindSelected': 'Texte sélectionné introuvable. Veuillez réessayer.',
  'toast.appliedSuggestion': 'Suggestion appliquée !',
  'toast.appliedRewrite': 'Réécriture appliquée !',
  'toast.undo': 'Annuler',
  'toast.redo': 'Rétablir',
  'toast.templateLoaded': 'Modèle chargé !',
  'toast.presetApplied': 'Préréglage appliqué !',
  'toast.noSpeechSupport': "Votre navigateur ne prend pas en charge la reconnaissance vocale.",
  'toast.noSpeechSynth': 'La synthèse vocale du navigateur n\'est pas disponible ici.',

  'confirm.newDoc': 'Créer un nouveau document ? Les modifications non enregistrées seront perdues.',
  'confirm.clearText': 'Effacer tout le texte ?',
  'confirm.loadTemplate': 'Charger ce modèle ? Le texte actuel sera remplacé.',

  'pro.rewriteDesc': 'Réécrire vous aide à trouver de nouvelles façons d\'exprimer vos idées — essayez différents tons.',
  'pro.coachDesc': 'Pro vous aide à écrire avec confiance — conseils simples, sans jargon, sans marques rouges.',
  'pro.mentorDesc': 'Votre guide d\'écriture personnel. Il vous aide à commencer et à avancer — une question à la fois.',
  'pro.unlock': 'Débloquer avec Pro →',
  'pro.later': 'Peut-être plus tard',

  'tip.simplify': "Collez ou saisissez n'importe quoi, puis cliquez pour simplifier.",
  'tip.accessibility': 'Modifiez la police, les couleurs et la taille du texte ici.',
  'tip.gotIt': 'Compris',

  'language.label': 'Langue',

  'mentor.title': "Mentor d'écriture",
  'mentor.proFeatureTitle': "Le Mentor d'écriture est une fonctionnalité Pro",
  'mentor.subtitle': 'Choisissez un type et commençons.',
  'mentor.whatWriting': "Qu'écrivez-vous aujourd'hui ?",
  'mentor.writeItUp': 'Rédiger',
  'mentor.writeItUpDesc': 'Transformer ce que vous avez partagé en paragraphe',
  'mentor.addToWriting': 'Ajouter à mon texte',
  'mentor.added': 'Ajouté à votre texte',
  'mentor.startOver': 'Recommencer',
  'mentor.typeOrSpeak': 'Tapez ou dictez votre réponse…',
  'mentor.listening': 'Écoute en cours…',
  'mentor.thinking': 'Réflexion…',

  'writingType.email': 'E-mail',
  'writingType.essay': 'Dissertation',
  'writingType.workMessage': 'Message professionnel',
  'writingType.socialPost': 'Publication sociale',
  'writingType.story': 'Histoire',
  'writingType.notes': 'Notes',
  'writingType.homework': 'Devoirs',
  'writingType.assignment': 'Devoir guidé',

  'assignment.setupTitle': 'Sur quoi travaillez-vous ?',
  'assignment.titlePlaceholder': 'ex. Mes vacances d\'été, Le cycle de l\'eau…',
  'assignment.subtype': 'Quel type ?',
  'assignment.start': 'Commencer →',
  'assignment.nextSection': 'Section suivante →',
  'assignment.section': 'Section',
  'assignment.of': 'sur',

  // Accessibility drawer
  'a11y.title': "⚙️ Paramètres d'accessibilité",
  'a11y.quickActions': 'Actions rapides',
  'a11y.font': 'Police',
  'a11y.bgColor': 'Couleur de fond',
  'a11y.displayMode': "Mode d'affichage",
  'a11y.ttsVoice': 'Voix de synthèse vocale',
  'a11y.fontSize': 'Taille de police : {n}px',
  'a11y.light': '☀️ Clair',
  'a11y.dark': '🌙 Sombre',
  'a11y.highContrast': 'Mode contraste élevé',
  'a11y.reset': 'Réinitialiser les paramètres',
  'a11y.voice.britishFemale': 'Voix féminine britannique',
  'a11y.voice.britishMale': 'Voix masculine britannique',
  'a11y.voice.americanFemale': 'Voix féminine américaine',
  'a11y.voice.americanMale': 'Voix masculine américaine',
  'a11y.voice.australianFemale': 'Voix féminine australienne',
  'a11y.voice.australianMale': 'Voix masculine australienne',
};

const de: typeof en = {
  'header.signIn': 'Anmelden',
  'header.upgradePro': '💎 Auf Pro upgraden',
  'header.manageSubscription': 'Abonnement verwalten',
  'header.proMember': '✨ Pro-Mitglied',
  'header.classDashboard': '📊 Klassen-Dashboard',
  'header.joinSchool': '🏫 Schule beitreten',

  'toolbar.group.writing': 'Schreibwerkzeuge',
  'toolbar.group.reading': 'Lesehilfe',
  'toolbar.group.input': 'Eingabe',
  'toolbar.group.document': 'Dokument',

  'toolbar.rewrite': '✏️ Umschreiben',
  'toolbar.simplify': '✨ Vereinfachen',
  'toolbar.readAloud': '🔊 Vorlesen',
  'toolbar.highlight': '🔍 Markieren',
  'toolbar.guide': '📖 Anleitung',
  'toolbar.dictate': '🎤 Diktieren',
  'toolbar.save': 'Speichern',
  'toolbar.saving': 'Speichert…',
  'toolbar.export': 'Exportieren',
  'toolbar.compare': 'Vergleichen',
  'toolbar.mentor': '🤖 Mentor',

  'wordcount.start': 'Beginne zu schreiben…',
  'wordcount.great': 'Guter Start — {n} Wörter geschrieben',
  'wordcount.going': 'Es läuft — {n} Wörter geschrieben',
  'wordcount.nice': 'Gute Arbeit — {n} Wörter geschrieben',
  'wordcount.strong': 'Starke Leistung — {n} Wörter geschrieben',
  'wordcount.keep': 'Weiter so — {n} Wörter geschrieben',
  'wordcount.saved': 'Gespeichert',

  'editor.placeholder': 'Beginne hier zu schreiben…',
  'editor.untitled': 'Unbenanntes Dokument',

  'toast.cannotSaveEmpty': 'Leeres Dokument kann nicht gespeichert werden',
  'toast.saved': 'Dokument gespeichert',
  'toast.saveFailed': 'Speichern fehlgeschlagen',
  'toast.newDoc': 'Neues Dokument erstellt',
  'toast.noTextToSimplify': 'Kein Text zum Vereinfachen. Bitte schreibe zuerst etwas.',
  'toast.noTextToRead': 'Kein Text zum Vorlesen.',
  'toast.noSimplifiedToRead': 'Kein vereinfachter Text. Bitte zuerst auf „Vereinfachen" klicken.',
  'toast.selectSentenceFirst': 'Bitte wähle zuerst einen Satz zum Umschreiben!',
  'toast.cantFindSelected': 'Ausgewählter Text nicht gefunden. Bitte erneut versuchen.',
  'toast.appliedSuggestion': 'Vorschlag angewendet!',
  'toast.appliedRewrite': 'Umschreibung angewendet!',
  'toast.undo': 'Rückgängig',
  'toast.redo': 'Wiederholen',
  'toast.templateLoaded': 'Vorlage geladen!',
  'toast.presetApplied': 'Voreinstellung angewendet!',
  'toast.noSpeechSupport': 'Dein Browser unterstützt keine Spracherkennung.',
  'toast.noSpeechSynth': 'Sprachsynthese wird in diesem Browser nicht unterstützt.',

  'confirm.newDoc': 'Neues Dokument erstellen? Nicht gespeicherte Änderungen gehen verloren.',
  'confirm.clearText': 'Gesamten Text löschen?',
  'confirm.loadTemplate': 'Vorlage laden? Der aktuelle Text wird ersetzt.',

  'pro.rewriteDesc': 'Umschreiben hilft dir, neue Wege zu finden, deine Gedanken auszudrücken.',
  'pro.coachDesc': 'Pro hilft dir, selbstbewusst zu schreiben — einfache Tipps, kein Fachjargon.',
  'pro.mentorDesc': 'Dein persönlicher Schreibbegleiter. Hilft dir anzufangen und voranzukommen.',
  'pro.unlock': 'Mit Pro freischalten →',
  'pro.later': 'Vielleicht später',

  'tip.simplify': 'Füge beliebigen Text ein oder tippe ihn, dann klicke zum Vereinfachen.',
  'tip.accessibility': 'Ändere hier Schrift, Farben und Textgröße.',
  'tip.gotIt': 'Verstanden',

  'language.label': 'Sprache',

  'mentor.title': 'Schreibmentor',
  'mentor.proFeatureTitle': 'Schreibmentor ist eine Pro-Funktion',
  'mentor.subtitle': 'Wähle einen Typ und wir fangen an.',
  'mentor.whatWriting': 'Was schreibst du heute?',
  'mentor.writeItUp': 'Ausformulieren',
  'mentor.writeItUpDesc': 'Das Besprochene in einen Absatz verwandeln',
  'mentor.addToWriting': 'Zum Text hinzufügen',
  'mentor.added': 'Zu deinem Text hinzugefügt',
  'mentor.startOver': 'Von vorne beginnen',
  'mentor.typeOrSpeak': 'Tippe oder spreche deine Antwort…',
  'mentor.listening': 'Hört zu…',
  'mentor.thinking': 'Denkt nach…',

  'writingType.email': 'E-Mail',
  'writingType.essay': 'Aufsatz',
  'writingType.workMessage': 'Arbeitsnachricht',
  'writingType.socialPost': 'Social-Media-Post',
  'writingType.story': 'Geschichte',
  'writingType.notes': 'Notizen',
  'writingType.homework': 'Hausaufgaben',
  'writingType.assignment': 'Geführte Aufgabe',

  'assignment.setupTitle': 'Woran arbeitest du?',
  'assignment.titlePlaceholder': 'z.B. Meine Sommerferien, Der Wasserkreislauf…',
  'assignment.subtype': 'Welcher Typ?',
  'assignment.start': 'Starten →',
  'assignment.nextSection': 'Nächster Abschnitt →',
  'assignment.section': 'Abschnitt',
  'assignment.of': 'von',

  // Accessibility drawer
  'a11y.title': '⚙️ Barrierefreiheit',
  'a11y.quickActions': 'Schnellaktionen',
  'a11y.font': 'Schrift',
  'a11y.bgColor': 'Hintergrundfarbe',
  'a11y.displayMode': 'Anzeigemodus',
  'a11y.ttsVoice': 'Text-zu-Sprache-Stimme',
  'a11y.fontSize': 'Schriftgröße: {n}px',
  'a11y.light': '☀️ Hell',
  'a11y.dark': '🌙 Dunkel',
  'a11y.highContrast': 'Hochkontrastmodus',
  'a11y.reset': 'Einstellungen zurücksetzen',
  'a11y.voice.britishFemale': 'Britisch Weiblich',
  'a11y.voice.britishMale': 'Britisch Männlich',
  'a11y.voice.americanFemale': 'Amerikanisch Weiblich',
  'a11y.voice.americanMale': 'Amerikanisch Männlich',
  'a11y.voice.australianFemale': 'Australisch Weiblich',
  'a11y.voice.australianMale': 'Australisch Männlich',
};

const es: typeof en = {
  'header.signIn': 'Iniciar sesión',
  'header.upgradePro': '💎 Actualizar a Pro',
  'header.manageSubscription': 'Gestionar suscripción',
  'header.proMember': '✨ Miembro Pro',
  'header.classDashboard': '📊 Panel de clase',
  'header.joinSchool': '🏫 Unirse a tu escuela',

  'toolbar.group.writing': 'Herramientas de escritura',
  'toolbar.group.reading': 'Ayuda de lectura',
  'toolbar.group.input': 'Entrada',
  'toolbar.group.document': 'Documento',

  'toolbar.rewrite': '✏️ Reescribir',
  'toolbar.simplify': '✨ Simplificar',
  'toolbar.readAloud': '🔊 Leer en voz alta',
  'toolbar.highlight': '🔍 Resaltar',
  'toolbar.guide': '📖 Guía',
  'toolbar.dictate': '🎤 Dictar',
  'toolbar.save': 'Guardar',
  'toolbar.saving': 'Guardando…',
  'toolbar.export': 'Exportar',
  'toolbar.compare': 'Comparar',
  'toolbar.mentor': '🤖 Mentor',

  'wordcount.start': 'Empieza a escribir…',
  'wordcount.great': 'Buen comienzo — {n} palabras escritas',
  'wordcount.going': 'Avanzando — {n} palabras escritas',
  'wordcount.nice': 'Buen trabajo — {n} palabras escritas',
  'wordcount.strong': 'Gran esfuerzo — {n} palabras escritas',
  'wordcount.keep': 'Sigue así — {n} palabras escritas',
  'wordcount.saved': 'Guardado',

  'editor.placeholder': 'Empieza a escribir aquí…',
  'editor.untitled': 'Documento sin título',

  'toast.cannotSaveEmpty': 'No se puede guardar un documento vacío',
  'toast.saved': 'Documento guardado',
  'toast.saveFailed': 'Error al guardar el documento',
  'toast.newDoc': 'Nuevo documento creado',
  'toast.noTextToSimplify': 'No hay texto para simplificar. Escribe algo primero.',
  'toast.noTextToRead': 'No hay texto para leer.',
  'toast.noSimplifiedToRead': 'Sin texto simplificado. Haz clic en «Simplificar» primero.',
  'toast.selectSentenceFirst': '¡Selecciona primero una frase para reescribir!',
  'toast.cantFindSelected': 'No se encontró el texto seleccionado. Intenta seleccionar de nuevo.',
  'toast.appliedSuggestion': '¡Sugerencia aplicada!',
  'toast.appliedRewrite': '¡Reescritura aplicada!',
  'toast.undo': 'Deshacer',
  'toast.redo': 'Rehacer',
  'toast.templateLoaded': '¡Plantilla cargada!',
  'toast.presetApplied': '¡Ajuste aplicado!',
  'toast.noSpeechSupport': 'Tu navegador no admite reconocimiento de voz.',
  'toast.noSpeechSynth': 'La síntesis de voz no está disponible en este navegador.',

  'confirm.newDoc': '¿Crear nuevo documento? Los cambios no guardados se perderán.',
  'confirm.clearText': '¿Borrar todo el texto?',
  'confirm.loadTemplate': '¿Cargar plantilla? El texto actual será reemplazado.',

  'pro.rewriteDesc': 'Reescribir te ayuda a encontrar nuevas formas de expresar lo que piensas.',
  'pro.coachDesc': 'Pro te ayuda a escribir con confianza — consejos simples, sin jerga.',
  'pro.mentorDesc': 'Tu guía de escritura personal. Te ayuda a empezar y a avanzar — una pregunta a la vez.',
  'pro.unlock': 'Desbloquear con Pro →',
  'pro.later': 'Quizás más tarde',

  'tip.simplify': 'Pega o escribe cualquier cosa, luego haz clic para simplificarlo.',
  'tip.accessibility': 'Cambia la fuente, los colores y el tamaño del texto aquí.',
  'tip.gotIt': 'Entendido',

  'language.label': 'Idioma',

  'mentor.title': 'Mentor de escritura',
  'mentor.proFeatureTitle': 'El Mentor de escritura es una función Pro',
  'mentor.subtitle': 'Elige uno y empecemos.',
  'mentor.whatWriting': '¿Qué estás escribiendo hoy?',
  'mentor.writeItUp': 'Redactar',
  'mentor.writeItUpDesc': 'Convertir lo compartido en un párrafo',
  'mentor.addToWriting': 'Añadir a mi texto',
  'mentor.added': 'Añadido a tu texto',
  'mentor.startOver': 'Volver a empezar',
  'mentor.typeOrSpeak': 'Escribe o habla tu respuesta…',
  'mentor.listening': 'Escuchando…',
  'mentor.thinking': 'Pensando…',

  'writingType.email': 'Correo electrónico',
  'writingType.essay': 'Ensayo',
  'writingType.workMessage': 'Mensaje de trabajo',
  'writingType.socialPost': 'Publicación social',
  'writingType.story': 'Historia',
  'writingType.notes': 'Notas',
  'writingType.homework': 'Deberes',
  'writingType.assignment': 'Tarea guiada',

  'assignment.setupTitle': '¿En qué estás trabajando?',
  'assignment.titlePlaceholder': 'ej. Mis vacaciones de verano, El ciclo del agua…',
  'assignment.subtype': '¿Qué tipo?',
  'assignment.start': 'Empezar →',
  'assignment.nextSection': 'Siguiente sección →',
  'assignment.section': 'Sección',
  'assignment.of': 'de',

  // Accessibility drawer
  'a11y.title': '⚙️ Accesibilidad',
  'a11y.quickActions': 'Acciones rápidas',
  'a11y.font': 'Fuente',
  'a11y.bgColor': 'Color de fondo',
  'a11y.displayMode': 'Modo de pantalla',
  'a11y.ttsVoice': 'Voz de texto a voz',
  'a11y.fontSize': 'Tamaño de fuente: {n}px',
  'a11y.light': '☀️ Claro',
  'a11y.dark': '🌙 Oscuro',
  'a11y.highContrast': 'Modo alto contraste',
  'a11y.reset': 'Restablecer ajustes',
  'a11y.voice.britishFemale': 'Voz femenina británica',
  'a11y.voice.britishMale': 'Voz masculina británica',
  'a11y.voice.americanFemale': 'Voz femenina americana',
  'a11y.voice.americanMale': 'Voz masculina americana',
  'a11y.voice.australianFemale': 'Voz femenina australiana',
  'a11y.voice.australianMale': 'Voz masculina australiana',
};

// ─── Type helpers ─────────────────────────────────────────────────────────────
const locales = { en, fr, de, es } as const;
type TranslationKey = keyof typeof en;

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key as string,
});

const STORAGE_KEY = 'dw_language';

// ─── Provider ─────────────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && saved in locales) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>): string => {
      const dict = locales[locale] as Record<string, string>;
      const fallback = locales.en as Record<string, string>;
      const str = dict[key] ?? fallback[key] ?? (key as string);
      return interpolate(str, vars);
    },
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function useLanguage() {
  return useContext(LanguageContext);
}

export function useT() {
  return useContext(LanguageContext).t;
}

// ─── Language selector UI ─────────────────────────────────────────────────────
const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
  es: '🇪🇸',
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  fr: 'FR',
  de: 'DE',
  es: 'ES',
};

export const LANGUAGE_NAMES_FOR_AI: Record<Locale, string> = {
  en: 'English',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
};

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLanguage();
  const allLocales: Locale[] = ['en', 'fr', 'de', 'es'];

  if (compact) {
    // Dropdown-style for small spaces
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.55, whiteSpace: 'nowrap' }}>
          {t('language.label')}:
        </span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {allLocales.map(l => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              title={`${LOCALE_FLAGS[l]} ${LANGUAGE_NAMES_FOR_AI[l]}`}
              style={{
                padding: '3px 7px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: locale === l ? 700 : 500,
                background: locale === l ? '#3b82f6' : 'transparent',
                color: locale === l ? 'white' : 'inherit',
                border: locale === l ? '1px solid #3b82f6' : '1px solid rgba(0,0,0,0.12)',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              {LOCALE_FLAGS[l]} {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Full size for accessibility drawer
  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
        {t('language.label')}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {allLocales.map(l => (
          <button
            key={l}
            type="button"
            onClick={() => setLocale(l)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: locale === l ? 700 : 500,
              background: locale === l ? '#3b82f6' : 'transparent',
              color: locale === l ? 'white' : 'inherit',
              border: locale === l ? '1px solid #3b82f6' : '1px solid rgba(0,0,0,0.15)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{LOCALE_FLAGS[l]}</span>
            <span>{LANGUAGE_NAMES_FOR_AI[l]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
