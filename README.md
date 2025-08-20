# Padel Club Smart Dashboard - Split Login UI

This project implements a modern split login system for the Padel Club dashboard with separate authentication flows for customers and administrators.

## Features

### 🎯 Split Login System
- **Customer Login**: Access to booking, profile, XP rewards, and group features
- **Admin Login**: Access to management dashboard, analytics, and staff controls
- **Landing Page**: Clean interface with two distinct login options

### 🎨 UI/UX Design
- **Neon Green Theme**: Primary branding with neon green gradients
- **Subdued Admin Palette**: Orange/amber accents for admin interface distinction
- **Dark Matte Background**: Professional dark theme throughout
- **Responsive Design**: Mobile-first approach with breakpoints
- **Smooth Animations**: CSS transitions and keyframe animations

### ♿ Accessibility Features
- **Keyboard Navigation**: Full tab-based navigation support
- **Focus Management**: Visible focus rings with neon styling
- **ARIA Labels**: Screen reader support with descriptive labels
- **Escape Key Support**: Modal dismissal with Escape key
- **Mobile Friendly**: Touch-optimized interface

### 🔐 Authentication System
- **Role-Based Access**: Customer vs Admin permissions
- **Demo Mode**: Easy testing with one-click demo login
- **Session Management**: localStorage-based authentication state
- **Auto-Redirect**: Smart routing based on user role
- **Logout Functionality**: Clean session termination

## File Structure

```
/
├── login.html          # Main landing page with split login
├── index.html          # Customer dashboard
├── admin.html          # Admin dashboard
├── booking.html        # Court booking interface
├── style.css           # Base styling and theme variables
├── booking.css         # Additional styles and animations
├── script.js           # Main JavaScript functionality
├── booking.js          # Booking-specific functionality
└── README.md           # This documentation
```

## Usage

### Customer Login Flow
1. Visit `login.html`
2. Click "Customer Login" (neon green button)
3. Use demo login or enter credentials
4. Redirected to customer dashboard (`index.html`)
5. Access booking, XP, check-in, shop features

### Admin Login Flow
1. Visit `login.html`
2. Click "Admin Login" (orange/amber button)
3. Use demo login or enter admin credentials
4. Redirected to admin dashboard (`admin.html`)
5. Access management tools, analytics, staff controls

### Navigation
- Login buttons always visible in header when not authenticated
- Logout button appears when authenticated
- Role-based menu visibility (admin features hidden from customers)

## Technical Implementation

### CSS Custom Properties
```css
:root {
  --primary-green: #00ff88;
  --accent-green: #10b981;
  --matt-black: #1a1a1a;
  --granite-grey: #6b7280;
  /* ... more variables */
}
```

### Role-Based Authentication
```javascript
// Check user role and update navigation
function checkUserAccess() {
  userRole = localStorage.getItem('userRole');
  isAdmin = localStorage.getItem('isAdmin') === 'true';
  isCustomer = localStorage.getItem('isCustomer') === 'true';
  updateNavigation();
}
```

### Modal System
- Customer login modal with email/password fields
- Admin login modal with username/password fields
- Keyboard accessibility with focus management
- Escape key support for modal dismissal

## Responsive Breakpoints

- **Mobile**: 375px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Local Development
```bash
# Start local server
python3 -m http.server 8000

# Visit http://localhost:8000/login.html
```

### Testing Checklist
- [x] Customer login → customer dashboard redirect
- [x] Admin login → admin dashboard redirect
- [x] Logout functionality clears session
- [x] Mobile responsive design
- [x] Keyboard navigation works
- [x] Focus management in modals
- [x] Role-based navigation visibility

## Future Enhancements

- [ ] Remember login preference
- [ ] Password recovery flow
- [ ] Multi-factor authentication
- [ ] Social login integration
- [ ] User profile management
- [ ] Advanced admin permissions

## License

© 2025 Padel Club. All rights reserved.