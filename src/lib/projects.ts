import fs from 'fs';
import path from 'path';

// Content mounted from 'work' branch by CI
const dataDirectory = path.join(process.cwd(), 'data');

export interface Project {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  image?: string;
  github?: string;
  demo?: string;
}

/**
 * Get all projects from projects.json
 */
export function getProjects(): Project[] {
  const filePath = path.join(dataDirectory, 'projects.json');

  // Fallback for local development
  if (!fs.existsSync(filePath)) {
    console.warn('[projects.ts] Projects file not found. Create /data/projects.json for local testing.');
    return [];
  }

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const projects = JSON.parse(fileContents);
    return Array.isArray(projects) ? projects : [];
  } catch (error) {
    console.error('[projects.ts] Error parsing projects.json:', error);
    return [];
  }
}
