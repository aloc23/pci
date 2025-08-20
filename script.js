// Global state
let isAdmin = false;
let accessLog = [];

// Dummy data for chart (replace with API later)
window.onload = function() {
  drawUsageChart();
  drawHeatmap();
  checkAdminAccess();
  handleNavigation();
  initializeShop();
  loadAccessLog();
  
  // Initialize real-time sync simulation
  initializeRealTimeSync();
};

// Check admin access (simulate with localStorage)
function checkAdminAccess() {
  isAdmin = localStorage.getItem('isAdmin') === 'true';
  const adminLink = document.getElementById('adminLink');
  if (adminLink) {
    adminLink.style.display = isAdmin ? 'inline' : 'none';
  }
}

// Toggle admin access (for testing)
function toggleAdmin() {
  isAdmin = !isAdmin;
  localStorage.setItem('isAdmin', isAdmin.toString());
  checkAdminAccess();
  alert(isAdmin ? 'Admin access granted' : 'Admin access revoked');
}

// Handle navigation highlighting
function handleNavigation() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.classList.remove('active');
    if ((currentPage === 'index.html' || currentPage === '') && link.getAttribute('href') === 'index.html') {
      link.classList.add('active');
    } else if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

function drawUsageChart() {
  const canvas = document.getElementById('usageChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  // Simple bar chart: 7 days
  const usage = [68, 75, 60, 80, 90, 72, 65];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0074d9';
  usage.forEach((val, idx) => {
    ctx.fillRect(60 * idx + 10, canvas.height - val, 40, val);
    ctx.fillStyle = '#222';
    ctx.fillText(`${val}%`, 60 * idx + 15, canvas.height - val - 5);
    ctx.fillStyle = '#0074d9';
  });
  ctx.fillStyle = '#222';
  ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach((d, idx) => {
    ctx.fillText(d, 60 * idx + 15, canvas.height - 5);
  });
}

// Simulate check-in
function simulateCheckin() {
  let code = document.getElementById('qrInput').value;
  let status = document.getElementById('checkinStatus');
  if (code.trim().length > 0) {
    status.textContent = "Success! Gate opened, attendance logged.";
    status.style.color = "green";
    logAccess('Manual Entry', code);
  } else {
    status.textContent = "Please enter a valid code or tap NFC.";
    status.style.color = "red";
  }
}

// QR Code simulation
function simulateQRScan() {
  const qrCode = 'QR_' + Math.random().toString(36).substr(2, 8).toUpperCase();
  document.getElementById('qrInput').value = qrCode;
  let status = document.getElementById('checkinStatus');
  status.textContent = "QR Code scanned successfully! Gate opened, attendance logged.";
  status.style.color = "green";
  logAccess('QR Scan', qrCode);
}

// NFC simulation
function simulateNFCTap() {
  const nfcCode = 'NFC_' + Math.random().toString(36).substr(2, 8).toUpperCase();
  document.getElementById('qrInput').value = nfcCode;
  let status = document.getElementById('checkinStatus');
  status.textContent = "NFC tap detected! Gate opened, attendance logged.";
  status.style.color = "green";
  logAccess('NFC Tap', nfcCode);
}

// Access logging
function logAccess(method, code) {
  const timestamp = new Date();
  const logEntry = {
    method: method,
    code: code,
    timestamp: timestamp,
    user: 'Current User' // In real app, would get from auth
  };
  
  accessLog.unshift(logEntry);
  if (accessLog.length > 10) accessLog.pop(); // Keep only last 10 entries
  
  localStorage.setItem('accessLog', JSON.stringify(accessLog));
  updateAccessLogDisplay();
  
  // Trigger real-time sync event
  triggerRealTimeEvent('access', logEntry);
}

function loadAccessLog() {
  const saved = localStorage.getItem('accessLog');
  if (saved) {
    accessLog = JSON.parse(saved);
    updateAccessLogDisplay();
  }
}

function updateAccessLogDisplay() {
  const container = document.getElementById('logEntries');
  if (!container) return;
  
  if (accessLog.length === 0) {
    container.innerHTML = '<p style="color: #6b7280; text-align: center; margin: 1rem 0;">No recent access logs</p>';
    return;
  }
  
  container.innerHTML = accessLog.map(entry => {
    const timestamp = new Date(entry.timestamp);
    return `
      <div class="log-entry">
        <div>
          <strong>${entry.method}</strong><br>
          <small>${entry.code}</small>
        </div>
        <div style="text-align: right; font-size: 0.75rem; color: #6b7280;">
          ${timestamp.toLocaleTimeString()}<br>
          ${timestamp.toLocaleDateString()}
        </div>
      </div>
    `;
  }).join('');
}

// In-app shop simulation
const shopForm = document.getElementById('shopForm');
if (shopForm) {
  shopForm.addEventListener('submit', function(e){
    e.preventDefault();
    processStandardPayment();
  });
}

function initializeShop() {
  const shopForm = document.getElementById('shopForm');
  if (!shopForm) return;
  
  // Add event listeners to checkboxes to update summary
  const checkboxes = shopForm.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateOrderSummary);
  });
}

function updateOrderSummary() {
  const shopForm = document.getElementById('shopForm');
  const summary = document.getElementById('orderSummary');
  const summaryItems = document.getElementById('summaryItems');
  const totalPriceElement = document.getElementById('totalPrice');
  
  if (!shopForm || !summary) return;
  
  const checkboxes = shopForm.querySelectorAll('input[type="checkbox"]:checked');
  let total = 0;
  let items = [];
  
  checkboxes.forEach(checkbox => {
    const price = parseInt(checkbox.dataset.price);
    const name = checkbox.parentElement.textContent.split(' (')[0].trim();
    total += price;
    items.push({ name, price });
  });
  
  if (items.length > 0) {
    summary.style.display = 'block';
    summaryItems.innerHTML = items.map(item => 
      `<div class="summary-item">
        <span>${item.name}</span>
        <span>€${item.price}</span>
      </div>`
    ).join('');
    totalPriceElement.textContent = total;
  } else {
    summary.style.display = 'none';
  }
}

function processApplePay() {
  const total = document.getElementById('totalPrice')?.textContent || '0';
  if (total === '0') {
    showShopStatus('Please select items first', 'error');
    return;
  }
  
  // Simulate Apple Pay process
  showShopStatus('Processing Apple Pay...', 'info');
  setTimeout(() => {
    showShopStatus(`Payment of €${total} successful via Apple Pay! Items will be delivered to your court.`, 'success');
    resetShopForm();
  }, 2000);
}

function processGooglePay() {
  const total = document.getElementById('totalPrice')?.textContent || '0';
  if (total === '0') {
    showShopStatus('Please select items first', 'error');
    return;
  }
  
  // Simulate Google Pay process
  showShopStatus('Processing Google Pay...', 'info');
  setTimeout(() => {
    showShopStatus(`Payment of €${total} successful via Google Pay! Items will be delivered to your court.`, 'success');
    resetShopForm();
  }, 2000);
}

function processStandardPayment() {
  const total = document.getElementById('totalPrice')?.textContent || '0';
  if (total === '0') {
    showShopStatus('Please select items first', 'error');
    return;
  }
  
  showShopStatus(`Payment of €${total} successful! Items will be delivered to your court.`, 'success');
  resetShopForm();
}

function resetShopForm() {
  const shopForm = document.getElementById('shopForm');
  if (shopForm) {
    shopForm.reset();
    updateOrderSummary();
  }
}

function showShopStatus(message, type) {
  const status = document.getElementById('shopStatus');
  if (!status) return;
  
  status.textContent = message;
  status.style.color = type === 'success' ? 'green' : type === 'error' ? 'red' : '#f59e0b';
  
  if (type === 'success') {
    setTimeout(() => {
      status.textContent = '';
    }, 5000);
  }
}

// Locker assignment simulation
function assignLocker() {
  let lockerNum = Math.floor(Math.random() * 100) + 1;
  let status = document.getElementById('lockerStatus');
  status.textContent = `Locker #${lockerNum} assigned. Tap app to unlock.`;
  status.style.color = "blue";
}

// Heatmap visualization
function drawHeatmap() {
  const heatmapGrid = document.getElementById('heatmapGrid');
  if (!heatmapGrid) return;
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM', '8PM'];
  
  // Sample data - in real app this would come from API
  const heatmapData = [
    [2, 1, 3, 4, 3, 2, 1], // Mon
    [1, 2, 3, 4, 4, 3, 2], // Tue
    [2, 3, 4, 4, 4, 3, 2], // Wed
    [3, 3, 4, 4, 4, 3, 3], // Thu
    [3, 4, 4, 4, 4, 4, 3], // Fri
    [4, 4, 4, 4, 4, 4, 4], // Sat
    [2, 3, 4, 3, 3, 2, 1], // Sun
  ];
  
  heatmapGrid.innerHTML = '';
  
  // Add hour headers
  heatmapGrid.style.gridTemplateColumns = `60px repeat(7, 1fr)`;
  
  // Empty cell for top-left corner
  const emptyCell = document.createElement('div');
  heatmapGrid.appendChild(emptyCell);
  
  // Day headers
  days.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.textContent = day;
    dayHeader.style.fontWeight = '600';
    dayHeader.style.textAlign = 'center';
    dayHeader.style.padding = '0.5rem';
    dayHeader.style.fontSize = '0.8rem';
    heatmapGrid.appendChild(dayHeader);
  });
  
  // Hour rows with data
  hours.forEach((hour, hourIndex) => {
    // Hour label
    const hourLabel = document.createElement('div');
    hourLabel.textContent = hour;
    hourLabel.style.fontWeight = '600';
    hourLabel.style.textAlign = 'center';
    hourLabel.style.padding = '0.5rem';
    hourLabel.style.fontSize = '0.8rem';
    heatmapGrid.appendChild(hourLabel);
    
    // Data cells for each day
    days.forEach((day, dayIndex) => {
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';
      
      const intensity = heatmapData[dayIndex][hourIndex];
      const intensityClass = intensity === 1 ? 'low' : 
                            intensity === 2 ? 'medium' : 
                            intensity === 3 ? 'high' : 'peak';
      
      cell.classList.add(intensityClass);
      cell.title = `${day} ${hour}: ${intensity === 1 ? 'Low' : intensity === 2 ? 'Medium' : intensity === 3 ? 'High' : 'Peak'} activity`;
      
      heatmapGrid.appendChild(cell);
    });
  });
}

// Real-time sync simulation
function initializeRealTimeSync() {
  // Simulate WebSocket connection with localStorage events
  window.addEventListener('storage', function(e) {
    if (e.key === 'realTimeEvent') {
      const event = JSON.parse(e.newValue || '{}');
      handleRealTimeEvent(event);
    }
  });
  
  // Simulate periodic booking updates
  setInterval(() => {
    simulateRandomBookingUpdate();
  }, 30000); // Every 30 seconds
}

function triggerRealTimeEvent(type, data) {
  const event = {
    type: type,
    data: data,
    timestamp: new Date().toISOString()
  };
  
  localStorage.setItem('realTimeEvent', JSON.stringify(event));
  handleRealTimeEvent(event);
}

function handleRealTimeEvent(event) {
  switch(event.type) {
    case 'booking':
      showRealTimeNotification(`New booking: Court ${event.data.court} at ${event.data.time}`);
      break;
    case 'cancellation':
      showRealTimeNotification(`Booking cancelled: Court ${event.data.court} at ${event.data.time}`);
      break;
    case 'access':
      console.log('Access logged:', event.data);
      break;
  }
}

function simulateRandomBookingUpdate() {
  const courts = [1, 2, 3, 4];
  const times = ['09:00', '11:00', '14:00', '16:00', '18:00', '20:00'];
  const actions = ['booking', 'cancellation'];
  
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  const randomCourt = courts[Math.floor(Math.random() * courts.length)];
  const randomTime = times[Math.floor(Math.random() * times.length)];
  
  if (Math.random() < 0.3) { // 30% chance of update
    triggerRealTimeEvent(randomAction, {
      court: randomCourt,
      time: randomTime,
      player: 'Guest User'
    });
  }
}

function showRealTimeNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'real-time-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--primary-green), var(--accent-green));
    color: var(--matt-black);
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-weight: 600;
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
}
