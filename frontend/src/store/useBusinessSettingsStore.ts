import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BusinessSettings, AccountInfo, BusinessStats } from '@/types';
import { createPersistOptions } from './storageConfig';

interface BusinessSettingsState {
  // Ayarlar
  settings: BusinessSettings;
  accountInfo: AccountInfo;
  stats: BusinessStats;
  
  // UI State
  isLoading: boolean;
  activeTab: string;
  expandedSections: { [key: string]: boolean };
  
  // Actions
  updateSettings: (updates: Partial<BusinessSettings>) => void;
  updateBasicInfo: (updates: Partial<BusinessSettings['basicInfo']>) => void;
  updateBranding: (updates: Partial<BusinessSettings['branding']>) => void;
  updateStaffCredentials: (staffId: string, credentials: Partial<BusinessSettings['staffCredentials'][keyof BusinessSettings['staffCredentials']]>) => void;
  generateStaffCredentials: (staffId: string, role: 'kitchen' | 'waiter' | 'cashier') => void;
  updateMenuSettings: (updates: Partial<BusinessSettings['menuSettings']>) => void;
  updatePaymentSettings: (updates: Partial<BusinessSettings['paymentSettings']>) => void;
  updateTechnicalSettings: (updates: Partial<BusinessSettings['technicalSettings']>) => void;
  updateCustomerExperience: (updates: Partial<BusinessSettings['customerExperience']>) => void;
  updateNotificationSettings: (updates: Partial<BusinessSettings['notificationSettings']>) => void;
  updateIntegrations: (updates: Partial<BusinessSettings['integrations']>) => void;
  updateSecuritySettings: (updates: Partial<BusinessSettings['securitySettings']>) => void;
  updateBackupSettings: (updates: Partial<BusinessSettings['backupSettings']>) => void;
  updateAccountInfo: (updates: Partial<AccountInfo>) => void;
  
  // UI Actions
  setActiveTab: (tab: string) => void;
  toggleSection: (section: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Utility Actions
  resetSettings: () => void;
  exportSettings: () => void;
  importSettings: (settings: BusinessSettings) => void;
  validateSubdomain: (subdomain: string) => Promise<boolean>;
}

const defaultSettings: BusinessSettings = {
  basicInfo: {
    name: '',
    subdomain: '',
    businessType: 'restaurant',
    description: '',
    slogan: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    wifiPassword: '',
    workingHours: '',
    directionsLink: '',
    googleReviewLink: '',
    facebook: '',
    instagram: '',
    twitter: 'https://twitter.com',
    status: 'active'
  },
  branding: {
    logo: '',
    coverImage: '',
    primaryColor: '#F97316',
    secondaryColor: '#FB923C',
    backgroundColor: '#FFFFFF',
    accentColor: '#F3F4F6',
    theme: 'modern',
    fontFamily: 'Poppins',
    fontSize: 'medium',
    headerStyle: 'gradient',
    loadingMessage: 'Hoş Geldiniz!',
    showLogoOnLoading: true,
    showSloganOnLoading: true,
    showLoadingMessage: true
  },
  staffCredentials: {},
  menuSettings: {
    theme: 'modern',
    language: ['tr'],
    allowTableSelection: true,
    requireCustomerInfo: false,
    showPreparationTime: true,
    enableWaiterCall: true,
    enableBillRequest: true,
    showNutritionInfo: false,
    showAllergens: false,
    enableFavorites: true,
    enableReviews: true,
    autoAcceptOrders: true,
    orderTimeout: 15
  },
  paymentSettings: {
    currency: 'TRY',
    taxRate: 18,
    serviceCharge: 0,
    deliveryFee: 0,
    minOrderAmount: 0,
    maxOrderAmount: 0,
    paymentMethods: ['cash', 'card', 'qr'],
    allowTips: true,
    tipPercentage: [10, 15, 20],
    enableSplitBill: true,
    enableOnlinePayment: false
  },
  technicalSettings: {
    autoOrderNotifications: true,
    orderSoundEnabled: true,
    qrCodeAutoRefresh: true,
    qrCodeRefreshInterval: 30,
    enableAnalytics: true,
    enableBackup: true,
    backupFrequency: 'daily',
    enableMaintenanceMode: false,
    enableApiAccess: false
  },
  customerExperience: {
    enableTableReservation: false,
    enableDelivery: false,
    deliveryRadius: 5,
    deliveryFee: 0,
    minDeliveryAmount: 0,
    enableLoyaltyProgram: false,
    loyaltyPointsPerLira: 1,
    enableCustomerFeedback: true,
    enableSocialLogin: false,
    enableGuestCheckout: true
  },
  notificationSettings: {
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    pushNotifications: true,
    orderConfirmationEmail: true,
    orderReadyNotification: true,
    dailyReportEmail: false,
    weeklyReportEmail: true,
    monthlyReportEmail: true
  },
  integrations: {},
  securitySettings: {
    requireStrongPasswords: true,
    enableTwoFactorAuth: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    enableIpWhitelist: false,
    allowedIps: [],
    enableAuditLog: true
  },
  backupSettings: {
    autoBackup: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    cloudBackup: true,
    localBackup: false
  }
};

const defaultAccountInfo: AccountInfo = {
  name: 'Mete Burcak',
  email: 'gsgmete@gmail.com',
  phone: '5454558097',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactorEnabled: false
};

const defaultStats: BusinessStats = {
  activeCategories: 18,
  activeProducts: 78,
  activeAnnouncements: 5,
  totalProducts: 78,
  totalOrders: 1247,
  monthlyRevenue: 45680,
  averageOrderValue: 36.7,
  customerCount: 1250,
  tableUtilization: 85,
  averagePreparationTime: 12,
  customerSatisfaction: 4.8
};

export const useBusinessSettingsStore = create<BusinessSettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      accountInfo: defaultAccountInfo,
      stats: defaultStats,
      isLoading: false,
      activeTab: 'general',
      expandedSections: {
        general: true,
        branding: false,
        staff: false,
        menu: false,
        payment: false,
        technical: false,
        notifications: false,
        integrations: false,
        security: false,
        backup: false
      },

      // General Settings Actions
      updateSettings: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          ...updates
        }
      })),

      // Basic Info Actions
      updateBasicInfo: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          basicInfo: { ...state.settings.basicInfo, ...updates }
        }
      })),

      // Branding Actions
      updateBranding: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          branding: { ...state.settings.branding, ...updates }
        }
      })),

      // Staff Credentials Actions
      updateStaffCredentials: (staffId, credentials) => set((state) => ({
        settings: {
          ...state.settings,
          staffCredentials: {
            ...state.settings.staffCredentials,
            [staffId]: { ...state.settings.staffCredentials[staffId], ...credentials }
          }
        }
      })),

      generateStaffCredentials: (staffId, role) => {
        const randomId = Math.random().toString(36).substring(2, 8);
        const username = role === 'kitchen' ? `mutfak_${randomId}` : 
                        role === 'waiter' ? `garson_${randomId}` : 
                        `kasa_${randomId}`;
        const password = Math.random().toString(36).substring(2, 10);
        const panelUrl = role === 'kitchen' ? '/business/kitchen' :
                        role === 'waiter' ? '/business/waiter' :
                        '/business/cashier';
        
        set((state) => ({
          settings: {
            ...state.settings,
            staffCredentials: {
              ...state.settings.staffCredentials,
              [staffId]: {
                username,
                password,
                panelUrl,
                isActive: true,
                generated: true,
                lastGenerated: new Date()
              }
            }
          }
        }));
      },

      // Menu Settings Actions
      updateMenuSettings: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          menuSettings: { ...state.settings.menuSettings, ...updates }
        }
      })),

      // Payment Settings Actions
      updatePaymentSettings: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          paymentSettings: { ...state.settings.paymentSettings, ...updates }
        }
      })),

      // Technical Settings Actions
      updateTechnicalSettings: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          technicalSettings: { ...state.settings.technicalSettings, ...updates }
        }
      })),

      // Customer Experience Actions
      updateCustomerExperience: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          customerExperience: { ...state.settings.customerExperience, ...updates }
        }
      })),

      // Notification Settings Actions
      updateNotificationSettings: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          notificationSettings: { ...state.settings.notificationSettings, ...updates }
        }
      })),

      // Integrations Actions
      updateIntegrations: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          integrations: { ...state.settings.integrations, ...updates }
        }
      })),

      // Security Settings Actions
      updateSecuritySettings: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          securitySettings: { ...state.settings.securitySettings, ...updates }
        }
      })),

      // Backup Settings Actions
      updateBackupSettings: (updates) => set((state) => ({
        settings: {
          ...state.settings,
          backupSettings: { ...state.settings.backupSettings, ...updates }
        }
      })),

      // Account Info Actions
      updateAccountInfo: (updates) => set((state) => ({
        accountInfo: { ...state.accountInfo, ...updates }
      })),

      // UI Actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      toggleSection: (section) => set((state) => ({
        expandedSections: {
          ...state.expandedSections,
          [section]: !state.expandedSections[section]
        }
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      // Utility Actions
      resetSettings: () => set({
        settings: defaultSettings,
        accountInfo: defaultAccountInfo
      }),

      exportSettings: () => {
        const { settings } = get();
        const dataStr = JSON.stringify(settings, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `masapp-settings-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      },

      importSettings: (settings) => set({ settings }),

      validateSubdomain: async (subdomain) => {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Basic validation rules
        const validPattern = /^[a-z0-9-]+$/;
        const isValidFormat = validPattern.test(subdomain);
        const isValidLength = subdomain.length >= 3 && subdomain.length <= 20;
        const startsWithLetter = /^[a-z]/.test(subdomain);
        const noConsecutiveHyphens = !/--/.test(subdomain);
        const noStartEndHyphen = !subdomain.startsWith('-') && !subdomain.endsWith('-');
        
        const isValid = isValidFormat && isValidLength && startsWithLetter && noConsecutiveHyphens && noStartEndHyphen;
        
        if (!isValid) {
          return false;
        }
        
        // Simulate some subdomains being taken
        const takenSubdomains = [
          'admin', 'api', 'www', 'mail', 'ftp', 'demo', 'test', 'app', 'mobile', 'web',
          'support', 'help', 'docs', 'blog', 'news', 'shop', 'store', 'market',
          'login', 'register', 'signup', 'signin', 'auth', 'account', 'profile',
          'dashboard', 'panel', 'admin-panel', 'user', 'users', 'customer', 'customers',
          'order', 'orders', 'menu', 'menus', 'product', 'products', 'category', 'categories',
          'restaurant', 'restaurants', 'cafe', 'cafes', 'bar', 'bars', 'pub', 'pubs',
          'food', 'drink', 'drinks', 'beverage', 'beverages', 'kitchen', 'waiter', 'waiters',
          'staff', 'employee', 'employees', 'manager', 'managers', 'owner', 'owners',
          'payment', 'payments', 'billing', 'invoice', 'invoices', 'receipt', 'receipts',
          'report', 'reports', 'analytics', 'stats', 'statistics', 'data', 'export', 'import',
          'settings', 'config', 'configuration', 'preferences', 'options', 'tools', 'utilities',
          'backup', 'backups', 'restore', 'sync', 'synchronize', 'update', 'updates',
          'version', 'versions', 'release', 'releases', 'changelog', 'history', 'log', 'logs',
          'error', 'errors', 'exception', 'exceptions', 'debug', 'debugging', 'test', 'tests',
          'staging', 'development', 'dev', 'production', 'prod', 'live', 'beta', 'alpha',
          'preview', 'draft', 'drafts', 'temp', 'temporary', 'cache', 'cached', 'static',
          'assets', 'images', 'img', 'css', 'js', 'javascript', 'html', 'php', 'python',
          'node', 'nodejs', 'react', 'vue', 'angular', 'svelte', 'next', 'nuxt', 'gatsby',
          'express', 'koa', 'hapi', 'fastify', 'nest', 'nestjs', 'adonis', 'sails',
          'django', 'flask', 'fastapi', 'tornado', 'bottle', 'cherrypy', 'pyramid',
          'rails', 'sinatra', 'hanami', 'grape', 'padrino', 'cuba', 'roda', 'ramaze',
          'spring', 'springboot', 'struts', 'jsf', 'wicket', 'vaadin', 'play', 'akka',
          'laravel', 'symfony', 'codeigniter', 'cakephp', 'zend', 'yii', 'phalcon',
          'asp', 'aspnet', 'mvc', 'webapi', 'core', 'framework', 'dotnet', 'netcore',
          'go', 'golang', 'gin', 'echo', 'fiber', 'iris', 'beego', 'revel', 'martini',
          'rust', 'rustlang', 'actix', 'rocket', 'warp', 'axum', 'tower', 'hyper',
          'swift', 'vapor', 'perfect', 'kitura', 'zewo', 'swifton', 'toucan',
          'kotlin', 'ktor', 'spring', 'vertx', 'javalin', 'micronaut', 'quarkus',
          'scala', 'akka', 'play', 'lift', 'spray', 'http4s', 'finagle', 'twitter',
          'clojure', 'ring', 'compojure', 'luminus', 'pedestal', 'bidi', 'reitit',
          'haskell', 'yesod', 'snap', 'scotty', 'servant', 'wai', 'warp', 'spock',
          'erlang', 'elixir', 'phoenix', 'plug', 'cowboy', 'ranch', 'gen_server',
          'fsharp', 'giraffe', 'suave', 'freya', 'web', 'saturn', 'falco', 'dap',
          'ocaml', 'opium', 'eliom', 'ocsigen', 'cohttp', 'httpaf', 'dream', 'piaf',
          'reason', 'reasonml', 'revery', 'bsb', 'bucklescript', 'melange', 'rescript',
          'elm', 'elmish', 'spa', 'single', 'page', 'application', 'pwa', 'progressive',
          'webapp', 'web-app', 'mobile-app', 'desktop-app', 'native-app', 'hybrid-app',
          'cross-platform', 'crossplatform', 'universal', 'isomorphic', 'ssr', 'csr',
          'spa', 'mpa', 'ssg', 'jamstack', 'headless', 'cms', 'contentful', 'strapi',
          'sanity', 'ghost', 'wordpress', 'drupal', 'joomla', 'magento', 'shopify',
          'woocommerce', 'prestashop', 'opencart', 'oscommerce', 'zencart', 'bigcommerce',
          'squarespace', 'wix', 'webflow', 'framer', 'figma', 'sketch', 'adobe',
          'photoshop', 'illustrator', 'indesign', 'xd', 'experience', 'design',
          'ui', 'ux', 'user-interface', 'user-experience', 'design-system', 'component',
          'library', 'framework', 'boilerplate', 'starter', 'template', 'theme',
          'plugin', 'extension', 'addon', 'module', 'package', 'bundle', 'widget',
          'api', 'rest', 'graphql', 'grpc', 'soap', 'rpc', 'microservice', 'service',
          'serverless', 'lambda', 'function', 'edge', 'cdn', 'cloudflare', 'aws',
          'azure', 'gcp', 'google', 'cloud', 'firebase', 'supabase', 'vercel',
          'netlify', 'heroku', 'railway', 'render', 'fly', 'digitalocean', 'linode',
          'vultr', 'scaleway', 'ovh', 'contabo', 'hetzner', 'aws', 'amazon',
          'microsoft', 'apple', 'meta', 'facebook', 'instagram', 'whatsapp', 'twitter',
          'linkedin', 'youtube', 'tiktok', 'snapchat', 'pinterest', 'reddit', 'discord',
          'slack', 'teams', 'zoom', 'skype', 'telegram', 'signal', 'viber', 'line',
          'wechat', 'qq', 'weibo', 'douyin', 'kuaishou', 'bilibili', 'yandex',
          'baidu', 'naver', 'kakao', 'line', 'rakuten', 'mercari', 'alibaba',
          'taobao', 'tmall', 'jd', 'pinduoduo', 'meituan', 'dianping', 'eleme',
          'uber', 'lyft', 'grab', 'gojek', 'ola', 'bolt', 'taxify', 'free-now',
          'airbnb', 'booking', 'expedia', 'agoda', 'tripadvisor', 'trivago', 'hotels',
          'priceline', 'kayak', 'skyscanner', 'momondo', 'google-flights', 'amadeus',
          'sabre', 'travelport', 'gds', 'crs', 'pms', 'hms', 'pos', 'erp', 'crm',
          'cms', 'lms', 'ecommerce', 'marketplace', 'auction', 'classified', 'directory',
          'listing', 'review', 'rating', 'comment', 'feedback', 'survey', 'poll',
          'quiz', 'test', 'exam', 'assessment', 'evaluation', 'scoring', 'grading',
          'certification', 'badge', 'achievement', 'reward', 'point', 'loyalty',
          'membership', 'subscription', 'billing', 'payment', 'invoice', 'receipt',
          'order', 'cart', 'checkout', 'shipping', 'delivery', 'pickup', 'return',
          'refund', 'exchange', 'warranty', 'guarantee', 'support', 'help', 'faq',
          'documentation', 'guide', 'tutorial', 'tutorials', 'course', 'courses',
          'lesson', 'lessons', 'chapter', 'chapters', 'section', 'sections',
          'article', 'articles', 'post', 'posts', 'page', 'pages', 'content',
          'media', 'image', 'images', 'photo', 'photos', 'picture', 'pictures',
          'video', 'videos', 'audio', 'music', 'song', 'songs', 'podcast', 'podcasts',
          'book', 'books', 'ebook', 'ebooks', 'magazine', 'magazines', 'newspaper',
          'newspapers', 'journal', 'journals', 'publication', 'publications',
          'press', 'news', 'blog', 'blogs', 'forum', 'forums', 'community',
          'social', 'network', 'networking', 'chat', 'messaging', 'email', 'sms',
          'notification', 'notifications', 'alert', 'alerts', 'reminder', 'reminders',
          'calendar', 'event', 'events', 'meeting', 'meetings', 'appointment',
          'appointments', 'schedule', 'scheduling', 'booking', 'reservation',
          'reservations', 'ticket', 'tickets', 'issue', 'issues', 'bug', 'bugs',
          'feature', 'features', 'request', 'requests', 'suggestion', 'suggestions',
          'idea', 'ideas', 'proposal', 'proposals', 'project', 'projects', 'task',
          'tasks', 'todo', 'todos', 'checklist', 'checklists', 'note', 'notes',
          'memo', 'memos', 'document', 'documents', 'file', 'files', 'folder',
          'folders', 'archive', 'archives', 'backup', 'backups', 'sync', 'syncs',
          'update', 'updates', 'upgrade', 'upgrades', 'patch', 'patches', 'fix',
          'fixes', 'hotfix', 'hotfixes', 'release', 'releases', 'version', 'versions',
          'changelog', 'changelogs', 'history', 'histories', 'log', 'logs', 'audit',
          'audits', 'track', 'tracking', 'monitor', 'monitoring', 'analytics',
          'statistics', 'stats', 'metrics', 'kpi', 'kpis', 'dashboard', 'dashboards',
          'report', 'reports', 'insight', 'insights', 'data', 'dataset', 'datasets',
          'database', 'databases', 'db', 'dbs', 'table', 'tables', 'column',
          'columns', 'row', 'rows', 'record', 'records', 'field', 'fields',
          'attribute', 'attributes', 'property', 'properties', 'key', 'keys',
          'value', 'values', 'index', 'indexes', 'query', 'queries', 'search',
          'searches', 'filter', 'filters', 'sort', 'sorts', 'order', 'orders',
          'group', 'groups', 'category', 'categories', 'tag', 'tags', 'label',
          'labels', 'type', 'types', 'class', 'classes', 'object', 'objects',
          'entity', 'entities', 'model', 'models', 'schema', 'schemas', 'structure',
          'structures', 'format', 'formats', 'type', 'types', 'kind', 'kinds',
          'sort', 'sorts', 'variety', 'varieties', 'option', 'options', 'choice',
          'choices', 'selection', 'selections', 'preference', 'preferences',
          'setting', 'settings', 'config', 'configs', 'configuration', 'configurations',
          'parameter', 'parameters', 'argument', 'arguments', 'option', 'options',
          'flag', 'flags', 'switch', 'switches', 'toggle', 'toggles', 'button',
          'buttons', 'link', 'links', 'url', 'urls', 'uri', 'uris', 'endpoint',
          'endpoints', 'route', 'routes', 'path', 'paths', 'directory', 'directories',
          'folder', 'folders', 'file', 'files', 'document', 'documents', 'page',
          'pages', 'section', 'sections', 'part', 'parts', 'component', 'components',
          'module', 'modules', 'package', 'packages', 'bundle', 'bundles', 'library',
          'libraries', 'framework', 'frameworks', 'toolkit', 'toolkits', 'sdk',
          'sdks', 'api', 'apis', 'service', 'services', 'microservice', 'microservices',
          'server', 'servers', 'client', 'clients', 'browser', 'browsers', 'app',
          'apps', 'application', 'applications', 'program', 'programs', 'software',
          'hardware', 'device', 'devices', 'computer', 'computers', 'laptop',
          'laptops', 'desktop', 'desktops', 'mobile', 'mobiles', 'phone', 'phones',
          'smartphone', 'smartphones', 'tablet', 'tablets', 'watch', 'watches',
          'smartwatch', 'smartwatches', 'headphone', 'headphones', 'speaker',
          'speakers', 'camera', 'cameras', 'microphone', 'microphones', 'keyboard',
          'keyboards', 'mouse', 'mice', 'monitor', 'monitors', 'screen', 'screens',
          'display', 'displays', 'tv', 'tvs', 'television', 'televisions', 'radio',
          'radios', 'stereo', 'stereos', 'amplifier', 'amplifiers', 'receiver',
          'receivers', 'tuner', 'tuners', 'equalizer', 'equalizers', 'mixer',
          'mixers', 'console', 'consoles', 'controller', 'controllers', 'joystick',
          'joysticks', 'gamepad', 'gamepads', 'remote', 'remotes', 'charger',
          'chargers', 'battery', 'batteries', 'power', 'adapter', 'adapters',
          'cable', 'cables', 'wire', 'wires', 'cord', 'cords', 'plug', 'plugs',
          'socket', 'sockets', 'outlet', 'outlets', 'switch', 'switches', 'button',
          'buttons', 'knob', 'knobs', 'dial', 'dials', 'lever', 'levers', 'handle',
          'handles', 'grip', 'grips', 'hold', 'holds', 'grab', 'grabs', 'catch',
          'catches', 'snap', 'snaps', 'clip', 'clips', 'pin', 'pins', 'hook',
          'hooks', 'loop', 'loops', 'ring', 'rings', 'circle', 'circles', 'round',
          'rounds', 'square', 'squares', 'triangle', 'triangles', 'rectangle',
          'rectangles', 'oval', 'ovals', 'ellipse', 'ellipses', 'diamond', 'diamonds',
          'star', 'stars', 'heart', 'hearts', 'arrow', 'arrows', 'line', 'lines',
          'curve', 'curves', 'angle', 'angles', 'corner', 'corners', 'edge', 'edges',
          'side', 'sides', 'top', 'tops', 'bottom', 'bottoms', 'left', 'right',
          'front', 'fronts', 'back', 'backs', 'center', 'centers', 'middle',
          'middles', 'inside', 'insides', 'outside', 'outsides', 'inner', 'inners',
          'outer', 'outers', 'upper', 'uppers', 'lower', 'lowers', 'high', 'highs',
          'low', 'lows', 'tall', 'talls', 'short', 'shorts', 'long', 'longs',
          'wide', 'wides', 'narrow', 'narrows', 'thick', 'thicks', 'thin', 'thins',
          'big', 'bigs', 'small', 'smalls', 'large', 'larges', 'huge', 'huges',
          'tiny', 'tinys', 'mini', 'minis', 'micro', 'micros', 'macro', 'macros',
          'mega', 'megas', 'giga', 'gigas', 'tera', 'teras', 'peta', 'petas',
          'exa', 'exas', 'zetta', 'zettas', 'yotta', 'yottas', 'kilo', 'kilos',
          'hecto', 'hectos', 'deca', 'decas', 'deci', 'decis', 'centi', 'centis',
          'milli', 'millis', 'micro', 'micros', 'nano', 'nanos', 'pico', 'picos',
          'femto', 'femtos', 'atto', 'attos', 'zepto', 'zeptos', 'yocto', 'yoctos'
        ];
        
        const isAvailable = !takenSubdomains.includes(subdomain.toLowerCase());
        
        return isValid && isAvailable;
      }
    }),
    {
      name: 'business-settings-storage',
      partialize: (state) => ({
        settings: state.settings,
        accountInfo: state.accountInfo,
        stats: state.stats,
      }),
    }
  )
);

export default useBusinessSettingsStore;
