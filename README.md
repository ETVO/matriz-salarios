# 📊 Matriz de Salários (Salary Matrix)

A dynamic salary matrix management application developed for an accounting office, enabling efficient salary data organization and manipulation with local storage capabilities.

## 🎯 Overview

This **lightweight, single-page application** allows accounting professionals to create, edit, and manage salary matrices with a user-friendly interface. All data is stored locally using IndexedDB for privacy and offline functionality, with CSV import/export capabilities for data portability.

The application can be run directly from the `index.html` file without any server setup, making it easy to deploy and use anywhere.

## ✨ Key Features

- **Dynamic Matrix Creation**: Build and customize salary matrices on the fly
- **Real-time Editing**: Edit salary data directly in the interface with instant updates
- **Local Storage**: Data persists locally using IndexedDB - no server required
- **CSV Export**: Export your salary matrices to CSV format for use in spreadsheets
- **CSV Import**: Import existing salary data from CSV files
- **Offline-First**: Works completely offline, ensuring data privacy and availability

## 🛠️ Tech Stack

- **Frontend Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite
- **Storage**: IndexedDB for local data persistence
- **Languages**: JavaScript, Vue, HTML, CSS

## 🚀 Getting Started

### Quick Start (No Installation Required)

This application is **super lightweight** and can be run directly from the built `index.html` file:

```bash
# Clone the repository
git clone https://github.com/ETVO/matriz-salarios.git

# Install dependencies and build
npm install
npm run build

# Open dist/index.html in your browser - that's it!
```

After building, simply open `dist/index.html` in any modern browser. The entire `dist` folder can be deployed to any static hosting or run locally with no backend infrastructure.


### Development Setup

For development or to make modifications:

#### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

#### Installation

```bash
# Clone the repository
git clone https://github.com/ETVO/matriz-salarios.git

# Navigate to project directory
cd matriz-salarios

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 💡 Use Cases

- **Accounting Offices**: Manage client salary structures and calculations
- **HR Departments**: Track and organize employee salary matrices
- **Payroll Management**: Maintain detailed salary breakdowns for processing
- **Budget Planning**: Create and compare different salary scenarios

## 🔒 Privacy & Security

All data is stored locally in your browser using IndexedDB. No data is sent to external servers, ensuring complete privacy and compliance with data protection regulations.

## 📦 Project Structure

```
matriz-salarios/
├── src/
│   ├── components/     # Vue components
│   ├── composables/    # Vue composition functions
│   └── assets/         # Static assets
├── public/             # Public static files
└── vite.config.js      # Vite configuration
```

## 🤝 Contributing

This is a freelance project developed for a specific client. However, if you have suggestions or find issues, feel free to open an issue.

## 📝 License

This project was developed as custom software for a client.

## 👤 Author

**Estevão Pereira Rolim**
- GitHub: [@ETVO](https://github.com/ETVO)
- LinkedIn: [Estevão P. Rolim](https://linkedin.com/in/estevao-p-rolim)

---

**Note**: This application was developed as a freelance project for an accounting office to streamline their salary management workflow.
