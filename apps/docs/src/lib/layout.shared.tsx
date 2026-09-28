import type { DocsLayoutProps } from "fumadocs-ui/layouts/docs";
import { GithubLogo } from "@phosphor-icons/react";
import {
  CustomFolder,
  CustomItem,
  CustomSeparator,
  SearchButton,
} from "@/components/docs/page-tree";

export function baseOptions(): Omit<DocsLayoutProps, "tree"> {
  return {
    nav: {
      title: (
        <div className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18 10H34L43 19V34M18 10C16.3 10 15 11.3 15 13V45C15 47.2 16.8 49 19 49H31M34 10V17C34 18.1 34.9 19 36 19H43M21 26H33M21 34H30" stroke="#E8A855" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M52 44C52 50.1 47.1 55 41 55C34.9 55 30 50.1 30 44C30 37.9 34.9 33 41 33C47.1 33 52 37.9 52 44Z" stroke="#E8A855" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M41 37V51M45 39.5C43.8 38.4 42.4 38 40.8 38C38.8 38 37.5 39.1 37.5 40.7C37.5 42.4 38.9 43.1 41.5 43.8C44.2 44.5 45.5 45.3 45.5 47C45.5 48.8 43.8 50 41.5 50C39.6 50 37.9 49.4 36.8 48.2" stroke="#E8A855" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-[17px] font-semibold tracking-tight">
            Billwave
          </span>
        </div>
      ),
      url: "/",
      transparentMode: "top",
    },
    searchToggle: { enabled: false },
    sidebar: {
      collapsible: false,
      banner: <SearchButton />,
      components: {
        Item: CustomItem,
        Folder: CustomFolder,
        Separator: CustomSeparator,
      },
      tabs: false,
      footer: (
        <a
          href="https://github.com/Digvijay-x1/Billwave"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <GithubLogo className="size-4" />
          GitHub
        </a>
      ),
    },
  };
}
