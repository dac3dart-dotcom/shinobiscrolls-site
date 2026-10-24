import { bookIndex as en } from './bookIndex.en.js';
import { bookIndex as ja } from './bookIndex.ja.js';
import { bookIndex as es } from './bookIndex.es.js';
import { bookIndex as fr } from './bookIndex.fr.js';
import { bookIndex as de } from './bookIndex.de.js';
import { bookIndex as ro } from './bookIndex.ro.js';

// Each entry represents a finished PDF edition supplied independently of the site.
export const languages = [
  { code: 'en', label: 'English', nativeLabel: 'English', pdfPath: '/public/book/en/densetsu-en.pdf', chapterIndex: en, textDirection: 'ltr', pageDirection: 'ltr' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', pdfPath: '/public/book/ja/densetsu-ja.pdf', chapterIndex: ja, textDirection: 'ltr', pageDirection: 'ltr' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', pdfPath: '/public/book/es/densetsu-es.pdf', chapterIndex: es, textDirection: 'ltr', pageDirection: 'ltr' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', pdfPath: '/public/book/fr/densetsu-fr.pdf', chapterIndex: fr, textDirection: 'ltr', pageDirection: 'ltr' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', pdfPath: '/public/book/de/densetsu-de.pdf', chapterIndex: de, textDirection: 'ltr', pageDirection: 'ltr' },
  { code: 'ro', label: 'Romanian', nativeLabel: 'Română', pdfPath: '/public/book/ro/densetsu-ro.pdf', chapterIndex: ro, textDirection: 'ltr', pageDirection: 'ltr' },
];

export const languageByCode = Object.fromEntries(languages.map(language => [language.code, language]));
