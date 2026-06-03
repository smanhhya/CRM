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

    // 👇 السطر اللي بيشغل حسابات الـ Dashboard في نفس اللحظة
    calculateDashboardStats();
};

// 8. دالة حسابات لوحة التحكم (الـ Dashboard) وتحليل الإحصائيات الحية
window.calculateDashboardStats = () => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US');

    // أ. حساب إحصائيات الطلبات
    db.collection('orders').onSnapshot(snapshot => {
        let todaySales = 0;
        let todayOrdersCount = 0;
        let pendingOrdersCount = 0;
        
        let reservedJumbo = 0;
        let reservedSpecial = 0;
        let reservedRoyal = 0;

        snapshot.forEach(doc => {
            const order = doc.data();
            
            if (order.orderDate === todayStr || (order.createdAt && new Date(order.createdAt.toMillis()).toDateString() === now.toDateString())) {
                todaySales += Number(order.total) || 0;
                todayOrdersCount++;
            }

            if (order.status === 'new' || order.status === 'preparing' || order.status === 'shipping') {
                pendingOrdersCount++;
                
                if (order.items) {
                    order.items.forEach(item => {
                        const itemName = item.name.toLowerCase();
                        if (itemName.includes('جامبو')) reservedJumbo += Number(item.quantity) || 0;
                        if (itemName.includes('اسبيشيال') || itemName.includes('متميز')) reservedSpecial += Number(item.quantity) || 0;
                        if (itemName.includes('رويال')) reservedRoyal += Number(item.quantity) || 0;
                    });
                }
            }
        });

        if(document.getElementById('stat-today-sales')) document.getElementById('stat-today-sales').innerText = todaySales + " ج";
        if(document.getElementById('stat-today-orders')) document.getElementById('stat-today-orders').innerText = todayOrdersCount;
        if(document.getElementById('stat-pending-orders')) document.getElementById('stat-pending-orders').innerText = pendingOrdersCount;
        
        if(document.getElementById('reserved-jumbo')) document.getElementById('reserved-jumbo').innerText = reservedJumbo;
        
        let totalJumboInFreezer = 30; // مثال لسرعة الجرد الفعلي المتاح
        let realLeftJumbo = totalJumboInFreezer - reservedJumbo;
        if(document.getElementById('real-left-jumbo')) {
            document.getElementById('real-left-jumbo').innerText = realLeftJumbo;
            if(realLeftJumbo <= 8) {
                document.getElementById('real-left-jumbo').className = "text-xl font-black text-red-600 animate-pulse";
            } else {
                document.getElementById('real-left-jumbo').className = "text-xl font-black text-brand-navy";
            }
        }
    });

    // ب. حساب إحصائيات وتصنيفات العملاء مفقود / نشط
    db.collection('customers').onSnapshot(snapshot => {
        let totalCustomers = snapshot.size;
        let lostCustomersCount = 0;

        snapshot.forEach(doc => {
            const c = doc.data();
            if (c.tags && c.tags.includes('مفقود')) {
                lostCustomersCount++;
            }
        });

        if(document.getElementById('stat-total-customers')) document.getElementById('stat-total-customers').innerText = totalCustomers;
        if(document.getElementById('stat-lost-customers')) document.getElementById('stat-lost-customers').innerText = lostCustomersCount;
    });
};

// 9. برمجة شاشة ملف العميل الذكي المتكاملة
window.openCustomerProfile = async (phone) => {
    console.log("فتح ملف العميل الشامل لـ:", phone);
    
    try {
        const customerDoc = await db.collection('customers').doc(phone).get();
        if (!customerDoc.exists) {
            alert("لم يتم العثور على ملف هذا العميل!");
            return;
        }
        const customer = customerDoc.data();

        const ordersSnapshot = await db.collection('orders').where('customerPhone', '==', phone).get();
        
        let ordersHtml = '';
        ordersSnapshot.forEach(oDoc => {
            const order = oDoc.data();
            const items = order.items ? order.items.map(i => `${i.quantity} × ${i.name}`).join(' | ') : 'لا يوجد تفاصيل';
            ordersHtml += `
                <div class="border-b border-gray-100 py-3 last:border-0">
                    <div class="flex justify-between text-sm font-bold text-brand-navy">
                        <span>📅 ${order.orderDate || 'تاريخ غير محدد'}</span>
                        <span class="text-brand-cyanDark">${order.total || 0} ج</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">📦 ${items}</div>
                    <div class="text-[10px] mt-1"><span class="px-2 py-0.5 rounded bg-gray-100 text-gray-700">${order.status || 'تم التسليم'}</span></div>
                </div>
            `;
        });

        if(ordersSnapshot.empty) ordersHtml = `<p class="text-center text-gray-400 py-4 text-sm">لا توجد طلبات مسجلة في الأرشيف.</p>`;

        let avgOrderValue = customer.ordersCount > 0 ? (customer.totalSpent / customer.ordersCount).toFixed(1) : 0;

        let whatsappMsg = `يا هلا أستاذ ${customer.name}، معاكم سمان ههيا 💎.. حابين نطمن على ذوقك في آخر طلب، ومتاح معانا النهاردة سمان جامبو فريش جاهز فوراً لو تحب تحجز أطباقك؟`;
        let encodedMsg = encodeURIComponent(whatsappMsg);
        let waLink = `https://wa.me/${phone.startsWith('0') ? '2' + phone : phone}?text=${encodedMsg}`;

        let modalEl = document.getElementById('customer-modal-container');
        if (!modalEl) {
            modalEl = document.createElement('div');
            modalEl.id = 'customer-modal-container';
            document.body.appendChild(modalEl);
        }

        modalEl.innerHTML = `
        <div id="crm-modal" class="fixed inset-0 bg-brand-navy bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-200">
            <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-1">
                
                <div class="p-6 border-b border-gray-100 flex justify-between items-start bg-brand-light rounded-t-3xl">
                    <div>
                        <span class="bg-brand-cyanDark text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">ملف عميل VIP</span>
                        <h3 class="text-2xl font-black text-brand-navy mt-2">${customer.name}</h3>
                        <p class="text-sm text-gray-500 mt-1" dir="ltr"><i class="fa-solid fa-phone text-brand-cyanDark"></i> ${customer.phone}</p>
                        <p class="text-xs text-gray-400 mt-1"><i class="fa-solid fa-location-dot"></i> ${customer.address || customer.zone || 'العنوان غير مسجل'}</p>
                    </div>
                    <button onclick="closeCustomerModal()" class="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm transition"><i class="fa-solid fa-xmark text-lg"></i></button>
                </div>

                <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="md:col-span-1 bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3 justify-between">
                        <div>
                            <span class="text-xs text-gray-400 font-bold block">إجمالي المشتريات (LTV)</span>
                            <span class="text-2xl font-black text-brand-cyanDark">${customer.totalSpent || 0} ج</span>
                        </div>
                        <div class="border-t border-gray-200 pt-2">
                            <span class="text-xs text-gray-400 font-bold block">عدد الطلبات</span>
                            <span class="text-lg font-black text-brand-navy">${customer.ordersCount || 0} أوردر</span>
                        </div>
                        <div class="border-t border-gray-200 pt-2">
                            <span class="text-xs text-gray-400 font-bold block">متوسط الطلب (AOV)</span>
                            <span class="text-md font-black text-brand-navy">${avgOrderValue} ج</span>
                        </div>
                    </div>

                    <div class="md:col-span-2 bg-white border border-gray-100 p-4 rounded-2xl shadow-inner max-h-[220px] overflow-y-auto custom-scrollbar">
                        <h4 class="font-black text-brand-navy text-sm mb-2 pb-1 border-b border-gray-100"><i class="fa-solid fa-clock-rotate-left text-brand-cyanDark"></i> سجل الطلبات الكامل</h4>
                        ${ordersHtml}
                    </div>
                </div>

                <div class="p-6 bg-gray-50 border-t border-gray-100 rounded-b-3xl flex flex-wrap gap-3 justify-between items-center">
                    <div class="flex gap-2">
                        <span class="text-xs font-bold text-gray-500 bg-white border px-3 py-1.5 rounded-xl">⭐ تقييم: ${customer.rating || 1} نجوم</span>
                        <span class="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-xl">حالة النشاط: ${customer.tags ? customer.tags.join(', ') : 'نشط'}</span>
                    </div>
                    <a href="${waLink}" target="_blank" class="bg-green-600 text-white font-black px-5 py-2.5 rounded-xl text-sm shadow-md hover:bg-green-700 transition flex items-center gap-2">
                        <i class="fa-brands fa-whatsapp text-lg"></i> تنشيط العميل عبر واتساب
                    </a>
                </div>

            </div>
        </div>
        `;
    } catch (error) {
        console.error("خطأ أثناء فتح ملف العميل:", error);
        alert("فشل تحميل بيانات العميل بالكامل.");
    }
};

// 10. دالة إغلاق الـ Modal
window.closeCustomerModal = () => {
    const modal = document.getElementById('crm-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => { modal.remove(); }, 200);
    }
};

// 11. أداة تأسيس قاعدة بيانات الـ CRM (شغلها مرة واحدة من الـ Console)
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
                    zone: order.zone || "غير حدد",
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
