// 1. إعدادات فايربيز الحقيقية الخاصة بمشروع سمان ههيا
const firebaseConfig = { 
    apiKey: "AIzaSyD7ZJP8n8fhMewPfEsTBANn0h9To_q15BY", 
    authDomain: "sman-ca8f8.firebaseapp.com", 
    projectId: "sman-ca8f8", 
    storageBucket: "sman-ca8f8.firebasestorage.app", 
    messagingSenderId: "538778803310", 
    appId: "1:538778803310:web:5eeff42bae534375a21a7f" 
};

// 2. تهيئة فايربيز للـ CRM
if (!firebase.apps.length) { 
    firebase.initializeApp(firebaseConfig); 
}
const auth = firebase.auth();
const db = firebase.firestore();

// 3. مراقبة حالة الدخول (لو مسجل دخول هيفتح اللوحة، لو لأ هيجيب شاشة الدخول)
auth.onAuthStateChanged((user) => {
    const loginScreen = document.getElementById('login-screen');
    const crmLayout = document.getElementById('crm-layout');
    
    if (user && user.email) {
        // لو الإيميل صح، اخفي شاشة الدخول وافتح الـ CRM
        loginScreen.classList.add('opacity-0');
        setTimeout(() => {
            loginScreen.classList.add('hidden');
            crmLayout.classList.remove('hidden');
        }, 300);
        console.log("Welcome Admin:", user.email);
    } else {
        // لو مش مسجل، رجعه لشاشة القفل
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
    
    // محاولة الدخول بصلاحيات الأدمن
    auth.signInWithEmailAndPassword(email, pass).catch((error) => {
        btn.innerHTML = 'تسجيل الدخول <i class="fa-solid fa-arrow-right-to-bracket"></i>';
        btn.disabled = false;
        errDiv.innerText = "بيانات الدخول غير صحيحة، أو الحساب غير مسجل كمسؤول!";
        errDiv.classList.remove('hidden');
        console.error("Login Error:", error.message);
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
    
    // إعادة كل الزراير للون الرمادي العادي
    document.querySelectorAll('aside nav button').forEach(btn => {
        btn.className = "w-full text-right px-4 py-3 rounded-xl font-bold text-sm text-gray-400 hover:bg-gray-800 transition-colors flex items-center gap-3";
    });
    
    // تفعيل الشاشة المختارة
    const activeView = document.getElementById(`view-${tabName}`);
    if(activeView) activeView.classList.remove('hidden');
    
    // تفعيل لون الزرار المختار
    const activeBtn = document.getElementById(`tab-${tabName}`);
    if(activeBtn) {
        activeBtn.className = "w-full text-right px-4 py-3 rounded-xl font-bold text-sm bg-brand-cyanDark text-white transition-colors flex items-center gap-3";
    }
    
    // تغيير عنوان الصفحة فوق
    const titles = { 
        'dashboard': 'الرئيسية (مركز القيادة)', 
        'customers': 'عائلة سمان (سجل الـ VIP)', 
        'orders': 'إدارة الطلبات الحية', 
        'inventory': 'جرد الفريزر الذكي' 
    };
    document.getElementById('page-title').innerText = titles[tabName] || 'CRM';
};
