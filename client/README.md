# Twitter Clone

A modern, responsive Twitter clone built with React and TypeScript. This project replicates the core functionality and UI of Twitter (now X) with a clean, dark-themed interface.

![Twitter Clone Screenshot](screenshot.png)

## Features

- **Modern Three-Column Layout**: Matching Twitter's design with responsive sidebars
- **Dark Theme**: Sleek dark mode interface throughout the application
- **Home Feed**: View and interact with tweets in your timeline
- **Tweet Composition**: Create and post new tweets with character limit
- **Notifications**: View likes, retweets, and mentions with filtering options
- **Messages**: Real-time messaging interface with conversation selection
- **Communities**: Discover and join communities based on interests
- **Responsive Design**: Optimized for various screen sizes
- **Navigation**: Seamless navigation between different sections using React Router

## Tech Stack

- **React 18.3+**: Modern React with hooks and functional components
- **TypeScript**: For type safety and better developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **React Router**: For client-side routing
- **Lucide React**: Modern icon library
- **ESLint**: For code linting and best practices

## Project Structure

```
src/
├── components/         # React components
│   ├── CommunitiesPage.tsx
│   ├── MessagesPage.tsx
│   ├── NotificationsPage.tsx
│   ├── SideNav.tsx
│   ├── TrendingSidebar.tsx
│   ├── Tweet.tsx
│   ├── TweetBox.tsx
│   └── ...
├── data/              # Mock data for development
├── App.tsx           # Main application component
├── types.ts          # TypeScript type definitions
├── main.tsx          # Application entry point
└── ...
```

## Layout Structure

### Left Sidebar (SideNav)
- Fixed position navigation menu
- Twitter logo
- Main navigation links with React Router integration
- Post button
- Uses Lucide React icons

### Main Content
- Dynamic content loading with React Router
- Different pages for Home, Explore, etc.
- Responsive layout with proper spacing
- Sticky header
- Tweet composition and feed

### Right Sidebar (TrendingSidebar)
- Fixed position with overflow scroll
- Search bar with sticky positioning
- Premium subscription card
- Trending topics section

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/supriya904/ProjectX.git
   cd twitter-clone
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
# or
yarn build
```

The build artifacts will be stored in the `dist/` directory.

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build locally

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Twitter (X) for the design inspiration
- React team for the amazing library
- Tailwind CSS for the utility-first approach to styling
