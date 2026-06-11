import { FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";

interface LandingFooterProps {
  currentYear: number;
}

export function LandingFooter({ currentYear }: LandingFooterProps) {
  return (
    <footer className="border-t border-(--border) bg-(--surface) py-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-(--muted) md:flex-row md:items-center md:justify-between">
        <p>© {currentYear} EasyClip. All rights reserved.</p>

        <div className="flex flex-wrap items-center gap-4">
          <a
            href="https://github.com/gksktl111/easy-clip-fe"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition-colors hover:text-(--foreground)"
            aria-label="EasyClip GitHub 저장소"
          >
            <FaGithub className="h-4 w-4" />
            <span>GitHub</span>
          </a>

          <a
            href="mailto:user@example.com"
            className="flex items-center gap-2 transition-colors hover:text-(--foreground)"
          >
            <HiOutlineMail className="h-4 w-4" />
            <span>medic6655@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
