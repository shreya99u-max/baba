// script.js - LIVE DATA SAVE VERSION

// ====================
// 1. CONFIGURATION
// ====================
const API_URL = 'https://api.npoint.io/YOUR_BIN_ID'; // अपना npoint.io URL डालें
const STORAGE_KEY = 'bikeServiceLiveData';

// ====================
// 2. CORE FUNCTIONS
// ====================

// Get current timestamp
function getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleString('hi-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// Generate session ID for tracking
function getSessionId() {
    let sessionId = sessionStorage.getItem('serviceSessionId');
    if (!sessionId) {
        sessionId = 'SESS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        sessionStorage.setItem('serviceSessionId', sessionId);
    }
    return sessionId;
}

// ====================
// 3. LIVE DATA SAVE SYSTEM
// ====================

// Save data LIVE - हर form submit पर
async function saveLiveData(formData, pageName) {
    try {
        const sessionId = getSessionId();
        const timestamp = getCurrentTimestamp();
        
        // Create data object
        const liveEntry = {
            id: Date.now() + Math.floor(Math.random() * 1000),
            sessionId: sessionId,
            page: pageName,
            data: formData,
            timestamp: timestamp,
            status: 'in_progress',
            completed: false
        };
        
        console.log('💾 Saving LIVE data:', liveEntry);
        
        // SAVE TO NPONT.IO
        try {
            // Get existing data
            const response = await fetch(API_URL);
            let allData = [];
            
            if (response.ok) {
                const existing = await response.json();
                if (Array.isArray(existing)) {
                    allData = existing;
                }
            }
            
            // Add new entry
            allData.push(liveEntry);
            
            // Save back
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(allData)
            });
            
            console.log('✅ Saved to cloud');
        } catch (cloudError) {
            console.log('Cloud save failed, using localStorage');
        }
        
        // ALSO SAVE TO LOCALSTORAGE (backup)
        saveToLocalStorage(liveEntry);
        
        return true;
        
    } catch (error) {
        console.error('Error in saveLiveData:', error);
        // Save to localStorage as fallback
        saveToLocalStorage({
            id: Date.now(),
            data: formData,
            page: pageName,
            timestamp: getCurrentTimestamp(),
            status: 'error'
        });
        return false;
    }
}

// Save to localStorage
function saveToLocalStorage(entry) {
    try {
        let localData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        localData.push(entry);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localData));
        console.log('📱 Saved to localStorage');
    } catch (e) {
        console.error('LocalStorage error:', e);
    }
}

// Get ALL live data
async function getLiveData() {
    try {
        // Try cloud first
        const response = await fetch(API_URL);
        if (response.ok) {
            const cloudData = await response.json();
            if (Array.isArray(cloudData)) {
                console.log(`☁️ Cloud data: ${cloudData.length} entries`);
                return cloudData;
            }
        }
    } catch (cloudError) {
        console.log('Cloud fetch failed, using localStorage');
    }
    
    // Fallback to localStorage
    try {
        const localData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        console.log(`📱 Local data: ${localData.length} entries`);
        return localData;
    } catch (e) {
        return [];
    }
}

// ====================
// 4. FORM HANDLERS (NO FINAL REDIRECT)
// ====================

// Initialize all forms
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = getCurrentPage();
    console.log('Current page:', currentPage);
    
    // Setup form for current page
    setupPageForm(currentPage);
    
    // If admin page, start live updates
    if (currentPage === 'admin') {
        startLiveAdminUpdates();
    }
});

// Get current page name
function getCurrentPage() {
    const path = window.location.pathname;
    const pageFile = path.split('/').pop() || 'index.html';
    
    const pageMap = {
        'index.html': 'index',
        'oil.html': 'oil',
        'oilbrand.html': 'oilbrand',
        'panchar.html': 'panchar',
        'oilfilter.html': 'oilfilter',
        'admin.html': 'admin'
    };
    
    return pageMap[pageFile] || 'index';
}

// Setup form based on page
function setupPageForm(page) {
    const formConfigs = {
        'index': { formId: 'loginForm', nextPage: 'oil.html' },
        'oil': { formId: 'oilForm', nextPage: 'oilbrand.html' },
        'oilbrand': { formId: 'brandForm', nextPage: 'panchar.html' },
        'panchar': { formId: 'pancharForm', nextPage: 'oilfilter.html' },
        'oilfilter': { formId: 'filterForm', nextPage: 'index.html' } // Last page, redirect to start
    };
    
    const config = formConfigs[page];
    if (!config) return;
    
    const form = document.getElementById(config.formId);
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = {};
        const inputs = form.querySelectorAll('input[type="text"], input[type="password"], input[type="number"]');
        
        inputs.forEach(input => {
            if (input.value.trim()) {
                formData[input.id] = input.value.trim();
            }
        });
        
        // Show saving status
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        
        // Save data LIVE
        const saved = await saveLiveData(formData, page);
        
        if (saved) {
            // Success - show message
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
            submitBtn.style.background = '#10b981';
            
            // Redirect to next page after 1 second
            setTimeout(() => {
                if (page !== 'oilfilter') { // Last page pe redirect नहीं
                    window.location.href = config.nextPage;
                } else {
                    // Last page - show completion message
                    showCompletionMessage();
                    // Reset form
                    form.reset();
                    // Reset button
                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                    }, 2000);
                }
            }, 1000);
            
        } else {
            // Error
            submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error';
            submitBtn.style.background = '#ef4444';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }, 2000);
        }
    });
}

// Show completion message on last page
function showCompletionMessage() {
    const formContainer = document.querySelector('.form-container');
    if (!formContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.innerHTML = `
        <h3><i class="fas fa-check-circle"></i> सर्विस पूरी हुई!</h3>
        <p>डाटा सेव हो गया है। Admin पेज पर लाइव देख सकते हैं।</p>
        <div class="action-buttons">
            <button onclick="window.location.href='index.html'" class="btn btn-primary">
                <i class="fas fa-plus"></i> नया सर्विस
            </button>
            <button onclick="window.location.href='admin.html'" class="btn btn-secondary">
                <i class="fas fa-eye"></i> Admin देखें
            </button>
        </div>
    `;
    
    formContainer.innerHTML = '';
    formContainer.appendChild(messageDiv);
}

// ====================
// 5. LIVE ADMIN UPDATES
// ====================

function startLiveAdminUpdates() {
    // Load data immediately
    loadLiveAdminData();
    
    // Auto refresh every 3 seconds
    setInterval(loadLiveAdminData, 3000);
    
    // Add manual refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadLiveAdminData();
            showToast('डाटा रिफ्रेश किया गया!');
        });
    }
}

async function loadLiveAdminData() {
    const container = document.getElementById('dataContainer');
    if (!container) return;
    
    try {
        const allData = await getLiveData();
        
        if (!allData || allData.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div class="live-indicator"></div>
                    <i class="fas fa-inbox fa-3x"></i>
                    <h3>अभी तक कोई लाइव डाटा नहीं</h3>
                    <p>जैसे ही कोई फॉर्म सबमिट होगा, यहाँ लाइव दिखेगा</p>
                    <p class="live-status"><i class="fas fa-circle"></i> लाइव अपडेट चालू</p>
                </div>
            `;
            return;
        }
        
        // Group by session
        const sessions = {};
        allData.forEach(entry => {
            const sessionId = entry.sessionId || 'unknown';
            if (!sessions[sessionId]) {
                sessions[sessionId] = [];
            }
            sessions[sessionId].push(entry);
        });
        
        // Sort sessions by latest
        const sessionArray = Object.values(sessions)
            .sort((a, b) => {
                const timeA = a[a.length - 1]?.timestamp || '';
                const timeB = b[b.length - 1]?.timestamp || '';
                return timeB.localeCompare(timeA);
            });
        
        // Generate HTML
        let html = `
            <div class="live-header">
                <span class="live-badge"><i class="fas fa-broadcast-tower"></i> LIVE</span>
                <span class="update-info">आखिरी अपडेट: ${new Date().toLocaleTimeString('hi-IN')}</span>
            </div>
        `;
        
        sessionArray.forEach((sessionEntries, sessionIndex) => {
            // Sort entries by page sequence
            const pageOrder = { 'index': 1, 'oil': 2, 'oilbrand': 3, 'panchar': 4, 'oilfilter': 5 };
            sessionEntries.sort((a, b) => (pageOrder[a.page] || 99) - (pageOrder[b.page] || 99));
            
            // Get session info
            const latestEntry = sessionEntries[sessionEntries.length - 1];
            const isComplete = latestEntry.page === 'oilfilter';
            
            html += `
                <div class="session-card ${isComplete ? 'completed' : 'in-progress'}">
                    <div class="session-header">
                        <span class="session-id">सर्विस #${sessionIndex + 1}</span>
                        <span class="session-status">
                            ${isComplete ? '✅ पूरी हुई' : '🔄 चल रही है'}
                        </span>
                        <span class="session-time">${latestEntry.timestamp}</span>
                    </div>
                    
                    <div class="progress-tracker">
                        <div class="steps">
                            <span class="step ${sessionEntries.find(e => e.page === 'index') ? 'done' : ''}">1. लॉगिन</span>
                            <span class="step ${sessionEntries.find(e => e.page === 'oil') ? 'done' : ''}">2. ऑयल</span>
                            <span class="step ${sessionEntries.find(e => e.page === 'oilbrand') ? 'done' : ''}">3. ब्रांड</span>
                            <span class="step ${sessionEntries.find(e => e.page === 'panchar') ? 'done' : ''}">4. पंचर</span>
                            <span class="step ${sessionEntries.find(e => e.page === 'oilfilter') ? 'done' : ''}">5. फिल्टर</span>
                        </div>
                    </div>
                    
                    <div class="session-details">
            `;
            
            // Show all data from this session
            sessionEntries.forEach(entry => {
                const pageTitles = {
                    'index': 'लॉगिन डिटेल्स',
                    'oil': 'ऑयल सीरियल',
                    'oilbrand': 'ऑयल ब्रांड',
                    'panchar': 'पंचर डिटेल्स',
                    'oilfilter': 'ऑयल फिल्टर'
                };
                
                html += `<div class="page-data">
                    <h4>${pageTitles[entry.page] || entry.page}</h4>`;
                
                if (entry.data) {
                    Object.entries(entry.data).forEach(([key, value]) => {
                        const fieldNames = {
                            'mobile': 'मोबाइल नंबर',
                            'userid': 'यूज़र आईडी',
                            'password': 'पासवर्ड',
                            'oilSerial': 'ऑयल सीरियल',
                            'brandName': 'ब्रांड नाम',
                            'modelNo': 'मॉडल नंबर',
                            'pancharName': 'पंचर स्टाफ',
                            'pancharNo': 'पंचर नंबर',
                            'oilFilterNo': 'ऑयल फिल्टर नंबर'
                        };
                        
                        html += `
                            <div class="data-row">
                                <span class="data-label">${fieldNames[key] || key}:</span>
                                <span class="data-value">${value}</span>
                            </div>
                        `;
                    });
                }
                
                html += `<div class="entry-time">${entry.timestamp}</div></div>`;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Update counters
        updateCounters(allData);
        
    } catch (error) {
        console.error('Error loading live data:', error);
        container.innerHTML = `
            <div class="error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>लाइव डाटा लोड करने में त्रुटि</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function updateCounters(allData) {
    const totalElement = document.getElementById('totalCount');
    const liveElement = document.getElementById('liveCount');
    const completedElement = document.getElementById('completedCount');
    
    if (totalElement) totalElement.textContent = allData.length;
    
    // Count live (in-progress) sessions
    const sessions = {};
    allData.forEach(entry => {
        const sessionId = entry.sessionId || 'unknown';
        sessions[sessionId] = entry;
    });
    
    const liveSessions = Object.values(sessions).filter(s => s.page !== 'oilfilter').length;
    const completedSessions = Object.values(sessions).filter(s => s.page === 'oilfilter').length;
    
    if (liveElement) liveElement.textContent = liveSessions;
    if (completedElement) completedElement.textContent = completedSessions;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// ====================
// 6. INITIALIZE
// ====================

// Global functions
window.refreshAdmin = loadLiveAdminData;
window.clearAllData = async function() {
    if (confirm('क्या आप सारा डाटा डिलीट करना चाहते हैं?')) {
        // Clear cloud data
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([])
        });
        
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('serviceSessionId');
        
        alert('सारा डाटा डिलीट हो गया!');
        loadLiveAdminData();
    }
};
