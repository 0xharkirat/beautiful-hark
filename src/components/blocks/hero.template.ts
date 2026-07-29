import type { Template } from 'tinacms';

export const heroBlockSchema: Template = {
	name: 'hero',
	label: 'Hero',
	fields: [
		{ type: 'string', label: 'Headline', name: 'headline' },
		{ type: 'string', label: 'Tagline', name: 'tagline' },
		{ type: 'string', label: 'Background', name: 'background' },
		{ type: 'string', label: 'Body Text', name: 'text', ui: { component: 'textarea' } },
		{
			type: 'object', label: 'Image', name: 'image',
			fields: [
				{ name: 'src', label: 'Image Source', type: 'image' },
				{ name: 'alt', label: 'Alt Text', type: 'string' },
				{ name: 'videoSrc', label: 'Video Source (MP4/WebM)', type: 'image' },
				{ name: 'videoUrl', label: 'YouTube Embed URL', type: 'string' },
			],
		},
		{ type: 'boolean', label: 'Show starfield', name: 'starfield' },
	],
	ui: {
		defaultItem: {
			tagline: "Here's some text above the other text",
			headline: 'Astro + TinaCMS, ready to ship',
			starfield: true,
		},
	},
};
