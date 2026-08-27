/**
 * Al-Mohandess PlayStation Management System - Firebase Realtime Cloud Sync + Local Cache
 * نظام المزامنة السحابية اللحظية (Firebase Realtime Database)
 * يربط جميع الفروع والتليفون واللابتوب في نفس اللحظة فوراً
 */

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDzVKuAx8tBvC3VQGp3XGiPbEjjD2TTyDc",
    authDomain: "system-el-serag-1.firebaseapp.com",
    databaseURL: "https://system-el-serag-1-default-rtdb.firebaseio.com",
    projectId: "system-el-serag-1",
    storageBucket: "system-el-serag-1.firebasestorage.app",
    messagingSenderId: "909135709654",
    appId: "1:909135709654:web:7d0d387b0549fc670c9077",
    measurementId: "G-98VB9JQJ6E"
};

let fbApp = null;
let fbDb = null;
let isCloudConnected = false;

try {
    if (typeof firebase !== 'undefined' && FIREBASE_CONFIG) {
        if (!firebase.apps.length) {
            fbApp = firebase.initializeApp(FIREBASE_CONFIG);
        } else {
            fbApp = firebase.app();
        }
        fbDb = firebase.database();
        isCloudConnected = true;
        console.log("🔥 Firebase Connected for Branch 2 (السراج)!");
    }
} catch (err) {
    console.warn("Firebase local mode active:", err);
}

const STORAGE_KEY_BRANCHES = 'elmohandess_branches_db';
const STORAGE_KEY_INVENTORY = 'elmohandess_inventory_db';
const STORAGE_KEY_INVOICES = 'elmohandess_invoices_db';
const STORAGE_KEY_TRANSFERS = 'elmohandess_transfers_db';
const STORAGE_KEY_SETTINGS = 'elmohandess_settings_db';

// Initial Seed Data
const DEFAULT_BRANCHES = [
    { id: 1, branch_key: 'branch_1', name: 'الفرع الأول', phone: '01012345671', address: 'المقر الرئيسي - الفرع الأول', password: '1111', is_admin: 0 },
    { id: 2, branch_key: 'branch_2', name: 'الفرع الثاني', phone: '01012345672', address: 'الفرع الثاني', password: '2222', is_admin: 0 },
    { id: 3, branch_key: 'branch_3', name: 'الفرع الثالث', phone: '01012345673', address: 'الفرع الثالث', password: '3333', is_admin: 0 },
    { id: 4, branch_key: 'admin', name: 'لوحة المدير العام (السيستم الرابع)', phone: '01000000000', address: 'المركز الرئيسي', password: 'admin123', is_admin: 1 }
];

const DEFAULT_SETTINGS = {
    company_name: 'المهندس لأجهزة وألعاب البلايستيشن',
    company_title: 'المهندس',
    company_phone: '01000000000 / 01100000000',
    default_warranty_terms: 'الضمان يسري ضد عيوب الصناعة من تاريخ الشراء. لا يشمل الكسر أو السوائل أو سوء الاستخدام. الفاتورة أصل الضمان.'
};

const DEFAULT_INVENTORY = [
    { id: 1, branch_id: 1, category: 'ps4', name: 'PlayStation 4 Slim 1TB', model_type: 'Slim', storage: '1TB', system_version: 'معدل 9.00', condition: 'كسر زيرو', color: 'أسود', serial_number: 'PS4-SLM-1001', quantity: 3, buy_price: 11500, sell_price: 13500, included_items: 'دراع أصلي + كابل باور + كابل HDMI + كابل شحن', notes: 'بحالة ممتازة محمل بأحدث الألعاب' },
    { id: 2, branch_id: 1, category: 'ps5', name: 'PlayStation 5 Slim Digital 1TB', model_type: 'Slim Digital', storage: '1TB', system_version: 'أصلي', condition: 'جديد متبرشم', color: 'أبيض', serial_number: 'PS5-DIG-2001', quantity: 2, buy_price: 24000, sell_price: 27500, included_items: 'دراع أصلي DualSense + كابلات أصلية بالكرتونة', notes: 'إصدار الشرق الأوسط' },
    { id: 3, branch_id: 1, category: 'controller_ps4_orig', name: 'دراع PS4 أصلي DualShock 4', model_type: 'DualShock 4', storage: '', system_version: 'أصلي', condition: 'كسر زيرو', color: 'أسود', serial_number: 'CTRL-PS4-O1', quantity: 10, buy_price: 850, sell_price: 1100, included_items: '', notes: 'أصلي' },
    { id: 4, branch_id: 1, category: 'controller_ps4_copy', name: 'دراع PS4 هاي كوبي درجة أولى', model_type: 'High Copy', storage: '', system_version: 'كوبي', condition: 'جديد', color: 'أزرق', serial_number: 'CTRL-PS4-C1', quantity: 15, buy_price: 380, sell_price: 550, included_items: '', notes: 'أعلى خامة كوبي' },
    { id: 5, branch_id: 1, category: 'controller_ps5_orig', name: 'دراع PS5 أصلي DualSense', model_type: 'DualSense', storage: '', system_version: 'أصلي', condition: 'جديد متبرشم', color: 'أبيض', serial_number: 'CTRL-PS5-O1', quantity: 6, buy_price: 2600, sell_price: 3100, included_items: '', notes: 'أصلي توكيل' },
    { id: 6, branch_id: 1, category: 'controller_ps5_copy', name: 'دراع PS5 كوبي درجة أولى', model_type: 'Copy', storage: '', system_version: 'كوبي', condition: 'جديد', color: 'أسود', serial_number: 'CTRL-PS5-C1', quantity: 8, buy_price: 850, sell_price: 1200, included_items: '', notes: 'كوبي ممتاز' },

    // Branch 2 (ID 2)
    { id: 7, branch_id: 2, category: 'ps4', name: 'PlayStation 4 Pro 1TB 4K', model_type: 'Pro', storage: '1TB', system_version: 'أصلي أونلاين', condition: 'مستعمل ممتاز', color: 'أسود', serial_number: 'PS4-PRO-2002', quantity: 2, buy_price: 13000, sell_price: 15500, included_items: '2 دراع أصلي + كابلات + علبة', notes: 'يدعم 4K وسلس جدا' },
    { id: 8, branch_id: 2, category: 'ps5', name: 'PlayStation 5 Fat Disc 825GB', model_type: 'Fat Disc', storage: '825GB', system_version: 'أصلي', condition: 'كسر زيرو', color: 'أبيض', serial_number: 'PS5-FAT-2003', quantity: 1, buy_price: 23000, sell_price: 26000, included_items: 'دراع أصلي + كابل HDMI 2.1', notes: 'نسخة السي دي' },
    { id: 9, branch_id: 2, category: 'controller_ps4_orig', name: 'دراع PS4 أصلي DualShock 4', model_type: 'DualShock 4', storage: '', system_version: 'أصلي', condition: 'جديد', color: 'أحمر', serial_number: 'CTRL-PS4-O2', quantity: 5, buy_price: 900, sell_price: 1200, included_items: '', notes: 'لون مميز' },
    { id: 10, branch_id: 2, category: 'controller_ps4_copy', name: 'دراع PS4 هاي كوبي درجة أولى', model_type: 'High Copy', storage: '', system_version: 'كوبي', condition: 'جديد', color: 'أسود', serial_number: 'CTRL-PS4-C2', quantity: 12, buy_price: 380, sell_price: 550, included_items: '', notes: 'كوبي درجة أولى' },
    { id: 11, branch_id: 2, category: 'controller_ps5_orig', name: 'دراع PS5 أصلي DualSense', model_type: 'DualSense', storage: '', system_version: 'أصلي', condition: 'جديد', color: 'بنفسجي Galactic Purple', serial_number: 'CTRL-PS5-O2', quantity: 4, buy_price: 2700, sell_price: 3200, included_items: '', notes: 'أصلي إصدار ملون' },

    // Branch 3 (ID 3)
    { id: 12, branch_id: 3, category: 'ps4', name: 'PlayStation 4 Fat 500GB', model_type: 'Fat', storage: '500GB', system_version: 'معدل 11.00', condition: 'مستعمل بحالة جيدة', color: 'أسود', serial_number: 'PS4-FAT-3001', quantity: 2, buy_price: 9000, sell_price: 10500, included_items: 'دراع أصلي + دراع كوبي + كابلات', notes: 'محمل 10 ألعاب' },
    { id: 13, branch_id: 3, category: 'ps5', name: 'PlayStation 5 Slim Disc 1TB', model_type: 'Slim Disc', storage: '1TB', system_version: 'أصلي', condition: 'جديد متبرشم', color: 'أبيض', serial_number: 'PS5-SLM-3002', quantity: 3, buy_price: 27000, sell_price: 30500, included_items: 'دراع أصلي + كابلات بالكرتونة', notes: 'ضمان محلي' },
    { id: 14, branch_id: 3, category: 'controller_ps4_orig', name: 'دراع PS4 أصلي DualShock 4', model_type: 'DualShock 4', storage: '', system_version: 'أصلي', condition: 'كسر زيرو', color: 'كاموفلاج Camo', serial_number: 'CTRL-PS4-O3', quantity: 7, buy_price: 880, sell_price: 1150, included_items: '', notes: 'نسخة أصلية مموهة' },
    { id: 15, branch_id: 3, category: 'controller_ps4_copy', name: 'دراع PS4 هاي كوبي درجة أولى', model_type: 'High Copy', storage: '', system_version: 'كوبي', condition: 'جديد', color: 'أبيض', serial_number: 'CTRL-PS4-C3', quantity: 20, buy_price: 380, sell_price: 550, included_items: '', notes: 'كوبي ممتاز' },
    { id: 16, branch_id: 3, category: 'controller_ps5_orig', name: 'دراع PS5 أصلي DualSense', model_type: 'DualSense', storage: '', system_version: 'أصلي', condition: 'جديد', color: 'أسود Midnight Black', serial_number: 'CTRL-PS5-O3', quantity: 5, buy_price: 2600, sell_price: 3100, included_items: '', notes: 'أصلي بالكرتونة' },
    { id: 17, branch_id: 3, category: 'controller_ps5_copy', name: 'دراع PS5 كوبي درجة أولى', model_type: 'Copy', storage: '', system_version: 'كوبي', condition: 'جديد', color: 'أبيض', serial_number: 'CTRL-PS5-C2', quantity: 6, buy_price: 850, sell_price: 1200, included_items: '', notes: 'كوبي درجة أولى' }
];

let isInitialized = false;

const SystemDB = {
    init() {
        if (!localStorage.getItem(STORAGE_KEY_BRANCHES)) {
            localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(DEFAULT_BRANCHES));
        }
        if (!localStorage.getItem(STORAGE_KEY_SETTINGS)) {
            localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        }
        if (!localStorage.getItem(STORAGE_KEY_INVENTORY)) {
            localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
        }
        if (!localStorage.getItem(STORAGE_KEY_INVOICES)) {
            localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify([]));
        }
        if (!localStorage.getItem(STORAGE_KEY_TRANSFERS)) {
            localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify([]));
        }

        // Setup Realtime Cloud Sync Listeners
        if (fbDb && !isInitialized) {
            isInitialized = true;
            this.setupCloudSync();
        }
    },

    notifyUI() {
        window.dispatchEvent(new CustomEvent('system-db-updated'));
    },

    setupCloudSync() {
        if (!fbDb) return;

        // 1. Inventory Sync
        fbDb.ref('inventory').on('value', snapshot => {
            const data = snapshot.val();
            if (data && Array.isArray(data)) {
                localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(data));
                this.notifyUI();
            } else if (data === null) {
                // Seed cloud with initial data
                const current = JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY) || JSON.stringify(DEFAULT_INVENTORY));
                fbDb.ref('inventory').set(current);
            }
        });

        // 2. Invoices Sync
        fbDb.ref('invoices').on('value', snapshot => {
            const data = snapshot.val();
            if (data && Array.isArray(data)) {
                localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(data));
                this.notifyUI();
            } else if (data === null) {
                const current = JSON.parse(localStorage.getItem(STORAGE_KEY_INVOICES) || '[]');
                fbDb.ref('invoices').set(current);
            }
        });

        // 3. Settings Sync
        fbDb.ref('settings').on('value', snapshot => {
            const data = snapshot.val();
            if (data && typeof data === 'object') {
                localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data));
                this.notifyUI();
            } else if (data === null) {
                const current = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
                fbDb.ref('settings').set(current);
            }
        });

        // 4. Branches Sync
        fbDb.ref('branches').on('value', snapshot => {
            const data = snapshot.val();
            if (data && Array.isArray(data)) {
                localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(data));
                this.notifyUI();
            } else if (data === null) {
                const current = JSON.parse(localStorage.getItem(STORAGE_KEY_BRANCHES) || JSON.stringify(DEFAULT_BRANCHES));
                fbDb.ref('branches').set(current);
            }
        });

        // 5. Transfers Sync
        fbDb.ref('transfers').on('value', snapshot => {
            const data = snapshot.val();
            if (data && Array.isArray(data)) {
                localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(data));
                this.notifyUI();
            } else if (data === null) {
                const current = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSFERS) || '[]');
                fbDb.ref('transfers').set(current);
            }
        });
    },

    pushToCloud(key, data) {
        if (fbDb) {
            try {
                fbDb.ref(key).set(data);
            } catch (e) {
                console.error("Cloud push failed:", e);
            }
        }
    },

    // Auth
    getBranches() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEY_BRANCHES) || '[]');
    },

    getBranchById(id) {
        return this.getBranches().find(b => b.id === Number(id));
    },

    login(branchId, password) {
        const branch = this.getBranchById(branchId);
        if (!branch) return { success: false, message: 'الفرع غير موجود' };
        if (branch.password !== password) return { success: false, message: 'كلمة المرور غير صحيحة' };
        return { success: true, user: branch };
    },

    updateBranchPassword(branchId, newPass) {
        const branches = this.getBranches();
        const idx = branches.findIndex(b => b.id === Number(branchId));
        if (idx > -1) {
            branches[idx].password = newPass;
            localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(branches));
            this.pushToCloud('branches', branches);
            return true;
        }
        return false;
    },

    // Settings
    getSettings() {
        this.init();
        return JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
    },

    saveSettings(newSettings) {
        const current = this.getSettings();
        const updated = { ...current, ...newSettings };
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
        this.pushToCloud('settings', updated);
        return updated;
    },

    // Inventory
    getInventory(branchId = null, category = 'all', search = '') {
        this.init();
        let items = JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY) || '[]');
        if (branchId) {
            items = items.filter(i => i.branch_id === Number(branchId));
        }
        if (category && category !== 'all') {
            items = items.filter(i => i.category === category);
        }
        if (search) {
            const term = search.toLowerCase().trim();
            items = items.filter(i => 
                (i.name && i.name.toLowerCase().includes(term)) ||
                (i.serial_number && i.serial_number.toLowerCase().includes(term)) ||
                (i.storage && i.storage.toLowerCase().includes(term)) ||
                (i.notes && i.notes.toLowerCase().includes(term))
            );
        }
        return items;
    },

    addInventoryItem(item) {
        this.init();
        const items = JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY) || '[]');
        const nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        const newItem = {
            id: nextId,
            branch_id: Number(item.branch_id),
            category: item.category,
            name: item.name,
            model_type: item.model_type || '',
            storage: item.storage || '',
            system_version: item.system_version || '',
            condition: item.condition || 'مستعمل',
            color: item.color || '',
            serial_number: item.serial_number || '',
            quantity: Number(item.quantity) || 1,
            buy_price: Number(item.buy_price) || 0,
            sell_price: Number(item.sell_price) || 0,
            included_items: item.included_items || '',
            notes: item.notes || ''
        };
        items.push(newItem);
        localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));
        this.pushToCloud('inventory', items);
        return newItem;
    },

    updateInventoryItem(id, data) {
        this.init();
        const items = JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY) || '[]');
        const idx = items.findIndex(i => i.id === Number(id));
        if (idx > -1) {
            items[idx] = { ...items[idx], ...data, id: Number(id) };
            localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));
            this.pushToCloud('inventory', items);
            return items[idx];
        }
        return null;
    },

    deleteInventoryItem(id) {
        this.init();
        let items = JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY) || '[]');
        items = items.filter(i => i.id !== Number(id));
        localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));
        this.pushToCloud('inventory', items);
        return true;
    },

    adjustStock(id, delta) {
        this.init();
        const items = JSON.parse(localStorage.getItem(STORAGE_KEY_INVENTORY) || '[]');
        const idx = items.findIndex(i => i.id === Number(id));
        if (idx > -1) {
            items[idx].quantity = Math.max(0, items[idx].quantity + Number(delta));
            localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(items));
            this.pushToCloud('inventory', items);
            return items[idx].quantity;
        }
        return null;
    },

    // Invoices
    getInvoices(branchId = null, search = '') {
        this.init();
        let invoices = JSON.parse(localStorage.getItem(STORAGE_KEY_INVOICES) || '[]');
        if (branchId) {
            invoices = invoices.filter(inv => inv.branch_id === Number(branchId));
        }
        if (search) {
            const term = search.toLowerCase().trim();
            invoices = invoices.filter(inv => 
                (inv.invoice_number && inv.invoice_number.toLowerCase().includes(term)) ||
                (inv.customer_name && inv.customer_name.toLowerCase().includes(term)) ||
                (inv.customer_phone && inv.customer_phone.toLowerCase().includes(term))
            );
        }
        return invoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    getInvoiceById(id) {
        const invoices = this.getInvoices();
        return invoices.find(inv => inv.id === Number(id));
    },

    createInvoice(payload) {
        this.init();
        const invoices = JSON.parse(localStorage.getItem(STORAGE_KEY_INVOICES) || '[]');
        const nextId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;

        const dateObj = new Date();
        const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
        const todayCount = invoices.filter(inv => inv.branch_id === Number(payload.branch_id) && inv.created_at.startsWith(dateObj.toISOString().slice(0, 10))).length + 1;
        const invoice_number = `INV-B${payload.branch_id}-${dateStr}-${String(todayCount).padStart(3, '0')}`;

        const branch = this.getBranchById(payload.branch_id);
        const settings = this.getSettings();

        const subtotal = payload.items.reduce((s, it) => s + Number(it.total_price), 0);
        const discount = Number(payload.discount) || 0;
        const total_amount = Math.max(0, subtotal - discount);
        const paid_amount = Number(payload.paid_amount) || total_amount;
        const remaining_amount = Math.max(0, total_amount - paid_amount);

        const newInvoice = {
            id: nextId,
            invoice_number: invoice_number,
            branch_id: Number(payload.branch_id),
            branch_name: branch ? branch.name : `فرع ${payload.branch_id}`,
            branch_phone: branch ? branch.phone : '',
            customer_name: payload.customer_name,
            customer_phone: payload.customer_phone || '',
            items: payload.items,
            subtotal: subtotal,
            discount: discount,
            total_amount: total_amount,
            paid_amount: paid_amount,
            remaining_amount: remaining_amount,
            payment_method: payload.payment_method || 'cash',
            warranty_period: payload.warranty_period || '3 شهور',
            warranty_terms: payload.warranty_terms || settings.default_warranty_terms,
            notes: payload.notes || '',
            created_by: payload.created_by || 'الكاشير',
            created_at: new Date().toISOString()
        };

        invoices.push(newInvoice);
        localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
        this.pushToCloud('invoices', invoices);

        // Deduct inventory
        payload.items.forEach(it => {
            if (it.inventory_id) {
                this.adjustStock(it.inventory_id, -it.quantity);
            }
            // Auto deduct controllers if in device bundle
            if (it.item_type === 'device') {
                if (it.original_controllers_count && it.original_controllers_count > 0) {
                    const ctrlCat = it.category === 'ps5' ? 'controller_ps5_orig' : 'controller_ps4_orig';
                    const ctrlItem = this.getInventory(payload.branch_id, ctrlCat)[0];
                    if (ctrlItem) this.adjustStock(ctrlItem.id, -it.original_controllers_count);
                }
                if (it.copy_controllers_count && it.copy_controllers_count > 0) {
                    const ctrlCat = it.category === 'ps5' ? 'controller_ps5_copy' : 'controller_ps4_copy';
                    const ctrlItem = this.getInventory(payload.branch_id, ctrlCat)[0];
                    if (ctrlItem) this.adjustStock(ctrlItem.id, -it.copy_controllers_count);
                }
            }
        });

        return newInvoice;
    },

    // Stock Transfer
    transferStock(fromBranchId, toBranchId, inventoryId, qty, notes = '') {
        const srcItem = this.getInventory().find(i => i.id === Number(inventoryId) && i.branch_id === Number(fromBranchId));
        if (!srcItem) return { success: false, message: 'الصنف غير موجود بالفرع المصدر' };
        if (srcItem.quantity < Number(qty)) return { success: false, message: `الكمية المتوفرة (${srcItem.quantity}) غير كافية` };

        // Deduct from source
        this.adjustStock(srcItem.id, -qty);

        // Add to destination
        const existingTarget = this.getInventory().find(i => i.branch_id === Number(toBranchId) && i.category === srcItem.category && i.name === srcItem.name);
        if (existingTarget) {
            this.adjustStock(existingTarget.id, qty);
        } else {
            this.addInventoryItem({
                ...srcItem,
                branch_id: Number(toBranchId),
                quantity: Number(qty)
            });
        }

        // Log transfer
        const transfers = JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSFERS) || '[]');
        transfers.push({
            id: transfers.length + 1,
            from_branch_id: Number(fromBranchId),
            to_branch_id: Number(toBranchId),
            item_name: srcItem.name,
            quantity: Number(qty),
            notes: notes,
            created_at: new Date().toISOString()
        });
        localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(transfers));

        return { success: true };
    },

    // Master Overview
    getAdminOverview() {
        const allItems = this.getInventory();
        const allInvoices = this.getInvoices();
        const branches = this.getBranches().filter(b => !b.is_admin);

        const todayStr = new Date().toISOString().slice(0, 10);
        const monthStr = new Date().toISOString().slice(0, 7);

        const branch_stocks = branches.map(b => {
            const bItems = allItems.filter(i => i.branch_id === b.id);
            const bInvoices = allInvoices.filter(inv => inv.branch_id === b.id);

            const ps4_count = bItems.filter(i => i.category === 'ps4').reduce((s, i) => s + i.quantity, 0);
            const ps5_count = bItems.filter(i => i.category === 'ps5').reduce((s, i) => s + i.quantity, 0);
            const ctrl_ps4_orig = bItems.filter(i => i.category === 'controller_ps4_orig').reduce((s, i) => s + i.quantity, 0);
            const ctrl_ps4_copy = bItems.filter(i => i.category === 'controller_ps4_copy').reduce((s, i) => s + i.quantity, 0);
            const ctrl_ps5_orig = bItems.filter(i => i.category === 'controller_ps5_orig').reduce((s, i) => s + i.quantity, 0);
            const ctrl_ps5_copy = bItems.filter(i => i.category === 'controller_ps5_copy').reduce((s, i) => s + i.quantity, 0);
            const total_stock_value = bItems.reduce((s, i) => s + (i.quantity * i.sell_price), 0);

            const total_sales = bInvoices.reduce((s, inv) => s + inv.total_amount, 0);
            const today_sales = bInvoices.filter(inv => inv.created_at.startsWith(todayStr)).reduce((s, inv) => s + inv.total_amount, 0);
            const month_sales = bInvoices.filter(inv => inv.created_at.startsWith(monthStr)).reduce((s, inv) => s + inv.total_amount, 0);

            return {
                branch_id: b.id,
                branch_name: b.name,
                branch_phone: b.phone,
                ps4_count,
                ps5_count,
                ctrl_ps4_orig,
                ctrl_ps4_copy,
                ctrl_ps5_orig,
                ctrl_ps5_copy,
                total_stock_value,
                total_sales,
                today_sales,
                month_sales,
                invoices_count: bInvoices.length
            };
        });

        const overall_stock = {
            all_ps4: allItems.filter(i => i.category === 'ps4').reduce((s, i) => s + i.quantity, 0),
            all_ps5: allItems.filter(i => i.category === 'ps5').reduce((s, i) => s + i.quantity, 0),
            all_controllers: allItems.filter(i => i.category.startsWith('controller')).reduce((s, i) => s + i.quantity, 0),
            all_stock_value: allItems.reduce((s, i) => s + (i.quantity * i.sell_price), 0)
        };

        const overall_sales = {
            grand_total_sales: allInvoices.reduce((s, inv) => s + inv.total_amount, 0),
            grand_invoices_count: allInvoices.length
        };

        const low_stock = allItems.filter(i => i.quantity <= 2).map(i => {
            const b = branches.find(br => br.id === i.branch_id);
            return {
                id: i.id,
                name: i.name,
                category: i.category,
                quantity: i.quantity,
                branch_name: b ? b.name : `فرع ${i.branch_id}`
            };
        });

        return {
            branch_stocks,
            overall_stock,
            overall_sales,
            low_stock,
            recent_invoices: allInvoices.slice(0, 15)
        };
    },

    // Export & Import backup
    exportBackup() {
        const data = {
            branches: this.getBranches(),
            settings: this.getSettings(),
            inventory: this.getInventory(),
            invoices: this.getInvoices(),
            transfers: JSON.parse(localStorage.getItem(STORAGE_KEY_TRANSFERS) || '[]'),
            export_date: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `نسخة_احتياطية_المهندس_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    },

    importBackup(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.branches) localStorage.setItem(STORAGE_KEY_BRANCHES, JSON.stringify(data.branches));
            if (data.settings) localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(data.settings));
            if (data.inventory) localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(data.inventory));
            if (data.invoices) localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(data.invoices));
            if (data.transfers) localStorage.setItem(STORAGE_KEY_TRANSFERS, JSON.stringify(data.transfers));
            return { success: true };
        } catch (e) {
            return { success: false, message: 'ملف غير صالح' };
        }
    },

    // Universal Direct In-Page Print Engine
    printInvoice(printAreaId = 'invoice-print-area') {
        const printContent = document.getElementById(printAreaId);
        if (!printContent) {
            window.print();
            return;
        }

        let iframe = document.getElementById('receipt-hidden-print-frame');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.id = 'receipt-hidden-print-frame';
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);
        }

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة - شركة المهندس</title>
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
                <style>
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: 'Cairo', Tahoma, Arial, sans-serif;
                        direction: rtl;
                        text-align: right;
                        background: #ffffff;
                        color: #000000;
                        padding: 15px;
                        margin: 0;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    table:not(.signature-table) th, table:not(.signature-table) td {
                        border: 1px solid #cbd5e1;
                        padding: 6px 8px;
                        font-size: 12px;
                    }
                    th {
                        background-color: #f1f5f9;
                        font-weight: 800;
                    }
                    .signature-table {
                        width: 100% !important;
                        margin-top: 30px !important;
                        border: none !important;
                    }
                    .signature-table td {
                        border: none !important;
                        padding: 0 !important;
                    }
                </style>
            </head>
            <body>
                <div style="max-width: 800px; margin: 0 auto;">
                    ${printContent.innerHTML}
                </div>
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (e) {
                window.print();
            }
        }, 300);
    },

    // Share Invoice via WhatsApp
    shareWhatsApp(invoice) {
        if (!invoice) return;
        const phone = (invoice.customer_phone || '').replace(/[^0-9]/g, '');
        let intlPhone = phone;
        if (intlPhone.startsWith('0')) {
            intlPhone = '20' + intlPhone.slice(1);
        }

        let itemsList = invoice.items.map((it, idx) => `*${idx + 1}. ${it.item_name}* (${it.quantity}x) - ${it.total_price.toLocaleString()} ج.م\n   ${it.included_details || ''}`).join('\n');

        const msg = `*🎮 فاتورة مبيعات وضمان - شركة المهندس للبلايستيشن*\n` +
            `--------------------------------\n` +
            `📄 *رقم الفاتورة:* ${invoice.invoice_number}\n` +
            `🏬 *الفرع:* ${invoice.branch_name}\n` +
            `👤 *اسم العميل:* ${invoice.customer_name}\n` +
            `📅 *التاريخ:* ${new Date(invoice.created_at).toLocaleDateString('ar-EG')}\n` +
            `🛡️ *مدة الضمان:* ${invoice.warranty_period}\n` +
            `--------------------------------\n` +
            `📦 *الأصناف والمشتملات:*\n${itemsList}\n` +
            `--------------------------------\n` +
            `💰 *الإجمالي:* ${invoice.total_amount.toLocaleString()} ج.م\n` +
            `💵 *المدفوع:* ${invoice.paid_amount.toLocaleString()} ج.م\n` +
            (invoice.remaining_amount > 0 ? `⚠️ *المتبقي:* ${invoice.remaining_amount.toLocaleString()} ج.م\n` : '') +
            `--------------------------------\n` +
            `🛡️ *شروط الضمان:* ${invoice.warranty_terms || 'الضمان يسري ضد عيوب الصناعة من تاريخ الشراء.'}\n\n` +
            `✨ شكراً لاختياركم شركة المهندس للبلايستيشن!`;

        const url = intlPhone.length >= 10
            ? `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(msg)}`
            : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;

        window.open(url, '_blank');
    }
};

// Auto-initialize DB
SystemDB.init();
