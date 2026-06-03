// 1. إعدادات فايربيز (انسخ نفس الإعدادات من موقعك الأساسي هنا)
const firebaseConfig = {
    apiKey: "********************************",
    authDomain: "********************************",
    projectId: "********************************",
    storageBucket: "********************************",
    messagingSenderId: "********************************",
    appId: "********************************"
};

// 2. تهيئة فايربيز
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const auth = firebase.auth();
const db = firebase.firestore();

// 3. مراقبة حالة الدخول (لو مسجل دخول هيفتح اللوحة، لو لأ هيجيب شاشة الدخول)
auth.onAuthStateChanged((user) => {
    const loginScreen = document.getElementById('login-screen');
    const crmLayout = document.getElementById('crm-layout');
    
    if (user && user.email) {
        // المستخدم مسجل دخول
        loginScreen.classList.add('opacity-0');
        setTimeout(() => {
            loginScreen.classList.add('hidden');
            crmLayout.classList.remove('hidden');
        }, 300);
        console.log("Welcome Admin:", user.email);
    } else {
        // غير مسجل دخول
        crmLayout.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        setTimeout(() => loginScreen.classList.remove('opacity-0'), 10);
    }
});

// 4. دالة تسجيل الدخول
window.loginToCRM = () => {
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    const btn = document.getElementById('login-btn');
    const errDiv = document.getElementById('login-error');
    
    if(!email || !pass) {
        errDiv.innerText = "يرجى كتابة البريد وكلمة المرور!";
        errDiv.classList.remove('hidden');
        return;
    }
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التحقق...';
    btn.disabled = true;
    errDiv.classList.add('hidden');
    
    auth.signInWithEmailAndPassword(email, pass).catch((error) => {
        btn.innerHTML = 'تسجيل الدخول <i class="fa-solid fa-arrow-right-to-bracket"></i>';
        btn.disabled = false;
        errDiv.innerText = "بيانات الدخول غير صحيحة!";
        errDiv.classList.remove('hidden');
    });
};

// 5. دالة تسجيل الخروج
window.logoutFromCRM = () => {
    if(confirm("هل تريد تسجيل الخروج من النظام؟")) {
        auth.signOut();
    }
};

// 6. نظام التنقل بين الشاشات (التابات)
window.switchTab = (tabName) => {
    // إخفاء كل الشاشات
    document.querySelectorAll('.crm-view').forEach(el => el.classList.add('hidden'));
    // إعادة كل الزراير للون الرمادي
    document.querySelectorAll('aside nav button').forEach(btn => {
        btn.className = "w-full text-right px-4 py-3 rounded-xl font-bold text-sm text-gray-400 hover:bg-gray-800 transition-colors flex items-center gap-3";
    });
    
    // تفعيل الشاشة والزرار المختار
    document.getElementById(`view-${tabName}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-${tabName}`);
    activeBtn.className = "w-full text-right px-4 py-3 rounded-xl font-bold text-sm bg-brand-cyanDark text-white transition-colors flex items-center gap-3";
    
    // تغيير عنوان الصفحة
    const titles = { 'dashboard': 'الرئيسية', 'customers': 'سجل العملاء الـ VIP', 'orders': 'إدارة الطلبات', 'inventory': 'جرد الفريزر' };
    document.getElementById('page-title').innerText = titles[tabName] || 'CRM';
};
