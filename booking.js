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
});

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
  
  // Create booking
  const newBooking = {
    court: court,
    date: date,
    time: time,
    duration: duration,
    player: playerName,
    price: PRICING[duration]
  };
  
  bookings.push(newBooking);
  
  // Save to localStorage for persistence
  localStorage.setItem('bookings', JSON.stringify(bookings));
  
  const price = PRICING[duration];
  showStatus(`Court ${court} booked successfully for ${formatTime(time)} on ${formatDate(date)}! Total: €${price}`, 'success');
  
  // Reset form
  document.getElementById('courtSelect').value = '';
  document.getElementById('timeSelect').value = '';
  document.getElementById('playerName').value = '';
  
  // Refresh displays
  loadAvailableTimes();
  displayBookings();
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

function showStatus(message, type) {
  const statusElement = document.getElementById('bookingStatus');
  statusElement.textContent = message;
  statusElement.className = `status-message ${type}`;
  
  // Add toast animation
  if (type === 'success') {
    statusElement.classList.add('toast-success');
  }
  
  // Auto-hide success messages after 5 seconds with fade out
  if (type === 'success') {
    setTimeout(() => {
      statusElement.classList.add('toast-fadeout');
      setTimeout(() => {
        statusElement.style.display = 'none';
        statusElement.classList.remove('toast-success', 'toast-fadeout');
      }, 300);
    }, 5000);
  }
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