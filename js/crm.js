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

// 3. مراقبة حالة الدخول
auth.onAuthStateChanged((user) => {
    const loginScreen = document.getElementById('login-screen');
    const crmLayout = document.getElementById('crm-layout');
    
    if (user && user.email) {
        loginScreen.classList.add('opacity-0');
        setTimeout(() => {
            loginScreen.classList.add('hidden');
            crmLayout.classList.remove('hidden');
            
            // 👇 السطر السحري اللي بيشغل سحب الداتا أول ما اللوحة تفتح
            loadCRMData();
            
        }, 300);
        console.log("Welcome Admin:", user.email);
    } else {
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
        errDiv.innerText = "بيانات الدخول غير صحيحة، أو الحساب غير مسجل كمسؤول!";
        errDiv.classList.remove('hidden');
    });
};

// 5. دالة تسجيل الخروج
window.logoutFromCRM = () => {
    if(confirm("هل تريد تسجيل الخروج من النظام؟")) {
        auth.signOut();
    }
};

// 6. نظام التنقل بين الشاشات
window.switchTab = (tabName) => {
    document.querySelectorAll('.crm-view').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('aside nav button').forEach(btn => {
        btn.className = "w-full text-right px-4 py-3 rounded-xl font-bold text-sm text-gray-400 hover:bg-gray-800 transition-colors flex items-center gap-3";
    });
    
    const activeView = document.getElementById(`view-${tabName}`);
    if(activeView) activeView.classList.remove('hidden');
    
    const activeBtn = document.getElementById(`tab-${tabName}`);
    if(activeBtn) {
        activeBtn.className = "w-full text-right px-4 py-3 rounded-xl font-bold text-sm bg-brand-cyanDark text-white transition-colors flex items-center gap-3";
    }
    
    const titles = { 
        'dashboard': 'الرئيسية (مركز القيادة)', 
        'customers': 'عائلة سمان (سجل الـ VIP)', 
        'orders': 'إدارة الطلبات الحية', 
        'inventory': 'جرد الفريزر الذكي' 
    };
    document.getElementById('page-title').innerText = titles[tabName] || 'CRM';
};

// 7. دالة سحب البيانات الحية (القلب النابض للـ CRM)
window.loadCRMData = () => {
    // --- أ. سحب العملاء وعرض البروفايل الذكي ---
    db.collection('customers').orderBy('lastOrderDate', 'desc').limit(50).onSnapshot(snapshot => {
        let html = `
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-brand-navy"><i class="fa-solid fa-gem text-brand-cyanDark mr-2"></i> عائلة سمان (العملاء)</h3>
                <button class="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-100 transition"><i class="fa-brands fa-whatsapp mr-1"></i> مراسلة المفقودين</button>
            </div>
            <div class="overflow-x-auto custom-scrollbar">
                <table class="w-full text-right">
                    <thead class="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                        <tr>
                            <th class="p-4 font-bold">العميل</th>
                            <th class="p-4 font-bold text-center">التقييم</th>
                            <th class="p-4 font-bold text-center">الطلبات</th>
                            <th class="p-4 font-bold text-center">إجمالي الشراء (LTV)</th>
                            <th class="p-4 font-bold">التصنيف (Tags)</th>
                            <th class="p-4 font-bold text-center">إجراء</th>
                        </tr>
                    </thead>
                    <tbody>`;
        
        if (snapshot.empty) html += `<tr><td colspan="6" class="text-center p-6 text-gray-400 font-bold">لا يوجد عملاء حتى الآن (قم بتشغيل أداة التأسيس)</td></tr>`;
        
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // رسم النجوم
            let stars = '';
            let rating = data.rating || 1;
            for(let i=0; i<5; i++) {
                stars += `<i class="fa-solid fa-star ${i < rating ? 'text-brand-yellow' : 'text-gray-200'} text-xs"></i>`;
            }

            // رسم التاجات
            let tagsHtml = '';
            if(data.tags && data.tags.length > 0) {
                data.tags.forEach(tag => {
                    let color = tag === 'VIP' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 
                               (tag === 'مفقود' ? 'bg-red-100 text-red-800 border-red-200' : 
                               'bg-blue-100 text-blue-800 border-blue-200');
                    tagsHtml += `<span class="px-2 py-1 rounded text-[10px] font-black border mr-1 ${color}">${tag}</span>`;
                });
            }

            html += `
                <tr class="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onclick="openCustomerProfile('${data.phone}')">
                    <td class="p-4">
                        <div class="font-black text-brand-navy">${data.name || 'غير معروف'}</div>
                        <div class="text-xs text-gray-500 mt-1" dir="ltr">${data.phone || '---'}</div>
                    </td>
                    <td class="p-4 text-center">${stars}</td>
                    <td class="p-4 text-center font-bold text-brand-navy">${data.ordersCount || 0}</td>
                    <td class="p-4 text-center font-black text-brand-cyanDark">${data.totalSpent || 0} ج</td>
                    <td class="p-4">${tagsHtml}</td>
                    <td class="p-4 text-center">
                        <button class="text-brand-cyanDark hover:bg-brand-light p-2 rounded-lg transition" title="فتح الملف"><i class="fa-solid fa-folder-open"></i></button>
                    </td>
                </tr>`;
        });
        
        html += `</tbody></table></div></div>`;
        const viewEl = document.getElementById('view-customers');
        if(viewEl) viewEl.innerHTML = html;
    });

    // --- ب. سحب الطلبات الحية ---
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
                <div class="absolute right-0 top-0 bottom-0 w-1 ${data.status === 'new' ? 'bg-brand-cyanDark' : 'bg-gray-300'}"></div>
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-black text-brand-navy text-lg">${data.customerName || 'بدون اسم'}</h4>
                        <p class="text-xs text-gray-500 mt-1"><i class="fa-solid fa-location-dot"></i> ${data.zone || 'غير محدد'}</p>
                    </div>
                    <span class="bg-brand-light text-brand-navy text-[10px] font-bold px-2 py-1 rounded">${data.orderDate || ''}</span>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl mb-4 min-h-[60px]">${itemsList}</div>
                <div class="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span class="text-xs text-gray-400 font-bold">الإجمالي:</span>
                    <span class="font-black text-xl text-brand-cyanDark">${data.total || 0} ج</span>
                </div>
            </div>`;
        });
        
        html += `</div>`;
        const orderView = document.getElementById('view-orders');
        if(orderView) orderView.innerHTML = html;
    });
};

// 8. أداة تأسيس قاعدة بيانات الـ CRM (شغلها مرة واحدة من الـ Console)
window.setupCRMDatabase = async () => {
    if(!confirm("هل أنت متأكد من رغبتك في تحديث وبناء هيكل العملاء الشامل؟")) return;
    
    console.log("جاري سحب الأوردرات وتحليل البيانات...");
    try {
        const ordersSnap = await db.collection('orders').get();
        let customersMap = {};
        
        ordersSnap.forEach(doc => {
            let order = doc.data();
            if(!order.customerPhone) return;
            
            let phone = order.customerPhone.replace(/\D/g, '');
            if (phone.startsWith('201') && phone.length === 12) phone = '0' + phone.substring(2);
            if(phone.length < 10) return;

            if(!customersMap[phone]) {
                customersMap[phone] = {
                    name: order.customerName || "غير معروف",
                    phone: phone,
                    zone: order.zone || "غير محدد",
                    address: order.customerAddress || "",
                    ordersCount: 0,
                    totalSpent: 0,
                    lastOrderDate: order.createdAt || null
                };
            }

            customersMap[phone].ordersCount += 1;
            customersMap[phone].totalSpent += Number(order.total) || 0;

            if(order.createdAt && customersMap[phone].lastOrderDate) {
                if(order.createdAt.toMillis() > customersMap[phone].lastOrderDate.toMillis()) {
                    customersMap[phone].lastOrderDate = order.createdAt;
                }
            } else if (order.createdAt) {
                customersMap[phone].lastOrderDate = order.createdAt;
            }
        });

        let batch = db.batch();
        let now = new Date().getTime();
        let count = 0;

        for(let phone in customersMap) {
            let c = customersMap[phone];

            c.rating = c.ordersCount >= 10 ? 5 : (c.ordersCount >= 5 ? 4 : (c.ordersCount >= 2 ? 3 : 1));
            c.tags = [];
            if(c.ordersCount >= 10) c.tags.push("VIP");
            else if(c.ordersCount >= 5) c.tags.push("متكرر");
            else if(c.ordersCount === 1) c.tags.push("جديد");

            if(c.lastOrderDate) {
                let daysSinceLastOrder = (now - c.lastOrderDate.toMillis()) / (1000 * 60 * 60 * 24);
                if(daysSinceLastOrder > 45) c.tags.push("مفقود");
                else if(daysSinceLastOrder > 25 && daysSinceLastOrder <= 45) c.tags.push("إعادة طلب قريبة");
            }

            let docRef = db.collection('customers').doc(phone);
            batch.set(docRef, c, { merge: true });
            count++;
            
            if (count === 490) {
                await batch.commit();
                batch = db.batch();
                count = 0;
            }
        }
        
        if (count > 0) await batch.commit();
        
        alert("🎉 تم بناء قاعدة البيانات بنجاح! تم تحليل وترتيب بيانات كل العملاء.");
        
    } catch(e) {
        console.error("خطأ في بناء القاعدة:", e);
        alert("حصل خطأ، راجع الـ Console.");
    }
};

// وظيفة مؤقتة عشان لو ضغطت على العميل ميعملش خطأ لحد ما نبرمج شاشة البروفايل كاملة
openCustomerProfile
