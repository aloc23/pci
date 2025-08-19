// Global state
let isAdmin = false;

// Dummy data for chart (replace with API later)
window.onload = function() {
  drawUsageChart();
  checkAdminAccess();
  handleNavigation();
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
  } else {
    status.textContent = "Please enter a valid code or tap NFC.";
    status.style.color = "red";
  }
}

// In-app shop simulation
const shopForm = document.getElementById('shopForm');
if (shopForm) {
  shopForm.addEventListener('submit', function(e){
    e.preventDefault();
    let status = document.getElementById('shopStatus');
    status.textContent = "Order received! Items will be delivered to your court.";
    status.style.color = "green";
  });
}

// Locker assignment simulation
function assignLocker() {
  let lockerNum = Math.floor(Math.random() * 100) + 1;
  let status = document.getElementById('lockerStatus');
  status.textContent = `Locker #${lockerNum} assigned. Tap app to unlock.`;
  status.style.color = "blue";
}
