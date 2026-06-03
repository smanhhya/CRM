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

// 7. دالة سحب البيانات الحية (الرسيفر اللي بيجيب الداتا من فايربيز)
window.loadCRMData = () => {
    
    // سحب أحدث 50 عميل VIP وعرضهم في جدول نظيف
    db.collection('customers').orderBy('lastOrder', 'desc').limit(50).onSnapshot(snapshot => {
        let html = `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="text-xl font-black mb-4 text-brand-navy"><i class="fa-solid fa-users text-brand-cyanDark mr-2"></i> عائلة سمان (عملاء VIP)</h3>
            <div class="overflow-x-auto custom-scrollbar">
                <table class="w-full text-right">
                    <thead class="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                        <tr>
                            <th class="p-4 font-bold">الاسم</th>
                            <th class="p-4 font-bold">رقم الهاتف</th>
                            <th class="p-4 font-bold">المنطقة</th>
                            <th class="p-4 font-bold">تاريخ آخر طلب</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        if (snapshot.empty) html += `<tr><td colspan="4" class="text-center p-6 text-gray-400">لا يوجد عملاء حتى الآن</td></tr>`;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.lastOrder ? data.lastOrder.toDate().toLocaleDateString('ar-EG') : 'غير محدد';
            html += `
                <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td class="p-4 font-black text-brand-navy">${data.name || '---'}</td>
                    <td class="p-4 text-gray-600" dir="ltr">${data.phone || '---'}</td>
                    <td class="p-4"><span class="bg-brand-light text-brand-navy px-3 py-1 rounded-lg text-xs font-bold">${data.zone || '---'}</span></td>
                    <td class="p-4 text-sm text-gray-500">${date}</td>
                </tr>`;
        });
        
        html += `</tbody></table></div></div>`;
        document.getElementById('view-customers').innerHTML = html;
    });

    // سحب أحدث الطلبات الحية وعرضها في كروت أنيقة
    db.collection('orders').orderBy('createdAt', 'desc').limit(30).onSnapshot(snapshot => {
        let html = `
        <div class="mb-4 flex justify-between items-center">
            <h3 class="text-xl font-black text-brand-navy"><i class="fa-solid fa-box-open text-brand-cyanDark mr-2"></i> الطلبات الحية</h3>
            <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">تحديث تلقائي شغال</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;
        
        if (snapshot.empty) html += `<div class="col-span-full text-center p-10 text-gray-400 font-bold bg-white rounded-2xl border border-gray-100">لا توجد طلبات مسجلة حتى الآن.</div>`;

        snapshot.forEach(doc => {
            const data = doc.data();
            const itemsList = data.items ? data.items.map(i => `<div class="text-sm border-b border-gray-200 pb-1 mb-1 last:border-0 last:mb-0 last:pb-0">▪ ${i.quantity} × ${i.name.replace('طبق ', '').split(' (')[0]}</div>`).join('') : 'بدون تفاصيل';
            
            html += `
            <div class="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <!-- شريط الحالة الجانبي -->
                <div class="absolute right-0 top-0 bottom-0 w-1 ${data.status === 'new' ? 'bg-brand-cyanDark' : 'bg-gray-300'}"></div>
                
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-black text-brand-navy text-lg">${data.customerName}</h4>
                        <p class="text-xs text-gray-500 mt-1"><i class="fa-solid fa-location-dot"></i> ${data.zone}</p>
                    </div>
                    <span class="bg-brand-light text-brand-navy text-[10px] font-bold px-2 py-1 rounded">${data.orderDate} - ${data.orderTime}</span>
                </div>
                
                <div class="bg-gray-50 p-3 rounded-xl mb-4 min-h-[60px]">
                    ${itemsList}
                </div>
                
                <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span class="text-xs text-gray-400 font-bold">الإجمالي:</span>
                    <span class="font-black text-xl text-brand-cyanDark">${data.total} ج</span>
                </div>
            </div>`;
        });
        
        html += `</div>`;
        document.getElementById('view-orders').innerHTML = html;
    });
};

