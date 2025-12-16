"use client";
import React from "react";
import Link from "next/link";
import { Icon } from "../../icon";
import { useLayout } from "../layout-context";

export const Footer = () => {
  const { globalSettings } = useLayout();
  const { header, footer } = globalSettings!;

  return (
    <footer className="border-b bg-white pt-20 dark:bg-transparent">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mt-12 flex flex-wrap items-center gap-6 border-t py-6 flex-col md:flex-row md:justify-between">

          <div className="order-last flex justify-center md:order-first md:justify-start">
            <Link href="/" aria-label="go home">
              <Icon
                parentColor={header!.color!}
                data={header!.icon}
              />
            </Link>
            <span className="self-center text-muted-foreground text-sm ml-2">© {new Date().getFullYear()} {header?.name}, All rights reserved</span>
          </div>

          <div className="order-first flex flex-col items-center gap-4 md:order-none">
            <span className="text-xs text-muted-foreground">Powered by <a href="https://tina.io" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">TinaCMS</a></span>
          </div>

          <div className="order-last flex justify-center gap-6 text-sm md:order-last md:justify-end">
            {footer?.social?.map((link, index) => (
              <Link key={`${link!.icon}${index}`} href={link!.url!} target="_blank" rel="noopener noreferrer" >
                <Icon data={{ ...link!.icon, size: 'small' }} className="text-muted-foreground hover:text-primary block" />
              </Link>
            ))}
          </div>

        </div>
      </div>
    </footer>
  );
}
