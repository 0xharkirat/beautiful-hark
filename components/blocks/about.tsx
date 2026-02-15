"use client";
import React from "react";
import { TinaMarkdown } from "tinacms/dist/rich-text";
import type { Template } from "tinacms";
import { PageBlocksAbout } from "../../tina/__generated__/types";
import { tinaField } from "tinacms/dist/react";
import { Section } from "../layout/section";
import { Disclosure, Transition, Dialog } from "@headlessui/react";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

const markdownComponents = {
    a: (props: any) => {
        const url = props.url || props.href;
        const isExternal = url && (url.startsWith('http') || url.startsWith('//'));
        return (
            <a
                href={url}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
            >
                {props.children}
            </a>
        );
    },
    img: (props: any) => (
        <span className="my-8 flex flex-col items-center">
            <img
                src={props.url}
                alt={props.alt || ""}
                className="rounded-lg shadow-sm max-h-[500px] w-auto object-contain"
            />
            {/* Standard markdown fallback */}
            {(props.caption || props.title) && (
                <span className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 italic block">
                    {props.caption || props.title}
                </span>
            )}
        </span>
    ),
};

// ... inside Layout ...


export const About = ({ data }: { data: PageBlocksAbout }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const openLightbox = (index: number) => setSelectedImageIndex(index);
    const closeLightbox = () => setSelectedImageIndex(null);

    const showNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex !== null && data.gallery) {
            setSelectedImageIndex((selectedImageIndex + 1) % data.gallery.length);
        }
    };

    const showPrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedImageIndex !== null && data.gallery) {
            setSelectedImageIndex((selectedImageIndex - 1 + data.gallery.length) % data.gallery.length);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedImageIndex === null) return;

            if (e.key === "ArrowLeft") {
                showPrev();
            } else if (e.key === "ArrowRight") {
                showNext();
            } else if (e.key === "Escape") {
                closeLightbox();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedImageIndex, data.gallery]);

    return (
        <Section className="flex-1" data-tina-field={tinaField(data)}>
            <div className="mx-auto max-w-6xl px-6 py-12">
                {/* Header Section */}
                <div className="mb-12 border-b border-gray-200 dark:border-gray-700 pb-8">
                    <h1
                        className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl mb-2 font-serif"
                        data-tina-field={tinaField(data, "title")}
                    >
                        {data.title}
                    </h1>
                    {data.subtitle && (
                        <p
                            className="text-xl text-gray-500 dark:text-gray-400"
                            data-tina-field={tinaField(data, "subtitle")}
                        >
                            {data.subtitle}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
                    {/* Sidebar / Image */}
                    <div className="lg:col-span-1 order-first lg:order-last">
                        {data.profileImage && (
                            <div data-tina-field={tinaField(data, "profileImage")}>
                                <div className="relative aspect-square w-full overflow-hidden rounded-t-full mb-4">
                                    <Image
                                        src={data.profileImage}
                                        alt={data.title || "Profile"}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                {data.imageCaption && (
                                    <div className="text-sm text-center text-gray-500 dark:text-gray-400 italic">
                                        {data.imageCaption}
                                    </div>
                                )}
                            </div>
                        )}
                        {/* Mini Info Box could go here later if needed */}
                    </div>

                    {/* Main Content / Summary */}
                    <div className="lg:col-span-2 prose dark:prose-invert max-w-none">
                        <div data-tina-field={tinaField(data, "summary")}>
                            <TinaMarkdown content={data.summary} components={markdownComponents} />
                        </div>
                    </div>
                </div>

                {/* Expandable Sections */}
                <div className="space-y-4">
                    {data.sections?.map((section: any, index: number) => (
                        <div key={index} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                            <Disclosure defaultOpen={false}>
                                {({ open }) => (
                                    <>
                                        <Disclosure.Button className="group flex w-full justify-start items-center gap-3 py-4 text-left text-lg font-medium text-gray-900 dark:text-gray-100 hover:text-accent-red transition-colors duration-200 focus:outline-none cursor-pointer">
                                            <span>{section?.title}</span>
                                            <ChevronDown
                                                className={`${open ? 'rotate-180 transform' : ''
                                                    } h-5 w-5 text-gray-400 group-hover:text-accent-red transition-transform duration-200`}
                                            />
                                        </Disclosure.Button>
                                        <Transition
                                            enter="transition duration-100 ease-out"
                                            enterFrom="transform scale-95 opacity-0"
                                            enterTo="transform scale-100 opacity-100"
                                            leave="transition duration-75 ease-out"
                                            leaveFrom="transform scale-100 opacity-100"
                                            leaveTo="transform scale-95 opacity-0"
                                        >
                                            <Disclosure.Panel className="pb-6 prose dark:prose-invert max-w-none">
                                                <TinaMarkdown content={section?.content} components={markdownComponents} />
                                            </Disclosure.Panel>
                                        </Transition>
                                    </>
                                )}
                            </Disclosure>
                        </div>
                    ))}
                </div>

                {/* Gallery / Embeds */}
                {data.gallery && data.gallery.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Gallery</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.gallery.map((item: any, i: number) => {
                                if (!item?.src) return null;
                                return (
                                    <div
                                        key={i}
                                        className="relative aspect-video rounded-lg overflow-hidden shadow-sm cursor-pointer group"
                                        onClick={() => openLightbox(i)}
                                    >
                                        <Image
                                            src={item.src || ""}
                                            alt={item.alt || `Gallery image ${i + 1}`}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Lightbox Dialog */}
                <Transition show={selectedImageIndex !== null} as={React.Fragment}>
                    <Dialog as="div" className="relative z-50" onClose={closeLightbox}>
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <Transition.Child
                                    as={React.Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <Dialog.Panel className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center outline-none">
                                        {selectedImageIndex !== null && data.gallery && data.gallery[selectedImageIndex] && (
                                            <>
                                                {/* Close Button */}
                                                <button
                                                    onClick={closeLightbox}
                                                    className="absolute -top-10 right-0 p-2 text-white/70 hover:text-white transition-colors focus:outline-none"
                                                >
                                                    <X className="h-8 w-8" />
                                                </button>

                                                {/* Navigation Buttons */}
                                                <button
                                                    onClick={showPrev}
                                                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-12 p-2 text-white/70 hover:text-white transition-colors focus:outline-none hidden md:block"
                                                >
                                                    <ChevronLeft className="h-10 w-10" />
                                                </button>
                                                <button
                                                    onClick={showNext}
                                                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-12 p-2 text-white/70 hover:text-white transition-colors focus:outline-none hidden md:block"
                                                >
                                                    <ChevronRight className="h-10 w-10" />
                                                </button>

                                                {/* Image */}
                                                <div className="relative w-full h-auto max-h-[80vh]">
                                                    <img
                                                        src={data.gallery[selectedImageIndex].src || ""}
                                                        alt={data.gallery[selectedImageIndex].alt || ""}
                                                        className="max-h-[80vh] w-auto mx-auto object-contain rounded-md"
                                                    />
                                                </div>

                                                {/* Caption */}
                                                {data.gallery[selectedImageIndex].caption && (
                                                    <p className="mt-4 text-white/90 text-lg font-medium text-center italic">
                                                        {data.gallery[selectedImageIndex].caption}
                                                    </p>
                                                )}
                                            </>
                                        )}
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

            </div>
        </Section>
    );
};

export const aboutBlockSchema: Template = {
    name: "about",
    label: "About Page",
    ui: {
        previewSrc: "/blocks/about.png",
        defaultItem: {
            title: "Hark Singh",
            subtitle: "Software Engineer",
        },
    },
    fields: [
        {
            type: "string",
            label: "Title",
            name: "title",
        },
        {
            type: "string",
            label: "Subtitle",
            name: "subtitle",
        },
        {
            type: "image",
            label: "Profile Image",
            name: "profileImage",
        },
        {
            type: "string",
            label: "Image Caption",
            name: "imageCaption",
        },
        {
            type: "rich-text",
            label: "Summary Blurb",
            name: "summary",
        },
        {
            type: "object",
            label: "Sections",
            name: "sections",
            list: true,
            ui: {
                itemProps: (item) => {
                    return { label: item?.title };
                },
            },
            fields: [
                {
                    type: "string",
                    label: "Section Title",
                    name: "title",
                },
                {
                    type: "rich-text",
                    label: "Content",
                    name: "content",
                    templates: [
                        {
                            name: "Image",
                            label: "Image",
                            fields: [
                                {
                                    name: "url",
                                    label: "URL",
                                    type: "image",
                                },
                                {
                                    name: "alt",
                                    label: "Alt Text",
                                    type: "string",
                                },
                                {
                                    name: "caption",
                                    label: "Caption",
                                    type: "string",
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            type: "object",
            label: "Gallery Images",
            name: "gallery",
            list: true,
            ui: {
                itemProps: (item) => {
                    return { label: item?.caption || "Image" };
                },
            },
            fields: [
                { type: "image", name: "src", label: "Image" },
                { type: "string", name: "alt", label: "Alt Text" },
                { type: "string", name: "caption", label: "Caption" }
            ]
        }
    ],
};
