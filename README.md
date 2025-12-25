# Bitcoin Shops Thailand

A web application to display and search Bitcoin-accepting shops in Thailand. The app features an interactive map view, filterable list view, and loads data dynamically from Google Sheets.

## 🌟 Features

- **Dual View Modes**: Switch between list and interactive map views
- **Real-time Data**: Loads data from Google Sheets with automatic cache-busting
- **Advanced Filtering**: Search by shop name, filter by province and category
- **Interactive Map**: Clustered markers with detailed popups and Google Maps integration
- **Responsive Design**: Mobile-optimized layout with card-based mobile view
- **Multi-language Support**: Thai language interface with emoji icons

## 📂 Project Structure

```
welb/
├── index.html              # Root landing page
├── assets/
│   └── icon.png            # Favicon
├── shop/
│   ├── index.html          # Shop listing page
│   └── assets/
│       ├── main.css        # Shop styles
│       └── main.js         # Shop JavaScript logic
├── event/
│   ├── index.html          # Event page template
│   ├── detail.html         # Event detail page template
│   └── assets/
│       ├── style.css       # Event detail styles
│       ├── events.js       # Event detail JavaScript
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

You need one of the following to run a local web server:

- **Node.js** (for npx http-server)
- **Python 3** (built-in with macOS/Linux)
- **PHP** (built-in with macOS)

### Running the Development Server

#### Option 1: Using Node.js (Recommended)

```bash
npx http-server -p 8080 -c-1
```

**Note**: The `-c-1` flag disables caching for development.

Then open:
- **Landing Page**: `http://localhost:8080/`
- **Shop Page**: `http://localhost:8080/shop/`

#### Option 2: Using Python

```bash
python3 -m http.server 8080
```

Then open:
- **Landing Page**: `http://localhost:8080/`
- **Shop Page**: `http://localhost:8080/shop/`

## 🚀 Production Deployment

### Cloudflare Pages

This static site can be deployed to Cloudflare Pages with zero build configuration.

#### Deploy via Git (Recommended)

1. Push your code to GitHub/GitLab
2. Connect your repository to Cloudflare Pages
3. Use these settings:
   - **Build command:** *(leave empty)*
   - **Build output directory:** `.`
   - **Root directory:** `/`

#### Deploy Command

```bash
npx http-server -p 8080
```

## 📊 Google Sheets Integration

### Setting Up Your Data Source

1. **Create a Google Sheet**

2. **Publish Your Sheet as CSV**:
   - Open your Google Sheet
   - Go to **File → Share → Publish to web**
   - Choose the specific sheet tab
   - Select **Comma-separated values (.csv)** format
   - Click **Publish**
   - Copy the generated URL

3. **Update the Data Source**:
   - Open `shop/assets/main.js`
   - Find the `GOOGLE_SHEET_CSV_URL` constant
   - Replace with your published CSV URL:

```javascript
const GOOGLE_SHEET_CSV_URL = 'YOUR_GOOGLE_SHEET_CSV_URL_HERE';
```

### Cache-Busting

The app automatically adds a timestamp parameter to the Google Sheets URL on every page load, ensuring users always see the latest data:

```javascript
const cacheBustedUrl = GOOGLE_SHEET_CSV_URL + '&timestamp=' + new Date().getTime();
```

## 🎨 Category Badge Colors

The app automatically colors category badges based on keywords:

- **Food/Restaurant/Cafe** → Yellow (`bg-food`)
- **Accommodation/Hotel** → Blue (`bg-accom`)
- **Shop/Store** → Red (`bg-shop`)
- **Health/Clinic** → Gray (`bg-health`)
- **Cannabis** → Green (`bg-cannabis`)
- **Service** → Purple (`bg-service`)

## 🗺️ Map Features

- **Interactive Markers**: Click on map markers to view shop details
- **Marker Clustering**: Automatically groups nearby markers for better performance
- **Google Maps Integration**: "Navigate" button opens directions in Google Maps
- **Jump to Map**: Click the location button in list view to jump to that shop on the map

## 📱 Mobile Responsive

The app is fully responsive with special mobile optimizations:

- Card-based layout on mobile devices
- Optimized table display (no visible headers)
- Touch-friendly buttons and controls
- Adaptive map height

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling with custom variables
- **JavaScript (ES6+)** - Application logic
- **jQuery** - DOM manipulation

### Libraries
- **Bootstrap 5.3** - UI framework
- **DataTables** - Table management and filtering
- **Leaflet.js** - Interactive maps
- **Leaflet.markercluster** - Map marker clustering
- **PapaParse** - CSV parsing
- **Font Awesome 6** - Icons
- **Google Fonts (Sarabun)** - Thai-friendly typography

## 🔧 Development Tips

### Browser Caching Issues

If you're not seeing your changes:

1. **Hard Refresh**:
   - Chrome/Edge (Mac): `Cmd + Shift + R`
   - Chrome/Edge (Windows): `Ctrl + Shift + R`
   - Firefox: `Cmd/Ctrl + Shift + R`
   - Safari: `Cmd + Option + R`

2. **Disable Cache in DevTools**:
   - Open DevTools (`F12`)
   - Go to Network tab
   - Check "Disable cache"
   - Keep DevTools open while developing

3. **Use http-server with cache-busting**:
   ```bash
   npx http-server -p 8080 -c-1
   ```

### Modifying Styles

Edit `shop/assets/main.css` to customize:
- Colors (see `:root` CSS variables)
- Layout and spacing
- Button styles
- Mobile responsive breakpoints

### Modifying Behavior

Edit `shop/assets/main.js` to customize:
- Data loading logic
- Filter behavior
- Map settings
- Category badge logic

## 🤝 Contributing

This project is maintained by **WelB**. To contribute:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is open source and available for use.

## 🙋 Support

For questions or issues, please contact the development team.

---

**Developed by WelB** 🚀
