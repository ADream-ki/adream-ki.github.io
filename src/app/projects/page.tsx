import { getProjects } from "@/lib/projects";
import Link from "next/link";
import { ExternalLink, Github, Rocket, Tag } from "lucide-react";

export const metadata = {
  title: "项目作品 - Adream 小站",
  description: "我的开源项目与技术实践",
};

export default function ProjectsPage() {
  const projects = getProjects();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 dark:from-primary-900/30 dark:to-accent-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800 shadow-soft mb-6">
          <Rocket className="w-4 h-4" />
          项目作品
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
          创造与实践
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          记录我的开源项目与技术探索历程
        </p>
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="group relative rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 hover:shadow-anime hover:border-primary-300 dark:hover:border-primary-500/50 transition-all duration-300"
            >
              {/* Project image/icon area */}
              <div className="relative h-40 mb-6 bg-gradient-to-br from-primary-100 via-primary-50 to-accent-50 dark:from-primary-900/30 dark:via-slate-900 dark:to-accent-900/20 rounded-2xl flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-300">
                {project.image ? (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-6xl">💻</div>
                )}
              </div>

              {/* Project info */}
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {project.title}
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                {project.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-300"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {project.github && (
                  <Link
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    <Github className="w-4 h-4" />
                    源码
                  </Link>
                )}
                {project.demo && (
                  <Link
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-2xl bg-gradient-to-r from-primary-500 to-accent-400 text-white hover:shadow-md transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    演示
                  </Link>
                )}
                {project.link && !project.github && !project.demo && (
                  <Link
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-2xl bg-gradient-to-r from-primary-500 to-accent-400 text-white hover:shadow-md transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    查看项目
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 mb-6">
            <Rocket className="w-10 h-10 text-primary-500 dark:text-primary-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
            暂无项目
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            项目数据将在 <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm">work</code> 分支的{" "}
            <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm">projects.json</code> 文件添加后显示
          </p>
        </div>
      )}
    </div>
  );
}
