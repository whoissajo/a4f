# Flutter Android App Requirements: Replication of Web Application

## 1. Project Goal

The primary objective is to create a Flutter Android application that is a pixel-perfect and functionally identical replication of the existing web application. The Android app must provide the same user experience, features, and visual design as the web counterpart.

## 2. Web Application Overview

The existing web application is a chat-based interface, likely an AI chatbot or similar interactive tool. It is built using:
*   **Framework**: Next.js (React)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, custom CSS modules
*   **UI Components**: Utilizes a component library (likely Shadcn/ui based on `components/ui` directory) for various UI elements like buttons, dialogs, inputs, etc.
*   **Key Features**:
    *   Interactive chat interface with message display.
    *   Chat history management (sidebar).
    *   Settings and API key management dialogs.
    *   Responsive design for various screen sizes.
    *   Dynamic UI elements and animations (e.g., spotlight cursor, text animations).
    *   API integration for core functionality (e.g., `app/actions.ts`, API key management).
    *   Local storage for user preferences/data.

## 3. Core Functionality and UI Mapping (Web to Flutter)

The Flutter application must replicate the following core functionalities and UI elements:

### 3.1. Application Structure & Navigation
*   **Main Layout**: Replicate the global layout defined in `app/layout.tsx`, including any providers or context setup.
*   **Home Page**: Replicate the content and functionality of `app/page.tsx`.
*   **New Chat Page**: Replicate the content and functionality of `app/new/page.tsx`.
*   **Navigation**: Implement seamless navigation between the home page and new chat page, similar to the web app's routing.

### 3.2. UI Components
Translate the following web components into equivalent Flutter widgets, ensuring visual fidelity and responsiveness:

*   **Chat Interface**:
    *   `components/messages.tsx`: Display a list of chat messages.
    *   `components/message.tsx`: Individual chat message rendering (user/AI, markdown support).
    *   `components/system-prompt-input.tsx`: Input area for system prompts.
    *   `components/interaction-buttons.tsx`: Buttons for user interaction (e.g., send, stop).
*   **Sidebar**:
    *   `components/chat-history-sidebar.tsx`: Sidebar for displaying chat history/conversations. Must be collapsible/toggleable.
*   **Dialogs/Modals**:
    *   `components/settings-dialog.tsx`: User settings interface.
    *   `components/api-keys-dialog.tsx` (and related `components/api-keys/`): Interface for managing API keys.
    *   `components/account-dialog.tsx`: Account-related settings.
    *   `components/customization-dialog.tsx`: Customization options.
*   **Core UI Elements (from `components/ui/`)**:
    *   `button.tsx`: Buttons.
    *   `input.tsx`: Text inputs.
    *   `textarea.tsx`: Multi-line text areas.
    *   `dialog.tsx`: Dialog/modal components.
    *   `switch.tsx`: Toggle switches.
    *   `slider.tsx`: Sliders.
    *   `tooltip.tsx`: Tooltips.
    *   `accordion.tsx`, `collapsible.tsx`, `tabs.tsx`, `select.tsx`, `dropdown-menu.tsx`: Complex UI elements as used in the web app.
    *   `card.tsx`, `alert.tsx`, `badge.tsx`, `separator.tsx`, `skeleton.tsx`, `progress.tsx`: Display and utility components.
*   **Animations & Effects**:
    *   `components/spotlight-cursor.tsx`: Replicate the spotlight cursor effect.
    *   `components/text-fade-animation.tsx`, `components/thinking-text-animation.tsx`, `components/thinking-card.tsx`: Replicate text and thinking state animations.
    *   `components/core/border-trail.tsx`, `components/core/text-loop.tsx`, `components/core/text-morph.tsx`, `components/core/text-shimmer.tsx`: Replicate any advanced text/border effects.
*   **Utility Components**:
    *   `components/markdown.tsx`: Implement a robust markdown renderer for Flutter, supporting all markdown features used in the web app.
    *   `components/error-message.tsx`: Error display.
    *   `components/auto-save-indicator.tsx`: Auto-save status indicator.

### 3.3. State Management & Logic
*   **Chat Logic**: Replicate the core chat logic found in `app/page-hooks/use-chat-logic.ts` and its sub-modules. This includes handling user input, AI responses, message history, and any real-time updates.
*   **API Key Management**: Replicate the logic from `hooks/use-api-key.tsx` and `hooks/use-api-keys.tsx` for securely storing and retrieving API keys.
*   **Local Storage**: Implement equivalent local storage mechanisms (e.g., `shared_preferences` or `hive`) to replicate `hooks/use-local-storage.tsx` for persisting user settings and data.
*   **Responsive Design Logic**: Replicate `hooks/use-media-query.tsx`, `hooks/use-mobile.ts`, `hooks/use-window-size.tsx` to adapt UI based on screen size and orientation.

### 3.4. API Integration
*   **Actions**: Replicate the functionality of `app/actions.ts` for server-side interactions. This will likely involve making HTTP requests to the same backend endpoints the web app uses.
*   **Authentication/Authorization**: If the web app has any authentication, it must be replicated. (No explicit auth files seen, but assume if present).

### 3.5. Styling and Assets
*   **Visual Design**: The Flutter app must match the web app's color scheme, typography, spacing, and overall aesthetic. Pay close attention to details like shadows, borders, and gradients.
*   **Custom Scrollbars**: Replicate the custom scrollbar styles from `styles/custom-scrollbar.css` and `styles/premium-scrollbar.css`.
*   **Assets**: Include all necessary images and icons from the `public/` directory (e.g., `anthropic.svg`, `openai.svg`, `favicon.ico`, `icon.png`, `opengraph-image.jpg`, `twitter-image.jpg`). SVG assets should be rendered correctly.

## 4. Technical Requirements

*   **Flutter Version**: Latest stable Flutter release.
*   **Dart Version**: Compatible with the chosen Flutter version.
*   **Target Platform**: Android (minimum API level 21).
*   **Dependencies**:
    *   HTTP client for API calls (e.g., `dio` or `http`).
    *   State management solution (e.g., `provider`, `bloc`, `riverpod`, or `getx` - choose one that best fits the web app's state logic).
    *   Markdown rendering package (e.g., `flutter_markdown`).
    *   Local storage package (e.g., `shared_preferences` or `hive`).
    *   SVG rendering package (e.g., `flutter_svg`).
    *   Any other packages required to replicate specific UI components or animations.

## 5. Step-by-Step Build Guide for AI

This section outlines the sequential steps for an AI to build the Flutter Android application.

### Step 1: Project Setup and Initial Configuration
1.  **Create New Flutter Project**:
    ```bash
    flutter create --org com.example.chatapp chatapp_android
    cd chatapp_android
    ```
2.  **Add Dependencies**: Open `pubspec.yaml` and add necessary dependencies.
    *   `http` or `dio` for network requests.
    *   `provider` (or chosen state management solution).
    *   `flutter_markdown` for markdown rendering.
    *   `shared_preferences` for local storage.
    *   `flutter_svg` for SVG assets.
    *   Any other UI/animation specific packages.
3.  **Get Packages**:
    ```bash
    flutter pub get
    ```
4.  **Configure Assets**: Create an `assets/` directory and copy all relevant images, icons, and fonts from the web app's `public/` directory. Update `pubspec.yaml` to include these assets.

### Step 2: Replicate Core UI Structure and Layout
1.  **Main App Widget**: Create `lib/main.dart` to define the root `MaterialApp` or `CupertinoApp` and set up themes.
2.  **Global Theme and Styling**: Define a `ThemeData` that closely matches the web app's color scheme, typography, and overall visual style. Translate Tailwind CSS concepts to Flutter's theming system.
3.  **Layout Widgets**: Create `lib/screens/home_screen.dart` and `lib/screens/new_chat_screen.dart` to represent the main pages.
4.  **Responsive Design**: Implement `MediaQuery` or `LayoutBuilder` to adapt UI elements based on screen size, replicating the web app's responsiveness.

### Step 3: Implement Reusable UI Components
1.  **Create `lib/widgets/` directory**: This will house all reusable UI components.
2.  **Basic UI Elements**: Create widgets for `Button`, `Input`, `TextArea`, `Switch`, `Slider`, `Tooltip`, etc., mimicking the `components/ui/` elements.
3.  **Complex UI Elements**: Implement `Dialog`, `Accordion`, `Collapsible`, `Tabs`, `Select`, `DropdownMenu` widgets as needed, ensuring they match the web app's appearance and behavior.
4.  **Chat Specific Components**:
    *   `MessageWidget` (for `components/message.tsx`): Renders individual chat messages, including markdown.
    *   `MessagesListWidget` (for `components/messages.tsx`): Displays the scrollable list of messages.
    *   `SystemPromptInputWidget` (for `components/system-prompt-input.tsx`): Input field for prompts.
    *   `InteractionButtonsWidget` (for `components/interaction-buttons.tsx`): Buttons for chat actions.
5.  **Sidebar Component**: Create `ChatHistorySidebarWidget` (for `components/chat-history-sidebar.tsx`) with its toggle functionality.
6.  **Dialog Components**: Create widgets for `SettingsDialog`, `ApiKeysDialog`, `AccountDialog`, `CustomizationDialog`, etc.

### Step 4: Implement State Management and Business Logic
1.  **State Management Setup**: Integrate the chosen state management solution (e.g., `Provider` for `use-chat-logic.ts`, `use-api-key.tsx`, `use-local-storage.tsx`).
2.  **Chat Logic Replication**: Translate the logic from `app/page-hooks/use-chat-logic.ts` into a Flutter state management class (e.g., a `ChangeNotifier` or `Bloc`). This includes handling message states, user input, AI responses, and history.
3.  **API Key Management**: Implement a service or provider for managing API keys, replicating `hooks/use-api-key.tsx` and `hooks/use-api-keys.tsx`.
4.  **Local Storage Integration**: Use `shared_preferences` or `hive` to persist user settings and data, mirroring `hooks/use-local-storage.tsx`.
5.  **Utility Functions**: Translate `lib/utils.ts` and `lib/token-utils.ts` into Dart utility functions.

### Step 5: API Integration
1.  **API Service**: Create a dedicated service class (e.g., `lib/services/api_service.dart`) to handle all API calls, replicating the functionality of `app/actions.ts`.
2.  **Data Models**: Define Dart classes for data models (e.g., `Message`, `ChatSession`, `Settings`) that correspond to the data structures used in the web app's API interactions.

### Step 6: Animations and Advanced UI
1.  **Replicate Animations**: Implement Flutter animations to mimic `spotlight-cursor.tsx`, `text-fade-animation.tsx`, `thinking-text-animation.tsx`, and other visual effects. Use `AnimatedContainer`, `Opacity`, `Transform`, `CustomPainter`, or `Rive` as appropriate.
2.  **Custom Scrollbars**: Implement custom scroll physics or use packages to replicate the web app's custom scrollbar appearance.

### Step 7: Testing and Build
1.  **Unit/Widget Testing**: Implement basic unit and widget tests for critical components and logic.
2.  **Build Android APK/AppBundle**:
    ```bash
    flutter build apk --release
    # or
    flutter build appbundle --release
    ```
3.  **Run on Device/Emulator**:
    ```bash
    flutter run
    ```

## 6. Assumptions and Constraints

*   The backend API endpoints used by the web app are accessible and will be used directly by the Flutter app.
*   No server-side rendering (SSR) or specific Next.js server features need to be replicated, only the client-side functionality.
*   The AI is expected to make reasonable design decisions for Flutter-specific implementations (e.g., choosing appropriate Flutter widgets, state management patterns) while adhering strictly to the visual and functional requirements.
*   Any third-party libraries or services used by the web app (e.g., analytics, specific authentication providers) that are not explicitly mentioned but are critical for functionality should be identified and integrated into the Flutter app. (Based on the file list, no obvious external services beyond core chat functionality are apparent, but this is a general note).
*   The `main-got` directory is considered a legacy or alternative version and its contents should not be prioritized over the top-level `app/` and `components/` directories.
