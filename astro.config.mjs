// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tina from '@tinacms/astro/integration';
import { tinaAdminDevRedirect } from '@tinacms/astro/vite';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
	// SITE_URL is the canonical origin and should always be set in production;
	// it feeds <link rel="canonical">, og:url, the sitemap and the RSS feed.
	// The fallback is VERCEL_PROJECT_PRODUCTION_URL (the stable production
	// domain) rather than VERCEL_URL, which is the per-deployment hostname and
	// would publish a different canonical on every single deploy.
	// The localhost default keeps local and CI builds working; it can never
	// reach production because Vercel always supplies the middle value.
	// @astrojs/sitemap hard-fails on an undefined site, so there has to be one.
	site:
		process.env.SITE_URL ||
		(process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: 'http://localhost:4321'),
	output: 'static',
	adapter: vercel(),
	redirects: { '/home': '/' },
	integrations: [mdx(), sitemap(), icon(), tina()],
	build: {
		// Inline the (~10 KiB) bundled CSS into a <style> in <head> instead of a
		// separate render-blocking <link>. Astro's default ('auto') only inlines
		// stylesheets under ~4 KiB, leaving ours blocking first paint on mobile.
		inlineStylesheets: 'always',
	},
	// Tina Cloud rewrites CMS image src to assets.tina.io; let Astro
	// fetch those URLs at build time so <Image> can transcode + resize them.
	image: {
		// Astro 6 responsive images: auto-emit srcset so the browser picks a
		// variant matched to the rendered box + DPR, not the full intrinsic size.
		layout: 'constrained',
		remotePatterns: [{ protocol: 'https', hostname: 'assets.tina.io' }],
	},
	vite: {
		plugins: [tailwindcss(), tinaAdminDevRedirect()],
		server: {
			fs: {
				// Allow @fontsource-variable packages hoisted to the workspace root.
				allow: ['..'],
			},
		},
		// Bundle @tinacms/astro into the SSR build instead of resolving it
		// per-module on every cold request — otherwise each
		// `import TinaMarkdown from '@tinacms/astro/TinaMarkdown.astro'`
		// triggers a full Vite resolve + Astro-plugin compile of the
		// package's source `.astro` files on the first request.
		ssr: {
			noExternal: ['@tinacms/astro', '@tinacms/bridge'],
		},
		build: {
			rollupOptions: {
				onwarn(warning, warn) {
					if (warning.code === 'UNUSED_EXTERNAL_IMPORT' &&
						warning.exporter === 'tinacms/dist/client') {
						return;
					}
					warn(warning);
				}
			}
		}
	}
});
