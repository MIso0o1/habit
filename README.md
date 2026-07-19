# Habit & Skill Tracker

## Project Overview

This project is a **Habit & Skill Tracker** application designed to help users build consistency in their daily routines. It features a unique **3D interactive tree visualization** that reflects the user's progress: as habits are logged, the tree's health improves, providing a visual metaphor for growth and well-being. The application allows users to add, track, update, and delete habits, with authentication powered by Supabase.

## Features

*   **User Authentication**: Secure login and registration using Supabase.
*   **Habit Management**: Create, view, update, and delete daily habits or skills.
*   **Habit Logging**: Mark habits as completed for the day.
*   **3D Tree Visualization**: An interactive 3D model (Cherry Blossom or Ficus Bonsai) whose health dynamically updates based on habit completion.
*   **Responsive Design**: A modern and intuitive user interface built with React and TailwindCSS.
*   **Contact Form**: A simple contact form for user feedback.

## Technologies Used

### Frontend

*   **React**: A JavaScript library for building user interfaces.
*   **Vite**: A fast build tool for modern web projects.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
*   **TailwindCSS**: A utility-first CSS framework for rapidly building custom designs.
*   **Framer Motion**: A production-ready motion library for React.
*   **Wouter**: A tiny (~1KB) routing library for React.
*   **@react-three/fiber & @react-three/drei**: React reconciler and helpers for Three.js, enabling declarative 3D scenes.
*   **Sonner**: A modern toast library for React.

### Backend & Database

*   **Supabase**: An open-source Firebase alternative providing authentication and a PostgreSQL database.
*   **Express**: A minimal and flexible Node.js web application framework (for API endpoints like the contact form).
*   **tsx**: A TypeScript execution environment for Node.js.

### Development Tools

*   **pnpm**: A fast, disk space efficient package manager.
*   **Vite**: Used as the development server and build tool.
*   **Prettier**: An opinionated code formatter.
*   **ESBuild**: An extremely fast JavaScript bundler and minifier.

## Setup and Installation

To get this project up and running on your local machine, follow these steps:

### Prerequisites

*   Node.js (v18 or higher)
*   pnpm (recommended package manager)
*   A Supabase project with a PostgreSQL database configured for authentication and the following tables:
    *   `user_profiles`: `id (UUID, PK)`, `tree_health (INT, default 100)`, `last_check_date (DATE)`
    *   `habits`: `id (BIGINT, PK)`, `user_id (UUID, FK to user_profiles.id)`, `name (TEXT)`, `created_at (TIMESTAMP WITH TIME ZONE)`
    *   `habit_logs`: `id (BIGINT, PK)`, `habit_id (BIGINT, FK to habits.id)`, `date (DATE)`

### Environment Variables

Create a `.env` file in the root of the project with the following variables. These are typically provided by your Supabase project settings.

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Note**: The `supabase.ts` file currently hardcodes these values. For production environments, it is highly recommended to use environment variables for security. You would modify `client/src/lib/supabase.ts` to read from `process.env.SUPABASE_URL` and `process.env.SUPABASE_ANON_KEY`.

### Installation Steps

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd habit
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    This command will start both the frontend (Vite) and the backend (Express) concurrently.
    ```bash
    pnpm dev
    ```

    The application should now be accessible at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

To build the project for production, run:

```bash
pnpm build
```

This will create a `dist` directory containing the optimized frontend assets and a `dist` directory in the `server` folder for the backend.

To start the production server:

```bash
pnpm start
```

## Usage

1.  **Register/Login**: Create an account or log in to start tracking your habits.
2.  **Add Habits**: Use the dashboard to add new habits or skills you want to track.
3.  **Log Progress**: Mark habits as completed for the day on the dashboard.
4.  **Observe Your Tree**: Visit the home page to see your 3D tree grow and thrive as you maintain your habits. Its health will reflect your consistency.
5.  **Update/Delete Habits**: Manage your habits from the dashboard.

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

## Contact

For any questions or feedback, please open an issue on GitHub or use the contact form within the application.

---

**Manus AI**
February 3, 2026
