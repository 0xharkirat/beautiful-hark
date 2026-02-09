'use client';
import type { Template } from 'tinacms';
import { tinaField } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import { PageBlocksFeatures, PageBlocksFeaturesItems } from '../../tina/__generated__/types';
import { iconSchema } from '../../tina/fields/icon';
import { Icon } from '../icon';
import { Section } from '../layout/section';
import { sectionBlockSchemaField } from '../layout/section';
import { Card, CardContent, CardHeader } from '../ui/card';

export const Features = ({ data }: { data: PageBlocksFeatures }) => {
  return (
    <Section background={data.background!}>
      <div className='@container mx-auto max-w-5xl px-6'>
        <div className='text-center'>
          <h2 data-tina-field={tinaField(data, 'title')} className='text-balance text-4xl font-semibold lg:text-5xl'>
            {data.title}
          </h2>
          <p data-tina-field={tinaField(data, 'description')} className='mt-4'>
            {data.description}
          </p>
        </div>
        <Card className='@min-4xl:max-w-full @min-4xl:grid-cols-3 @min-4xl:divide-x @min-4xl:divide-y-0 mx-auto mt-8 grid max-w-sm divide-y overflow-hidden shadow-zinc-950/5 *:text-center md:mt-16'>
          {data.items &&
            data.items.map(function (block, i) {
              return <Feature key={i} {...block!} />;
            })}
        </Card>
      </div>
    </Section>
  );
};

const CardDecorator = ({ children }: { children: React.ReactNode }) => (
  <div className='relative mx-auto size-36 duration-200'>
    <div className='bg-background absolute inset-0 m-auto flex size-12 items-center justify-center rounded-sm border'>{children}</div>
  </div>
);

export const Feature: React.FC<PageBlocksFeaturesItems> = (data) => {
  return (
    <div className='group shadow-zinc-950/5'>
      <CardHeader className='pb-3'>
        <CardDecorator>{data.icon && <Icon tinaField={tinaField(data, 'icon')} data={{ size: 'large', ...data.icon }} />}</CardDecorator>

        <h3 data-tina-field={tinaField(data, 'title')} className='mt-6 font-medium'>
          {data.title}
        </h3>
      </CardHeader>

      <CardContent className='text-sm pb-8'>
        <TinaMarkdown data-tina-field={tinaField(data, 'text')} content={data.text} />
      </CardContent>
    </div>
  );
};

const defaultFeature = {
  title: "Here's Another Feature",
  text: "This is where you might talk about the feature, if this wasn't just filler text.",
  icon: {
    name: 'Tina',
    color: 'white',
    style: 'float',
  },
};

export const featureBlockSchema: Template = {
  name: 'features',
  label: 'Features',
  ui: {
    previewSrc: '/blocks/features.png',
    defaultItem: {
      title: 'Built to cover your needs',
      description: 'We have a lot of features to cover your needs',
      items: [defaultFeature, defaultFeature, defaultFeature],
    },
  },
  fields: [
    sectionBlockSchemaField as any,
    {
      type: 'string',
      label: 'Title',
      name: 'title',
    },
    {
      type: 'string',
      label: 'Description',
      name: 'description',
    },
    {
      type: 'object',
      label: 'Feature Items',
      name: 'items',
      list: true,
      ui: {
        itemProps: (item) => {
          return {
            label: item?.title,
          };
        },
        defaultItem: {
          ...defaultFeature,
        },
      },
      fields: [
        iconSchema as any,
        {
          type: 'string',
          label: 'Title',
          name: 'title',
        },
        {
          type: 'rich-text',
          label: 'Text',
          name: 'text',
        },
      ],
    },
  ],
};
