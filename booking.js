// Booking system logic
let bookings = [
  { court: 1, date: new Date().toISOString().split('T')[0], time: '09:00', duration: 60, player: 'John Doe' },
  { court: 2, date: new Date().toISOString().split('T')[0], time: '14:00', duration: 90, player: 'Jane Smith' },
  { court: 3, date: new Date().toISOString().split('T')[0], time: '16:30', duration: 120, player: 'Mike Johnson' }
];

// Operating hours configuration
const OPERATING_HOURS = {
  weekday: { start: 7, end: 23 }, // 7 AM to 11 PM Monday-Saturday
  sunday: { start: 8, end: 23 }   // 8 AM to 11 PM Sunday
};

// Pricing configuration (in EUR)
const PRICING = {
  60: 35,   // 1 hour
  90: 50,   // 1.5 hours
  120: 65   // 2 hours
};

// Initialize booking page
document.addEventListener('DOMContentLoaded', function() {
  initializeBookingPage();
  initializeCalendarView();
  initializeGroupBooking();
  initializeBookingHistory();
});

let currentWeekStart = new Date();
currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1); // Start from Monday

function initializeBookingPage() {
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').value = today;
  document.getElementById('bookingDate').min = today;
  
  // Set maximum date to 30 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 30);
  document.getElementById('bookingDate').max = maxDate.toISOString().split('T')[0];
  
  // Load available times for today
  loadAvailableTimes();
  
  // Display today's bookings
  displayBookings();
  
  // Add event listeners
  document.getElementById('bookingDate').addEventListener('change', loadAvailableTimes);
  document.getElementById('courtSelect').addEventListener('change', loadAvailableTimes);
  
  // Check admin access
  checkAdminAccess();
}

// View switching functionality with enhanced animations
function switchView(viewType) {
  const formView = document.getElementById('booking');
  const calendarView = document.getElementById('calendar-view');
  const formBtn = document.getElementById('formViewBtn');
  const calendarBtn = document.getElementById('calendarViewBtn');
  const currentView = formView.classList.contains('active') ? formView : calendarView;
  const targetView = viewType === 'form' ? formView : calendarView;
  
  // Update button states with animation
  if (viewType === 'form') {
    formBtn.classList.add('active');
    calendarBtn.classList.remove('active');
  } else {
    formBtn.classList.remove('active');
    calendarBtn.classList.add('active');
  }
  
  // Animate view transition
  if (currentView !== targetView) {
    // Fade out current view
    currentView.style.opacity = '0';
    currentView.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
      currentView.classList.remove('active');
      targetView.classList.add('active');
      
      // Fade in new view
      targetView.style.opacity = '0';
      targetView.style.transform = 'translateX(20px)';
      
      requestAnimationFrame(() => {
        targetView.style.transition = 'all 0.3s ease';
        targetView.style.opacity = '1';
        targetView.style.transform = 'translateX(0)';
        
        setTimeout(() => {
          targetView.style.transition = '';
          currentView.style.transition = '';
          currentView.style.opacity = '';
          currentView.style.transform = '';
        }, 300);
      });
      
      if (viewType === 'calendar') {
        setTimeout(() => drawCalendar(), 100);
      }
    }, 150);
  }
  
  // Add ripple effect to button
  addRippleEffect(viewType === 'form' ? formBtn : calendarBtn);
  
  // Show contextual help
  showContextualHelp(viewType);
}

// Group booking functionality
function initializeGroupBooking() {
  const splitPayment = document.getElementById('splitPayment');
  if (splitPayment) {
    splitPayment.addEventListener('change', updatePaymentBreakdown);
  }
}

function toggleGroupBooking() {
  const checkbox = document.getElementById('groupBooking');
  
  if (checkbox.checked) {
    openGroupBookingModal();
  }
}

// Enhanced Group Booking Modal Functions
function openGroupBookingModal() {
  const modal = document.getElementById('groupBookingModal');
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // Initialize modal
  initializeGroupModal();
}

function closeGroupBookingModal() {
  const modal = document.getElementById('groupBookingModal');
  modal.classList.remove('show');
  document.body.style.overflow = 'auto';
  
  // Uncheck the group booking checkbox
  const checkbox = document.getElementById('groupBooking');
  if (checkbox) {
    checkbox.checked = false;
  }
}

function initializeGroupModal() {
  // Set up group size selector
  const sizeBtns = document.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      generatePlayerInputs(parseInt(btn.dataset.size));
    });
  });
  
  // Set up payment method change
  const paymentRadios = document.querySelectorAll('input[name="groupPayment"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      updatePaymentDisplay();
    });
  });
  
  // Initialize with default 4 players
  generatePlayerInputs(4);
  updatePaymentDisplay();
}

function generatePlayerInputs(groupSize) {
  const container = document.getElementById('playersContainer');
  container.innerHTML = '';
  
  for (let i = 1; i <= groupSize; i++) {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player-input';
    
    const isMainPlayer = i === 1;
    const statusText = isMainPlayer ? '(You)' : 'Invited';
    
    playerDiv.innerHTML = `
      <input 
        type="text" 
        placeholder="Player ${i} Name" 
        id="groupPlayer${i}"
        ${isMainPlayer ? 'value="' + (document.getElementById('playerName')?.value || '') + '"' : ''}
        ${isMainPlayer ? 'readonly' : ''}
      >
      <input 
        type="email" 
        placeholder="Email for payment link" 
        id="groupPlayerEmail${i}"
        ${isMainPlayer ? 'style="display: none;"' : ''}
      >
      <span class="player-status">${statusText}</span>
    `;
    
    container.appendChild(playerDiv);
  }
}

function updatePaymentDisplay() {
  const splitPayment = document.querySelector('input[name="groupPayment"]:checked').value === 'split';
  const splitDetails = document.getElementById('splitPaymentDetails');
  const breakdown = document.getElementById('paymentBreakdown');
  
  if (splitPayment) {
    splitDetails.style.display = 'block';
    
    // Calculate split amount
    const duration = document.getElementById('durationSelect')?.value || 60;
    const totalPrice = PRICING[duration] || 35;
    const groupSize = parseInt(document.querySelector('.size-btn.active').dataset.size);
    const perPersonAmount = (totalPrice / groupSize).toFixed(2);
    
    breakdown.innerHTML = `
      <div class="payment-split-item">
        <span>Total Booking Cost:</span>
        <span>€${totalPrice}</span>
      </div>
      <div class="payment-split-item">
        <span>Per Person (${groupSize} players):</span>
        <span class="highlight">€${perPersonAmount}</span>
      </div>
      <div class="payment-note">
        <small>Payment links will be sent to each player's email</small>
      </div>
    `;
  } else {
    splitDetails.style.display = 'none';
  }
}

function suggestPartners() {
  const suggestedPartners = [
    { name: 'Maria Garcia', skill: 'Advanced', lastPlayed: '2 days ago' },
    { name: 'Carlos Rodriguez', skill: 'Intermediate', lastPlayed: '1 week ago' },
    { name: 'Sophie Chen', skill: 'Advanced', lastPlayed: '3 days ago' },
    { name: 'Jake Thompson', skill: 'Beginner', lastPlayed: '5 days ago' }
  ];
  
  const partnersHtml = suggestedPartners.map(partner => `
    <div class="suggested-partner" onclick="selectSuggestedPartner('${partner.name}', '${partner.skill}')">
      <div class="partner-info">
        <strong>${partner.name}</strong>
        <span class="skill-level">${partner.skill}</span>
        <span class="last-played">Last played: ${partner.lastPlayed}</span>
      </div>
      <button class="invite-partner-btn">Invite</button>
    </div>
  `).join('');
  
  showToast(`
    <div class="partners-suggestion">
      <h4>Suggested Partners</h4>
      ${partnersHtml}
    </div>
  `, 'info', 8000);
}

function selectSuggestedPartner(name, skill) {
  // Find first empty player input
  const playerInputs = document.querySelectorAll('#playersContainer input[type="text"]');
  for (let i = 1; i < playerInputs.length; i++) { // Skip first (main player)
    if (!playerInputs[i].value) {
      playerInputs[i].value = name;
      showToast(`${name} added to your group!`, 'success');
      break;
    }
  }
}

// Booking History Timeline
function initializeBookingHistory() {
  generateSampleHistory();
  displayBookingHistory();
  
  // Set up filter buttons
  const filterButtons = document.querySelectorAll('.timeline-filter');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      filterBookingHistory(button.dataset.filter);
    });
  });
}

function generateSampleHistory() {
  const sampleHistory = [
    {
      id: 1,
      court: 'Court 1',
      date: '2025-08-20',
      time: '10:00',
      duration: 60,
      player: 'Alex Johnson',
      price: 35,
      status: 'upcoming',
      paymentMethod: 'Apple Pay',
      groupSize: 1,
      createdAt: '2025-08-19T15:30:00Z'
    },
    {
      id: 2,
      court: 'Court 3',
      date: '2025-08-19',
      time: '16:00',
      duration: 90,
      player: 'Alex Johnson',
      price: 50,
      status: 'completed',
      paymentMethod: 'Google Pay',
      groupSize: 4,
      createdAt: '2025-08-19T10:15:00Z'
    },
    {
      id: 3,
      court: 'Court 2',
      date: '2025-08-18',
      time: '14:30',
      duration: 60,
      player: 'Alex Johnson',
      price: 35,
      status: 'completed',
      paymentMethod: 'Credit Card',
      groupSize: 2,
      createdAt: '2025-08-17T20:45:00Z'
    },
    {
      id: 4,
      court: 'Court 1',
      date: '2025-08-16',
      time: '18:00',
      duration: 120,
      player: 'Alex Johnson',
      price: 65,
      status: 'cancelled',
      paymentMethod: 'Apple Pay',
      groupSize: 1,
      createdAt: '2025-08-15T12:00:00Z'
    },
    {
      id: 5,
      court: 'Court 4',
      date: '2025-08-22',
      time: '19:30',
      duration: 90,
      player: 'Alex Johnson',
      price: 50,
      status: 'upcoming',
      paymentMethod: 'Apple Pay',
      groupSize: 3,
      createdAt: '2025-08-20T09:20:00Z'
    }
  ];
  
  localStorage.setItem('bookingHistory', JSON.stringify(sampleHistory));
}

// Enhanced microinteractions and animations
function addRippleEffect(element) {
  const ripple = document.createElement('div');
  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    background: rgba(0, 255, 136, 0.6);
    transform: scale(0);
    animation: neonRipple 0.6s ease-out;
    pointer-events: none;
    z-index: 1;
  `;
  
  const rect = element.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = (rect.width / 2 - size / 2) + 'px';
  ripple.style.top = (rect.height / 2 - size / 2) + 'px';
  
  element.style.position = 'relative';
  element.appendChild(ripple);
  
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
}

// Admin modal functions
function openAdminModal() {
  const modal = document.getElementById('adminLoginModal');
  modal.classList.add('show');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Add entrance animation
  const modalContent = modal.querySelector('.modal-content');
  modalContent.style.animation = 'fadeInScale 0.3s ease-out';
}

function closeAdminModal() {
  const modal = document.getElementById('adminLoginModal');
  const modalContent = modal.querySelector('.modal-content');
  
  modalContent.style.animation = 'fadeOut 0.3s ease-out';
  setTimeout(() => {
    modal.classList.remove('show');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Clear form
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
  }, 300);
}

function demoAdminLogin() {
  // Simulate admin login for demo
  localStorage.setItem('isAdmin', 'true');
  showNeonToast('Admin access granted! Redirecting...', 'success');
  
  setTimeout(() => {
    closeAdminModal();
    window.location.href = 'admin.html';
  }, 1500);
}

function adminLogin() {
  const username = document.getElementById('adminUsername').value;
  const password = document.getElementById('adminPassword').value;
  
  if (username && password) {
    demoAdminLogin(); // For demo purposes
  } else {
    showNeonToast('Please enter both username and password', 'error');
  }
}

// Neon toast notifications
function showNeonToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `neon-toast ${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--matt-black-light), var(--matt-black));
    color: var(--primary-green);
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius-sm);
    border: 2px solid rgba(0, 255, 136, 0.5);
    box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
    z-index: 3000;
    font-weight: 500;
    text-shadow: 0 0 5px rgba(0, 255, 136, 0.3);
    animation: slideInRight 0.3s ease-out;
    max-width: 300px;
  `;
  
  if (type === 'error') {
    toast.style.borderColor = 'rgba(255, 107, 107, 0.5)';
    toast.style.color = '#ff6b6b';
    toast.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.3)';
  } else if (type === 'success') {
    toast.style.borderColor = 'rgba(0, 255, 136, 0.7)';
    toast.style.boxShadow = '0 0 25px rgba(0, 255, 136, 0.4)';
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

// Contextual help and tooltips
function showContextualHelp(viewType) {
  const helpMessage = viewType === 'form' 
    ? 'Fill out the form to book a court. Select date, time, and court.' 
    : 'Click on available slots to book. Drag booked slots to reschedule.';
  
  showNeonTooltip(helpMessage, document.querySelector('.view-btn.active'));
}

function showNeonTooltip(text, element) {
  const tooltip = document.getElementById('neonTooltip');
  tooltip.textContent = text;
  
  const rect = element.getBoundingClientRect();
  tooltip.style.left = (rect.left + rect.width / 2) + 'px';
  tooltip.style.top = (rect.bottom + 10) + 'px';
  tooltip.style.transform = 'translateX(-50%)';
  
  tooltip.classList.add('show');
  
  setTimeout(() => {
    tooltip.classList.remove('show');
  }, 3000);
}

// Mobile action bar functions
function quickBook() {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
  const time = nextHour.getHours() + ':00';
  
  // Auto-fill form with next available slot
  document.getElementById('bookingDate').value = now.toISOString().split('T')[0];
  document.getElementById('timeSelect').value = time;
  document.getElementById('courtSelect').value = '1';
  
  switchView('form');
  showNeonToast('Quick booking form filled!', 'success');
  addRippleEffect(document.querySelector('.action-btn.quick-book'));
}

function showHelp() {
  const helpText = `
    📅 Calendar View: Click available slots to book
    📝 Form View: Fill out booking details
    📱 Mobile: Use these quick actions
    🎯 Quick Book: Auto-fill next available slot
  `;
  showNeonToast(helpText, 'info');
  addRippleEffect(document.querySelector('.action-btn.help'));
}

// Enhanced calendar pulse animation on booking updates
function pulseCalendarOnUpdate() {
  const calendar = document.querySelector('.calendar-container');
  if (calendar) {
    calendar.style.animation = 'neonPulse 1s ease-in-out';
    setTimeout(() => {
      calendar.style.animation = '';
    }, 1000);
  }
}

// Enhanced booking function with animations
function bookCourt() {
  const date = document.getElementById('bookingDate').value;
  const court = document.getElementById('courtSelect').value;
  const time = document.getElementById('timeSelect').value;
  const duration = document.getElementById('duration').value;
  const playerName = document.getElementById('playerName').value;
  
  if (!date || !court || !time || !playerName) {
    showNeonToast('Please fill in all required fields', 'error');
    return;
  }
  
  // Add ripple effect to book button
  addRippleEffect(document.querySelector('.book-button'));
  
  // Create booking object
  const booking = {
    court: parseInt(court),
    date: date,
    time: time,
    duration: parseInt(duration),
    player: playerName,
    createdAt: new Date().toISOString()
  };
  
  // Add to bookings array
  bookings.push(booking);
  localStorage.setItem('bookings', JSON.stringify(bookings));
  
  // Show success message with animation
  showNeonToast(`Court ${court} booked successfully for ${formatTime(time)}!`, 'success');
  
  // Pulse calendar and refresh views
  pulseCalendarOnUpdate();
  displayBookings();
  drawCalendar();
  
  // Clear form
  setTimeout(() => {
    document.getElementById('bookingDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('courtSelect').value = '';
    document.getElementById('timeSelect').value = '';
    document.getElementById('playerName').value = '';
    loadAvailableTimes();
  }, 1000);
}

// Initialize tooltips on page load
document.addEventListener('DOMContentLoaded', function() {
  // Add tooltip functionality to elements with data-tooltip
  document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', function() {
      showNeonTooltip(this.dataset.tooltip, this);
    });
  });
  
  // Add ripple effect to all interactive elements
  document.querySelectorAll('button, .nav-link, .view-btn, .payment-option').forEach(element => {
    element.addEventListener('click', function(e) {
      if (!this.classList.contains('no-ripple')) {
        addRippleEffect(this);
      }
    });
  });
  
  // Close modals on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (document.getElementById('adminLoginModal').classList.contains('show')) {
        closeAdminModal();
      }
      if (document.getElementById('groupBookingModal').classList.contains('show')) {
        closeGroupBookingModal();
      }
    }
  });
});

function displayBookingHistory(filter = 'all') {
  const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
  const timeline = document.getElementById('bookingTimeline');
  
  let filteredHistory = history;
  if (filter !== 'all') {
    filteredHistory = history.filter(booking => booking.status === filter);
  }
  
  if (filteredHistory.length === 0) {
    timeline.innerHTML = `
      <div class="timeline-empty">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
        <h3>No bookings found</h3>
        <p>No bookings match the selected filter.</p>
      </div>
    `;
    return;
  }
  
  // Sort by date (newest first)
  filteredHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  timeline.innerHTML = filteredHistory.map(booking => {
    const bookingDate = new Date(booking.date + 'T' + booking.time + ':00');
    const isUpcoming = bookingDate > new Date();
    const formattedDate = formatDate(booking.date);
    const formattedTime = formatTime(booking.time);
    
    let actions = '';
    if (booking.status === 'upcoming') {
      actions = `
        <div class="timeline-actions">
          <button class="timeline-action" onclick="rescheduleBooking(${booking.id})">Reschedule</button>
          <button class="timeline-action danger" onclick="cancelBooking(${booking.id})">Cancel</button>
        </div>
      `;
    } else if (booking.status === 'completed') {
      actions = `
        <div class="timeline-actions">
          <button class="timeline-action" onclick="rebookSlot(${booking.id})">Book Again</button>
          <button class="timeline-action" onclick="rateBooking(${booking.id})">Rate Experience</button>
        </div>
      `;
    }
    
    return `
      <div class="timeline-item ${booking.status}" data-booking-id="${booking.id}">
        <div class="timeline-header">
          <h3 class="timeline-title">${booking.court} - ${formattedDate}</h3>
          <span class="timeline-status ${booking.status}">${booking.status}</span>
        </div>
        
        <div class="timeline-details">
          <div class="timeline-detail">
            <span class="timeline-detail-label">Time</span>
            <span class="timeline-detail-value">${formattedTime}</span>
          </div>
          <div class="timeline-detail">
            <span class="timeline-detail-label">Duration</span>
            <span class="timeline-detail-value">${booking.duration} minutes</span>
          </div>
          <div class="timeline-detail">
            <span class="timeline-detail-label">Players</span>
            <span class="timeline-detail-value">${booking.groupSize} ${booking.groupSize === 1 ? 'player' : 'players'}</span>
          </div>
          <div class="timeline-detail">
            <span class="timeline-detail-label">Price</span>
            <span class="timeline-detail-value">€${booking.price}</span>
          </div>
          <div class="timeline-detail">
            <span class="timeline-detail-label">Payment</span>
            <span class="timeline-detail-value">${booking.paymentMethod}</span>
          </div>
        </div>
        
        ${actions}
      </div>
    `;
  }).join('');
}

function filterBookingHistory(filter) {
  displayBookingHistory(filter);
}

function rescheduleBooking(bookingId) {
  showToast('Reschedule feature coming soon! You can cancel and create a new booking.', 'info');
}

function cancelBooking(bookingId) {
  if (confirm('Are you sure you want to cancel this booking?')) {
    const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
    const bookingIndex = history.findIndex(b => b.id === bookingId);
    
    if (bookingIndex !== -1) {
      history[bookingIndex].status = 'cancelled';
      localStorage.setItem('bookingHistory', JSON.stringify(history));
      
      showToast('Booking cancelled successfully. Refund will be processed within 24 hours.', 'success');
      displayBookingHistory();
      
      // Trigger real-time sync
      if (typeof triggerRealTimeEvent === 'function') {
        triggerRealTimeEvent('cancellation', {
          court: history[bookingIndex].court,
          time: history[bookingIndex].time,
          action: 'cancelled'
        });
      }
    }
  }
}

function rebookSlot(bookingId) {
  const history = JSON.parse(localStorage.getItem('bookingHistory') || '[]');
  const booking = history.find(b => b.id === bookingId);
  
  if (booking) {
    // Pre-fill form with booking details
    document.getElementById('courtSelect').value = booking.court.split(' ')[1];
    document.getElementById('durationSelect').value = booking.duration;
    
    // Switch to form view
    switchView('form');
    
    showToast('Form pre-filled with previous booking details!', 'success');
  }
}

function rateBooking(bookingId) {
  showToast('Rating feature coming soon! Thank you for your feedback.', 'info');
}

function shareViaEmail() {
  const groupSize = document.querySelector('.size-btn.active').dataset.size;
  const court = document.getElementById('courtSelect')?.value || 'TBD';
  const date = document.getElementById('bookingDate')?.value || 'TBD';
  const time = document.getElementById('timeSelect')?.value || 'TBD';
  
  const subject = `Padel Club Group Booking Invitation`;
  const body = `Hi! You're invited to join our ${groupSize}-player padel game at Padel Club.
  
Details:
- Court: ${court}
- Date: ${date}
- Time: ${time}
- Players: ${groupSize}

Click here to confirm your spot: ${window.location.origin}/booking.html

See you on the court!`;

  const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
  
  showToast('Email invitation opened!', 'success');
}

function shareViaWhatsApp() {
  const groupSize = document.querySelector('.size-btn.active').dataset.size;
  const court = document.getElementById('courtSelect')?.value || 'TBD';
  const date = document.getElementById('bookingDate')?.value || 'TBD';
  const time = document.getElementById('timeSelect')?.value || 'TBD';
  
  const message = `🏓 Padel Game Invitation!

You're invited to join our ${groupSize}-player game:
📍 Court: ${court}
📅 Date: ${date}
⏰ Time: ${time}

Confirm your spot: ${window.location.origin}/booking.html

Let's play! 🎾`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  
  showToast('WhatsApp invitation opened!', 'success');
}

function copyBookingLink() {
  const bookingLink = `${window.location.origin}/booking.html?group=true`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(bookingLink).then(() => {
      showToast('Booking link copied to clipboard!', 'success');
    });
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = bookingLink;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('Booking link copied to clipboard!', 'success');
  }
}

function confirmGroupBooking() {
  const groupSize = parseInt(document.querySelector('.size-btn.active').dataset.size);
  const paymentMethod = document.querySelector('input[name="groupPayment"]:checked').value;
  
  // Collect player details
  const players = [];
  for (let i = 1; i <= groupSize; i++) {
    const nameInput = document.getElementById(`groupPlayer${i}`);
    const emailInput = document.getElementById(`groupPlayerEmail${i}`);
    
    if (nameInput && nameInput.value.trim()) {
      players.push({
        name: nameInput.value.trim(),
        email: emailInput ? emailInput.value.trim() : '',
        isMainPlayer: i === 1
      });
    }
  }
  
  if (players.length < 2) {
    showToast('Please add at least one other player', 'error');
    return;
  }
  
  // Close modal
  closeGroupBookingModal();
  
  // Show progress indicator
  const steps = [
    'Creating group booking...',
    'Sending invitations...',
    paymentMethod === 'split' ? 'Setting up split payments...' : 'Processing payment...',
    'Confirming reservation...',
    'Booking complete!'
  ];
  
  const progressIndicator = showProgressIndicator('Group Booking', steps);
  
  setTimeout(() => {
    progressIndicator.close();
    
    const playerNames = players.map(p => p.name).join(', ');
    showToast(`🎉 Group booking confirmed! Invitations sent to: ${playerNames}`, 'success', 8000);
    
    // Update the main form to indicate group booking
    const groupCheckbox = document.getElementById('groupBooking');
    if (groupCheckbox) {
      groupCheckbox.checked = true;
    }
    
    // Populate group size in main form if it exists
    const groupSizeSelect = document.getElementById('groupSize');
    if (groupSizeSelect) {
      groupSizeSelect.value = groupSize;
    }
  }, 5000);
}

function updateGroupPlayers() {
  const groupSize = document.getElementById('groupSize').value;
  const container = document.getElementById('groupPlayersContainer');
  
  container.innerHTML = '';
  
  // Add input fields for other players (excluding the main player)
  for (let i = 2; i <= groupSize; i++) {
    const playerDiv = document.createElement('div');
    playerDiv.className = 'group-player-input';
    playerDiv.innerHTML = `
      <label for="player${i}">Player ${i} Name:</label>
      <input type="text" id="player${i}" placeholder="Enter player name" required>
      <label for="player${i}Email">Player ${i} Email (for payment link):</label>
      <input type="email" id="player${i}Email" placeholder="Enter email for payment">
    `;
    container.appendChild(playerDiv);
  }
  
  updatePaymentBreakdown();
}

function updatePaymentBreakdown() {
  const splitPayment = document.getElementById('splitPayment');
  const breakdown = document.getElementById('paymentBreakdown');
  const groupSize = document.getElementById('groupSize').value;
  const duration = document.getElementById('duration').value;
  
  if (splitPayment.checked && document.getElementById('groupBooking').checked) {
    breakdown.style.display = 'block';
    const totalPrice = PRICING[duration] || 35;
    const perPerson = Math.round((totalPrice / groupSize) * 100) / 100;
    
    breakdown.innerHTML = `
      <h5>Payment Breakdown</h5>
      ${Array.from({length: groupSize}, (_, i) => `
        <div class="payment-breakdown-item">
          <span>Player ${i + 1}</span>
          <span>€${perPerson}</span>
        </div>
      `).join('')}
      <div class="payment-breakdown-item total">
        <span><strong>Total</strong></span>
        <span><strong>€${totalPrice}</strong></span>
      </div>
      <p style="margin-top: 1rem; font-size: 0.9rem; color: #6c757d;">
        Payment links will be sent to each player's email.
      </p>
    `;
  } else {
    breakdown.style.display = 'none';
  }
}

// Calendar functionality
function initializeCalendarView() {
  // Set current week to this week
  currentWeekStart = new Date();
  const today = currentWeekStart.getDay();
  currentWeekStart.setDate(currentWeekStart.getDate() - today + 1); // Start from Monday
}

function changeWeek(direction) {
  currentWeekStart.setDate(currentWeekStart.getDate() + (direction * 7));
  drawCalendar();
}

function drawCalendar() {
  const grid = document.getElementById('calendarGrid');
  const weekSpan = document.getElementById('currentWeek');
  
  if (!grid || !weekSpan) return;
  
  // Update week display
  const endDate = new Date(currentWeekStart);
  endDate.setDate(endDate.getDate() + 6);
  weekSpan.textContent = `${currentWeekStart.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  
  // Clear grid
  grid.innerHTML = '';
  
  // Time slots
  const timeSlots = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Header row
  const emptyHeader = document.createElement('div');
  emptyHeader.className = 'calendar-cell header';
  grid.appendChild(emptyHeader);
  
  days.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-cell header';
    dayHeader.textContent = day;
    grid.appendChild(dayHeader);
  });
  
  // Time slots and availability
  timeSlots.forEach(time => {
    // Time header
    const timeHeader = document.createElement('div');
    timeHeader.className = 'calendar-cell time-header';
    timeHeader.textContent = time;
    grid.appendChild(timeHeader);
    
    // Days for this time slot
    days.forEach((day, dayIndex) => {
      const cell = document.createElement('div');
      cell.className = 'calendar-cell available';
      
      const cellDate = new Date(currentWeekStart);
      cellDate.setDate(cellDate.getDate() + dayIndex);
      
      // Check if slot is booked
      const isBooked = bookings.some(booking => {
        const bookingDate = new Date(booking.date);
        return bookingDate.toDateString() === cellDate.toDateString() && 
               booking.time === time;
      });
      
      if (isBooked) {
        cell.className = 'calendar-cell booked';
        cell.textContent = 'Booked';
      } else {
        cell.textContent = 'Available';
        cell.onclick = () => selectCalendarSlot(cellDate, time, cell);
      }
      
      // Add drag functionality for existing bookings
      if (isBooked) {
        cell.draggable = true;
        cell.ondragstart = (e) => handleDragStart(e, cellDate, time);
      }
      
      // Add drop functionality for available slots
      if (!isBooked) {
        cell.ondragover = (e) => e.preventDefault();
        cell.ondrop = (e) => handleDrop(e, cellDate, time);
      }
      
      grid.appendChild(cell);
    });
  });
}

function selectCalendarSlot(date, time, cell) {
  // Remove previous selections
  document.querySelectorAll('.calendar-cell.selected').forEach(c => {
    c.classList.remove('selected');
  });
  
  // Select this cell
  cell.classList.add('selected');
  
  // Update form with selected values
  document.getElementById('bookingDate').value = date.toISOString().split('T')[0];
  document.getElementById('timeSelect').innerHTML = `<option value="${time}" selected>${formatTime(time)}</option>`;
  
  // Switch to form view
  switchView('form');
}

function handleDragStart(e, date, time) {
  e.dataTransfer.setData('text/plain', JSON.stringify({date: date.toISOString().split('T')[0], time}));
  e.target.classList.add('dragging');
}

function handleDrop(e, newDate, newTime) {
  e.preventDefault();
  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
  
  // Find the booking to move
  const bookingIndex = bookings.findIndex(b => 
    b.date === data.date && b.time === data.time
  );
  
  if (bookingIndex !== -1) {
    // Update booking
    bookings[bookingIndex].date = newDate.toISOString().split('T')[0];
    bookings[bookingIndex].time = newTime;
    
    // Save to localStorage
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    // Trigger real-time sync
    triggerRealTimeEvent('booking', {
      court: bookings[bookingIndex].court,
      time: newTime,
      action: 'rescheduled'
    });
    
    // Redraw calendar
    drawCalendar();
    
    alert('Booking rescheduled successfully!');
  }
  
  // Remove dragging class
  document.querySelectorAll('.dragging').forEach(el => {
    el.classList.remove('dragging');
  });
}

function loadAvailableTimes() {
  const dateInput = document.getElementById('bookingDate');
  const timeSelect = document.getElementById('timeSelect');
  
  if (!dateInput.value) {
    timeSelect.innerHTML = '<option value="">Choose a time...</option>';
    return;
  }
  
  const selectedDate = new Date(dateInput.value);
  const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Determine operating hours based on day of week
  const hours = dayOfWeek === 0 ? OPERATING_HOURS.sunday : OPERATING_HOURS.weekday;
  
  // Generate time slots (30-minute intervals)
  const timeSlots = [];
  for (let hour = hours.start; hour < hours.end; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  
  // Filter out past times if date is today
  const now = new Date();
  const isToday = selectedDate.toDateString() === now.toDateString();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  const availableSlots = timeSlots.filter(time => {
    if (!isToday) return true;
    
    const [hour, minute] = time.split(':').map(Number);
    return hour > currentHour || (hour === currentHour && minute > currentMinute);
  });
  
  // Populate time select
  timeSelect.innerHTML = '<option value="">Choose a time...</option>';
  availableSlots.forEach(time => {
    const option = document.createElement('option');
    option.value = time;
    option.textContent = formatTime(time);
    timeSelect.appendChild(option);
  });
}

function formatTime(time24) {
  const [hour, minute] = time24.split(':').map(Number);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
}

function isTimeSlotAvailable(court, date, time, duration) {
  const startTime = timeToMinutes(time);
  const endTime = startTime + duration;
  
  return !bookings.some(booking => {
    if (booking.court !== court || booking.date !== date) return false;
    
    const bookingStart = timeToMinutes(booking.time);
    const bookingEnd = bookingStart + booking.duration;
    
    // Check for overlap
    return (startTime < bookingEnd && endTime > bookingStart);
  });
}

function timeToMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function bookCourt() {
  const date = document.getElementById('bookingDate').value;
  const court = parseInt(document.getElementById('courtSelect').value);
  const time = document.getElementById('timeSelect').value;
  const duration = parseInt(document.getElementById('duration').value);
  const playerName = document.getElementById('playerName').value.trim();
  const isGroupBooking = document.getElementById('groupBooking')?.checked || false;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'standard';
  
  const statusElement = document.getElementById('bookingStatus');
  
  // Validation
  if (!date || !court || !time || !duration || !playerName) {
    showStatus('Please fill in all fields.', 'error');
    return;
  }
  
  // Check if time slot is available
  if (!isTimeSlotAvailable(court, date, time, duration)) {
    showStatus('This time slot is not available. Please choose a different time.', 'error');
    return;
  }
  
  // Validate booking time is within operating hours
  const selectedDate = new Date(date);
  const dayOfWeek = selectedDate.getDay();
  const hours = dayOfWeek === 0 ? OPERATING_HOURS.sunday : OPERATING_HOURS.weekday;
  
  const [hour, minute] = time.split(':').map(Number);
  const endHour = hour + Math.floor(duration / 60);
  const endMinute = minute + (duration % 60);
  const finalHour = endHour + Math.floor(endMinute / 60);
  
  if (hour < hours.start || finalHour > hours.end) {
    const dayName = dayOfWeek === 0 ? 'Sunday' : 'Monday-Saturday';
    const startTime = formatTime(`${hours.start}:00`);
    const endTime = formatTime(`${hours.end}:00`);
    showStatus(`Booking must be within operating hours (${dayName}: ${startTime} - ${endTime}).`, 'error');
    return;
  }
  
  let groupPlayers = [playerName];
  let totalPrice = PRICING[duration];
  
  // Handle group booking
  if (isGroupBooking) {
    const groupSize = parseInt(document.getElementById('groupSize')?.value || 2);
    for (let i = 2; i <= groupSize; i++) {
      const playerInput = document.getElementById(`player${i}`);
      if (playerInput && playerInput.value.trim()) {
        groupPlayers.push(playerInput.value.trim());
      }
    }
    
    // Check if split payment is enabled
    if (document.getElementById('splitPayment')?.checked) {
      const perPersonAmount = Math.round((totalPrice / groupSize) * 100) / 100;
      showStatus(`Processing group booking with split payment (€${perPersonAmount} per person)...`, 'info');
    }
  }
  
  // Create booking
  const newBooking = {
    court: court,
    date: date,
    time: time,
    duration: duration,
    player: isGroupBooking ? `${playerName} + ${groupPlayers.length - 1} others` : playerName,
    groupPlayers: isGroupBooking ? groupPlayers : [playerName],
    price: totalPrice,
    paymentMethod: paymentMethod,
    isGroupBooking: isGroupBooking,
    timestamp: new Date().toISOString()
  };
  
  // Process payment based on method
  processPayment(paymentMethod, totalPrice, newBooking);
}

function processPayment(method, amount, booking) {
  const steps = [
    'Validating payment details...',
    'Connecting to payment gateway...',
    'Processing payment...',
    'Confirming booking...',
    'Sending confirmation...'
  ];

  const progressIndicator = showProgressIndicator(`Processing ${method === 'apple' ? 'Apple Pay' : method === 'google' ? 'Google Pay' : 'Credit Card'} Payment`, steps);
  
  // Simulate payment processing with enhanced feedback
  setTimeout(() => {
    progressIndicator.close();
    
    // Add booking to list
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    const successMessage = `✅ Payment successful! Court ${booking.court} booked for ${formatTime(booking.time)} on ${formatDate(booking.date)}. Total: €${booking.price}`;
    showToast(successMessage, 'success', 6000);
    
    // Trigger real-time sync (if function exists)
    if (typeof triggerRealTimeEvent === 'function') {
      triggerRealTimeEvent('booking', {
        court: booking.court,
        time: booking.time,
        player: booking.player,
        action: 'new'
      });
    }
    
    // Reset form
    resetBookingForm();
    
    // Refresh displays
    loadAvailableTimes();
    displayBookings();
    if (document.getElementById('calendarGrid')) {
      drawCalendar();
    }
  }, 5000); // Simulate realistic payment processing time
}

function resetBookingForm() {
  document.getElementById('courtSelect').value = '';
  document.getElementById('timeSelect').value = '';
  document.getElementById('playerName').value = '';
  
  if (document.getElementById('groupBooking')) {
    document.getElementById('groupBooking').checked = false;
  }
  if (document.getElementById('splitPayment')) {
    document.getElementById('splitPayment').checked = false;
  }
  if (document.getElementById('groupBookingSection')) {
    document.getElementById('groupBookingSection').style.display = 'none';
  }
  if (document.getElementById('paymentBreakdown')) {
    document.getElementById('paymentBreakdown').style.display = 'none';
  }
  
  // Reset payment method to apple
  const applePayRadio = document.querySelector('input[name="paymentMethod"][value="apple"]');
  if (applePayRadio) {
    applePayRadio.checked = true;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

// Enhanced status system using new toast notifications
function showStatus(message, type) {
  showToast(message, type);
}

// Enhanced toast notification system
function showToast(message, type = 'info', duration = 5000) {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 400);
  }, duration);
}

// Enhanced progress indicator
function showProgressIndicator(title, steps = []) {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1999;
    backdrop-filter: blur(5px);
  `;

  const indicator = document.createElement('div');
  indicator.className = 'progress-indicator';
  indicator.innerHTML = `
    <div class="spinner"></div>
    <h3>${title}</h3>
    <div class="progress-bar">
      <div class="progress-bar-fill"></div>
    </div>
    <p class="progress-step">Initializing...</p>
  `;

  overlay.appendChild(indicator);
  document.body.appendChild(overlay);

  let currentStep = 0;
  const progressFill = indicator.querySelector('.progress-bar-fill');
  const progressStep = indicator.querySelector('.progress-step');

  function updateProgress() {
    if (currentStep < steps.length) {
      const progress = ((currentStep + 1) / steps.length) * 100;
      progressFill.style.width = `${progress}%`;
      progressStep.textContent = steps[currentStep];
      currentStep++;
      
      setTimeout(updateProgress, 1000);
    } else {
      setTimeout(() => {
        document.body.removeChild(overlay);
      }, 500);
    }
  }

  if (steps.length > 0) {
    setTimeout(updateProgress, 500);
  }

  return {
    close: () => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    }
  };
}

function displayBookings() {
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(booking => booking.date === today);
  
  const gridElement = document.getElementById('bookingsGrid');
  
  if (todayBookings.length === 0) {
    gridElement.innerHTML = '<p>No bookings for today.</p>';
    return;
  }
  
  // Sort bookings by time
  todayBookings.sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));
  
  gridElement.innerHTML = todayBookings.map(booking => `
    <div class="booking-card">
      <h4>Court ${booking.court}</h4>
      <div class="time">${formatTime(booking.time)} - ${formatTime(addMinutesToTime(booking.time, booking.duration))}</div>
      <div class="player">Player: ${booking.player}</div>
      <div class="duration">Duration: ${booking.duration} minutes</div>
      <div class="price">Price: €${booking.price || PRICING[booking.duration] || 35}</div>
    </div>
  `).join('');
}

function addMinutesToTime(time, minutes) {
  const [hour, minute] = time.split(':').map(Number);
  const totalMinutes = hour * 60 + minute + minutes;
  const newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
}

// Load bookings from localStorage on page load
window.addEventListener('load', function() {
  const savedBookings = localStorage.getItem('bookings');
  if (savedBookings) {
    bookings = JSON.parse(savedBookings);
  }
});