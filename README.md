# Wiki Project

A Wikipedia-style wiki application built with Next.js and Markdown, featuring a clean three-column layout with navigation, content, and metadata sidebars.

## Features

- **PIN Authentication**: All CRUD operations protected by an 8-digit PIN
- **Section Management**: Create, edit, and delete sections to organize your content
- **Page Management**: Add, edit, delete, and move pages between sections
- **Markdown Editor**: Write content in Markdown with live preview
- **Image Upload**: Upload images from your computer and insert into articles
- **Metadata Fields**: Add custom metadata fields (key-value pairs) to each page
- **Search Functionality**: Search across all articles by title and content
- **Hover Actions**: Convenient hover buttons for quick access to actions
- **Local Storage**: All data is persisted in local JSON files
- **Wikipedia-inspired UI**: Clean, familiar interface based on Wikipedia's design

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

## PIN Authentication

All create, update, and delete operations require a 6-digit PIN for security.

### Default PIN

The default PIN is: **123456**

### Session Management

Once you successfully enter your PIN, you won't be asked again for **15 minutes**. After 15 minutes of inactivity, you'll need to re-enter your PIN for security.

### Changing the PIN

To change your PIN, run the following command in your terminal:

```bash
npm run change-pin
```

You will be prompted to:
1. Enter your current PIN (if one exists)
2. Enter your new 6-digit PIN
3. Confirm your new PIN

The PIN is stored securely as a SHA-256 hash in `data/auth-config.json`.

**Important**: The PIN can ONLY be changed via the terminal command. There is no way to change it through the web interface for security reasons.

## How to Use

### Adding a Section

1. Click the **+** button next to "CONTENTS" in the left sidebar
2. Enter your 8-digit PIN when prompted
3. Enter a section title
4. The new section will appear in the sidebar

### Adding a Page

1. Hover over a section in the left sidebar
2. Click the **+** button that appears next to the section name
3. Fill in the page details:
   - **Section**: Select which section the page belongs to
   - **Page Title**: Enter the page title
   - **Edit Tab**: Write your content in Markdown
   - **Preview Tab**: See how your content will look
   - **Metadata Tab**: Add an image URL and custom fields
4. Click **Save**

### Editing a Page

1. Select a page from the sidebar
2. Click the **Edit** button in the top toolbar
3. Make your changes in the editor
4. Click **Save**

### Adding Images to Articles

#### Main Page Image (Sidebar Display)

1. Edit a page and go to the **Metadata** tab
2. Either:
   - Enter an image URL in the text field, OR
   - Click the **Upload** button to upload an image from your computer
3. The image will appear in the right sidebar when viewing the page

#### Images Within Article Content

1. Edit a page and go to the **Edit** tab
2. Click the **Insert Image** button above the text area
3. Select an image from your computer
4. The image will be uploaded and markdown code `![Image](/uploads/filename.jpg)` will be inserted at your cursor position
5. You can also manually write markdown image syntax: `![Alt text](image-url)`

All uploaded images are stored in the `public/uploads` folder and persist locally.

### Moving a Page to Another Section

1. Edit the page
2. In the editor, change the **Section** dropdown to a different section
3. Click **Save**

### Deleting a Page

1. Select a page from the sidebar
2. Hover over the page name
3. Click the trash icon that appears
4. Confirm the deletion

### Deleting a Section

1. Hover over a section in the left sidebar
2. Click the trash icon that appears
3. Confirm the deletion (this will also delete all pages in that section)

## Markdown Support

The editor supports full GitHub Flavored Markdown (GFM), including:

- Headings (`#`, `##`, `###`)
- Bold and italic text
- Lists (ordered and unordered)
- Links
- Blockquotes
- Code blocks
- And more!

## Project Structure

```
wiki-project/
├── app/
│   ├── page.js          # Main application component
│   ├── layout.js        # Root layout
│   └── globals.css      # Global styles
├── components/
│   ├── Sidebar.js       # Left navigation sidebar
│   ├── PageContent.js   # Main content area
│   ├── RightSidebar.js  # Metadata sidebar
│   └── MarkdownEditor.js # Page editor modal
├── lib/
│   └── storage.js       # LocalStorage utilities
├── data/
│   └── sample-data.js   # Initial sample data
└── types/
    └── index.js         # Type definitions (JSDoc)
```

## Technologies Used

- **Next.js 16**: React framework for production
- **React 19**: UI library
- **Tailwind CSS**: Utility-first CSS framework
- **react-markdown**: Markdown rendering
- **remark-gfm**: GitHub Flavored Markdown support
- **lucide-react**: Icon library

## Data Persistence

All data is stored in a local JSON file at `data/wiki-data.json`. This means:

- Data persists on your local file system
- Data is saved automatically whenever you make changes
- The JSON file is human-readable and can be edited directly
- The data file is gitignored by default to prevent accidental commits
- On first load, sample data will be created if no data file exists

### Search Functionality

The application includes a powerful search feature:

- Click on the search input in the top-right corner
- Type your search query to search across all articles
- Search looks through both page titles and content
- Results appear in a dropdown showing matching pages
- Click any result to navigate to that page
- Results show the page title, section, and a preview of the content

## License

MIT
