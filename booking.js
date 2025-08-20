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

// View switching functionality
function switchView(viewType) {
  const formView = document.getElementById('booking');
  const calendarView = document.getElementById('calendar-view');
  const formBtn = document.getElementById('formViewBtn');
  const calendarBtn = document.getElementById('calendarViewBtn');
  
  if (viewType === 'form') {
    formView.classList.add('active');
    calendarView.classList.remove('active');
    formBtn.classList.add('active');
    calendarBtn.classList.remove('active');
  } else {
    formView.classList.remove('active');
    calendarView.classList.add('active');
    formBtn.classList.remove('active');
    calendarBtn.classList.add('active');
    drawCalendar();
  }
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
  const section = document.getElementById('groupBookingSection');
  
  if (checkbox.checked) {
    section.style.display = 'block';
    updateGroupPlayers();
  } else {
    section.style.display = 'none';
  }
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