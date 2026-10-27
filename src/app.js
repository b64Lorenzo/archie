// Archie - Frontend Application
// Copyright (c) 2026 Lorenzo Zambelli

class ArchiveManager {
  constructor() {
    this.currentPath = '';
    this.files = [];
    this.duplicates = [];
    this.currentPage = 1;
    this.pageSize = 100;
    this.sortColumn = 'name';
    this.sortReverse = false;
    this.searchQuery = '';
    this.filterType = 'All';
    this.selectedFilePath = null;
    this.selectedDupFiles = null;
    this.customTopics = [];
    this.topicSearchQuery = '';
    this.lastStats = null;
    this.topicNames = new Map();
    this.hiddenTopics = new Set();
    this.scanVersion = 0;
    this.recentPaths = [];
    this.currentLanguage = 'en';
    this.autocompleteVisible = false;

    this.i18n = {
      en: {
        ready: 'Ready',
        scanning: 'Scanning...',
        scanFailed: 'Scan failed',
        noDirSelected: 'No directory selected',
        selectDir: 'Select a directory to scan',
        enterPath: 'Enter folder path, or click Browse...',
        browse: 'Browse',
        scan: 'Scan Directory',
        refresh: 'Refresh',
        scanDir: 'Scan',
        files: 'Files',
        folders: 'Folders',
        size: 'Size',
        dupGroups: 'Dup Groups',
        codeFiles: 'Code Files',
        searchFiles: 'Search files...',
        exportCsv: 'Export CSV',
        all: 'All',
        documents: 'Documents',
        code: 'Code',
        media: 'Media',
        archives: 'Archives',
        other: 'Other',
        prev: 'Prev',
        next: 'Next',
        page: 'Page',
        of: 'of',
        name: 'Name',
        type: 'Type',
        modified: 'Modified',
        actions: 'Actions',
        open: 'Open',
        folder: 'Folder',
        rename: 'Rename',
        delete: 'Delete',
        newFile: 'New File',
        newFolder: 'New Folder',
        enterFileName: 'Enter file name:',
        enterFolderName: 'Enter folder name:',
        confirmDelete: 'Delete this file?\n',
        confirmDeleteFolder: 'Delete this folder?\n',
        emptyTree: 'No directory selected',
        treeError: 'Error',
        noFilesFound: 'No files found',
        selectAndScan: 'Select a directory and click Scan to view files',
        clickFindDups: 'Click "Find Duplicates" to scan for duplicate files',
        noDupGroups: 'No duplicate groups',
        deleteFirstCopy: 'Delete first copy',
        openSelected: 'Open Selected',
        copyPaths: 'Copy Paths',
        topics: 'Topics',
        searchTopics: 'Search topics...',
        addTopic: '+ Add Custom Topic',
        scanToSeeTopics: 'Scan a directory to see topic-based organization',
        noTopicMatches: 'No topic matches found',
        deleteTopic: 'Delete topic',
        topicRenamed: 'Topic renamed to',
        topicDeleted: 'Topic deleted',
        customTopicAdded: 'Custom topic added. It will appear on next topic refresh.',
        dupGroupsFound: 'groups found',
        opened: 'Opened',
        openedFolder: 'Opened folder',
        copiedPath: 'Copied path',
        renamedTo: 'Renamed to',
        deleted: 'Deleted',
        largestFiles: 'Largest files',
        reviewLargest: 'Review the ten largest files in this scan. Select a file to inspect it.',
        fileTypeDistribution: 'File type distribution',
        topExtensionsSize: 'Top 10 extensions by size',
        topExtensionsCount: 'Top 10 extensions by count',
        noFiles: 'No files',
        zeroByte: '0 B',
        noData: 'No data',
        duplicates: 'Duplicates',
        home: 'Home',
        filesView: 'Files',
        topicsView: 'Topics',
        duplicateFiles: 'Duplicate Files',
        selectFolderFirst: 'Select a folder first',
        fileCreated: 'File created',
        folderCreated: 'Folder created',
        createFileIn: 'Create file in',
        createFolderIn: 'Create folder in',
        recent: 'Recent',
        language: 'Language',
        enterPathRequired: 'Please enter a directory path',
        editTopicName: 'Edit topic name:',
        enterCustomTopic: 'Enter keyword for custom topic:',
        enterNewName: 'Enter new name:',
        selectDupGroupFirst: 'Select a duplicate group first',
        noFilesInDir: 'No files in this directory.',
        noFilesZeroBytes: 'No files — 0 B',
        loadingTree: 'Loading tree...',
        loadingTopics: 'Loading topics...',
        errorPrefix: 'Error',
        confirmDeleteDup: 'Delete this duplicate file?\n',
        confirmDeleteAllDups: 'Delete ALL {count} copies?\nThis cannot be undone.',
        cannotDeleteLastCopy: 'Cannot delete the last verified copy of a discovered duplicate group',
        dupGroupsFound: 'groups found',
        topicCardTitle: '{topic}',
        fileSize: '{size}',
        locations: 'Locations',
        copyAllPaths: 'Copy All Paths',
        deleteThisCopy: 'Delete This Copy',
        deleteAllCopies: 'Delete All Copies',
        openAllLocations: 'Open All Locations',
        showInExplorer: 'Show in Explorer',
        help: 'Help',
        helpTitle: 'Help - How to Use Archie',
        helpScanning: 'Scanning Directories',
        helpScanningText: 'Home Page (Start): When you first open Archie, you\'ll see a clean screen with a large folder icon. Enter a directory path in the text field or click Browse to select a folder using the native file picker. Then click Scan Directory. Archie will recursively scan the selected folder and all its subfolders. Code directories (node_modules, venv, .git, etc.) are automatically excluded to speed up scanning.',
        helpHomeDashboard: 'Home Dashboard',
        helpHomeDashboardText: 'After scanning, the Home page shows: Stat Cards (total files, folders, size, duplicate groups, code files), File Type Distribution (doughnut chart), and Top 10 Extensions by Size. Use the sidebar to navigate to Files, Duplicates, or Topics.',
        helpFilesView: 'Files View',
        helpFilesViewText: 'The Files page lists all scanned files in a table. You can search, filter by type, sort by columns, navigate pages, and right-click for actions (Open File, Open Folder, Copy Path, Rename, Delete).',
        helpDuplicates: 'Duplicates',
        helpDuplicatesText: 'Click Find Duplicates to scan for duplicate files. Archie compares by size first, then by MD5 hash. Cloud-only files that can\'t be read are automatically skipped. For each group you can Open All, Delete copies, Copy Paths, or Show in Explorer.',
        helpTree: 'Directory Tree',
        helpTreeText: 'The left sidebar shows the directory tree of the scanned folder. You can expand/collapse folders, select items, double-click to scan/open, and right-click for actions.',
        helpTopics: 'Topics',
        helpTopicsText: 'Archie automatically groups files by topic based on folder names and paths. You can search topics, add custom keyword-based topics, rename topics by double-clicking, and delete topics.',
        helpTips: 'General Tips',
        helpTipsText: 'Scan Cache: Scans are cached for 10 minutes. Language: Use the dropdown to switch between English and Italian. Shortcuts: Press Enter to scan, Esc to close menus. Performance: Parallel scanning is used automatically.',
        helpLicense: 'License',
        helpLicenseText: 'Archie is released under the MIT License.',
        settings: 'Settings',
        defaultFolder: 'Default folder',
        defaultFolderPlaceholder: 'Enter default scan folder path...',
        saveSettings: 'Save settings',
        settingsSaved: 'Settings saved',
        cancel: 'Cancel',
      },
      it: {
        ready: 'Pronto',
        scanning: 'Scansione...',
        scanFailed: 'Scansione fallita',
        noDirSelected: 'Nessuna directory selezionata',
        selectDir: 'Seleziona una directory da scansionare',
        enterPath: 'Inserisci il percorso della cartella, o fai clic su Sfoglia...',
        browse: 'Sfoglia',
        scan: 'Scansiona',
        refresh: 'Aggiorna',
        scanDir: 'Scansiona',
        files: 'File',
        folders: 'Cartelle',
        size: 'Dimensione',
        dupGroups: 'Gruppi duplicati',
        codeFiles: 'File codice',
        searchFiles: 'Cerca file...',
        exportCsv: 'Esporta CSV',
        all: 'Tutti',
        documents: 'Documenti',
        code: 'Codice',
        media: 'Media',
        archives: 'Archivi',
        other: 'Altro',
        prev: 'Prec',
        next: 'Succ',
        page: 'Pagina',
        of: 'di',
        name: 'Nome',
        type: 'Tipo',
        modified: 'Modificato',
        actions: 'Azioni',
        open: 'Apri',
        folder: 'Cartella',
        rename: 'Rinomina',
        delete: 'Elimina',
        newFile: 'Nuovo file',
        newFolder: 'Nuova cartella',
        enterFileName: 'Inserisci nome file:',
        enterFolderName: 'Inserisci nome cartella:',
        confirmDelete: 'Eliminare questo file?\n',
        confirmDeleteFolder: 'Eliminare questa cartella?\n',
        emptyTree: 'Nessuna directory selezionata',
        treeError: 'Errore',
        noFilesFound: 'Nessun file trovato',
        selectAndScan: 'Seleziona una directory e clicca Scansiona per vedere i file',
        clickFindDups: 'Clicca "Trova duplicati" per cercare file duplicati',
        noDupGroups: 'Nessun gruppo di duplicati',
        deleteFirstCopy: 'Elimina prima copia',
        openSelected: 'Apri selezionati',
        copyPaths: 'Copia percorsi',
        topics: 'Argomenti',
        searchTopics: 'Cerca argomenti...',
        addTopic: '+ Aggiungi argomento',
        scanToSeeTopics: 'Scansiona una directory per vedere gli argomenti',
        noTopicMatches: 'Nessun argomento corrispondente',
        deleteTopic: 'Elimina argomento',
        topicRenamed: 'Argomento rinominato in',
        topicDeleted: 'Argomento eliminato',
        customTopicAdded: 'Argomento personalizzato aggiunto. Apparira al prossimo aggiornamento.',
        opened: 'Aperto',
        openedFolder: 'Cartella aperta',
        copiedPath: 'Percorso copiato',
        renamedTo: 'Rinominato in',
        deleted: 'Eliminato',
        largestFiles: 'File più grandi',
        reviewLargest: 'Esamina i dieci file più grandi di questa scansione. Seleziona un file per ispezionarlo.',
        fileTypeDistribution: 'Distribuzione per tipo di file',
        topExtensionsSize: 'Top 10 estensioni per dimensione',
        topExtensionsCount: 'Top 10 estensioni per numero',
        noFiles: 'Nessun file',
        zeroByte: '0 B',
        noData: 'Nessun dato',
        duplicates: 'Duplicati',
        home: 'Home',
        filesView: 'File',
        topicsView: 'Argomenti',
        duplicateFiles: 'File duplicati',
        selectFolderFirst: 'Seleziona prima una cartella',
        fileCreated: 'File creato',
        folderCreated: 'Cartella creata',
        createFileIn: 'Crea file in',
        createFolderIn: 'Crea cartella in',
        recent: 'Recenti',
        language: 'Lingua',
        enterPathRequired: 'Inserisci un percorso di directory',
        editTopicName: 'Modifica nome argomento:',
        enterCustomTopic: 'Inserisci parola chiave per argomento personalizzato:',
        enterNewName: 'Inserisci nuovo nome:',
        selectDupGroupFirst: 'Seleziona prima un gruppo di duplicati',
        noFilesInDir: 'Nessun file in questa directory.',
        noFilesZeroBytes: 'Nessun file — 0 B',
        loadingTree: 'Caricamento albero...',
        loadingTopics: 'Caricamento argomenti...',
        errorPrefix: 'Errore',
        confirmDeleteDup: 'Eliminare questo file duplicato?\n',
        confirmDeleteAllDups: 'Eliminare TUTTI {count} copie?\nQuesto non puo essere annullato.',
        cannotDeleteLastCopy: 'Impossibile eliminare l\'ultima copia verificata di un gruppo duplicato',
        dupGroupsFound: 'gruppi trovati',
        topicCardTitle: '{topic}',
        fileSize: '{size}',
        locations: 'Percorsi',
        copyAllPaths: 'Copia tutti i percorsi',
        deleteThisCopy: 'Elimina questa copia',
        deleteAllCopies: 'Elimina tutte le copie',
        openAllLocations: 'Apri tutte le posizioni',
        showInExplorer: 'Mostra in Explorer',
        help: 'Aiuto',
        helpTitle: 'Aiuto - Come usare Archie',
        helpScanning: 'Scansione delle directory',
        helpScanningText: 'Home Page (Inizio): Quando apri Archie per la prima volta, vedrai una schermata pulita con una grande icona di cartella. Inserisci il percorso di una directory nel campo di testo o fai clic su Sfoglia per selezionare una cartella. Poi clicca Scansiona. Archie scansionerà ricorsivamente la cartella selezionata e tutte le sottocartelle. Le directory di codice (node_modules, venv, .git, ecc.) vengono automaticamente escluse per velocizzare la scansione.',
        helpHomeDashboard: 'Home Dashboard',
        helpHomeDashboardText: 'Dopo la scansione, la Home page mostra: Stat Cards (file totali, cartelle, dimensione, gruppi duplicati, file codice), Distribuzione per tipo di file (grafico a ciambella) e Top 10 estensioni per dimensione. Usa la barra laterale per navigare a File, Duplicati o Argomenti.',
        helpFilesView: 'Visualizzazione File',
        helpFilesViewText: 'La pagina File elenca tutti i file scansionati in una tabella. Puoi cercare, filtrare per tipo, ordinare per colonne, navigare le pagine e fare clic destro per azioni (Apri file, Apri cartella, Copia percorso, Rinomina, Elimina).',
        helpDuplicates: 'Duplicati',
        helpDuplicatesText: 'Clicca Trova duplicati per scansionare i file duplicati. Archie confronta prima per dimensione, poi per hash MD5. I file solo cloud non leggibili vengono saltati. Per ogni gruppo puoi Apri tutti, Elimina copie, Copia percorsi o Mostra in Explorer.',
        helpTree: 'Albero directory',
        helpTreeText: 'La barra laterale sinistra mostra l\'albero della directory scansionata. Puoi espandere/collassare le cartelle, selezionare gli elementi, fare doppio clic per scansionare/aprire e clic destro per le azioni.',
        helpTopics: 'Argomenti',
        helpTopicsText: 'Archie raggruppa automaticamente i file per argomento basandosi sui nomi delle cartelle e sui percorsi. Puoi cercare argomenti, aggiungere argomenti personalizzati basati su parole chiave, rinominare gli argomenti con doppio clic ed eliminarli.',
        helpTips: 'Consigli generali',
        helpTipsText: 'Cache scansione: Le scansioni sono memorizzate per 10 minuti. Lingua: Usa il menu a discesa per passare da Inglese a Italiano. Scorciatoie: Premi Invio per scansionare, Esc per chiudere i menu. Prestazioni: Viene usata automaticamente la scansione parallela.',
        helpLicense: 'Licenza',
        helpLicenseText: 'Archie è rilasciato sotto la licenza MIT.',
        settings: 'Impostazioni',
        defaultFolder: 'Cartella predefinita',
        defaultFolderPlaceholder: 'Inserisci il percorso della cartella predefinita...',
        saveSettings: 'Salva impostazioni',
        settingsSaved: 'Impostazioni salvate',
        cancel: 'Annulla',
      }
    };

    this.init();
  }

  t(key) {
    const lang = this.i18n[this.currentLanguage] || this.i18n.en;
    return lang[key] || key;
  }

  async setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('archive-manager-language', lang);
    this.updateAllTexts();
    // Re-render current view to update dynamic content
    const activePage = document.querySelector('.page.active');
    const view = activePage?.id?.replace('page-', '');
    if (this.currentPath && ['home', 'files', 'duplicates', 'topics'].includes(view)) {
      await this.showPage(view);
    }
    // Re-render help or settings if active
    if (view === 'help') {
      this.renderHelpPage();
    } else if (view === 'settings') {
      this.renderSettingsPage();
    }
  }

  renderHelpPage() {
    const container = document.getElementById('helpContent');
    if (!container) return;
    const t = this.t.bind(this);
    container.innerHTML = `
      <h1 class="help-title">${t('helpTitle')}</h1>
      <div class="help-section">
        <h2>📂 ${t('helpScanning')}</h2>
        <p>${t('helpScanningText')}</p>
      </div>
      <div class="help-section">
        <h2>📊 ${t('helpHomeDashboard')}</h2>
        <p>${t('helpHomeDashboardText')}</p>
      </div>
      <div class="help-section">
        <h2>📄 ${t('helpFilesView')}</h2>
        <p>${t('helpFilesViewText')}</p>
      </div>
      <div class="help-section">
        <h2>⚠️ ${t('helpDuplicates')}</h2>
        <p>${t('helpDuplicatesText')}</p>
      </div>
      <div class="help-section">
        <h2>🌳 ${t('helpTree')}</h2>
        <p>${t('helpTreeText')}</p>
      </div>
      <div class="help-section">
        <h2>🏷️ ${t('helpTopics')}</h2>
        <p>${t('helpTopicsText')}</p>
      </div>
      <div class="help-section">
        <h2>⚙️ ${t('helpTips')}</h2>
        <p>${t('helpTipsText')}</p>
      </div>
      <div class="help-section">
        <h2>📜 ${t('helpLicense')}</h2>
        <p>${t('helpLicenseText')}</p>
      </div>
    `;
  }

  renderSettingsPage() {
    const defaultFolderInput = document.getElementById('defaultFolderInput');
    const languageSelect = document.getElementById('settingsLanguageSelect');
    if (!defaultFolderInput || !languageSelect) return;
    const settings = this.loadSettings();
    defaultFolderInput.value = settings.defaultFolder || '';
    languageSelect.value = settings.language || 'en';
  }

  loadSettings() {
    try {
      const raw = localStorage.getItem('archie-settings');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  saveSettings() {
    const defaultFolderInput = document.getElementById('defaultFolderInput');
    const languageSelect = document.getElementById('settingsLanguageSelect');
    if (!defaultFolderInput || !languageSelect) return;
    const settings = {
      defaultFolder: defaultFolderInput.value.trim(),
      language: languageSelect.value,
    };
    localStorage.setItem('archie-settings', JSON.stringify(settings));
    if (settings.language && settings.language !== this.currentLanguage) {
      this.setLanguage(settings.language);
    }
    const savedText = document.getElementById('settingsSavedText');
    if (savedText) {
      savedText.style.opacity = '1';
      setTimeout(() => { savedText.style.opacity = '0'; }, 2000);
    }
  }

  getDefaultFolder() {
    const settings = this.loadSettings();
    return settings.defaultFolder || '';
  }

  updateAllTexts() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const prefix = el.getAttribute('data-i18n-prefix') || '';
      const suffix = el.getAttribute('data-i18n-suffix') || '';
      if (prefix || suffix) {
        el.textContent = prefix + this.t(key) + suffix;
      } else {
        el.textContent = this.t(key);
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
    });

    // Update canvas aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', this.t(el.getAttribute('data-i18n-aria')));
    });

    // Update filter select options
    const filterSelect = document.getElementById('filterSelect');
    if (filterSelect) {
      const optionMap = { All: 'all', Documents: 'documents', Code: 'code', Media: 'media', Archives: 'archives', Other: 'other' };
      Array.from(filterSelect.options).forEach(opt => {
        if (optionMap[opt.value]) {
          opt.textContent = this.t(optionMap[opt.value]);
        }
      });
    }
  }

  init() {
    // Load saved language
    const savedLang = localStorage.getItem('archive-manager-language');
    if (savedLang && (savedLang === 'en' || savedLang === 'it')) {
      this.currentLanguage = savedLang;
      const langSelect = document.getElementById('languageSelect');
      if (langSelect) langSelect.value = savedLang;
    }
    // Load default folder
    const defaultFolder = this.getDefaultFolder();
    if (defaultFolder) {
      const homePathInput = document.getElementById('homePathInput');
      if (homePathInput) homePathInput.value = defaultFolder;
    }
    this.bindEvents();
    this.showPage('home');
    this.updateStatus('Ready');
  }

  // Tauri 2.x compatibility helper
  tauriInvoke(command, args = {}) {
    if (window.__TAURI__ && window.__TAURI__.core && typeof window.__TAURI__.core.invoke === 'function') {
      return window.__TAURI__.core.invoke(command, args);
    }
    return Promise.reject(new Error('Tauri API not available. Please run the desktop app.'));
  }

  bindEvents() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        this.showPage(page);
      });
    });

    // Scan
    document.getElementById('scanBtn').addEventListener('click', () => {
      this.scanDirectory();
    });

    document.getElementById('refreshBtn').addEventListener('click', () => {
      this.scanDirectory(true);
    });

    document.getElementById('browseBtn').addEventListener('click', () => {
      this.browseDirectory();
    });

    // Home page scan/browse
    document.getElementById('homeScanBtn')?.addEventListener('click', () => {
      this.scanDirectory();
    });

    document.getElementById('homeBrowseBtn')?.addEventListener('click', () => {
      this.browseDirectory();
    });

    document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCsv());

    // Search & Filter
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.currentPage = 1;
      this.renderFiles();
    });

    document.getElementById('filterSelect').addEventListener('change', (e) => {
      this.filterType = e.target.value;
      this.currentPage = 1;
      this.renderFiles();
    });

    // Pagination
    document.getElementById('prevPageBtn').addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderFiles();
      }
    });

    document.getElementById('nextPageBtn').addEventListener('click', () => {
      this.currentPage++;
      this.renderFiles();
    });

    document.getElementById('pageSizeSelect').addEventListener('change', (e) => {
      this.pageSize = parseInt(e.target.value);
      this.currentPage = 1;
      this.renderFiles();
    });

    // Table sorting
    document.querySelectorAll('.data-table th[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        const column = th.dataset.sort;
        this.sortFiles(column);
      });
    });

    // Duplicates
    document.getElementById('findDupsBtn').addEventListener('click', () => {
      this.findDuplicates();
    });

    document.getElementById('dupDeleteSelected').addEventListener('click', () => {
      this.dupAction('delete');
    });

    document.getElementById('dupOpenSelected').addEventListener('click', () => {
      this.dupAction('open');
    });

    document.getElementById('dupCopyPaths').addEventListener('click', () => {
      this.dupAction('copyAll');
    });

    // Context menus
    this.setupContextMenus();

    // Tree rows own selection; children are siblings, never nested handlers.
    document.getElementById('directoryTree').addEventListener('click', (event) => {
      const row = event.target.closest('.tree-item');
      if (!row || event.target.closest('.tree-arrow')) return;
      if (row.dataset.type === 'folder') {
        this.selectedFolder = row.dataset.path;
        this.currentPage = 1;
        document.querySelectorAll('.tree-item').forEach(item => item.classList.toggle('selected', item === row));
        this.showPage('files');
      }
    });
    document.getElementById('directoryTree').addEventListener('dblclick', (event) => {
      const row = event.target.closest('.tree-item');
      if (row?.dataset.type === 'file') this.openFile(row.dataset.path);
    });

    // Add custom topic
    document.getElementById('addTopicBtn').addEventListener('click', () => {
      this.addCustomTopic();
    });

    // Topic search
    document.getElementById('topicSearchInput')?.addEventListener('input', (e) => {
      this.topicSearchQuery = e.target.value.toLowerCase();
      this.showTopics();
    });

    // New file/folder buttons
    document.getElementById('newFileBtn')?.addEventListener('click', () => this.createFile());
    document.getElementById('newFolderBtn')?.addEventListener('click', () => this.createFolder());

    // Language selector
    document.getElementById('languageSelect')?.addEventListener('change', (e) => {
      this.setLanguage(e.target.value);
    });

    // Settings page listeners
    document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
      this.saveSettings();
    });
    document.getElementById('browseDefaultFolder')?.addEventListener('click', async () => {
      try {
        const result = await this.tauriInvoke('pick_folder', {});
        if (result && result.length > 0) {
          const input = document.getElementById('defaultFolderInput');
          if (input) input.value = result;
        }
      } catch (error) {
        console.error('browse error:', error);
      }
    });

    // Autocomplete for search and path inputs
    this.setupAutocomplete('searchInput', 'searchAutocomplete');
    this.setupAutocomplete('homePathInput', 'pathAutocomplete');
  }

  setupAutocomplete(inputId, dropdownId) {
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!input || !dropdown) return;

    input.addEventListener('input', () => {
      const query = input.value.trim();
      if (!query) {
        dropdown.style.display = 'none';
        return;
      }
      this.showAutocomplete(inputId, dropdownId, query);
    });

    input.addEventListener('focus', () => {
      const query = input.value.trim();
      if (query) this.showAutocomplete(inputId, dropdownId, query);
    });

    input.addEventListener('blur', () => {
      setTimeout(() => { dropdown.style.display = 'none'; }, 150);
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        this.navigateAutocomplete(dropdownId, e.key);
      }
    });
  }

  async showAutocomplete(inputId, dropdownId, query) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;
    let items = [];
    if (inputId === 'homePathInput') {
      items = this.recentPaths.filter(p => p.toLowerCase().includes(query.toLowerCase()));
    } else {
      try {
        const results = await this.tauriInvoke('search_files', { query, limit: 10 });
        items = results.map(r => r.path);
      } catch {
        items = [];
      }
    }
    if (!items.length) {
      dropdown.style.display = 'none';
      return;
    }
    dropdown.innerHTML = '';
    items.slice(0, 8).forEach(item => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.textContent = item;
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        document.getElementById(inputId).value = item;
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(div);
    });
    dropdown.style.display = 'block';
  }

  navigateAutocomplete(dropdownId, key) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown || dropdown.style.display === 'none') return;
    const items = [...dropdown.querySelectorAll('.autocomplete-item')];
    if (!items.length) return;
    const active = dropdown.querySelector('.autocomplete-item.active');
    let idx = active ? items.indexOf(active) : -1;
    if (key === 'ArrowDown') idx = (idx + 1) % items.length;
    if (key === 'ArrowUp') idx = (idx - 1 + items.length) % items.length;
    if (key === 'Enter' && idx >= 0) {
      items[idx].dispatchEvent(new Event('mousedown'));
      return;
    }
    items.forEach(i => i.classList.remove('active'));
    if (idx >= 0 && idx < items.length) items[idx].classList.add('active');
  }

  setupContextMenus() {
    const contextMenu = document.getElementById('contextMenu');
    const dupContextMenu = document.getElementById('dupContextMenu');
    const treeContextMenu = document.getElementById('treeContextMenu');

    // Hide on click outside
    document.addEventListener('click', (e) => {
      if (!contextMenu.contains(e.target)) {
        contextMenu.classList.remove('show');
      }
      if (!dupContextMenu.contains(e.target)) {
        dupContextMenu.classList.remove('show');
      }
      if (!treeContextMenu.contains(e.target)) {
        treeContextMenu.classList.remove('show');
      }
    });

    // Files table context menu
    document.getElementById('filesTableBody').addEventListener('contextmenu', (e) => {
      const row = e.target.closest('tr');
      if (row && row.dataset.path) {
        e.preventDefault();
        this.selectedFilePath = row.dataset.path;
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
        contextMenu.classList.add('show');
      }
    });

    // Duplicates table context menu
    document.getElementById('duplicatesTableBody').addEventListener('contextmenu', (e) => {
      const row = e.target.closest('tr');
      if (row && row.dataset.files) {
        e.preventDefault();
        this.selectedDupFiles = JSON.parse(row.dataset.files);
        dupContextMenu.style.left = `${e.clientX}px`;
        dupContextMenu.style.top = `${e.clientY}px`;
        dupContextMenu.classList.add('show');
      }
    });

    // Tree view context menu
    document.getElementById('directoryTree').addEventListener('contextmenu', (e) => {
      const item = e.target.closest('.tree-item');
      if (item && item.dataset.path) {
        e.preventDefault();
        this.selectedFilePath = item.dataset.path;
        treeContextMenu.style.left = `${e.clientX}px`;
        treeContextMenu.style.top = `${e.clientY}px`;
        treeContextMenu.classList.add('show');
      }
    });

    // Context menu actions
    contextMenu.querySelectorAll('.context-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const action = item.dataset.action;
        this.handleContextAction(action);
        contextMenu.classList.remove('show');
      });
    });

    dupContextMenu.querySelectorAll('.context-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const action = item.dataset.action;
        this.handleDupContextAction(action);
        dupContextMenu.classList.remove('show');
      });
    });

    treeContextMenu.querySelectorAll('.context-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const action = item.dataset.action;
        this.handleContextAction(action);
        treeContextMenu.classList.remove('show');
      });
    });

    // Double click to open
    document.getElementById('filesTableBody').addEventListener('dblclick', (e) => {
      const row = e.target.closest('tr');
      if (row && row.dataset.path) {
        this.openFile(row.dataset.path);
      }
    });
  }

  async showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    document.getElementById(`page-${page}`)?.classList.add('active');
    document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

    // Toggle home page states
    if (page === 'home') {
      document.body.classList.add('page-home');
      if (this.currentPath) {
        document.body.classList.add('page-home-dashboard');
        this.renderHomeDashboard({ stats: this.lastStats || {} });
      } else {
        document.body.classList.remove('page-home-dashboard');
      }
    } else {
      document.body.classList.remove('page-home', 'page-home-dashboard');
    }

    if (page === 'duplicates') {
      // Do not auto-start duplicate scan; show empty state until user clicks Find Duplicates
      if (!this.duplicatesLoaded) this.showEmptyDuplicates();
    } else if (page === 'topics') {
      this.showTopics();
    } else if (page === 'files') {
      this.renderFiles();
    } else if (page === 'help') {
      this.renderHelpPage();
    } else if (page === 'settings') {
      this.renderSettingsPage();
    }
  }

  async scanDirectory(force = false) {
    if (this.scanning) return;
    const isHome = !this.lastStats;
    const pathInput = document.getElementById(isHome ? 'homePathInput' : 'pathInput');
    const path = pathInput?.value.trim();
    
    if (!path) {
      alert(this.t('enterPathRequired'));
      return;
    }

    this.updateStatus('Scanning...');
    this.scanning = true;
    const controls = ['scanBtn', 'homeScanBtn', 'refreshBtn', 'browseBtn', 'homeBrowseBtn'].map(id => document.getElementById(id));
    controls.forEach(button => button.disabled = true);

    try {
      const result = await this.tauriInvoke('scan_directory', {
        path,
        forceRefresh: force
      });
      console.log('scan result:', result.stats.total_files, 'files,', result.stats.total_folders, 'folders');

      this.currentPath = path;
      this.selectedFolder = path;
      this.files = result.files;
      this.lastStats = result.stats;
      this.scanVersion++;
      this.topicsPromise = null;
      this.duplicates = [];
      this.duplicatesLoaded = false;
      this.selectedDupFiles = null;
      this.currentPage = 1;
      this.addRecentPath(path);
      this.renderStats(result.stats);
      this.renderSidebarTree();

      // After scan, show home dashboard with stats and chart
      this.renderHomeDashboard(result);
      this.showPage('home');

      this.updateStatus(`Scanned ${result.stats.total_files} files, ${result.stats.total_folders} folders`);
    } catch (error) {
      console.error('Scan error:', error);
      this.updateStatus(`Scan failed: ${error}`);
    } finally {
      this.scanning = false;
      controls.forEach(button => button.disabled = false);
    }
  }

  async browseDirectory() {
    try {
      const path = await this.tauriInvoke('pick_folder', {});
      if (path) {
        const isHome = !this.lastStats;
        const pathInput = document.getElementById(isHome ? 'homePathInput' : 'pathInput');
        if (pathInput) pathInput.value = path;
        this.scanDirectory();
      }
    } catch (error) {
      console.error('Browse error:', error);
    }
  }

  renderStats(stats) {
    document.getElementById('statFiles').textContent = stats.total_files.toLocaleString();
    document.getElementById('statFolders').textContent = stats.total_folders.toLocaleString();
    document.getElementById('statSize').textContent = stats.total_size_human;
    document.getElementById('statDups').textContent = stats.duplicate_groups.toLocaleString();
    document.getElementById('statCode').textContent = stats.code_files.toLocaleString();
  }

  renderTypeChart() {
    const canvas = document.getElementById('typeChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const types = {};
    for (const file of this.files) {
      const key = file.file_type.toString();
      types[key] = (types[key] || 0) + file.size;
    }

    const entries = Object.entries(types).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '13px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(this.t('noData'), width / 2, height / 2);
      return;
    }

    const total = entries.reduce((sum, e) => sum + e[1], 0);
    const summary = document.getElementById('typeSummary');
    summary.replaceChildren(...entries.map(([type, size]) => this.textElement('div', `${type}: ${this.formatSize(size)} (${total ? (size / total * 100).toFixed(1) : '0.0'}%)`)));
    if (!total) {
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '14px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.files.length} files · 0 B — no size data`, width / 2, height / 2);
      return;
    }
    const colors = {
      'Documents': '#5b9bd5',
      'Code': '#4ec9b0',
      'Media': '#c586c0',
      'Archives': '#e5c07b',
      'Other': '#6a6a7a'
    };

    const cx = width / 3;
    const cy = height / 2;
    const outerRadius = Math.min(width, height) / 2 - 28;
    const innerRadius = outerRadius * 0.55;

    let startAngle = -Math.PI / 2;

    entries.forEach(([type, size]) => {
      const slice = (size / total) * Math.PI * 2;
      
      // Draw segment
      ctx.beginPath();
      ctx.arc(cx, cy, outerRadius, startAngle, startAngle + slice);
      ctx.arc(cx, cy, innerRadius, startAngle + slice, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = colors[type] || '#6a6a7a';
      ctx.fill();
      
      // Subtle border between segments
      ctx.strokeStyle = '#0a0a0f';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle += slice;
    });

    // Center text
    ctx.fillStyle = '#f0f0f5';
    ctx.font = 'bold 16px Segoe UI';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.files.length.toLocaleString(), cx, cy - 8);
    ctx.font = '11px Segoe UI';
    ctx.fillStyle = '#a0a0b0';
    ctx.fillText('files', cx, cy + 10);

    // Legend on the right
    const legendX = width - 110;
    let legendY = 16;
    entries.forEach(([type, size]) => {
      const pct = ((size / total) * 100).toFixed(1);
      
      // Color dot
      ctx.beginPath();
      ctx.arc(legendX + 6, legendY + 6, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors[type] || '#6a6a7a';
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#f0f0f5';
      ctx.font = '11px Segoe UI';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${type} ${pct}%`, legendX + 16, legendY + 7);
      
      legendY += 18;
    });
  }

  renderHomeDashboard(result) {
    // Show dashboard state, hide entry card
    document.getElementById('homeEntry').style.display = 'none';
    document.getElementById('homeDashboard').style.display = 'flex';
    document.body.classList.add('page-home-dashboard');

    // Update top bar path
    const pathInput = document.getElementById('pathInput');
    if (pathInput) pathInput.value = this.currentPath;

    const largest = document.getElementById('largestFiles');
    largest.replaceChildren(...[...this.files].sort((a, b) => b.size - a.size).slice(0, 10).map(file => {
      const button = this.actionButton(`${file.name} — ${this.formatSize(file.size)}`, () => {
        this.selectedFolder = this.currentPath;
        this.searchQuery = file.path;
        this.filterType = 'All';
        this.currentPage = 1;
        document.getElementById('searchInput').value = file.path;
        document.getElementById('filterSelect').value = 'All';
        this.showPage('files');
      });
      button.title = file.path;
      return button;
    }));
    if (!this.files.length) {
      largest.textContent = this.t('noFilesInDir');
      document.getElementById('typeSummary').textContent = this.t('noFilesZeroBytes');
    }
    // Render charts after a brief delay to ensure layout is computed
    requestAnimationFrame(() => {
      this.renderTypeChart();
      this.renderExtChart();
      this.renderExtCountChart();
    });
  }

  renderExtChart() {
    const canvas = document.getElementById('extChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Aggregate size by extension
    const extMap = new Map();
    for (const file of this.files) {
      const ext = file.extension || 'none';
      extMap.set(ext, (extMap.get(ext) || 0) + file.size);
    }

    const entries = Array.from(extMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (entries.length === 0) {
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '13px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(this.t('noData'), width / 2, height / 2);
      return;
    }

    const maxVal = entries[0][1] || 1;
    const barHeight = 22;
    const gap = 10;
    const startY = 20;
    const leftMargin = 70;
    const chartWidth = width - leftMargin - 80;

    entries.forEach(([ext, size], i) => {
      const y = startY + i * (barHeight + gap);
      const barW = (size / maxVal) * chartWidth;

      // Label
      ctx.fillStyle = '#f0f0f5';
      ctx.font = '12px Segoe UI';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`.${ext}`, leftMargin - 10, y + barHeight / 2);

      // Bar background
      ctx.fillStyle = '#1e1e2a';
      ctx.beginPath();
      ctx.roundRect(leftMargin, y, chartWidth, barHeight, 4);
      ctx.fill();

      // Bar fill
      const gradient = ctx.createLinearGradient(leftMargin, 0, leftMargin + barW, 0);
      gradient.addColorStop(0, '#5b9bd5');
      gradient.addColorStop(1, '#4a8ac4');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(leftMargin, y, Math.max(barW, 4), barHeight, 4);
      ctx.fill();

      // Size label
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '11px Segoe UI';
      ctx.textAlign = 'left';
      ctx.fillText(this.formatSize(size), leftMargin + barW + 8, y + barHeight / 2);
    });
  }

  renderExtCountChart() {
    const canvas = document.getElementById('extCountChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Aggregate count by extension
    const extMap = new Map();
    for (const file of this.files) {
      const ext = file.extension || 'none';
      extMap.set(ext, (extMap.get(ext) || 0) + 1);
    }

    const entries = Array.from(extMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (entries.length === 0) {
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '13px Segoe UI';
      ctx.textAlign = 'center';
      ctx.fillText(this.t('noData'), width / 2, height / 2);
      return;
    }

    const maxVal = entries[0][1] || 1;
    const barHeight = 22;
    const gap = 10;
    const startY = 20;
    const leftMargin = 70;
    const chartWidth = width - leftMargin - 80;

    entries.forEach(([ext, count], i) => {
      const y = startY + i * (barHeight + gap);
      const barW = (count / maxVal) * chartWidth;

      // Label
      ctx.fillStyle = '#f0f0f5';
      ctx.font = '12px Segoe UI';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`.${ext}`, leftMargin - 10, y + barHeight / 2);

      // Bar background
      ctx.fillStyle = '#1e1e2a';
      ctx.beginPath();
      ctx.roundRect(leftMargin, y, chartWidth, barHeight, 4);
      ctx.fill();

      // Bar fill
      const gradient = ctx.createLinearGradient(leftMargin, 0, leftMargin + barW, 0);
      gradient.addColorStop(0, '#4ec9b0');
      gradient.addColorStop(1, '#3ba898');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(leftMargin, y, Math.max(barW, 4), barHeight, 4);
      ctx.fill();

      // Count label
      ctx.fillStyle = '#a0a0b0';
      ctx.font = '11px Segoe UI';
      ctx.textAlign = 'left';
      ctx.fillText(count.toLocaleString(), leftMargin + barW + 8, y + barHeight / 2);
    });
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  resetHomeEntry() {
    document.getElementById('homeEntry').style.display = 'flex';
    document.getElementById('homeDashboard').style.display = 'none';
    document.body.classList.remove('page-home-dashboard');
    document.getElementById('homePathInput').value = '';
    this.renderRecentPaths();
  }

  addRecentPath(path) {
    this.recentPaths = this.recentPaths.filter(p => p !== path);
    this.recentPaths.unshift(path);
    if (this.recentPaths.length > 8) this.recentPaths.length = 8;
  }

  renderRecentPaths() {
    const container = document.getElementById('recentPaths');
    if (!container) return;
    container.innerHTML = '';
    if (!this.recentPaths.length) {
      container.style.display = 'none';
      return;
    }
    container.style.display = 'flex';
    const label = this.textElement('span', 'Recent:', 'recent-label');
    container.appendChild(label);
    this.recentPaths.forEach(path => {
      const chip = this.textElement('button', path, 'btn btn-small btn-secondary recent-chip');
      chip.type = 'button';
      chip.title = path;
      chip.addEventListener('click', () => {
        document.getElementById('homePathInput').value = path;
        this.scanDirectory();
      });
      container.appendChild(chip);
    });
  }

  async renderTree() {
    const treeContainer = document.getElementById('treeView');
    treeContainer.innerHTML = '<div class="empty-state"><div class="empty-text">' + this.t('loadingTree') + '</div></div>';

    try {
      const tree = await this.tauriInvoke('get_tree', {
        path: this.currentPath
      });

      treeContainer.innerHTML = '';
      treeContainer.appendChild(this.buildTreeNode(tree));
    } catch (error) {
      treeContainer.innerHTML = `<div class="empty-state"><div class="empty-text">${this.t('errorPrefix')}: ${this.escapeHtml(error)}</div></div>`;
    }
  }

  buildTreeNode(node) {
    const wrapper = document.createElement('div');
    const row = document.createElement('div');
    row.className = 'tree-item';
    row.dataset.path = node.path;
    row.dataset.type = node.type;
    row.tabIndex = 0;
    const arrow = document.createElement('button');
    arrow.className = 'tree-arrow';
    arrow.type = 'button';
    const children = node.children || [];
    arrow.textContent = children.length ? '▶' : '·';
    arrow.disabled = !children.length;
    arrow.setAttribute('aria-label', `Expand ${node.name}`);
    row.append(arrow, document.createTextNode(`${node.type === 'folder' ? '📁' : '📄'} ${node.name}`));
    wrapper.append(row);
    if (children.length) {
      const group = document.createElement('div');
      group.className = 'tree-children';
      group.hidden = true;
      let populated = false;
      arrow.addEventListener('click', () => {
        if (!populated) {
          group.append(...children.map(child => this.buildTreeNode(child)));
          populated = true;
        }
        group.hidden = !group.hidden;
        arrow.textContent = group.hidden ? '▶' : '▼';
        arrow.setAttribute('aria-expanded', String(!group.hidden));
      });
      wrapper.append(group);
    }
    row.addEventListener('keydown', event => {
      if (event.target !== row) return;
      if (event.key === 'Enter') row.click();
      if (event.key === 'ArrowRight' && arrow.getAttribute('aria-expanded') !== 'true') arrow.click();
      if (event.key === 'ArrowLeft' && arrow.getAttribute('aria-expanded') === 'true') arrow.click();
    });
    return wrapper;
  }

  isWithin(path, folder) {
    const normalize = value => value.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
    return !folder || normalize(path).startsWith(normalize(folder) + '/');
  }

  renderFiles() {
    const tbody = document.getElementById('filesTableBody');
    tbody.innerHTML = '';
    console.log('renderFiles called, this.files length:', this.files.length, 'search:', this.searchQuery, 'filter:', this.filterType);

    const filtered = this.filteredFiles();

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    const pageFiles = filtered.slice(start, end);

    if (pageFiles.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="5">
            <div class="empty-state">
              <div class="empty-icon">📂</div>
              <div class="empty-text">${this.t('noFilesFound')}</div>
            </div>
          </td>
        </tr>
      `;
    } else {
      pageFiles.forEach(file => {
        const row = document.createElement('tr');
        row.dataset.path = file.path;
        for (const value of [file.name, file.file_type, this.formatSize(file.size), file.modified]) {
          row.appendChild(this.textElement('td', value));
        }
        const actions = document.createElement('td');
        for (const [label, method] of [['Open', 'openFile'], ['Folder', 'openFolder'], ['Rename', 'renameFile'], ['Delete', 'deleteFile']]) {
          actions.append(this.actionButton(label, () => this[method](file.path)));
        }
        row.append(actions);
        tbody.appendChild(row);
      });
    }

    document.getElementById('prevPageBtn').disabled = this.currentPage <= 1;
    document.getElementById('nextPageBtn').disabled = this.currentPage >= totalPages;
    document.getElementById('pageInfo').textContent = 
      `${this.t('page')} ${this.currentPage} ${this.t('of')} ${totalPages} (${filtered.length.toLocaleString()} ${this.t('files').toLowerCase()})`;
  }

  filteredFiles() {
    const filtered = this.files.filter(file => {
      const matchesSearch = !this.searchQuery || 
        file.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        file.path.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesFilter = this.filterType === 'All' || 
        file.file_type.toString() === this.filterType;
      
      return matchesSearch && matchesFilter && this.isWithin(file.path, this.selectedFolder);
    });
    console.log('filtered length:', filtered.length);

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[this.sortColumn];
      let bVal = b[this.sortColumn];
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (aVal < bVal) return this.sortReverse ? 1 : -1;
      if (aVal > bVal) return this.sortReverse ? -1 : 1;
      return 0;
    });

    return filtered;
  }

  exportCsv() {
    const files = this.filteredFiles();
    const quote = value => {
      let text = String(value ?? '');
      if (/^[=+@\-\t\r\n]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    };
    const csv = ['Name,Path,Type,Size,Modified', ...files.map(file => [file.name, file.path, file.file_type, file.size, file.modified].map(quote).join(','))].join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'archive-inventory.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.updateStatus(`Exported ${files.length} filtered files`);
  }

  sortFiles(column) {
    if (this.sortColumn === column) {
      this.sortReverse = !this.sortReverse;
    } else {
      this.sortColumn = column;
      this.sortReverse = false;
    }
    this.renderFiles();
  }

  async findDuplicates() {
    this.updateStatus('Finding duplicates...');
    
    try {
      const result = await this.tauriInvoke('find_duplicates', {
        path: this.currentPath
      });

      this.duplicates = result.duplicates;
      this.duplicatesLoaded = true;
      document.getElementById('dupCount').textContent = 
        `${result.total_groups} ${this.t('dupGroupsFound')}`;

      const tbody = document.getElementById('duplicatesTableBody');
      tbody.innerHTML = '';

      if (this.duplicates.length === 0) {
        tbody.innerHTML = `
          <tr class="empty-row">
            <td colspan="5">
              <div class="empty-state">
                <div class="empty-icon">✅</div>
                <div class="empty-text">${this.t('noDupGroups')}</div>
              </div>
            </td>
          </tr>
        `;
      } else {
        this.duplicates.forEach(dup => {
          const row = document.createElement('tr');
          row.dataset.files = JSON.stringify(dup.files);
          row.addEventListener('click', () => {
            document.querySelectorAll('#duplicatesTableBody tr').forEach(item => item.classList.toggle('selected', item === row));
            this.selectedDupFiles = dup.files;
          });
          for (const value of [dup.name, dup.count, this.formatSize(dup.total_size), dup.files.map(file => file.path).join(' | ')]) {
            row.append(this.textElement('td', value));
          }
          const actions = document.createElement('td');
          actions.append(this.actionButton('Open', () => this.dupOpen(dup.files)), this.actionButton('Delete first copy', () => this.dupDelete(dup.files)));
          row.append(actions);
          tbody.appendChild(row);
        });
      }

      this.updateStatus(`Found ${result.total_groups} duplicate groups`);
    } catch (error) {
      console.error('Duplicates error:', error);
      this.updateStatus(`Duplicate scan failed: ${error}`);
    }
  }

  async showTopics() {
    const container = document.getElementById('topicsContainer');
    container.innerHTML = '<div class="empty-state"><div class="empty-text">' + this.t('loadingTopics') + '</div></div>';

    try {
      const version = this.scanVersion;
      if (!this.topicsPromise) this.topicsPromise = this.tauriInvoke('get_topics', {path: this.currentPath}).catch(error => { this.topicsPromise = null; throw error; });
      const result = await this.topicsPromise;
      if (version !== this.scanVersion) return;

      container.innerHTML = '';

      let topics = [...result.topics];

      // Add custom topics from frontend
      for (const keyword of this.customTopics) {
        const matches = this.files.filter(f => 
          f.name.toLowerCase().includes(keyword.toLowerCase()) ||
          f.path.toLowerCase().includes(keyword.toLowerCase())
        );
        if (matches.length > 0) {
          topics.push({
            topic: keyword,
            files: matches.slice(0, 50),
            count: matches.length
          });
        }
      }

      topics = topics.filter(topic => !this.hiddenTopics.has(topic.topic)).map(topic => ({...topic, key: topic.topic, topic: this.topicNames.get(topic.topic) || topic.topic}));

      // Filter by search query
      if (this.topicSearchQuery) {
        topics = topics.filter(t => 
          t.topic.toLowerCase().includes(this.topicSearchQuery) ||
          t.files.some(f => f.name.toLowerCase().includes(this.topicSearchQuery))
        );
      }

      if (topics.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">🏷️</div>
            <div class="empty-text">${this.t('noTopicMatches')}</div>
          </div>
        `;
      } else {
        topics.forEach(topic => {
          const card = document.createElement('div');
          card.className = 'topic-card';
          
          const header = this.textElement('div', '', 'topic-header');
          const title = this.textElement('div', `🏷️ ${topic.topic}`, 'topic-title');
          title.dataset.topic = topic.topic;
          const remove = this.actionButton(this.t('deleteTopic'), () => {});
          remove.classList.add('topic-delete-btn');
          header.append(title, this.textElement('div', `${topic.count} ${this.t('files').toLowerCase()}`, 'topic-count'), remove);
          const list = this.textElement('div', '', 'topic-files');
          for (const file of topic.files) {
            const entry = this.textElement('div', `${file.name} (${this.formatSize(file.size)})`, 'topic-file');
            entry.dataset.path = file.path;
            list.append(entry);
          }
          card.append(header, list);

          // Delete topic button
          const deleteBtn = card.querySelector('.topic-delete-btn');
          deleteBtn.addEventListener('click', () => {
            this.deleteTopic(topic.key, card);
          });

          // Double-click topic title to rename
          const titleEl = card.querySelector('.topic-title');
          titleEl.addEventListener('dblclick', () => {
            this.editTopicTitle(topic.key, titleEl);
          });

          // Double-click file to open
          card.querySelectorAll('.topic-file').forEach(fileEl => {
            fileEl.addEventListener('dblclick', () => {
              this.openFile(fileEl.dataset.path);
            });

            // Right-click context menu for topic files
            fileEl.addEventListener('contextmenu', (e) => {
              e.preventDefault();
              this.selectedFilePath = fileEl.dataset.path;
              const contextMenu = document.getElementById('contextMenu');
              contextMenu.style.left = `${e.clientX}px`;
              contextMenu.style.top = `${e.clientY}px`;
              contextMenu.classList.add('show');
            });
          });

          container.appendChild(card);
        });
      }
    } catch (error) {
      console.error('Topics error:', error);
      container.innerHTML = `<div class="empty-state"><div class="empty-text">${this.t('errorPrefix')}: ${this.escapeHtml(error)}</div></div>`;
    }
  }

  editTopicTitle(oldTopic, element) {
    const newTopic = prompt(this.t('editTopicName'), oldTopic);
    if (newTopic && newTopic !== oldTopic) {
      this.topicNames.set(oldTopic, newTopic);
      element.textContent = `🏷️ ${newTopic}`;
      element.dataset.topic = newTopic;
      this.updateStatus(`Topic renamed to: ${newTopic}`);
    }
  }

  deleteTopic(topicName, cardElement) {
    if (!confirm(`Delete topic "${topicName}"? This will not delete any files.`)) return;
    
    this.hiddenTopics.add(topicName);
    // Remove from custom topics if present
    const idx = this.customTopics.indexOf(topicName);
    if (idx > -1) {
      this.customTopics.splice(idx, 1);
    }
    
    // Remove card with animation
    if (cardElement && cardElement.parentNode) {
      cardElement.style.transition = 'all 0.3s ease';
      cardElement.style.opacity = '0';
      cardElement.style.transform = 'scale(0.9)';
      setTimeout(() => cardElement.remove(), 300);
    }
    
    this.updateStatus(`Topic "${topicName}" deleted`);
  }

  addCustomTopic() {
    const keyword = prompt(this.t('enterCustomTopic'));
    if (keyword && keyword.trim()) {
      const topicName = keyword.trim();
      if (!this.customTopics.includes(topicName)) {
        this.customTopics.push(topicName);
        this.hiddenTopics.delete(topicName);
      }
      this.updateStatus(`Custom topic "${topicName}" added. It will appear on next topic refresh.`);
      this.showTopics();
    }
  }

  async createFile(parentPath) {
    const name = prompt(this.t('enterFileName'));
    if (!name || !name.trim()) return;
    const clean = name.trim();
    if (!parentPath) {
      alert(this.t('selectFolderFirst'));
      return;
    }
    try {
      const path = parentPath.replace(/[\\/]+$/, '') + '/' + clean;
      await this.tauriInvoke('create_file', { path, content: '' });
      this.updateStatus(`${this.t('fileCreated')}: ${clean}`);
      await this.scanDirectory(true);
    } catch (error) {
      alert(error);
    }
  }

  async createFolder(parentPath) {
    const name = prompt(this.t('enterFolderName'));
    if (!name || !name.trim()) return;
    const clean = name.trim();
    if (!parentPath) {
      alert(this.t('selectFolderFirst'));
      return;
    }
    try {
      const path = parentPath.replace(/[\\/]+$/, '') + '/' + clean;
      await this.tauriInvoke('create_folder', { path });
      this.updateStatus(`${this.t('folderCreated')}: ${clean}`);
      await this.scanDirectory(true);
    } catch (error) {
      alert(error);
    }
  }

  async openFile(path) {
    try {
      await this.tauriInvoke('open_file', { path });
      this.updateStatus(`Opened: ${path.split('/').pop()}`);
    } catch (error) {
      console.error('Open file error:', error);
    }
  }

  async openFolder(path) {
    try {
      await this.tauriInvoke('open_folder', { path });
      this.updateStatus(`Opened folder: ${path}`);
    } catch (error) {
      console.error('Open folder error:', error);
    }
  }

  async renameFile(path) {
    const newName = prompt(this.t('enterNewName'), path.split('/').pop());
    if (newName && newName !== path.split('/').pop()) {
      try {
        await this.tauriInvoke('rename_file', {
          oldPath: path,
          newName
        });
        this.updateStatus(`Renamed to: ${newName}`);
        this.scanDirectory(true);
      } catch (error) {
        console.error('Rename error:', error);
      }
    }
  }

  async deleteFile(path, skipConfirm = false) {
    if (!skipConfirm && !confirm(`Delete this file?\n${path}`)) return;
    try {
      await this.tauriInvoke('delete_file', { path });
      this.updateStatus(`Deleted: ${path.split('/').pop()}`);
      this.scanDirectory(true);
    } catch (error) {
      console.error('Delete error:', error);
    }
  }

  handleContextAction(action) {
    if (!this.selectedFilePath) return;

    switch (action) {
      case 'open':
        this.openFile(this.selectedFilePath);
        break;
      case 'openFolder':
        this.openFolder(this.selectedFilePath);
        break;
      case 'copy':
        navigator.clipboard.writeText(this.selectedFilePath);
        this.updateStatus(this.t('copiedPath'));
        break;
      case 'newFile':
        this.createFile(this.selectedFilePath);
        break;
      case 'newFolder':
        this.createFolder(this.selectedFilePath);
        break;
      case 'rename':
        this.renameFile(this.selectedFilePath);
        break;
      case 'delete':
        this.deleteFile(this.selectedFilePath);
        break;
    }
  }

  handleDupContextAction(action) {
    if (!this.selectedDupFiles) return;

    switch (action) {
      case 'open':
        this.openFile(this.selectedDupFiles[0].path);
        break;
      case 'openFolder':
        this.openFolder(this.selectedDupFiles[0].path);
        break;
      case 'copy':
        navigator.clipboard.writeText(this.selectedDupFiles[0].path);
        this.updateStatus('Copied path');
        break;
      case 'copyAll':
        navigator.clipboard.writeText(this.selectedDupFiles.map(f => f.path).join('\n'));
        this.updateStatus(`Copied ${this.selectedDupFiles.length} paths`);
        break;
      case 'delete':
        if (confirm(`Delete this duplicate file?\n${this.selectedDupFiles[0].path}`)) {
          this.deleteFile(this.selectedDupFiles[0].path, true);
          this.findDuplicates();
        }
        break;
      case 'deleteAll':
        if (confirm(`Delete ALL ${this.selectedDupFiles.length} copies?\nThis cannot be undone.`)) {
          Promise.all(this.selectedDupFiles.map(f => this.deleteFile(f.path, true)))
            .then(() => this.findDuplicates());
        }
        break;
      case 'openAll':
        this.selectedDupFiles.forEach(f => this.openFile(f.path));
        break;
      case 'showExplorer':
        this.openFolder(this.selectedDupFiles[0].path);
        break;
    }
  }

  dupAction(action) {
    const selectedRow = document.querySelector('#duplicatesTableBody tr.selected');
    if (!selectedRow) {
      alert(this.t('selectDupGroupFirst'));
      return;
    }

    this.selectedDupFiles = JSON.parse(selectedRow.dataset.files);
    this.handleDupContextAction(action);
  }

  dupOpen(files) {
    this.selectedDupFiles = typeof files === 'string' ? JSON.parse(files) : files;
    this.handleDupContextAction('openAll');
  }

  dupDelete(files) {
    this.selectedDupFiles = typeof files === 'string' ? JSON.parse(files) : files;
    this.handleDupContextAction('delete');
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = bytes / Math.pow(k, i);
    return `${size.toFixed(1)} ${sizes[i]}`;
  }

  showEmptyDuplicates() {
    document.getElementById('dupCount').textContent = '';
    const tbody = document.getElementById('duplicatesTableBody');
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="5">
          <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <div class="empty-text">${this.t('clickFindDups')}</div>
          </div>
        </td>
      </tr>
    `;
  }

  async renderSidebarTree() {
    const treeContainer = document.getElementById('directoryTree');
    const treeLabel = document.getElementById('treeLabel');
    
    if (!this.currentPath) {
      treeContainer.innerHTML = '<div class="empty-state"><div class="empty-text">' + this.t('emptyTree') + '</div></div>';
      if (treeLabel) treeLabel.textContent = this.t('emptyTree');
      return;
    }

    try {
      const tree = await this.tauriInvoke('get_tree', {
        path: this.currentPath
      });
      console.log('tree result:', tree);

      treeContainer.innerHTML = '';
      treeContainer.appendChild(this.buildTreeNode(tree));
      
      // Update label with current directory name
      if (treeLabel) {
        const folderName = this.currentPath.split(/[\\/]/).filter(Boolean).pop() || this.currentPath;
        treeLabel.textContent = folderName;
      }
    } catch (error) {
      console.error('tree error:', error);
      treeContainer.innerHTML = `<div class="empty-state"><div class="empty-text">${this.t('errorPrefix')}: ${this.escapeHtml(error)}</div></div>`;
    }
  }

  escapeHtml(value) {
    const element = this.textElement('span', value);
    return element.innerHTML;
  }

  textElement(tag, text, className = '') {
    const element = document.createElement(tag);
    element.textContent = text ?? '';
    element.className = className;
    return element;
  }

  actionButton(label, action) {
    const button = this.textElement('button', label, 'btn btn-small btn-secondary');
    button.type = 'button';
    button.addEventListener('click', action);
    return button;
  }

  updateStatus(text) {
    document.getElementById('statusText').textContent = text;
  }

  initSidebarResize() {
    const sidebar = document.querySelector('.sidebar');
    const resizeHandle = document.getElementById('sidebarResize');
    if (!sidebar || !resizeHandle) return;

    const STORAGE_KEY = 'archive-manager-sidebar-width';
    const MIN = 180;
    const MAX = 420;
    const DEFAULT = 260;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const w = parseInt(saved, 10);
      if (!Number.isNaN(w)) sidebar.style.width = Math.min(MAX, Math.max(MIN, w)) + 'px';
    }

    let startX = 0;
    let startWidth = 0;
    const onMouseMove = (e) => {
      const dx = e.clientX - startX;
      const newWidth = Math.min(MAX, Math.max(MIN, startWidth + dx));
      sidebar.style.width = newWidth + 'px';
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      resizeHandle.classList.remove('resizing');
      localStorage.setItem(STORAGE_KEY, sidebar.style.width || sidebar.offsetWidth + 'px');
    };

    resizeHandle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startX = e.clientX;
      startWidth = sidebar.offsetWidth;
      resizeHandle.classList.add('resizing');
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }
}

// Initialize app
const app = new ArchiveManager();
app.initSidebarResize();
