# Gaza Chronicle 🇵🇸

A comprehensive historical chronicle and live news dashboard documenting the conflict in Gaza. This project is a static web application designed to provide context, timeline events, and real-time updates in a dignified, editorial format.

## Features

- **Historical Timeline**: A curated timeline of key events from 1948 to the present.
- **Contextual Analysis**: Key data on demographics, economy, and humanitarian impact.
- **Interactive Map**: Explorable map of the Gaza Strip and surrounding regions.
- **Live News Feed**: Real-time integration with BBC News (via client-side fetch) to show the latest headlines.
- **Editorial Design**: Clean, respectful UI with support for light mode and responsive layouts.

## Live Demo

This project is designed to be hosted on GitHub Pages.
[Link to the project's official webpage](https://victorpolitakis.github.io/gaza-chronicle/)

## Local Development

Since this is a static site, you don't need a backend server to run it!

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/gaza-chronicle.git
    cd gaza-chronicle
    ```

2.  **Open `index.html`:**
    Simply open the `index.html` file in your browser.
    
    *OR* for a better experience (to avoid CORS issues with some assets), use a simple static server:
    ```bash
    # using python
    python3 -m http.server 8000
    
    # OR using npx
    npx serve
    ```

3.  Navigate to `http://localhost:8000`

## Deployment

To deploy to GitHub Pages:

1.  Push your code to a GitHub repository.
2.  Go to **Settings** > **Pages**.
3.  Under **Source**, select `Deploy from a branch`.
4.  Select `main` (or `master`) as the branch and `/ (root)` as the folder.
5.  Click **Save**.

Your site will be live in a few minutes!

## Technologies

- **HTML5 & CSS3**: Semantic structure and custom properties for styling.
- **JavaScript (Vanilla)**: DOM manipulation and state management.
- **Leaflet.js**: Interactive maps.
- **CartoDB**: Map tiles.
- **AllOrigins**: CORS proxy for fetching external news data.

## Credits

- News data sourced from [BBC News](https://www.bbc.com/news).
- Map data © OpenStreetMap contributors.
- Design inspired by modern editorial standards.

---
*This project is for educational and informational purposes.*
